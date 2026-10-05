import { get, post } from './client';
import { Book } from '../types/models';
import { BookQuery, CreateBookRequest, Paginated } from '../types/api';
import { mockBooksApi } from './mock';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export async function fetchBooks(query: BookQuery): Promise<Paginated<Book>> {
  if (useMock) {
    return mockBooksApi.getBooks(query);
  }
  return get<Paginated<Book>>('/books', query as Record<string, unknown>);
}

export async function fetchGenres(): Promise<string[]> {
  if (useMock) {
    return mockBooksApi.getGenres();
  }
  return get<string[]>('/books/genres');
}

export async function createBook(bookData: CreateBookRequest): Promise<Book> {
  if (useMock) {
    return mockBooksApi.createBook(bookData);
  }
  return post<Book>('/books', bookData);
}
