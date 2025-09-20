import Layout from "../components/Layout";
import { listPosts } from "../lib/posts";
import PostCard from "../components/PostCard";

export default function Blog({ posts }: { posts: any[] }) {
  return (
    <Layout>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.slug} meta={post} />
        ))}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const posts = listPosts();
  return { props: { posts } };
}
