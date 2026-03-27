export interface BlogPostFrontmatter {
  title: string;
  slug: string;
  date: string;
  author: string;
  tags: string[];
  description: string;
}

export interface BlogPost extends BlogPostFrontmatter {
  content: string;
}

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}
