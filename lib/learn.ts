// lib/learn.ts
import { supabase } from "../lib/supabaseClient";

// ---------- Generic fetch helper ----------
async function fetchTable<T>(
  table: string,
  filters?: Record<string, any>,
  select: string = "*"
): Promise<T[]> {
  let query = supabase.from(table).select(select);
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Supabase fetch error from table "${table}":`, error);
    return [];
  }

  return data as T[];
}

// ---------- Types ----------
export type Lesson = {
  id: string;
  unit_id: string;
  title: string;
  content: any[]; // normalized JSON
  order_index?: number;
  created_at?: string;
};

export type Unit = {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  order_index?: number;
  created_at?: string;
};

export type Module = {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index?: number;
  created_at?: string;
};

export type Course = {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
};

export type Quiz = {
  id: string;
  lesson_id: string;
  passing_score?: number;
  created_at?: string;
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  question: string;
  options: any;
  answer: any;
  created_at?: string;
};

// ---------- Fetchers ----------
export const fetchCourses = async (): Promise<Course[]> =>
  fetchTable<Course>(
    "courses",
    undefined,
    "id, title, description, created_at"
  );

export const fetchModules = async (courseId: string): Promise<Module[]> =>
  fetchTable<Module>(
    "modules",
    { course_id: courseId },
    "id, course_id, title, description, order_index, created_at"
  );

export const fetchUnits = async (moduleId: string): Promise<Unit[]> =>
  fetchTable<Unit>(
    "units",
    { module_id: moduleId },
    "id, module_id, title, description, order_index, created_at"
  );

export const fetchLessons = async (unitId: string): Promise<Lesson[]> => {
  const rows = await fetchTable<Omit<Lesson, "content"> & { content: any }>(
    "lessons",
    { unit_id: unitId },
    "id, unit_id, title, content, order_index, created_at"
  );

  return rows.map((row) => ({
    ...row,
    content: normalizeContent(row.content),
  }));
};

export const fetchQuizzes = async (lessonId: string): Promise<Quiz[]> =>
  fetchTable<Quiz>(
    "quizzes",
    { lesson_id: lessonId },
    "id, lesson_id, passing_score, created_at"
  );

export const fetchQuizQuestions = async (
  quizId: string
): Promise<QuizQuestion[]> =>
  fetchTable<QuizQuestion>(
    "quiz_questions",
    { quiz_id: quizId },
    "id, quiz_id, question, options, answer, created_at"
  );

// ---------- Single lesson fetch ----------
export const fetchLessonById = async (
  lessonId: string
): Promise<Lesson | null> => {
  const { data, error } = await supabase
    .from("lessons")
    .select("id, unit_id, title, content, order_index, created_at")
    .eq("id", lessonId)
    .single();

  if (error) {
    console.error("Supabase fetch lesson error:", error);
    return null;
  }

  return {
    ...data,
    content: normalizeContent(data.content),
  };
};

// ---------- Deep fetch: course → modules → units → lessons ----------
export const fetchCourseWithContent = async (): Promise<any[]> => {
  const { data, error } = await supabase.from("courses").select(`
      id, title, description, created_at,
      modules (
        id, title, description, order_index, created_at,
        units (
          id, title, description, order_index, created_at,
          lessons (id, unit_id, title, content, order_index, created_at,
          quizzes (
              id, lesson_id, passing_score, created_at,
              quiz_questions(id, quiz_id, question_text, options, correct_answer, explanation, created_at, lesson_id
              )
            )
          )
        )
      )
    `);

  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }

  return data || []; // ✅ always an array
};

// ---------- Helper ----------
function normalizeContent(content: any): any[] {
  if (!content) return [];
  try {
    if (Array.isArray(content)) return content;
    if (typeof content === "string") return JSON.parse(content);
    return [content];
  } catch {
    return [];
  }
}
