import { Member, Librarian, PopulatedBorrowRecord } from './models';


export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PageMeta;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    stack?: string;
  };
}

// Request & Response DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  librarian: Librarian;
}

export interface BookQuery {
  page?: number;
  limit?: number;
  genre?: string;
  search?: string;
  sort?: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  isbn: string;
  genre: string;
  totalCopies: number;
  availableCopies?: number;
}

export interface MemberQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateMemberRequest {
  name: string;
  email: string;
  membershipId?: string;
  joinedDate?: string;
}

export interface IssueBookRequest {
  bookId: string;
  memberId: string;
  dueDate?: string;
}

export interface IssueBookResponse {
  borrowRecord: PopulatedBorrowRecord;
  availableCopies: number;
}

export interface ReturnBookResponse {
  borrowRecord: PopulatedBorrowRecord;
  wasLate: boolean;
}

export interface MemberHistoryMeta extends PageMeta {
  member: Pick<Member, '_id' | 'name' | 'email' | 'membershipId'>;
}

export interface MemberHistoryResponse {
  data: PopulatedBorrowRecord[];
  meta: MemberHistoryMeta;
}
