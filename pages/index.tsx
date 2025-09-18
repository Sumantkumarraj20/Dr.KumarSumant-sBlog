
import Layout from '../components/Layout'
import { listPosts } from '../lib/posts'
import PostCard from '../components/PostCard'

export default function Home({posts}:{posts:any[]}) {
  return (
    <Layout>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map(p=> <PostCard key={p.slug} meta={p} />)}
      </div>
    </Layout>
  )
}

export async function getStaticProps(){
  const posts = listPosts()
  return { props: { posts } }
}
