"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import { listPosts, PostMeta, getCategories } from "@/lib/posts";
import {
  Box,
  Heading,
  Text,
  Flex,
  Divider,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { FolderIcon } from "@heroicons/react/24/outline";

interface BlogProps {
  posts: PostMeta[];
  categories: string[];
  currentLang: string;
}

export default function Blog({ posts, categories, currentLang }: BlogProps) {
  const [visibleCount, setVisibleCount] = useState(9);
  const { ref, inView } = useInView({ threshold: 0.2 });

  const headingColor = useColorModeValue("gray.900", "gray.50");
  const textColor = useColorModeValue("gray.600", "gray.400");

  useEffect(() => {
    if (inView) setVisibleCount((c) => c + 6);
  }, [inView]);

  return (
    <Layout>
      <Box
        maxW="6xl"
        mx="auto"
        px={{ base: 4, md: 6 }}
        py={{ base: 10, md: 16 }}
      >
        {/* ===== HEADER ===== */}
        <Box textAlign="center" maxW="3xl" mx="auto" mb={12}>
          <Heading as="h1" size="2xl" mb={3} letterSpacing="tight">
            Blog
          </Heading>
          <Text fontSize="lg" color={textColor}>
            Curated articles, guides & updates — in{" "}
            <Text as="span" fontWeight="semibold">
              {currentLang.toUpperCase()}
            </Text>
          </Text>
          <Box
            mt={5}
            h="1"
            w="24"
            mx="auto"
            bgGradient="linear(to-r, blue.500, purple.500, pink.500)"
            borderRadius="full"
          />
        </Box>

        {/* ===== POSTS BY CATEGORY ===== */}
        {categories.map((cat) => {
          const catPosts = posts.filter((p) => p.category === cat);
          return (
            <Box key={cat} mb={16}>
              <Flex align="center" mb={6} gap={2}>
                <FolderIcon className="w-6 h-6 text-blue-500" />
                <Heading
                  as="h2"
                  size="lg"
                  color={headingColor}
                  textTransform="capitalize"
                  letterSpacing="tight"
                >
                  {cat || "Uncategorized"}
                </Heading>
              </Flex>

              {catPosts.length === 0 ? (
                <Text textAlign="center" color="gray.500">
                  No posts in this category
                </Text>
              ) : (
                <Box
                  display="grid"
                  gridTemplateColumns={{
                    base: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={6}
                >
                  {catPosts.slice(0, visibleCount).map((post) => (
                    <PostCard key={post.slug} meta={post} />
                  ))}
                </Box>
              )}
            </Box>
          );
        })}

        {/* ===== Lazy Load Sentinel ===== */}
        <Flex ref={ref} h={12} justify="center" align="center">
          {visibleCount < posts.length && (
            <Spinner size="sm" color="gray.500" />
          )}
        </Flex>
      </Box>
    </Layout>
  );
}

/** Fetch posts at build time */
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLang = locale || "en";
  const categories = getCategories(currentLang);
  const posts = categories.flatMap((cat) => listPosts(currentLang, cat));

  return {
    props: {
      posts,
      categories,
      currentLang,
      ...(await serverSideTranslations(locale || "en", ["nav", "common"])),
    },
  };
};
