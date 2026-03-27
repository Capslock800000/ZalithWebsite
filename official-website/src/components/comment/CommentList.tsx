import { useTranslation } from 'react-i18next';
import type { Comment } from '../../types/comment';
import CommentItem from './CommentItem';

interface CommentListProps {
  comments: Comment[];
  onReply: (parentId: number) => void;
  onDelete: (id: number) => void;
}

const CommentList = ({ comments, onReply, onDelete }: CommentListProps) => {
  const { t } = useTranslation();

  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400">
        <p>{t('comment.noComments')}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default CommentList;
