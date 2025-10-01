// types/learning.ts
import { JSONContent } from "@tiptap/react";

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

// types/learn.ts
export type Course = {
  id: string;
  title: string;
  description?: string;
  slug?: string; 
  created_at?: string;
  modules?: Module[];
};

export type Module = {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  slug?: string; 
  order_index?: number;
  created_at?: string;
  units?: Unit[];
};

export type Unit = {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  slug?: string; 
  order_index?: number;
  created_at?: string;
  lessons?: Lesson[];
};

export type Lesson = {
  id: string;
  unit_id: string;
  title: string;
  content?: any;
  slug?: string; 
  order_index?: number;
  created_at?: string;
  quizzes?: Quiz[];
  module_id?: string; // Added for compatibility
};

export type Quiz = {
  id: string;
  lesson_id: string;
  passing_score?: number;
  created_at?: string;
  quiz_questions?: QuizQuestion[];
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  question_text: any;
  options: any;
  correct_answer: any;
  explanation?: any;
  source_exam?: string;
  created_at?: string;
};

export type UserProgress = {
  [courseId: string]: number;
};

export type NavigationHandler = (
  course?: Course,
  module?: Module,
  unit?: Unit,
  lesson?: Lesson
) => void;