"use client";

import Layout from "../components/Layout";
import Image from "next/image";
import { Box, Flex, Text, VStack, HStack, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

const MotionBox = motion.create ? motion.create(Box) : motion(Box);

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
  const textColor = useColorModeValue("slate.900", "slate.100");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.100", "gray.700");
  const timelineLine = useColorModeValue("gray.300", "gray.600");

  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center relative z-10">
          <Image
            src="/images/profilePic.jpg"
            alt="profilePic"
            width={160}
            height={160}
            className="rounded-full mx-auto mb-6 border-4 border-white shadow-xl"
          />
          <h1 className="text-5xl font-bold mb-3">Dr. Kumar Sumant</h1>
          <p className="text-lg max-w-2xl mx-auto text-slate-200">
            Physician • Educator • Researcher
            <br />
            Dedicated to evidence-based, equitable healthcare.
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </section>

      {/* BIO */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-lg">
        <VStack spacing={6} align="stretch">
          <Text color={textColor}>
            I earned my medical degree from <strong>Mari State Medical University, Yoshkar-Ola</strong>, graduating
            with a <em>Red Diploma</em> — an honor for exceptional academic achievement.
          </Text>
          <Text color={textColor}>
            My passion lies in guiding colleagues to bridge the gap between research and clinical care. I specialize in
            helping peers interpret literature, implement research findings, and enhance patient outcomes through
            evidence-based practices.
          </Text>
          <Text color={textColor}>
            Currently, I am working on research to <strong>optimize healthcare delivery</strong> in resource-limited
            countries like India, developing sustainable solutions for patients everywhere.
          </Text>
        </VStack>
      </section>

      {/* TIMELINE */}
      <section className="bg-slate-50 dark:bg-slate-900 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">Milestones</h2>
          <div className="relative">
            <div className={`absolute left-1/2 transform -translate-x-1/2 h-full w-1 rounded`} style={{ backgroundColor: timelineLine }} />
            <ul className="space-y-12">
              {timeline.map((item, idx) => (
                <li
                  key={idx}
                  className={`relative w-full md:w-1/2 ${idx % 2 === 0 ? "md:pl-12 md:ml-auto" : "md:pr-12"}`}
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
                  >
                    <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
                      {item.year}
                    </Text>
                    <Text fontSize="xl" fontWeight="semibold" color={textColor} mt={1}>
                      {item.title}
                    </Text>
                    <Text mt={2} color={textColor}>
                      {item.description}
                    </Text>
                  </MotionBox>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PHOTO GALLERY */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">Journey in Pictures</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <MotionBox
              key={photo.src}
              className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 bg-slate-100 dark:bg-slate-800"
              whileHover={{ scale: 1.03 }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={700}
                height={450}
                className="object-cover w-full h-64"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
              <Box className="absolute bottom-0 p-5 text-white">
                <Text fontWeight="semibold" fontSize="lg">
                  {photo.title}
                </Text>
                <Text fontSize="sm" mt={1} lineHeight="short">
                  {photo.story}
                </Text>
              </Box>
            </MotionBox>
          ))}
        </div>
      </section>
    </Layout>
  );
}
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['nav', 'common'])),
    },
    revalidate: 60,
  };
};