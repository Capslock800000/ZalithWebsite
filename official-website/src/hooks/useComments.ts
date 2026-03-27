import { useState, useCallback } from 'react';
import type { Comment, CreateCommentRequest } from '../types/comment';
import { useAuthToken } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

export const useComments = (postSlug: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const token = useAuthToken();

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/comments/${postSlug}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postSlug]);

  const createComment = useCallback(async (data: CreateCommentRequest) => {
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create comment');
    }

    return response.json();
  }, [token]);

  const deleteComment = useCallback(async (id: number) => {
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/comments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete comment');
    }
  }, [token]);

  return {
    comments,
    loading,
    fetchComments,
    createComment,
    deleteComment,
  };
};
