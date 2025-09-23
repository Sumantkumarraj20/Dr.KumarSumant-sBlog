"use client";

import NextLink from "next/link";
import {
  Box,
  Image,
  Heading,
  Text,
  Tag,
  Wrap,
  WrapItem,
  Flex,
  useColorModeValue,
  Link as ChakraLink,
} from "@chakra-ui/react";

export type PostCardProps = {
  meta: {
    title: string;
    slug: string;
    date: string;
    lang: string;
    category: string;
    tags?: string[];
    description?: string;
    thumbnail?: string;
  };
  // optional deterministic locale to render links with (avoid client-only router differences)
  locale?: string;
};

const getPostHref = (
  meta: { category: string; slug: string; lang: string },
  locale?: string
) => `/${locale || meta.lang}/${meta.category}/${meta.slug}`;

export default function PostCard({ meta, locale }: PostCardProps) {
  // use provided locale (from page's SSG props) or fall back to the post's language
  const href = getPostHref(meta, locale || meta.lang);

  const bgCard = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.900", "gray.50");
  const textDesc = useColorModeValue("gray.700", "gray.300");
  const tagBg = useColorModeValue("blue.50", "blue.900");
  const tagColor = useColorModeValue("blue.700", "blue.200");

  return (
    <Box
      as="article"
      bg={bgCard}
      rounded="xl"
      overflow="hidden"
      shadow="md"
      transition="all 0.3s"
      _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
      minH="420px"
      display="flex"
      flexDirection="column"
      role="group"
    >
      {/* Thumbnail */}
      {meta.thumbnail && (
        <Box position="relative" h={{ base: "48", md: "52" }} overflow="hidden">
          <Image
            src={meta.thumbnail}
            alt={meta.title}
            objectFit="cover"
            w="full"
            h="full"
            transition="transform 0.5s"
            _groupHover={{ transform: "scale(1.05)" }}
          />
          <Box
            position="absolute"
            inset={0}
            bgGradient="linear(to-t, blackAlpha.400, transparent)"
            opacity={0}
            _groupHover={{ opacity: 1 }}
            transition="opacity 0.3s"
          />
        </Box>
      )}

      {/* Content */}
      <Box flex="1" p={6} display="flex" flexDirection="column">
        {/* Tags */}
        {meta.tags?.length ? (
          <Wrap spacing={2} mb={3}>
            {meta.tags.map((tag) => (
              <WrapItem key={tag}>
                <Tag size="sm" bg={tagBg} color={tagColor}>
                  {tag}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        ) : null}

        {/* Title */}
        <Heading as="h3" size="md" mb={1} color={textColor} lineHeight="short">
          <NextLink href={href} legacyBehavior passHref>
            <ChakraLink _hover={{ color: "blue.500" }} _dark={{ _hover: { color: "blue.400" } }}>
              {meta.title}
            </ChakraLink>
          </NextLink>
        </Heading>

        {/* Date */}
        <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")} mb={2}>
          {meta.date}
        </Text>

        {/* Description */}
        {meta.description && (
          <Text color={textDesc} mb={4} noOfLines={3}>
            {meta.description}
          </Text>
        )}

        {/* Read More */}
        <Flex mt="auto" pt={2}>
          <NextLink href={href} legacyBehavior passHref>
            <ChakraLink fontSize="sm" fontWeight="medium" color="blue.500" _dark={{ color: "blue.400" }} _hover={{ textDecoration: "underline" }}>
              Read More →
            </ChakraLink>
          </NextLink>
        </Flex>
      </Box>
    </Box>
  );
}
