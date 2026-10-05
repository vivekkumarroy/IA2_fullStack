import {
  Book,
  Member,
  PopulatedBorrowRecord,
} from '../../types/models';
import {
  Paginated,
  BookQuery,
  MemberQuery,
  CreateBookRequest,
  CreateMemberRequest,
  IssueBookRequest,
  IssueBookResponse,
  ReturnBookResponse,
  LoginRequest,
  LoginResponse,
  MemberHistoryResponse,
  CirculationResponse,
} from '../../types/api';
import { mockBooks, mockMembers, mockBorrowRecords, mockLibrarian } from './data';

// Helper for simulated network delay
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

// Deep clone state for mutation in memory
const inMemoryBooks: Book[] = JSON.parse(JSON.stringify(mockBooks));
const inMemoryMembers: Member[] = JSON.parse(JSON.stringify(mockMembers));
const inMemoryBorrowRecords: PopulatedBorrowRecord[] = JSON.parse(JSON.stringify(mockBorrowRecords));

export const mockAuthApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    await delay(400);
    if (credentials.email === 'librarian@shelflife.test' && credentials.password === 'Passw0rd!') {
      return {
        token: 'mock-jwt-token-librarian-auth',
        librarian: mockLibrarian,
      };
    }
    const err = new Error('Invalid email or password');
    Object.assign(err, { response: { status: 401, data: { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } } } });
    throw err;
  }
};

export const mockBooksApi = {
  async getGenres(): Promise<string[]> {
    await delay(200);
    const genres = Array.from(new Set(inMemoryBooks.map((b) => b.genre))).sort();
    return genres;
  },

  async getBooks(query: BookQuery): Promise<Paginated<Book>> {
    await delay(350);
    let filtered = [...inMemoryBooks];

    if (query.genre) {
      filtered = filtered.filter((b) => b.genre.toLowerCase() === query.genre?.toLowerCase());
    }

    if (query.search) {
      const q = query.search.toLowerCase();
      filtered = filtered.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },

  async createBook(req: CreateBookRequest): Promise<Book> {
    await delay(400);
    const newBook: Book = {
      _id: `mock-book-${Date.now()}`,
      title: req.title,
      author: req.author,
      isbn: req.isbn,
      genre: req.genre,
      totalCopies: req.totalCopies,
      availableCopies: req.availableCopies !== undefined ? req.availableCopies : req.totalCopies,
      createdAt: new Date().toISOString(),
    };
    inMemoryBooks.unshift(newBook);
    return newBook;
  },
};

export const mockMembersApi = {
  async getMembers(query: MemberQuery): Promise<Paginated<Member>> {
    await delay(300);
    let filtered = [...inMemoryMembers];

    if (query.search) {
      const q = query.search.toLowerCase();
      filtered = filtered.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },

  async createMember(req: CreateMemberRequest): Promise<Member> {
    await delay(400);
    const newMember: Member = {
      _id: `mock-member-${Date.now()}`,
      name: req.name,
      email: req.email,
      membershipId: req.membershipId || `MEM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      joinedDate: req.joinedDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    inMemoryMembers.unshift(newMember);
    return newMember;
  },
};

export const mockBorrowApi = {
  async issueBook(req: IssueBookRequest): Promise<IssueBookResponse> {
    await delay(400);
    const book = inMemoryBooks.find((b) => b._id === req.bookId);
    if (!book) {
      const err = new Error('Book not found');
      Object.assign(err, { response: { status: 404, data: { error: { code: 'BOOK_NOT_FOUND', message: 'Book not found' } } } });
      throw err;
    }

    if (book.availableCopies <= 0) {
      const err = new Error('No copies available for this book');
      Object.assign(err, { response: { status: 409, data: { error: { code: 'NO_COPIES_AVAILABLE', message: 'No copies available for this book' } } } });
      throw err;
    }

    const member = inMemoryMembers.find((m) => m._id === req.memberId);
    if (!member) {
      const err = new Error('Member not found');
      Object.assign(err, { response: { status: 404, data: { error: { code: 'MEMBER_NOT_FOUND', message: 'Member not found' } } } });
      throw err;
    }

    // Atomic decrement
    book.availableCopies -= 1;

    const issueDate = new Date().toISOString();
    const dueDate = req.dueDate || new Date(Date.now() + 14 * 86400000).toISOString();

    const record: PopulatedBorrowRecord = {
      _id: `mock-borrow-${Date.now()}`,
      book: { ...book },
      member: { ...member },
      issueDate,
      dueDate,
      returnDate: null,
      status: 'issued',
      effectiveStatus: 'issued',
    };

    inMemoryBorrowRecords.unshift(record);

    return {
      borrowRecord: record,
      availableCopies: book.availableCopies,
    };
  },

  async returnBook(borrowId: string): Promise<ReturnBookResponse> {
    await delay(400);
    const record = inMemoryBorrowRecords.find((r) => r._id === borrowId);
    if (!record) {
      const err = new Error('Borrow record not found');
      Object.assign(err, { response: { status: 404, data: { error: { code: 'BORROW_NOT_FOUND', message: 'Borrow record not found' } } } });
      throw err;
    }

    if (record.status === 'returned') {
      const err = new Error('This book has already been returned');
      Object.assign(err, { response: { status: 409, data: { error: { code: 'ALREADY_RETURNED', message: 'This book has already been returned' } } } });
      throw err;
    }

    record.returnDate = new Date().toISOString();
    record.status = 'returned';
    record.effectiveStatus = 'returned';

    // Increment available copies on book
    const book = inMemoryBooks.find((b) => b._id === record.book._id);
    if (book && book.availableCopies < book.totalCopies) {
      book.availableCopies += 1;
    }

    const wasLate = new Date(record.returnDate).getTime() > new Date(record.dueDate).getTime();

    return {
      borrowRecord: record,
      wasLate,
    };
  },

  async getMemberHistory(memberId: string): Promise<MemberHistoryResponse> {
    await delay(350);
    const member = inMemoryMembers.find((m) => m._id === memberId);
    if (!member) {
      const err = new Error('Member not found');
      Object.assign(err, { response: { status: 404, data: { error: { code: 'MEMBER_NOT_FOUND', message: 'Member not found' } } } });
      throw err;
    }

    const records = inMemoryBorrowRecords.filter((r) => r.member._id === memberId);

    return {
      data: records,
      meta: {
        member: {
          _id: member._id,
          name: member.name,
          email: member.email,
          membershipId: member.membershipId,
        },
        page: 1,
        limit: 20,
        total: records.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  },

  async getCirculation(query: { page?: number; limit?: number; status?: string; search?: string } = {}): Promise<CirculationResponse> {
    await delay(350);
    let records = [...inMemoryBorrowRecords];
    if (query.status) records = records.filter((record) => record.status === query.status);
    if (query.search) {
      const search = query.search.toLowerCase();
      records = records.filter((record) =>
        [record.book.title, record.book.author, record.book.isbn, record.member.name, record.member.email, record.member.membershipId]
          .some((value) => value.toLowerCase().includes(search))
      );
    }
    const page = query.page || 1;
    const limit = query.limit || 10;
    const total = records.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    return {
      data: records.slice(start, start + limit),
      meta: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  },
};
