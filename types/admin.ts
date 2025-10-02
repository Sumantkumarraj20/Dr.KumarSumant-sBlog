import { JSONContent } from "@tiptap/react";

export interface Course {
  id: string;
  title: string;
  description?: string;
  created_by?: string;
  created_at?: string;
  modules?: Module[];
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order_index?: number;
  course_id: string;
  created_at?: string;
  units?: Unit[];
}

export interface Unit {
  id: string;
  title: string;
  description?: string;
  order_index?: number;
  module_id: string;
  created_at?: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  content: JSONContent;
  order_index?: number;
  unit_id: string;
  created_at?: string;
  quizzes?: Quiz[];
}

export interface Quiz {
  id: string;
  lesson_id: string;
  passing_score: number;
  created_at: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  lesson_id: string;
  question_text: JSONContent;
  options: string[];
  correct_answer: string[];
  explanation?: { text: JSONContent };
  created_at?: string;
}