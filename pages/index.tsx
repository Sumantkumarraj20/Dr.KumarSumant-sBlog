import Layout from "../components/Layout";
import { listPosts } from "../lib/posts";
import PostCard from "../components/PostCard";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import {
  Box,
  Button,
  Grid,
  Heading,
  Text,
  Stack,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { SparklesIcon, BookOpenIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

type Post = {
  slug: string;
  title: string;
  date: string;
  description?: string;
  thumbnail?: string;
  lang: string;
  category: string;
};

export default function Home({ posts, locale: pageLocale }: { posts: Post[]; locale?: string }) {
  const headingColor = useColorModeValue("gray.900", "gray.50");
  const textColor = useColorModeValue("gray.600", "gray.400");

  const features = [
    {
      title: "Evidence-based articles",
      desc: "Patient-focused, peer-reviewed summaries and practical clinical guides.",
      icon: BookOpenIcon,
    },
    {
      title: "Interactive learning",
      desc: "In-article quizzes (MCQs) and flow diagrams to boost understanding.",
      icon: SparklesIcon,
    },
    {
      title: "Learning Platform",
      desc: "A medical elearnig platform with SRS-based revision and spaced repetition. We are evidence base carefully learning scicence to optimise learning efficiency.",
      icon: AcademicCapIcon,
    },
  ];

  return (
    <Layout>
      <Box maxW="6xl" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 10, md: 16 }}>
        {/* HERO */}
        <Stack spacing={6} align="center" textAlign="center">
          <Heading as="h1" size="2xl" color={headingColor} lineHeight="short">
            Practical, patient-facing medical guides
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="3xl">
            Trusted, easy-to-read clinical explanations, interactive quizzes, and decision-support designed for
            patients and clinicians.
          </Text>
          <HStack spacing={3} pt={2}>
            <Button colorScheme="blue" size="md" onClick={() => window.location.assign('/blog')}>Read latest articles</Button>
            <Button variant="outline" size="md" onClick={() => window.location.assign('/learn')}>Ask a question</Button>
          </HStack>
        </Stack>

        {/* FEATURES */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }} gap={6} mt={12}>
          {features.map((f) => (
            <Box key={f.title} p={6} rounded="xl" shadow="sm" bg={useColorModeValue('white','gray.800')}>
              <HStack align="start" spacing={4}>
                <Box aria-hidden>
                  <Icon as={f.icon as any} w={7} h={7} color="blue.500" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading size="md">{f.title}</Heading>
                  <Text color={textColor}>{f.desc}</Text>
                </VStack>
              </HStack>
            </Box>
          ))}
        </Grid>

        {/* LATEST POSTS */}
        <Box mt={12}>
          <Heading size="lg" mb={4} color={headingColor}>Latest posts</Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }} gap={6}>
            {posts.slice(0, 6).map((p) => (
              <PostCard key={`${p.lang}-${p.category}-${p.slug}`} meta={p as any} locale={pageLocale} />
            ))}
          </Grid>
        </Box>
      </Box>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const posts = listPosts(locale || 'en');

  return {
    props: {
      posts,
      locale: locale || 'en',
      ...(await serverSideTranslations(locale || 'en', ['nav', 'common'])),
    },
    revalidate: 60,
  };
};
