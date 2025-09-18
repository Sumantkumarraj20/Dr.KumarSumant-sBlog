import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

type PostData = {
  title: string
  date: string
  author?: string
  file: string
  [key: string]: any
}

const postsPath = path.join(process.cwd(), 'content', 'posts')

export function listPosts(): PostData[] {
  const files = fs.readdirSync(postsPath)
  return files
    .filter(f => f.endsWith('.mdx'))
    .map(fname => {
      const full = path.join(postsPath, fname)
      const md = fs.readFileSync(full, 'utf8')
      const { data } = matter(md)
      return { ...data, file: fname } as PostData
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPostBySlug(slug: string) {
  const files = fs.readdirSync(postsPath)
  const match = files.find(f => f.includes(slug) || f.replace('.mdx','') === slug)
  if(!match) return null
  const full = path.join(postsPath, match)
  const source = fs.readFileSync(full, 'utf8')
  const { content, data } = matter(source)
  const mdxSource = await serialize(content, { 
    scope: data, 
    mdxOptions: { 
      remarkPlugins: [remarkGfm], 
      rehypePlugins: [rehypeHighlight] 
    }
  })
  return { mdxSource, meta: data as PostData }
}
export function getAllTags(): string[] {
  const posts = listPosts()
  const tags = new Set<string>()
  posts.forEach(p => {
    if(p.tags && Array.isArray(p.tags)) {
      p.tags.forEach((t: string) => tags.add(t))
    }
  })
  return Array.from(tags).sort()
}