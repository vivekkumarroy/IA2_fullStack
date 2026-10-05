import { get, post } from './client';
import {
  IssueBookRequest,
  IssueBookResponse,
  ReturnBookResponse,
  MemberHistoryResponse,
} from '../types/api';
import { mockBorrowApi } from './mock';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export async function issueBook(data: IssueBookRequest): Promise<IssueBookResponse> {
  if (useMock) {
    return mockBorrowApi.issueBook(data);
  }
  return post<IssueBookResponse>('/borrow', data);
}

export async function returnBook(borrowId: string): Promise<ReturnBookResponse> {
  if (useMock) {
    return mockBorrowApi.returnBook(borrowId);
  }
  return post<ReturnBookResponse>(`/return/${borrowId}`);
}

export async function fetchMemberHistory(
  memberId: string,
  params?: { page?: number; limit?: number; status?: string }
): Promise<MemberHistoryResponse> {
  if (useMock) {
    return mockBorrowApi.getMemberHistory(memberId);
  }
  return get<MemberHistoryResponse>(`/members/${memberId}/history`, params as Record<string, unknown>);
}
