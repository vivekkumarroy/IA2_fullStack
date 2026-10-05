import { get, post } from './client';
import { Member } from '../types/models';
import { MemberQuery, CreateMemberRequest, Paginated } from '../types/api';
import { mockMembersApi } from './mock';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export async function fetchMembers(query: MemberQuery): Promise<Paginated<Member>> {
  if (useMock) {
    return mockMembersApi.getMembers(query);
  }
  return get<Paginated<Member>>('/members', query as Record<string, unknown>);
}

export async function createMember(memberData: CreateMemberRequest): Promise<Member> {
  if (useMock) {
    return mockMembersApi.createMember(memberData);
  }
  return post<Member>('/members', memberData);
}
