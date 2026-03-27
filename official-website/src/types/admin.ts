import type { User } from '../types/auth';
import type { CommentStatus } from '../types/comment';

export interface AdminStats {
  totalUsers: number;
  totalComments: number;
  pendingComments: number;
  approvedComments: number;
  rejectedComments: number;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CommentListParams {
  page?: number;
  pageSize?: number;
  status?: CommentStatus;
  postSlug?: string;
  search?: string;
}

export interface UpdateUserRoleRequest {
  role: 'user' | 'moderator' | 'admin';
}

export interface UpdateUserStatusRequest {
  status: 'active' | 'disabled';
}

export interface UpdateCommentStatusRequest {
  status: CommentStatus;
}

export interface BatchActionRequest {
  ids: number[];
  action: 'approve' | 'reject' | 'delete';
}
