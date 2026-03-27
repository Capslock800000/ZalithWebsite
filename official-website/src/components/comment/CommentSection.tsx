import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useComments } from '../../hooks/useComments';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import type { CreateCommentRequest, Comment } from '../../types/comment';
import { MessageSquare } from 'lucide-react';

interface CommentSectionProps {
  postSlug: string;
}

const CommentSection = ({ postSlug }: CommentSectionProps) => {
  const { t } = useTranslation();
  const { comments, loading, fetchComments, createComment, deleteComment } = useComments(postSlug);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  useEffect(() => {
    fetchComments();
  }, [postSlug, fetchComments]);

  const handleSubmit = async (data: CreateCommentRequest) => {
    await createComment(data);
    await fetchComments();
    setReplyingTo(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('comment.deleteConfirm'))) {
      await deleteComment(id);
      await fetchComments();
    }
  };

  const handleReply = (parentId: number) => {
    setReplyingTo(parentId);
  };

  const buildCommentTree = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<number, Comment>();
    const rootComments: Comment[] = [];

    flatComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    flatComments.forEach((comment) => {
      const node = commentMap.get(comment.id)!;
      if (comment.parentId === null) {
        rootComments.push(node);
      } else {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies!.push(node);
        }
      }
    });

    return rootComments;
  };

  const commentTree = buildCommentTree(comments);
  const replyingComment = comments.find((c) => c.id === replyingTo);

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-[var(--brand)]" />
        <h3 className="text-xl font-semibold text-white">
          {t('comment.title')} ({comments.length})
        </h3>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        {replyingTo && replyingComment && (
          <div className="mb-4 p-3 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-400">
              {t('comment.replyingTo')} <span className="text-white">{replyingComment.user.username}</span>
            </p>
            <p className="text-sm text-gray-300 mt-1">{replyingComment.content}</p>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-xs text-gray-500 hover:text-white mt-2"
            >
              {t('common.cancel')}
            </button>
          </div>
        )}

        <CommentForm
          postSlug={postSlug}
          parentId={replyingTo || undefined}
          onSubmit={handleSubmit}
          onCancel={replyingTo ? () => setReplyingTo(null) : undefined}
        />

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand)] mx-auto"></div>
          </div>
        ) : (
          <CommentList
            comments={commentTree}
            onReply={handleReply}
            onDelete={handleDelete}
          />
        )}
      </div>
    </section>
  );
};

export default CommentSection;
