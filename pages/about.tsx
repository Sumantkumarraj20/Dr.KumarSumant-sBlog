"use client";

import Layout from "../components/Layout";
import Image from "next/image";
import {
  Box,
  Flex,
  Text,
  VStack,
  Heading,
  useColorModeValue,
  Divider,
  SimpleGrid,
  Container,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import SEO from "@/components/Seo";

const MotionBox = motion(Box);

const photos = [
  {
    src: "/images/graduation.jpg",
    alt: "Graduation Ceremony",
    title: "Red Diploma Graduation",
    story:
      "Graduated with a Red Diploma from Mari State Medical University, Yoshkar-Ola, symbolizing outstanding academic excellence and dedication to medicine.",
  },
  {
    src: "/images/teaching.jpg",
    alt: "Teaching session",
    title: "Teaching Research Methodology",
    story:
      "Sharing knowledge on research methodology, literature exploration, and clinical implementation has been a highlight of my medical journey.",
  },
  {
    src: "/images/research.jpg",
    alt: "Research work",
    title: "Ongoing Research",
    story:
      "Currently working on research projects focused on optimizing healthcare delivery in India and other resource-limited regions.",
  },
  {
    src: "/images/community.jpg",
    alt: "Community healthcare",
    title: "Community Healthcare",
    story:
      "Committed to bridging the gap between research and real-world practice, making quality care accessible to every community.",
  },
];

const timeline = [
  {
    year: "2025",
    title: "Pioneering Healthcare Optimization",
    description:
      "Working on scalable research initiatives to improve clinical efficiency and patient outcomes in resource-constrained areas.",
  },
  {
    year: "2024",
    title: "Graduated with Red Diploma",
    description:
      "Completed medical studies at Mari State Medical University with highest honors (equivalent to 100% marks).",
  },
  {
    year: "2023",
    title: "Research Mentor",
    description:
      "Guided peers in applying research evidence to clinical practice, literature review, and study methodology.",
  },
];

export default function About() {
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subText = useColorModeValue("gray.600", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const timelineLine = useColorModeValue("gray.300", "gray.600");

  return (
    <>
      <SEO title="About me"/>
      <Layout>
        {/* HERO */}
        <Box
          position="relative"
          py={{ base: 16, md: 24 }}
          bgGradient={useColorModeValue(
            "linear(to-b, gray.50, white)",
            "linear(to-b, gray.900, gray.800)"
          )}
          textAlign="center"
        >
          <Image
            src="/images/profilePic.jpg"
            alt="profilePic"
            width={160}
            height={160}
            className="rounded-full mx-auto mb-6 border-4 border-white shadow-lg"
          />
          <Heading as="h1" fontSize={{ base: "4xl", md: "5xl" }} mb={3}>
            Dr. Kumar Sumant
          </Heading>
          <Text fontSize="lg" maxW="2xl" mx="auto" color={subText}>
            Physician • Educator • Researcher
            <br />
            Dedicated to evidence-based, equitable healthcare.
          </Text>
        </Box>

        {/* BIO */}
        <Container maxW="4xl" py={16}>
          <VStack spacing={6} align="stretch">
            <Text color={textColor}>
              I earned my medical degree from{" "}
              <strong>Mari State Medical University, Yoshkar-Ola</strong>,
              graduating with a <em>Red Diploma</em> — an honor for exceptional
              academic achievement.
            </Text>
            <Text color={textColor}>
              My passion lies in guiding colleagues to bridge the gap between
              research and clinical care. I specialize in helping peers
              interpret literature, implement research findings, and enhance
              patient outcomes through evidence-based practices.
            </Text>
            <Text color={textColor}>
              Currently, I am working on research to{" "}
              <strong>optimize healthcare delivery</strong> in resource-limited
              countries like India, developing sustainable solutions for
              patients everywhere.
            </Text>
          </VStack>
        </Container>

        {/* TIMELINE */}
        <Box py={16} bg={useColorModeValue("gray.50", "gray.900")}>
          <Container maxW="5xl">
            <Heading textAlign="center" mb={12}>
              Milestones
            </Heading>
            <Box position="relative">
              {/* Timeline line */}
              <Box
                position="absolute"
                left="50%"
                top={0}
                bottom={0}
                transform="translateX(-50%)"
                w="1px"
                bg={timelineLine}
              />
              <VStack spacing={12} align="stretch">
                {timeline.map((item, idx) => (
                  <Flex
                    key={idx}
                    justify={idx % 2 === 0 ? "flex-end" : "flex-start"}
                    w="full"
                  >
                    <MotionBox
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      bg={cardBg}
                      border={`1px solid ${cardBorder}`}
                      p={6}
                      rounded="xl"
                      shadow="lg"
                      maxW="sm"
                    >
                      <Text fontSize="sm" color={subText}>
                        {item.year}
                      </Text>
                      <Text
                        fontSize="xl"
                        fontWeight="semibold"
                        color={textColor}
                      >
                        {item.title}
                      </Text>
                      <Text mt={2} color={textColor}>
                        {item.description}
                      </Text>
                    </MotionBox>
                  </Flex>
                ))}
              </VStack>
            </Box>
          </Container>
        </Box>

        {/* PHOTO GALLERY */}
        <Container maxW="6xl" py={20}>
          <Heading textAlign="center" mb={12}>
            Journey in Pictures
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={8}>
            {photos.map((photo) => (
              <MotionBox
                key={photo.src}
                position="relative"
                overflow="hidden"
                rounded="2xl"
                shadow="lg"
                bg={useColorModeValue("gray.100", "gray.800")}
                whileHover={{ scale: 1.03 }}
                transition="all 0.3s ease"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={700}
                  height={450}
                  className="object-cover w-full h-64"
                />
                <Box
                  position="absolute"
                  inset={0}
                  bgGradient="linear(to-t, blackAlpha.600, transparent)"
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  transition="opacity 0.3s"
                />
                <Box position="absolute" bottom={0} p={5} color="white">
                  <Text fontWeight="semibold" fontSize="lg">
                    {photo.title}
                  </Text>
                  <Text fontSize="sm" mt={1} lineHeight="short">
                    {photo.story}
                  </Text>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["nav", "common"])),
    },
    revalidate: 60,
  };
};
