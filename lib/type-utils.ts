import { Course, Module, Unit, Lesson, Quiz, QuizQuestion } from '@/types/admin';
import { JSONContent } from '@tiptap/react';

// Type guards
export const isCourse = (obj: any): obj is Course => 
  obj && typeof obj.id === 'string' && typeof obj.title === 'string';

export const isModule = (obj: any): obj is Module => 
  obj && typeof obj.id === 'string' && typeof obj.title === 'string' && typeof obj.course_id === 'string';

export const isUnit = (obj: any): obj is Unit => 
  obj && typeof obj.id === 'string' && typeof obj.title === 'string' && typeof obj.module_id === 'string';

export const isLesson = (obj: any): obj is Lesson => 
  obj && typeof obj.id === 'string' && typeof obj.title === 'string' && typeof obj.unit_id === 'string' && obj.content;

export const isQuiz = (obj: any): obj is Quiz => 
  obj && typeof obj.id === 'string' && typeof obj.lesson_id === 'string' && typeof obj.passing_score === 'number';

export const isQuizQuestion = (obj: any): obj is QuizQuestion => 
  obj && typeof obj.id === 'string' && typeof obj.quiz_id === 'string' && typeof obj.lesson_id === 'string';

// Safe type assertion functions
export const safeCourse = (data: any): Course => ({
  id: String(data.id || ''),
  title: String(data.title || ''),
  description: data.description ? String(data.description) : undefined,
  created_by: data.created_by ? String(data.created_by) : undefined,
  created_at: data.created_at ? String(data.created_at) : undefined,
  modules: Array.isArray(data.modules) ? data.modules.map(safeModule) : [],
});

export const safeModule = (data: any): Module => ({
  id: String(data.id || ''),
  title: String(data.title || ''),
  description: data.description ? String(data.description) : undefined,
  order_index: typeof data.order_index === 'number' ? data.order_index : 0,
  course_id: String(data.course_id || ''),
  created_at: data.created_at ? String(data.created_at) : undefined,
  units: Array.isArray(data.units) ? data.units.map(safeUnit) : [],
});

export const safeUnit = (data: any): Unit => ({
  id: String(data.id || ''),
  title: String(data.title || ''),
  description: data.description ? String(data.description) : undefined,
  order_index: typeof data.order_index === 'number' ? data.order_index : 0,
  module_id: String(data.module_id || ''),
  created_at: data.created_at ? String(data.created_at) : undefined,
  lessons: Array.isArray(data.lessons) ? data.lessons.map(safeLesson) : [],
});

export const safeLesson = (data: any): Lesson => ({
  id: String(data.id || ''),
  title: String(data.title || ''),
  description: data.description ? String(data.description) : undefined,
  content: data.content && typeof data.content === 'object' ? data.content : { type: "doc", content: [] },
  order_index: typeof data.order_index === 'number' ? data.order_index : 0,
  unit_id: String(data.unit_id || ''),
  created_at: data.created_at ? String(data.created_at) : undefined,
  quizzes: Array.isArray(data.quizzes) ? data.quizzes.map(safeQuiz) : [],
});

export const safeQuiz = (data: any): Quiz => ({
  id: String(data.id || ''),
  lesson_id: String(data.lesson_id || ''),
  passing_score: typeof data.passing_score === 'number' ? data.passing_score : 70,
  created_at: String(data.created_at || new Date().toISOString()),
  questions: Array.isArray(data.questions) ? data.questions.map(safeQuizQuestion) : [],
});

export const safeQuizQuestion = (data: any): QuizQuestion => ({
  id: String(data.id || ''),
  quiz_id: String(data.quiz_id || ''),
  lesson_id: String(data.lesson_id || ''),
  question_text: data.question_text && typeof data.question_text === 'object' ? data.question_text : { type: "doc", content: [] },
  options: Array.isArray(data.options) ? data.options.map(String) : [],
  correct_answer: Array.isArray(data.correct_answer) ? data.correct_answer.map(String) : [],
  explanation: data.explanation ? { text: data.explanation.text || { type: "doc", content: [] } } : undefined,
  created_at: data.created_at ? String(data.created_at) : undefined,
});

// Safe array mappers
export const safeCourseArray = (data: any): Course[] => 
  Array.isArray(data) ? data.map(safeCourse) : [];

export const safeModuleArray = (data: any): Module[] => 
  Array.isArray(data) ? data.map(safeModule) : [];

export const safeUnitArray = (data: any): Unit[] => 
  Array.isArray(data) ? data.map(safeUnit) : [];

export const safeLessonArray = (data: any): Lesson[] => 
  Array.isArray(data) ? data.map(safeLesson) : [];