
import Layout from '../../components/Layout'
import { getPostBySlug } from '../../lib/posts'
import { MDXRemote } from 'next-mdx-remote'

export default function Post({post}:{post:any}) {
  if(!post) return <Layout><div>Post not found</div></Layout>
  return (
    <Layout>
      <article className="prose max-w-none">
        <h1>{post.meta.title}</h1>
        <p className="text-sm text-slate-500">{post.meta.date} · {post.meta.tags?.join(', ')}</p>
        <MDXRemote {...post.mdxSource} />
      </article>
    </Layout>
  )
}

export async function getStaticPaths() {
  const posts = (await import('../../lib/posts')).listPosts()
  const paths = posts.map(p => ({
    params: { slug: p.slug }
  }))
  return { paths, fallback: false }
}

export async function getStaticProps({params}:{params:any}){
  const post = await getPostBySlug(params.slug)
  return { props: { post } }
}
