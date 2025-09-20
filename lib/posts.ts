// lib/posts.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  tags?: string[];
  author?: string;
  [key: string]: any;
};

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

/** List all posts (no content) */
export function listPosts(): PostMeta[] {
  const files = fs.readdirSync(POSTS_DIR);

  return files
    .filter((f) => f.endsWith('.mdx'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
      const { data } = matter(raw);
      return {
        slug: (data.slug as string) ?? file.replace(/\.mdx$/, ''),
        title: (data.title as string) ?? file.replace(/\.mdx$/, ''),
        date: (data.date as string) ?? '',
        tags: (data.tags as string[]) ?? [],
        ...data,
      } as PostMeta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Get a post (content + meta) by slug */
export async function getPostBySlug(slug: string) {
  const files = fs.readdirSync(POSTS_DIR);
  const fileName =
    files.find((f) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8');
      const { data } = matter(raw);
      return data.slug === slug;
    }) ?? files.find((f) => f.replace(/\.mdx$/, '') === slug);

  if (!fileName) return null;

  const source = fs.readFileSync(path.join(POSTS_DIR, fileName), 'utf8');
  const { content, data } = matter(source);

  const mdxSource = await serialize(content, {
    scope: data,
    mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeHighlight] },
  });

  return { mdxSource, meta: data as PostMeta };
}

/** Collect all unique tags */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  listPosts().forEach((p) => p.tags?.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}
