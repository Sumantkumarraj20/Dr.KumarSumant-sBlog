import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import { listPosts, PostMeta, getCategories } from "@/lib/posts";
import { GetStaticProps } from "next";

interface BlogProps {
  posts: PostMeta[];
  categories: string[];
  currentLang: string;
}

export default function Blog({ posts, categories, currentLang }: BlogProps) {
  // Group posts by category
  const postsByCategory: Record<string, PostMeta[]> = {};
  categories.forEach((cat) => {
    postsByCategory[cat] = posts.filter((p) => p.category === cat);
  });

  return (
    <Layout>
      {categories.map((cat) => (
        <section key={cat} className="mb-12">
          <h2 className="text-2xl font-bold mb-4">{cat}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {postsByCategory[cat].length > 0 ? (
              postsByCategory[cat].map((post) => (
                <PostCard key={post.slug} meta={post} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                No posts in this category
              </p>
            )}
          </div>
        </section>
      ))}
    </Layout>
  );
}

/** Fetch posts at build time (server-side only) */
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLang = locale || "en";
  const categories = getCategories(currentLang);
  const posts = categories.flatMap((cat) => listPosts(currentLang, cat));

  return {
    props: {
      posts,
      categories,
      currentLang,
      ...(await serverSideTranslations(locale || 'en', ['nav', 'common'])),
    },
  };
};

