export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface Comment {
  id: number;
  postSlug: string;
  userId: number;
  parentId: number | null;
  content: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  replies?: Comment[];
}

export interface CreateCommentRequest {
  postSlug: string;
  parentId?: number;
  content: string;
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
}
