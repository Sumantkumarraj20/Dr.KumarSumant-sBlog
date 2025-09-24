"use client";

import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Layout from "../../components/Layout";
import { Box, Text, VStack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Table, Thead, Tbody, Tr, Th, Td, Code, Image, Grid, Heading } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import MCQ from "../../components/MCQ";
import { AuthProvider } from "../../context/authContext";
import { LanguageProvider } from "../../context/languageContext";
import { getPostBySlug, PostMeta, listPosts } from "@/lib/posts";
import PostCard from "../../components/PostCard";

// Note: MDX components mapping is created inside PostPage so we can use Chakra's theming

interface PostPageProps {
  post: { mdxSource: MDXRemoteSerializeResult; meta: PostMeta } | null;
  relatedPosts?: PostMeta[];
  locale?: string;
}

export default function PostPage({ post, relatedPosts = [], locale }: PostPageProps) {
  if (!post)
    return (
      <Layout>
        <Box p={10} textAlign="center" fontSize="xl" color="gray.600">
          Post not found
        </Box>
      </Layout>
    );

  const { meta, mdxSource } = post;

  // MDX components mapping (use Chakra Image for responsive full-width images)
  const mdxComponents = {
    Box,
    Text,
    VStack,
    img: (props: any) => {
      const src = props.src || "https://placehold.co/600x400/EEE/31343C";
      const alt = props.alt || "";
      return (
        <Image
          src={src}
          alt={alt}
          w="full"
          h="auto"
          objectFit="cover"
          borderRadius="md"
          boxShadow="md"
          my={6}
        />
      );
    },
    table: Table,
    thead: Thead,
    tbody: Tbody,
    tr: Tr,
    th: Th,
    td: Td,
    code: Code,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    MCQ,
  };

  return (
    <AuthProvider>
      <LanguageProvider>
        <Layout>
          <Box maxW="5xl" mx="auto" px={4} py={10}>
              {/* Post Header */}
              <VStack spacing={2} mb={10} align="start">
                <Text as="h1" fontSize="4xl" fontWeight="bold">
                  {meta.title}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {meta.date}
                  {meta.tags?.length ? ` · ${meta.tags.join(", ")}` : ""}
                </Text>
                {meta.description && (
                  <Text fontSize="md" mt={2} color="gray.600">
                    {meta.description}
                  </Text>
                )}
              </VStack>

              {/* MDX Content */}
              <Box
                className="prose prose-slate dark:prose-invert max-w-none"
                sx={{
                  h1: { fontSize: "2xl", fontWeight: "bold", mt: 8, mb: 4 },
                  h2: { fontSize: "xl", fontWeight: "semibold", mt: 6, mb: 3 },
                  h3: { fontSize: "lg", fontWeight: "semibold", mt: 5, mb: 2 },
                  p: { lineHeight: "tall", mb: 3 },
                  li: { mb: 2 },
                  blockquote: { borderLeft: "4px solid", borderColor: "blue.400", pl: 4, fontStyle: "italic", color: "gray.600" },
                  table: { width: "full", borderCollapse: "collapse", mb: 6 },
                  th: { borderBottom: "2px solid", borderColor: "gray.300", p: 2, textAlign: "left" },
                  td: { borderBottom: "1px solid", borderColor: "gray.200", p: 2 },
                  em: { fontStyle: "italic" }, // fix italic rendering
                  strong: { fontWeight: "semibold" },
                }}
              >
                <MDXRemote {...mdxSource} components={mdxComponents} />
              </Box>

              {/* Related posts */}
              {relatedPosts && relatedPosts.length > 0 && (
                <Box mt={12}>
                  <Heading size="md" mb={4}>Related posts</Heading>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }} gap={6}>
                    {relatedPosts.map((p) => (
                      // PostCard expects meta and optional locale
                      <PostCard key={`${p.lang}-${p.category}-${p.slug}`} meta={p as any} locale={locale} />
                    ))}
                  </Grid>
                </Box>
              )}
          </Box>
        </Layout>
      </LanguageProvider>
    </AuthProvider>
  );
}

// Static paths (fallback)
export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
};

// Static props for post
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const lang = locale || "en";
  const category = params?.category as string;
  const slug = params?.slug as string;

  const post = await getPostBySlug(slug, lang, category);

  // compute related posts: same category first, excluding the current slug
  let related: PostMeta[] = [];
  try {
    const all = listPosts(lang, category);
    related = all.filter((p) => p.slug !== slug).slice(0, 6);
    // prefer posts sharing tags if available
    if (post?.meta?.tags?.length) {
      const tagSet = new Set(post.meta.tags);
      const byTag = all
        .filter((p) => p.slug !== slug)
        .map((p) => ({ p, common: (p.tags || []).filter((t) => tagSet.has(t)).length }))
        .filter((x) => x.common > 0)
        .sort((a, b) => b.common - a.common)
        .map((x) => x.p);
      related = Array.from(new Set([...byTag, ...related])).slice(0, 3);
    } else {
      related = related.slice(0, 3);
    }
  } catch (e) {
    related = [];
  }

  return {
    props: {
      post,
      relatedPosts: related,
      locale: lang,
      ...(await serverSideTranslations(lang, ["common", "nav"])),
    },
  };
};
