// pages/learn.tsx
import { useState, useEffect } from "react";
import { Flex, Spinner, useColorModeValue } from "@chakra-ui/react";

import Dashboard from "@/components/learning/Dashboard";
import ModulePage from "@/components/learning/ModulePage";
import UnitPage from "@/components/learning/UnitPage";
import LessonPage from "@/components/learning/LessonPage";
import LessonContent from "@/components/learning/LessonContent";

import { fetchCourses } from "@/lib/learn";

const LearnPage = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const bgColor = useColorModeValue("gray.50", "gray.800");

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      const data = await fetchCourses();
      setCourses(data);
      setLoading(false);
    };
    loadCourses();
  }, []);

  if (loading) {
    return (
      <Flex h="80vh" align="center" justify="center" bg={bgColor}>
        <Spinner size="xl" thickness="5px" color="blue.500" />
      </Flex>
    );
  }

  // Navigation flow
  if (!selectedCourse) {
    return <Dashboard courses={courses} onSelectCourse={setSelectedCourse} />;
  }

  if (selectedCourse && !selectedModule) {
    return (
      <ModulePage
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
        onSelectModule={setSelectedModule}
      />
    );
  }

  if (selectedModule && !selectedUnit) {
    return (
      <UnitPage
        module={selectedModule}
        onBack={() => setSelectedModule(null)}
        onSelectUnit={setSelectedUnit}
      />
    );
  }

  if (selectedUnit && !selectedLesson) {
    return (
      <LessonPage
        unit={selectedUnit}
        onBack={() => setSelectedModule(null)}
        onSelectLesson={setSelectedLesson}
      />
    );
  }

  // Lesson Content view with navigation + quiz
  return (
    <LessonContent
      unit={selectedUnit}
      lesson={selectedLesson}
      lessonsInUnit={selectedUnit?.lessons || []} // ordered list of lessons
      onBackToUnit={() => setSelectedLesson(null)}
      onNavigateLesson={(lesson) => setSelectedLesson(lesson)}
      onGoToQuiz={(lesson) => {
        // TODO: implement quiz page navigation
        console.log("Go to quiz for lesson:", lesson.id);
      }}
    />
  );
};

export default LearnPage;
