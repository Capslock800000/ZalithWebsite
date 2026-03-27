import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import type { Comment } from '../../types/comment';

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: number) => void;
  onDelete: (id: number) => void;
}

const CommentItem = ({ comment, onReply, onDelete }: CommentItemProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOwner = user?.id === comment.userId;

  return (
    <div className="py-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--brand)]/20 flex items-center justify-center flex-shrink-0">
          {comment.user.avatarUrl ? (
            <img
              src={comment.user.avatarUrl}
              alt={comment.user.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-[var(--brand)] font-semibold">
              {comment.user.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white">{comment.user.username}</span>
            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
          </div>

          <p className="text-gray-300 text-sm whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          <div className="flex items-center gap-4 mt-2">
            {user && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-xs text-gray-500 hover:text-[var(--brand)] transition-colors"
              >
                {t('comment.reply')}
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                {t('comment.delete')}
              </button>
            )}
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-[var(--brand)] hover:underline"
              >
                {showReplies
                  ? t('comment.hideReplies', { count: comment.replies.length })
                  : t('comment.showReplies', { count: comment.replies.length })}
              </button>

              {showReplies && (
                <div className="mt-3 pl-4 border-l border-white/10 space-y-4">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      onReply={onReply}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
