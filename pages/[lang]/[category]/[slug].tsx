import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Layout from "../../../components/Layout";
import LangBlock from "../../../components/LangBlock";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../../../components/ui/Collapsible";
import { Tooltip } from "../../../components/ui/Tooltip";
import { getPostBySlug, listPosts, PostMeta, getCategories } from "@/lib/posts";

const components = {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Tooltip,
  LangBlock,
};

interface PostPageProps {
  post: { mdxSource: MDXRemoteSerializeResult; meta: PostMeta } | null;
}

export default function PostPage({ post }: PostPageProps) {
  if (!post) return <Layout><div className="p-10 text-center text-xl text-gray-600">Post not found</div></Layout>;

  const { meta, mdxSource } = post;

  return (
    <Layout>
      <article className="prose max-w-3xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">{meta.title}</h1>
          <p className="text-sm text-slate-500">{meta.date}{meta.tags?.length ? ` · ${meta.tags.join(", ")}` : ""}</p>
        </header>
        <MDXRemote {...mdxSource} components={components} />
      </article>
    </Layout>
  );
}

/** Static paths */
export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const paths: { params: { lang: string; category: string; slug: string } }[] = [];

  for (const lng of locales || ["en"]) {
    const categories = getCategories(lng);
    for (const category of categories) {
      const posts = listPosts(lng, category);
      posts.forEach((post) => paths.push({ params: { lang: lng, category, slug: post.slug } }));
    }
  }

  return { paths, fallback: false };
};

/** Static props */
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const lang = params?.lang as string;
  const category = params?.category as string;
  const slug = params?.slug as string;

  const post = await getPostBySlug(lang, category, slug); 

  return {
    props: {
      post,
      ...(await serverSideTranslations(locale ?? lang ?? "en", ["common", "nav"])),
    },
  };
};
