export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  membershipId: string;
  joinedDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BorrowStatus = 'issued' | 'returned' | 'overdue';

export interface BorrowRecord {
  _id: string;
  book: Book | string; // populated or id
  member: Member | string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: BorrowStatus;
  effectiveStatus?: BorrowStatus;
  issuedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PopulatedBorrowRecord {
  _id: string;
  book: Pick<Book, '_id' | 'title' | 'author' | 'isbn' | 'genre' | 'totalCopies' | 'availableCopies'>;
  member: Pick<Member, '_id' | 'name' | 'email' | 'membershipId'>;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: BorrowStatus;
  effectiveStatus?: BorrowStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Librarian {
  id: string;
  name: string;
  email: string;
}
