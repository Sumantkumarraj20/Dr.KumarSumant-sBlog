// lib/learn.ts
import { supabase } from "../lib/supabaseClient";

// Generic fetch function to reduce redundancy
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

// --- Type Definitions ---
export type Lesson = {
  id: string;
  title: string;
  description?: string;
  content: any[]; // always normalized
};

export type Course = {
  id: string;
  title: string;
  description?: string;
};

export type Module = {
  id: string;
  title: string;
  description?: string;
  order_index?: number;
};

export type Unit = {
  id: string;
  title: string;
  description?: string;
  order_index?: number;
};

// --- Fetchers ---
export const fetchCourses = async (): Promise<Course[]> => fetchTable<Course>("courses");

export const fetchModules = async (courseId: string): Promise<Module[]> =>
  fetchTable<Module>("modules", { course_id: courseId }, "id, title, description, order_index, created_at");

export const fetchUnits = async (moduleId: string): Promise<Unit[]> =>
  fetchTable<Unit>("units", { module_id: moduleId }, "id, title, description, order_index, created_at");

export const fetchLessons = async (unitId: string): Promise<Lesson[]> =>
  fetchTable<Lesson>("lessons", { unit_id: unitId }, "id, title, content, order_index");

export const fetchQuizzes = async (lessonId: string) =>
  fetchTable("quizzes", { lesson_Id: lessonId }, "id, passing_score");

export const fetchQuizQuestions = async (quizId: string) =>
  fetchTable("quiz_questions", { quiz_Id: quizId });

// --- Fetch single lesson and normalize content ---
export const fetchLessonById = async (lessonId: string): Promise<Lesson | null> => {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (error) {
    console.error("Supabase fetch lesson error:", error);
    return null;
  }

  if (!data) return null;

  let contentArray: any[] = [];

  try {
    if (Array.isArray(data.content)) contentArray = data.content;
    else if (typeof data.content === "string") contentArray = JSON.parse(data.content);
    else if (data.content) contentArray = [data.content];
  } catch (err) {
    console.error("Error parsing lesson content:", err);
    contentArray = [];
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description ?? "",
    content: contentArray,
  };
};
