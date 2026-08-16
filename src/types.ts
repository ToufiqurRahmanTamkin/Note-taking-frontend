export type Role = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  interests: string[];
  createdAt: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  owner: string;
  createdAt: string;
}

export type Privacy = 'public' | 'private';

export interface Post {
  id: string;
  title: string;
  body: string;
  privacy: Privacy;
  createdAt: string;
}

export interface Poster {
  id: string;
  name: string;
  email: string;
  publicPostCount: number;
  totalPostCount: number;
}

export interface UserPostsResult {
  _id: string;
  name: string;
  email: string;
  postCount: number;
  posts: Post[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface InterestGroup {
  interest: string;
  userCount: number;
  users: { id: string; name: string; email: string }[];
}
