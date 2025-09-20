// pages/[slug].tsx
import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Layout from "../../components/Layout";
import { getPostBySlug, listPosts, PostMeta } from "../../lib/posts";
import LangBlock from "../../components/LangBlock"; 

interface PostPageProps {
  post: { mdxSource: MDXRemoteSerializeResult; meta: PostMeta } | null;
}

export default function PostPage({ post }: PostPageProps) {
  if (!post) {
    return (
      <Layout>
        <div className="p-10 text-center text-xl text-gray-600">
          Post not found
        </div>
      </Layout>
    );
  }

  const { meta, mdxSource } = post;

  return (
    <Layout>
      <article className="prose max-w-3xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">{meta.title}</h1>
          <p className="text-sm text-slate-500">
            {meta.date}
            {meta.tags?.length ? ` · ${meta.tags.join(", ")}` : ""}
          </p>
        </header>

        {/* Pass components here 👇 */}
        <MDXRemote {...mdxSource} components={{ LangBlock }} />
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const posts = listPosts();
  const paths =
    locales?.flatMap((lng) =>
      posts.map((p) => ({
        params: { slug: p.slug },
        locale: lng,
      }))
    ) ?? [];

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const post = await getPostBySlug(params?.slug as string);
  return {
    props: {
      post,
      ...(await serverSideTranslations(locale ?? "en", ["common", "nav"])),
    },
  };
};
