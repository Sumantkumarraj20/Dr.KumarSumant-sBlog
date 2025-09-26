"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Flex, Spinner, Box, useColorModeValue } from "@chakra-ui/react";
import Layout from "@/components/Layout";
import LearningSidebar from "@/components/learning/LearningSidebar";
import Dashboard from "@/components/learning/Dashboard";
import ModulePage from "@/components/learning/ModulePage";
import UnitPage from "@/components/learning/UnitPage";
import LessonPage from "@/components/learning/LessonPage";
import LessonContent from "@/components/learning/LessonContent";
import { fetchCourses } from "@/lib/learn";
import { useAuth } from "@/context/authContext";

const LearnPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { slugs = [] } = router.query as { slugs?: string[] };

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load courses from backend
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      const data = await fetchCourses();
      const normalizedCourses = (data || []).map((c: any) => ({
        ...c,
        modules: (c.modules || []).map((m: any) => ({
          ...m,
          units: (m.units || []).map((u: any) => ({
            ...u,
            lessons: u.lessons || [],
          })),
        })),
      }));
      setCourses(normalizedCourses);
      setLoading(false);
    };
    loadCourses();
  }, []);

  const bgColor = useColorModeValue("gray.50", "gray.800");

  if (loading || authLoading) {
    return (
      <Flex h="80vh" align="center" justify="center" bg={bgColor}>
        <Spinner size="xl" thickness="5px" color="blue.500" />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex h="80vh" align="center" justify="center" bg={bgColor}>
        Please log in to access learning features.
      </Flex>
    );
  }

  const [courseId, moduleId, unitId, lessonId] = slugs || [];

  // --- Safe find access ---
  const selectedCourse = courses.find((c) => c.id === courseId) || null;
  const selectedModule = selectedCourse?.modules?.find((m) => m.id === moduleId) || null;
  const selectedUnit = selectedModule?.units?.find((u) => u.id === unitId) || null;
  const selectedLesson = selectedUnit?.lessons?.find((l) => l.id === lessonId) || null;

  // --- Navigation helper ---
  const navigateTo = (course?: any, module?: any, unit?: any, lesson?: any) => {
    const path = [
      "/learn",
      course?.id,
      module?.id,
      unit?.id,
      lesson?.id,
    ].filter(Boolean).join("/");
    router.push(path);
  };

  // --- Conditional rendering based on selection ---
  let mainContent: React.ReactNode = null;

  if (!selectedCourse) {
    mainContent = <Dashboard courses={courses} onSelectCourse={(c) => navigateTo(c)} />;
  } else if (selectedCourse && !selectedModule) {
    mainContent = (
      <ModulePage
        course={selectedCourse}
        onBack={() => navigateTo()}
        onSelectModule={(m) => navigateTo(selectedCourse, m)}
      />
    );
  } else if (selectedModule && !selectedUnit) {
    mainContent = (
      <UnitPage
        module={selectedModule}
        onBack={() => navigateTo(selectedCourse)}
        onSelectUnit={(u) => navigateTo(selectedCourse, selectedModule, u)}
      />
    );
  } else if (selectedUnit && !selectedLesson) {
    mainContent = (
      <LessonPage
        unit={selectedUnit}
        onBack={() => navigateTo(selectedCourse, selectedModule)}
        onSelectLesson={(l) => navigateTo(selectedCourse, selectedModule, selectedUnit, l)}
      />
    );
  } else if (selectedUnit && selectedLesson) {
    mainContent = (
      <LessonContent
        unit={selectedUnit}
        lesson={selectedLesson}
        lessonsInUnit={selectedUnit.lessons || []}
        userId={user.id}
        onBackToUnit={() => navigateTo(selectedCourse, selectedModule, selectedUnit)}
        onNavigateLesson={(lesson) =>
          navigateTo(selectedCourse, selectedModule, selectedUnit, lesson)
        }
        onGoToNext={(completedLesson?: any) => {
          // Next lesson
          const lessonIndex = selectedUnit.lessons.findIndex(
            (l: any) => l.id === (completedLesson?.id || selectedLesson.id)
          );
          const nextLesson = selectedUnit.lessons[lessonIndex + 1];
          if (nextLesson)
            return navigateTo(selectedCourse, selectedModule, selectedUnit, nextLesson);

          // Next unit
          const unitIndex = selectedModule.units.findIndex((u: any) => u.id === selectedUnit.id);
          const nextUnit = selectedModule.units[unitIndex + 1];
          if (nextUnit)
            return navigateTo(selectedCourse, selectedModule, nextUnit, nextUnit.lessons[0]);

          // Next module
          const moduleIndex = selectedCourse.modules.findIndex(
            (m: any) => m.id === selectedModule.id
          );
          const nextModule = selectedCourse.modules[moduleIndex + 1];
          if (nextModule) {
            const firstUnit = nextModule.units[0];
            return navigateTo(selectedCourse, nextModule, firstUnit, firstUnit.lessons[0]);
          }

          // Course complete
          alert("🎉 Congratulations! You have completed this course.");
          navigateTo();
        }}
      />
    );
  }

  return (
    <Layout>
      <LearningSidebar userId={user.id} />
      <Box ml={{ base: 0, md: 64 }} p={4} bg={bgColor} minH="100vh">
        {mainContent}
      </Box>
    </Layout>
  );
};

export default LearnPage;
