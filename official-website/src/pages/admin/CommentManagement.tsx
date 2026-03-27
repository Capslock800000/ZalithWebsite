import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthToken } from '../../contexts/AuthContext';
import type { Comment } from '../../types/comment';
import type { CommentListParams, BatchActionRequest } from '../../types/admin';
import { Search, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

const CommentManagement = () => {
  const { t } = useTranslation();
  const token = useAuthToken();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<CommentListParams>({
    page: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchComments = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
      if (params.status) searchParams.set('status', params.status);
      if (params.search) searchParams.set('search', params.search);

      const response = await fetch(`${API_BASE}/admin/comments?${searchParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [token, params.page, params.status]);

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
        fetchComments();
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
        fetchComments();
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
        body: JSON.stringify({ ids: selectedIds, action } as BatchActionRequest),
      });

      if (response.ok) {
        setSelectedIds([]);
        fetchComments();
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

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      pending: 'bg-yellow-500/20 text-yellow-400',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const tabs = [
    { status: undefined, label: t('admin.comments.all') },
    { status: 'pending' as const, label: t('admin.comments.pending') },
    { status: 'approved' as const, label: t('admin.comments.approved') },
    { status: 'rejected' as const, label: t('admin.comments.rejected') },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">{t('admin.comments.title')}</h1>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setParams({ ...params, page: 1, status: tab.status })}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                params.status === tab.status
                  ? 'bg-[var(--brand)] text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder={t('admin.comments.search')}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)]"
            onChange={(e) => setParams({ ...params, search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && fetchComments()}
          />
        </div>
      </div>

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

      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === comments.length && comments.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-white/20 bg-white/5"
                  />
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">User</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Post</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Content</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Date</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No comments found
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr key={comment.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(comment.id)}
                        onChange={() => toggleSelect(comment.id)}
                        className="rounded border-white/20 bg-white/5"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{comment.id}</td>
                    <td className="px-6 py-4 text-sm text-white">{comment.user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{comment.postSlug}</td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                      {comment.content}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(comment.status)}`}>
                        {comment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{formatDate(comment.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {comment.status !== 'approved' && (
                          <button
                            onClick={() => updateStatus(comment.id, 'approved')}
                            className="p-1 text-green-400 hover:bg-green-500/20 rounded"
                            title={t('admin.comments.approve')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {comment.status !== 'rejected' && (
                          <button
                            onClick={() => updateStatus(comment.id, 'rejected')}
                            className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded"
                            title={t('admin.comments.reject')}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                          title={t('admin.comments.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total > 10 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setParams({ ...params, page: (params.page || 1) - 1 })}
            disabled={params.page === 1}
            className="px-4 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-400">
            Page {params.page} of {Math.ceil(total / 10)}
          </span>
          <button
            onClick={() => setParams({ ...params, page: (params.page || 1) + 1 })}
            disabled={(params.page || 1) >= Math.ceil(total / 10)}
            className="px-4 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentManagement;
