import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import type { CreateCommentRequest } from '../../types/comment';

interface CommentFormProps {
  postSlug: string;
  parentId?: number;
  onSubmit: (data: CreateCommentRequest) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
}

const CommentForm = ({ postSlug, parentId, onSubmit, onCancel, placeholder }: CommentFormProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setSubmitting(true);
    try {
      await onSubmit({
        postSlug,
        parentId,
        content: content.trim(),
      });
      setContent('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="py-4 text-center text-gray-400">
        <p>{t('comment.loginRequired')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="py-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder || t('comment.placeholder')}
        className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[var(--brand)] transition-colors"
        rows={3}
        disabled={submitting}
      />
      <div className="flex justify-end gap-3 mt-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            disabled={submitting}
          >
            {t('common.cancel')}
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="px-4 py-2 text-sm bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand)]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? t('common.loading') : t('comment.submit')}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
