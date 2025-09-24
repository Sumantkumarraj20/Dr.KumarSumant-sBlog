// pages/learn.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { Flex, Spinner, useColorModeValue } from "@chakra-ui/react";
import { useAuth } from "../context/authContext";

// Components
import Dashboard from "../components/learning/Dashboard";
import LessonPage from "../components/learning/LessonPage";
import SRSReview from "../components/learning/SRSReview";

const LearnPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const bgColor = useColorModeValue("gray.50", "gray.800");

  const [currentView, setCurrentView] = useState<"dashboard" | "lesson" | "srs">("dashboard");
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);

  // Protect page: redirect to /auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth");
    }
  }, [authLoading, user, router]);

  // Handle SPA-style navigation using query param ?view=
  useEffect(() => {
    const view = router.query.view as string;
    if (view === "lesson") setCurrentView("lesson");
    else if (view === "srs") setCurrentView("srs");
    else setCurrentView("dashboard");
  }, [router.query.view]);

  const navigate = (view: "dashboard" | "lesson" | "srs", lesson?: any) => {
    if (lesson) setSelectedLesson(lesson);
    router.push({ pathname: "/learn", query: { view } }, undefined, { shallow: true });
    setCurrentView(view);
  };

  if (authLoading || !user) {
    return (
      <Flex h="80vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Layout>
      <Flex
        direction="column"
        bg={bgColor}
        flex="1"
        minH="calc(100vh - 64px - 64px)" 
        w="100%"
        p={6}
        overflow="hidden"
      >
        {currentView === "dashboard" && (
          <Dashboard onSelectLesson={(lesson: any) => navigate("lesson", lesson)} />
        )}

        {currentView === "lesson" && selectedLesson && (
          <LessonPage lesson={selectedLesson} onBack={() => navigate("dashboard")} />
        )}

        {currentView === "srs" && <SRSReview userId={user.id} language="en" />}
      </Flex>
    </Layout>
  );
};

export default LearnPage;
