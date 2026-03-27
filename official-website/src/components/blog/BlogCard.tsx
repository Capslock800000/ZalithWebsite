import { Link } from 'react-router-dom';
import type { BlogPostFrontmatter } from '../../types/blog';
import { Calendar, User, Tag } from 'lucide-react';

interface BlogCardProps {
  post: BlogPostFrontmatter;
  language: 'zh' | 'en';
}

const BlogCard = ({ post, language }: BlogCardProps) => {
  const postUrl = `/${language}/blog/${post.slug}`;

  return (
    <Link to={postUrl} className="block group">
      <article className="bg-[var(--bg-alt)] backdrop-blur-sm border border-[var(--divider)]/20 rounded-xl p-6 hover:border-[var(--brand)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--brand)]/10">
        <h2 className="text-xl font-semibold text-[var(--text-1)] group-hover:text-[var(--brand)] transition-colors mb-3">
          {post.title}
        </h2>
        
        <p className="text-[var(--text-2)] text-sm mb-4 line-clamp-2">
          {post.description}
        </p>
        
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-2)]">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{post.date}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>{post.author}</span>
          </div>
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg)] rounded-md text-xs text-[var(--text-2)]"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
};

export default BlogCard;
