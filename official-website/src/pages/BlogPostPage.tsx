import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { marked } from 'marked';
import { useLanguage } from '../hooks/useLanguage';
import TableOfContents from '../components/blog/TableOfContents';
import CommentSection from '../components/comment/CommentSection';
import { fetchBlogPost, extractTableOfContents } from '../utils/blogParser';
import type { BlogPost, TableOfContentsItem } from '../types/blog';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [toc, setToc] = useState<TableOfContentsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const language = currentLanguage as 'zh' | 'en';

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      setLoading(true);
      const fetchedPost = await fetchBlogPost(language, slug);
      if (fetchedPost) {
        setPost(fetchedPost);
        const html = await marked(fetchedPost.content);
        
        const htmlWithIds = html.replace(
          /<h([2-4])>(.*?)<\/h\1>/g,
          (_, level, text) => {
            const id = text
              .toLowerCase()
              .replace(/<[^>]*>/g, '')
              .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
              .replace(/^-|-$/g, '');
            return `<h${level} id="${id}">${text}</h${level}>`;
          }
        );
        
        setHtmlContent(htmlWithIds);
        setToc(extractTableOfContents(htmlWithIds));
      }
      setLoading(false);
    };
    loadPost();
  }, [slug, language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-20">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)] mx-auto"></div>
          <p className="text-gray-400 mt-4">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{t('blog.notFound')}</h1>
          <Link
            to={`/${language}/blog`}
            className="inline-flex items-center gap-2 text-[var(--brand)] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('blog.backToList')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12 max-w-4xl">
          <Link
            to={`/${language}/blog`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('blog.backToList')}
          </Link>

          <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="flex gap-8">
          <div className="flex-1 max-w-4xl">
            <div
              className="prose prose-invert prose-lg max-w-none
                prose-headings:text-white prose-headings:font-semibold
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-gray-300 prose-p:leading-relaxed
                prose-a:text-[var(--brand)] prose-a:no-underline hover:prose-a:underline
                prose-code:text-[var(--brand)] prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10
                prose-blockquote:border-[var(--brand)] prose-blockquote:text-gray-400
                prose-img:rounded-lg prose-img:border prose-img:border-white/10"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            <div className="mt-16 pt-8 border-t border-white/10">
              <CommentSection postSlug={post.slug} />
            </div>
          </div>

          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              <TableOfContents items={toc} />
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
};

export default BlogPostPage;
