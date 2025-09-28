// types/learning.ts
import { JSONContent } from "@tiptap/react";

export interface Lesson {
  id: string;
  title: string;
  content: JSONContent | string | null;
}

export interface Unit {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface LessonContentProps {
  unit: Unit;
  lesson: Lesson;
  lessonsInUnit: Lesson[];
  onBackToUnit: () => void;
  onNavigateLesson: (lesson: Lesson) => void;
  onGoToNext: (completedLesson?: Lesson) => void;
  userId: string;
}

export interface LessonQuizProps {
  lessonId: string;
  userId: string;
  lessonTitle: string;
  onCompleteQuiz: () => void;
  onBackToLesson: () => void;
  hasNextLesson: boolean;
  unit?: Unit;
  lesson?: Lesson;
}