import { useTranslation } from 'react-i18next';
import type { BlogPostFrontmatter } from '../../types/blog';
import BlogCard from './BlogCard';

interface BlogListProps {
  posts: BlogPostFrontmatter[];
  language: 'zh' | 'en';
}

const BlogList = ({ posts, language }: BlogListProps) => {
  const { t } = useTranslation();

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">{t('blog.noPosts')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} language={language} />
      ))}
    </div>
  );
};

export default BlogList;
