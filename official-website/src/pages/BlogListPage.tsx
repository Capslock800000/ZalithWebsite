import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BlogList from '../components/blog/BlogList';
import type { BlogPostFrontmatter } from '../types/blog';
import { fetchBlogPosts } from '../utils/blogParser';
import { useLanguage } from '../hooks/useLanguage';

const BlogListPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [posts, setPosts] = useState<BlogPostFrontmatter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const language = currentLanguage as 'zh' | 'en';

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const fetchedPosts = await fetchBlogPosts(language);
      setPosts(fetchedPosts);
      setLoading(false);
    };
    loadPosts();
  }, [language]);

  const allTags = [...new Set(posts.flatMap((post) => post.tags))];

  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags.includes(selectedTag))
    : posts;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t('blog.title')}</h1>
          <p className="text-gray-400 text-lg">{t('blog.subtitle')}</p>
        </header>

        {allTags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedTag === null
                    ? 'bg-[var(--brand)] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {t('blog.allTags')}
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedTag === tag
                      ? 'bg-[var(--brand)] text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)] mx-auto"></div>
            <p className="text-gray-400 mt-4">{t('common.loading')}</p>
          </div>
        ) : (
          <BlogList posts={filteredPosts} language={language} />
        )}
      </div>
    </div>
  );
};

export default BlogListPage;
