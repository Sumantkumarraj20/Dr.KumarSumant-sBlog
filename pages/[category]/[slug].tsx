"use client";

import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Layout from "../../components/Layout";
import {
  Box,
  Text,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  Image,
  Grid,
  Heading,
  Skeleton,
  SkeletonText,
  useColorModeValue,
} from "@chakra-ui/react";
import { AuthProvider } from "../../context/authContext";
import { LanguageProvider } from "../../context/languageContext";
import { getPostBySlug, PostMeta, listPosts } from "@/lib/posts";
import SEO from "@/components/Seo";

// Lazy load heavy components
const PostCard = lazy(() => import("../../components/PostCard"));
const MCQ = lazy(() => import("../../components/MCQ"));

// Optimized MDX components with memoization
const createMDXComponents = () => {
  const ResponsiveImage = (props: any) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const src = props.src || "https://placehold.co/600x400/EEE/31343C";
    const alt = props.alt || "";

    return (
      <Box position="relative" my={6}>
        {isLoading && (
          <Skeleton height="300px" width="100%" borderRadius="md" />
        )}
        <Image
          src={hasError ? "https://placehold.co/600x400/EEE/31343C" : src}
          alt={alt}
          w="full"
          h="auto"
          maxH="400px"
          objectFit="cover"
          borderRadius="md"
          boxShadow="md"
          opacity={isLoading ? 0 : 1}
          transition="opacity 0.3s ease"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          loading="lazy"
          decoding="async"
        />
      </Box>
    );
  };

  const MemoizedImage = ResponsiveImage;

  return {
    Box,
    Text,
    VStack,
    img: MemoizedImage,
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
    MCQ: (props: any) => (
      <Suspense fallback={<Skeleton height="200px" width="100%" />}>
        <MCQ {...props} />
      </Suspense>
    ),
  };
};

interface PostPageProps {
  post: { mdxSource: MDXRemoteSerializeResult; meta: PostMeta } | null;
  relatedPosts?: PostMeta[];
  locale?: string;
}

// Loading components
const PostHeaderSkeleton = () => (
  <VStack spacing={2} mb={10} align="start">
    <Skeleton height="40px" width="80%" />
    <Skeleton height="20px" width="40%" />
    <Skeleton height="20px" width="60%" />
  </VStack>
);

const ContentSkeleton = () => (
  <Box>
    <SkeletonText mt="4" noOfLines={10} spacing="4" />
    <Skeleton height="200px" mt="6" />
    <SkeletonText mt="4" noOfLines={8} spacing="4" />
  </Box>
);

const RelatedPostsSkeleton = () => (
  <Box mt={12}>
    <Skeleton height="30px" width="200px" mb={4} />
    <Grid templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }} gap={6}>
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} height="200px" borderRadius="md" />
      ))}
    </Grid>
  </Box>
);

export default function PostPage({
  post,
  relatedPosts = [],
  locale,
}: PostPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [mdxComponents, setMdxComponents] = useState<any>(null);

  // Preload and memoize MDX components
  useEffect(() => {
    // Load components after initial render to prevent blocking
    const timer = setTimeout(() => {
      setMdxComponents(createMDXComponents());
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Memoize expensive computations
  const processedRelatedPosts = useMemo(() => {
    if (!relatedPosts || relatedPosts.length === 0) return [];
    return relatedPosts.slice(0, 3); // Limit to 3 posts for performance
  }, [relatedPosts]);

  const proseStyles = useMemo(
    () => ({
      h1: { fontSize: "2xl", fontWeight: "bold", mt: 8, mb: 4 },
      h2: { fontSize: "xl", fontWeight: "semibold", mt: 6, mb: 3 },
      h3: { fontSize: "lg", fontWeight: "semibold", mt: 5, mb: 2 },
      p: { lineHeight: "tall", mb: 3 },
      li: { mb: 2 },
      blockquote: {
        borderLeft: "4px solid",
        borderColor: useColorModeValue("blue.400", "blue.300"),
        pl: 4,
        fontStyle: "italic",
        color: useColorModeValue("gray.600", "gray.300"),
      },
      table: { width: "full", borderCollapse: "collapse", mb: 6 },
      th: {
        borderBottom: "2px solid",
        borderColor: useColorModeValue("gray.300", "gray.600"),
        p: 2,
        textAlign: "left",
      },
      td: {
        borderBottom: "1px solid",
        borderColor: useColorModeValue("gray.200", "gray.500"),
        p: 2,
      },
      em: { fontStyle: "italic" },
      strong: { fontWeight: "semibold" },
    }),
    []
  );

  if (!post) {
    return (
      <Layout>
        <Box p={10} textAlign="center" fontSize="xl" color="gray.600">
          Post not found
        </Box>
      </Layout>
    );
  }

  const { meta, mdxSource } = post;

  return (
    <>
      <SEO title={meta.title} />
      <AuthProvider>
        <LanguageProvider>
          <Layout>
            <Box maxW="5xl" mx="auto" px={4} py={10}>
              {/* Post Header */}
              {isLoading ? (
                <PostHeaderSkeleton />
              ) : (
                <VStack spacing={2} mb={10} align="start">
                  <Text
                    as="h1"
                    fontSize={{ base: "3xl", md: "4xl" }}
                    fontWeight="bold"
                    bgGradient={useColorModeValue(
                      "linear(to-r, blue.600, purple.600)",
                      "linear(to-r, blue.300, purple.300)"
                    )}
                    bgClip="text"
                  >
                    {meta.title}
                  </Text>
                  <Text
                    fontSize="sm"
                    color={useColorModeValue("gray.500", "gray.400")}
                  >
                    {meta.date}
                    {meta.tags?.length ? ` · ${meta.tags.join(", ")}` : ""}
                  </Text>
                  {meta.description && (
                    <Text
                      fontSize="md"
                      mt={2}
                      color={useColorModeValue("gray.600", "gray.300")}
                      fontStyle="italic"
                    >
                      {meta.description}
                    </Text>
                  )}
                </VStack>
              )}

              {/* MDX Content */}
              <Box
                className="prose prose-slate dark:prose-invert max-w-none"
                sx={proseStyles}
              >
                {isLoading || !mdxComponents ? (
                  <ContentSkeleton />
                ) : (
                  <MDXRemote {...mdxSource} components={mdxComponents} />
                )}
              </Box>

              {/* Related posts with lazy loading */}
              {processedRelatedPosts.length > 0 && (
                <Box mt={12}>
                  <Heading size="md" mb={4}>
                    Related posts
                  </Heading>
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }}
                    gap={6}
                  >
                    <Suspense fallback={<RelatedPostsSkeleton />}>
                      {processedRelatedPosts.map((postMeta) => (
                        <PostCard
                          key={`${postMeta.lang}-${postMeta.category}-${postMeta.slug}`}
                          meta={postMeta as any}
                          locale={locale}
                        />
                      ))}
                    </Suspense>
                  </Grid>
                </Box>
              )}
            </Box>
          </Layout>
        </LanguageProvider>
      </AuthProvider>
    </>
  );
}

// Optimized Static Paths
export const getStaticPaths: GetStaticPaths = async () => {
  // Generate only popular paths initially, let others be generated on-demand
  return {
    paths: [],
    fallback: "blocking",
  };
};

// Optimized Static Props with Caching
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const lang = locale || "en";
  const category = params?.category as string;
  const slug = params?.slug as string;

  try {
    // Parallel data fetching
    const [post, translations] = await Promise.all([
      getPostBySlug(slug, lang, category),
      serverSideTranslations(lang, ["common", "nav"]),
    ]);

    if (!post) {
      return {
        notFound: true,
      };
    }

    // Compute related posts efficiently
    let related: PostMeta[] = [];
    try {
      const allPosts = listPosts(lang, category);

      // Simple related posts algorithm for performance
      if (post.meta?.tags?.length) {
        const tagSet = new Set(post.meta.tags);
        related = allPosts
          .filter((p) => p.slug !== slug)
          .sort((a, b) => {
            const aTags = new Set(a.tags || []);
            const bTags = new Set(b.tags || []);
            const aCommon = [...tagSet].filter((t) => aTags.has(t)).length;
            const bCommon = [...tagSet].filter((t) => bTags.has(t)).length;
            return bCommon - aCommon;
          })
          .slice(0, 3);
      } else {
        related = allPosts.filter((p) => p.slug !== slug).slice(0, 3);
      }
    } catch (e) {
      console.error("Error computing related posts:", e);
      related = [];
    }

    return {
      props: {
        post,
        relatedPosts: related,
        locale: lang,
        ...translations,
      },
      // Incremental Static Regeneration - regenerate after 1 hour
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Error generating post page:", error);
    return {
      notFound: true,
    };
  }
};
