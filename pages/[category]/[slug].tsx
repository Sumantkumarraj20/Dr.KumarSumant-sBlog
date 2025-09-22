"use client";

import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Layout from "../../components/Layout";
import { ChakraProvider, extendTheme, Box, Text, VStack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Table, Thead, Tbody, Tr, Th, Td, Code } from "@chakra-ui/react";
import { AuthProvider } from "../../context/authContext";
import { LanguageProvider } from "../../context/languageContext";
import { getPostBySlug, PostMeta } from "@/lib/posts";

// MDX components mapping
const components = {
  Box,
  Text,
  VStack,
  img: (props: any) => <img {...props} className="rounded-md shadow-md my-4" />,
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
  code: Code,
  // Accordion for collapsible sections in MDX
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
};

interface PostPageProps {
  post: { mdxSource: MDXRemoteSerializeResult; meta: PostMeta } | null;
}

export default function PostPage({ post }: PostPageProps) {
  if (!post)
    return (
      <Layout>
        <Box p={10} textAlign="center" fontSize="xl" color="gray.600">
          Post not found
        </Box>
      </Layout>
    );

  const { meta, mdxSource } = post;

  // Chakra theme
  const theme = extendTheme({
    styles: {
      global: {
        body: {
          bg: "gray.50",
          color: "gray.800",
        },
      },
    },
  });

  return (
    <ChakraProvider theme={theme}>
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
                <MDXRemote {...mdxSource} components={components} />
              </Box>
            </Box>
          </Layout>
        </LanguageProvider>
      </AuthProvider>
    </ChakraProvider>
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

  return {
    props: {
      post,
      ...(await serverSideTranslations(lang, ["common", "nav"])),
    },
  };
};
