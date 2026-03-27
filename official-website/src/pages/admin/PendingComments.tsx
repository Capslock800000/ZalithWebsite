import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthToken } from '../../contexts/AuthContext';
import type { Comment } from '../../types/comment';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

const PendingComments = () => {
  const { t } = useTranslation();
  const token = useAuthToken();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchComments = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/comments?status=pending&pageSize=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [token]);

  const updateStatus = async (id: number, status: 'approved' | 'rejected') => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/admin/comments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
        setSelectedIds((prev) => prev.filter((i) => i !== id));
      }
    } catch (error) {
      console.error('Failed to update comment status:', error);
    }
  };

  const deleteComment = async (id: number) => {
    if (!token || !window.confirm(t('admin.comments.deleteConfirm'))) return;

    try {
      const response = await fetch(`${API_BASE}/admin/comments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
        setSelectedIds((prev) => prev.filter((i) => i !== id));
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleBatchAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (!token || selectedIds.length === 0) return;

    try {
      const response = await fetch(`${API_BASE}/admin/comments/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds, action }),
      });

      if (response.ok) {
        setComments((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
        setSelectedIds([]);
      }
    } catch (error) {
      console.error('Failed to batch action:', error);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === comments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(comments.map((c) => c.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-1)] mb-8">{t('admin.stats.pendingComments')}</h1>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-[var(--brand)]/10 border border-[var(--brand)]/30 rounded-lg">
          <span className="text-sm text-[var(--brand)]">
            {t('admin.comments.selected', { count: selectedIds.length })}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBatchAction('approve')}
              className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm hover:bg-green-500/30"
            >
              <CheckCircle className="w-4 h-4" />
              {t('admin.comments.batchApprove')}
            </button>
            <button
              onClick={() => handleBatchAction('reject')}
              className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30"
            >
              <XCircle className="w-4 h-4" />
              {t('admin.comments.batchReject')}
            </button>
            <button
              onClick={() => handleBatchAction('delete')}
              className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30"
            >
              <Trash2 className="w-4 h-4" />
              {t('admin.comments.batchDelete')}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-[var(--bg-alt)] border border-[var(--divider)]/20 rounded-xl p-12 text-center">
          <p className="text-[var(--text-2)]">No pending comments</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={selectedIds.length === comments.length}
              onChange={toggleSelectAll}
              className="rounded border-[var(--divider)] bg-[var(--bg)]"
            />
            <span className="text-sm text-[var(--text-2)]">{t('admin.comments.selectAll')}</span>
          </div>

          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-[var(--bg-alt)] border border-[var(--divider)]/20 rounded-xl p-4"
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(comment.id)}
                  onChange={() => toggleSelect(comment.id)}
                  className="mt-1 rounded border-[var(--divider)] bg-[var(--bg)]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--brand)]/20 flex items-center justify-center">
                      <span className="text-[var(--brand)] text-sm font-semibold">
                        {comment.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-[var(--text-1)]">{comment.user.username}</span>
                    <span className="text-xs text-[var(--text-2)]">{formatDate(comment.createdAt)}</span>
                    <span className="text-xs text-[var(--text-2)]">on {comment.postSlug}</span>
                  </div>
                  <p className="text-[var(--text-2)] text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateStatus(comment.id, 'approved')}
                    className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                    title={t('admin.comments.approve')}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => updateStatus(comment.id, 'rejected')}
                    className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30"
                    title={t('admin.comments.reject')}
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                    title={t('admin.comments.delete')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingComments;
