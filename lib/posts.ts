import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

/* ---------- Types ---------- */

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  tags?: string[];
  description?: string;
  thumbnail?: string;
  lang: string;       
  category: string;   
  [key: string]: any;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

/* ---------- Helpers ---------- */

/** Return true if a path exists and is a directory */
function isDir(p: string): boolean {
  return fs.existsSync(p) && fs.statSync(p).isDirectory();
}

/** Return all categories (sub-folders) for a given language */
export function getCategories(lang: string): string[] {
  const langDir = path.join(POSTS_DIR, lang);
  if (!isDir(langDir)) return [];
  return fs
    .readdirSync(langDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

/* ---------- Core ---------- */

export function listPosts(lang?: string, category?: string): PostMeta[] {
  const posts: PostMeta[] = [];

  // languages to process
  const langs = lang
    ? [lang]
    : isDir(POSTS_DIR)
    ? fs.readdirSync(POSTS_DIR).filter((f) => isDir(path.join(POSTS_DIR, f)))
    : [];

  for (const lng of langs) {
    const categories = category ? [category] : getCategories(lng);

    for (const cat of categories) {
      const dir = path.join(POSTS_DIR, lng, cat);
      if (!isDir(dir)) continue;

      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

      for (const file of files) {
        let raw = "";
        try {
          raw = fs.readFileSync(path.join(dir, file), "utf8");
        } catch {
          continue;
        }

        let data: any = {};
        try {
          data = matter(raw).data ?? {};
        } catch {
          data = {};
        }

        posts.push({
          slug: typeof data.slug === "string" ? data.slug : file.replace(/\.mdx$/, ""),
          title: typeof data.title === "string" ? data.title : file.replace(/\.mdx$/, ""),
          date: typeof data.date === "string" ? data.date : "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          description: typeof data.description === "string" ? data.description : "",
          thumbnail: typeof data.thumbnail === "string" ? data.thumbnail : "",
          lang: lng,        // always folder name
          category: cat,    // always folder name
          ...data,          // any extra frontmatter (won't override lang/category)
        });
      }
    }
  }

  // newest first
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Get a single post by slug */
export async function getPostBySlug(
  slug: string,
  lang?: string,
  category?: string
) {
  const langs = lang
    ? [lang]
    : isDir(POSTS_DIR)
    ? fs.readdirSync(POSTS_DIR).filter((f) => isDir(path.join(POSTS_DIR, f)))
    : [];

  for (const lng of langs) {
    const categories = category ? [category] : getCategories(lng);

    for (const cat of categories) {
      const dir = path.join(POSTS_DIR, lng, cat);
      if (!isDir(dir)) continue;

      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

      for (const file of files) {
        const raw = fs.readFileSync(path.join(dir, file), "utf8");
        const { data, content } = matter(raw);

        const postSlug = (data.slug as string) ?? file.replace(/\.mdx$/, "");
        if (postSlug !== slug) continue;

        // Debug: log when we find a matching slug (helpful during build/dev)
        if (process.env.NODE_ENV !== 'production') {
          try {
            console.log(`DEBUG: getPostBySlug matched slug="${slug}" in file=${path.join(dir, file)} (lang=${lng}, category=${cat})`);
          } catch (e) {}
        }

        const mdxSource = await serialize(content, {
          scope: data,
          mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeHighlight] },
        });

        const meta: PostMeta = {
          slug: postSlug,
          title: (data.title as string) ?? postSlug,
          date: (data.date as string) ?? "",
          tags: (data.tags as string[]) ?? [],
          description: (data.description as string) ?? "",
          thumbnail: (data.thumbnail as string) ?? "",
          lang: lng,      // <- always from folder
          category: cat,  // <- always from folder
          ...data,
        };

        return { mdxSource, meta };
      }
    }
  }

  return null;
}

/** Collect all unique tags */
export function getAllTags(lang?: string, category?: string): string[] {
  const tags = new Set<string>();
  listPosts(lang, category).forEach((p) => p.tags?.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}
