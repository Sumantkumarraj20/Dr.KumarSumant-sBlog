import Layout from "../components/Layout";
import { listPosts } from "../lib/posts";
import PostCard from "../components/PostCard";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  // add other post properties
}

interface HomeProps {
  posts: Post[];
}

export default function Home({ posts }: HomeProps) {
  return (
    <Layout>
      <div className="grid md:grid-cols-3 gap-6">Home</div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({locale}) => {
 
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['nav', 'common'])),
    },
  };
};