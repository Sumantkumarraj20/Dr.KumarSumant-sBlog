"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Flex,
  Spinner,
  Box,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import Layout from "@/components/Layout";
import Dashboard from "@/components/learning/Dashboard";
import ModulePage from "@/components/learning/ModulePage";
import UnitPage from "@/components/learning/UnitPage";
import LessonPage from "@/components/learning/LessonPage";
import LessonContent from "@/components/learning/LessonContent";
import { fetchCourses } from "@/lib/learn";
import { useAuth } from "@/context/authContext";
import { recordProgress } from "@/lib/userProgress";

const LearnPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const slugs = Array.isArray(router.query.slugs) ? router.query.slugs : [];

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const bgColor = useColorModeValue("gray.50", "gray.800");

  // --- Load courses from API
  useEffect(() => {
    const loadCourses = async () => {
      console.log("[DEBUG] Loading courses...");
      setLoading(true);
      try {
        const data = await fetchCourses();
        const normalized = (data || []).map((c: any) => ({
          ...c,
          modules: (c.modules || []).map((m: any) => ({
            ...m,
            units: (m.units || []).map((u: any) => ({
              ...u,
              lessons: u.lessons || [],
            })),
          })),
        }));
        console.log("[DEBUG] Courses loaded:", normalized);
        setCourses(normalized);
      } catch (err) {
        console.error("[ERROR] Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  // --- Debug slugs changes
  useEffect(() => {
    console.log("[DEBUG] Router slugs changed:", slugs);
  }, [slugs]);

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

  // --- Derive current selection based on slugs
  const [courseId, moduleId, unitId, lessonId] = slugs;

  const selectedCourse = courses.find((c) => c.id === courseId) || null;
  const selectedModule =
    selectedCourse?.modules?.find((m) => m.id === moduleId) || null;
  const selectedUnit =
    selectedModule?.units?.find((u) => u.id === unitId) || null;
  const selectedLesson =
    selectedUnit?.lessons?.find((l) => l.id === lessonId) || null;

  // --- Debug current selection
  console.log("[DEBUG] Selected path:", {
    courseId,
    moduleId,
    unitId,
    lessonId,
    selectedCourse,
    selectedModule,
    selectedUnit,
    selectedLesson,
  });

  // --- Navigation helper
  const navigateTo = (
    course?: any,
    module?: any,
    unit?: any,
    lesson?: any
  ) => {
    const path = [
      "/learn",
      course?.id,
      module?.id,
      unit?.id,
      lesson?.id,
    ].filter(Boolean).join("/");

    console.log("[DEBUG] Navigating to path:", path, {
      course,
      module,
      unit,
      lesson,
    });

    router.push(path).then(() => {
      console.log("[DEBUG] Router push complete");
    });

    if (lesson && user?.id) {
      console.log("[DEBUG] Recording progress for lesson:", lesson.id);
      recordProgress(user.id, course?.id, module?.id, unit?.id, lesson?.id);
    }
  };

  // --- Conditional rendering
  let mainContent: React.ReactNode = null;

  if (!selectedCourse) {
    mainContent = <Dashboard courses={courses} onSelectCourse={(c) => navigateTo(c)} />;
  } else if (!selectedModule) {
    mainContent = <ModulePage
      course={selectedCourse}
      onBack={() => navigateTo()}
      onSelectModule={(m) => navigateTo(selectedCourse, m)}
    />;
  } else if (!selectedUnit) {
    console.log("[DEBUG] Rendering UnitPage:", selectedModule);
    mainContent = <UnitPage
      module={selectedModule}
      onBack={() => navigateTo(selectedCourse)}
      onSelectUnit={(u) => navigateTo(selectedCourse, selectedModule, u)}
    />;
  } else if (!selectedLesson) {
    console.log("[DEBUG] Rendering LessonPage:", selectedUnit);
    mainContent = <LessonPage
      unit={selectedUnit}
      onBack={() => navigateTo(selectedCourse, selectedModule)}
      onSelectLesson={(l) => navigateTo(selectedCourse, selectedModule, selectedUnit, l)}
    />;
  } else {
    console.log("[DEBUG] Rendering LessonContent:", selectedLesson);
    mainContent = <LessonContent
      unit={selectedUnit}
      lesson={selectedLesson}
      lessonsInUnit={selectedUnit.lessons || []}
      userId={user.id}
      onBackToUnit={() => navigateTo(selectedCourse, selectedModule, selectedUnit)}
      onNavigateLesson={(lesson) => navigateTo(selectedCourse, selectedModule, selectedUnit, lesson)}
      onGoToNext={(completedLesson?: any) => {
        const lessonIndex = selectedUnit.lessons.findIndex(
          (l: any) => l.id === (completedLesson?.id || selectedLesson.id)
        );
        const nextLesson = selectedUnit.lessons[lessonIndex + 1];
        if (nextLesson)
          return navigateTo(selectedCourse, selectedModule, selectedUnit, nextLesson);

        const unitIndex = selectedModule.units.findIndex(
          (u: any) => u.id === selectedUnit.id
        );
        const nextUnit = selectedModule.units[unitIndex + 1];
        if (nextUnit)
          return navigateTo(selectedCourse, selectedModule, nextUnit, nextUnit.lessons[0]);

        const moduleIndex = selectedCourse.modules.findIndex(
          (m: any) => m.id === selectedModule.id
        );
        const nextModule = selectedCourse.modules[moduleIndex + 1];
        if (nextModule) {
          const firstUnit = nextModule.units[0];
          return navigateTo(selectedCourse, nextModule, firstUnit, firstUnit.lessons[0]);
        }

        alert("🎉 Congratulations! You have completed this course.");
        navigateTo();
      }}
    />;
  }

  return (
    <Layout>
      <Box p={4} bg={bgColor} minH="100vh">
        {mainContent}
      </Box>
    </Layout>
  );
};

export default LearnPage;
