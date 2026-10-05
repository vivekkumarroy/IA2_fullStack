import { Book, Member, PopulatedBorrowRecord, Librarian } from '../../types/models';

export const mockLibrarian: Librarian = {
  id: '66fa00000000000000000001',
  name: 'Demo Librarian',
  email: 'librarian@shelflife.test',
};

export const mockBooks: Book[] = [
  {
    _id: '66fa00000000000000000010',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    genre: 'Fiction',
    totalCopies: 5,
    availableCopies: 4,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '66fa00000000000000000011',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '9780061120084',
    genre: 'Fiction',
    totalCopies: 3,
    availableCopies: 3,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '66fa00000000000000000012',
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    genre: 'Dystopian',
    totalCopies: 4,
    availableCopies: 3,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '66fa00000000000000000013',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    isbn: '9780060850524',
    genre: 'Dystopian',
    totalCopies: 2,
    availableCopies: 2,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '66fa00000000000000000014',
    title: 'The Catcher in the Rye (0 Copies Demo)',
    author: 'J.D. Salinger',
    isbn: '9780316769488',
    genre: 'Fiction',
    totalCopies: 1,
    availableCopies: 0, // Deliberately unavailable for toast demo
    createdAt: new Date().toISOString(),
  },
  {
    _id: '66fa00000000000000000015',
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '9780441013593',
    genre: 'Science Fiction',
    totalCopies: 4,
    availableCopies: 3,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '66fa00000000000000000016',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '9780062316097',
    genre: 'Non-Fiction',
    totalCopies: 5,
    availableCopies: 5,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '66fa00000000000000000017',
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '9780735211292',
    genre: 'Self-Help',
    totalCopies: 6,
    availableCopies: 6,
    createdAt: new Date().toISOString(),
  }
];

export const mockMembers: Member[] = [
  {
    _id: '66fa00000000000000000020',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    membershipId: 'MEM-A00001',
    joinedDate: new Date('2026-01-10').toISOString(),
  },
  {
    _id: '66fa00000000000000000021',
    name: 'Bob Smith',
    email: 'bob@example.com',
    membershipId: 'MEM-B00002',
    joinedDate: new Date('2026-02-15').toISOString(),
  },
  {
    _id: '66fa00000000000000000022',
    name: 'Carol Williams',
    email: 'carol@example.com',
    membershipId: 'MEM-C00003',
    joinedDate: new Date('2026-03-01').toISOString(),
  },
  {
    _id: '66fa00000000000000000023',
    name: 'David Brown',
    email: 'david@example.com',
    membershipId: 'MEM-D00004',
    joinedDate: new Date('2026-04-12').toISOString(),
  }
];

export const mockBorrowRecords: PopulatedBorrowRecord[] = [
  {
    _id: '66fa00000000000000000030',
    book: {
      _id: mockBooks[0]!._id,
      title: mockBooks[0]!.title,
      author: mockBooks[0]!.author,
      isbn: mockBooks[0]!.isbn,
      genre: mockBooks[0]!.genre,
      totalCopies: mockBooks[0]!.totalCopies,
      availableCopies: mockBooks[0]!.availableCopies,
    },
    member: {
      _id: mockMembers[0]!._id,
      name: mockMembers[0]!.name,
      email: mockMembers[0]!.email,
      membershipId: mockMembers[0]!.membershipId,
    },
    issueDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 11 * 86400000).toISOString(),
    returnDate: null,
    status: 'issued',
    effectiveStatus: 'issued',
  },
  {
    _id: '66fa00000000000000000031',
    book: {
      _id: mockBooks[2]!._id,
      title: mockBooks[2]!.title,
      author: mockBooks[2]!.author,
      isbn: mockBooks[2]!.isbn,
      genre: mockBooks[2]!.genre,
      totalCopies: mockBooks[2]!.totalCopies,
      availableCopies: mockBooks[2]!.availableCopies,
    },
    member: {
      _id: mockMembers[1]!._id,
      name: mockMembers[1]!.name,
      email: mockMembers[1]!.email,
      membershipId: mockMembers[1]!.membershipId,
    },
    issueDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 16 * 86400000).toISOString(), // overdue
    returnDate: null,
    status: 'issued',
    effectiveStatus: 'overdue',
  },
  {
    _id: '66fa00000000000000000032',
    book: {
      _id: mockBooks[3]!._id,
      title: mockBooks[3]!.title,
      author: mockBooks[3]!.author,
      isbn: mockBooks[3]!.isbn,
      genre: mockBooks[3]!.genre,
      totalCopies: mockBooks[3]!.totalCopies,
      availableCopies: mockBooks[3]!.availableCopies,
    },
    member: {
      _id: mockMembers[0]!._id,
      name: mockMembers[0]!.name,
      email: mockMembers[0]!.email,
      membershipId: mockMembers[0]!.membershipId,
    },
    issueDate: new Date(Date.now() - 20 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 6 * 86400000).toISOString(),
    returnDate: new Date(Date.now() - 8 * 86400000).toISOString(),
    status: 'returned',
    effectiveStatus: 'returned',
  },
  {
    _id: '66fa00000000000000000033',
    book: {
      _id: mockBooks[5]!._id,
      title: mockBooks[5]!.title,
      author: mockBooks[5]!.author,
      isbn: mockBooks[5]!.isbn,
      genre: mockBooks[5]!.genre,
      totalCopies: mockBooks[5]!.totalCopies,
      availableCopies: mockBooks[5]!.availableCopies,
    },
    member: {
      _id: mockMembers[0]!._id,
      name: mockMembers[0]!.name,
      email: mockMembers[0]!.email,
      membershipId: mockMembers[0]!.membershipId,
    },
    issueDate: new Date(Date.now() - 25 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 11 * 86400000).toISOString(),
    returnDate: new Date(Date.now() - 5 * 86400000).toISOString(), // returned late
    status: 'returned',
    effectiveStatus: 'returned',
  }
];
