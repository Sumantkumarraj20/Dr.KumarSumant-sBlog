import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Layout from "../../components/Layout";
// LangBlock is a client component; provide a server-safe replacement below
import { Collapsible, CollapsibleTrigger, CollapsibleContent, Collapse } from "../../components/ui/Collapsible";
import { Tooltip } from "../../components/ui/Tooltip";
import Image from 'next/image';
import { Tabs, TabList, Tab, TabPanel } from '@chakra-ui/react';
import { getPostBySlug, listPosts, PostMeta, getCategories } from "@/lib/posts";
import { ChakraProvider } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';
import { AuthProvider } from '../../context/authContext';
import { LanguageProvider } from '../../context/languageContext';

// base components mapping; LangBlock will be injected per-post to access meta.lang
const baseComponents = {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Collapse,
  Tooltip,
  // Provide a lightweight Image component for MDX content that expects <Image>
  Image: (props: any) => <img {...props} />,
  Tabs,
  TabList,
  Tab,
  TabPanel,
};

interface PostPageProps {
  post: { mdxSource: MDXRemoteSerializeResult; meta: PostMeta } | null;
}

export default function PostPage({ post }: PostPageProps) {
  if (!post) return <Layout><div className="p-10 text-center text-xl text-gray-600">Post not found</div></Layout>;

  const { meta, mdxSource } = post;

  const theme = extendTheme({});

  // Server-side LangBlock component that checks the post's declared language
  const ServerLangBlock = ({ lang, children }: { lang: string; children: React.ReactNode }) => {
    // meta.lang can be an array in frontmatter; normalize to string
    const postLang = Array.isArray(meta.lang) ? meta.lang[0] : (meta.lang as string) || meta.lang || '';
    return postLang === lang ? <>{children}</> : null;
  };

  const components = { ...baseComponents, LangBlock: ServerLangBlock };

  return (
    <Layout>
      <article className="prose max-w-3xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">{meta.title}</h1>
          <p className="text-sm text-slate-500">{meta.date}{meta.tags?.length ? ` \u00b7 ${meta.tags.join(", ")}` : ""}</p>
        </header>
        <ChakraProvider theme={theme}>
          <AuthProvider>
            <LanguageProvider>
              <MDXRemote {...mdxSource} components={components} />
            </LanguageProvider>
          </AuthProvider>
        </ChakraProvider>
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const lang = locale as string || 'en';
  const category = params?.category as string;
  const slug = params?.slug as string;

  const post = await getPostBySlug(slug, lang, category);

  return {
    props: {
      post,
      ...(await serverSideTranslations(lang ?? 'en', ["common", "nav"])),
    },
  };
};

