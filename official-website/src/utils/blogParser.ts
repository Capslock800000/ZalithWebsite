import { marked } from 'marked';
import type { BlogPost, BlogPostFrontmatter, TableOfContentsItem } from '../types/blog';

const parseFrontmatter = (content: string): { frontmatter: Record<string, unknown>; body: string } => {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, body: content };
  }
  
  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter: Record<string, unknown> = {};
  
  const lines = frontmatterStr.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.slice(0, colonIndex).trim();
    let value: unknown = line.slice(colonIndex + 1).trim();
    
    if (typeof value === 'string') {
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value
          .slice(1, -1)
          .split(',')
          .map((item) => item.trim().replace(/^["']|["']$/g, ''));
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
    }
    
    frontmatter[key] = value;
  }
  
  return { frontmatter, body };
};

export const parseBlogPost = (content: string): BlogPost | null => {
  const { frontmatter, body } = parseFrontmatter(content);
  
  if (!frontmatter.title || !frontmatter.slug) {
    return null;
  }
  
  return {
    title: frontmatter.title as string,
    slug: frontmatter.slug as string,
    date: (frontmatter.date as string) || new Date().toISOString().split('T')[0],
    author: (frontmatter.author as string) || 'Anonymous',
    tags: (frontmatter.tags as string[]) || [],
    description: (frontmatter.description as string) || '',
    content: body,
  };
};

export const parseBlogFrontmatter = (content: string): BlogPostFrontmatter | null => {
  const { frontmatter } = parseFrontmatter(content);
  
  if (!frontmatter.title || !frontmatter.slug) {
    return null;
  }
  
  return {
    title: frontmatter.title as string,
    slug: frontmatter.slug as string,
    date: (frontmatter.date as string) || new Date().toISOString().split('T')[0],
    author: (frontmatter.author as string) || 'Anonymous',
    tags: (frontmatter.tags as string[]) || [],
    description: (frontmatter.description as string) || '',
  };
};

export const renderMarkdown = async (content: string): Promise<string> => {
  return await marked(content);
};

export const extractTableOfContents = (html: string): TableOfContentsItem[] => {
  const headings: TableOfContentsItem[] = [];
  const regex = /<h([2-4])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, ''),
    });
  }
  
  return headings;
};

export const fetchBlogPosts = async (language: 'zh' | 'en'): Promise<BlogPostFrontmatter[]> => {
  try {
    const response = await fetch(`/blog/${language}/index.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    console.warn('Blog index not found, falling back to empty list');
  }
  return [];
};

export const fetchBlogPost = async (language: 'zh' | 'en', slug: string): Promise<BlogPost | null> => {
  try {
    const response = await fetch(`/blog/${language}/${slug}.md`);
    if (!response.ok) return null;
    
    const content = await response.text();
    return parseBlogPost(content);
  } catch {
    return null;
  }
};
