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

export const fetchModules = async (courseId: string): Promise<Module[]> => {
  const { data, error } = await supabase
    .from("modules")
    .select("id, course_id, title, description, order_index, created_at")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching modules:", error);
    throw error;
  }

  return data || [];
};

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

export const fetchCourseWithContent = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id, title, description, created_at,
      modules (
        id, title, description, order_index, created_at,
        units (
          id, title, description, order_index, created_at,
          lessons (
            id, unit_id, title, content, order_index, created_at,
            quizzes (
              id, lesson_id, passing_score, created_at,
              quiz_questions (
                id, quiz_id, question_text, options, correct_answer, explanation, created_at, lesson_id
              )
            )
          )
        )
      )
    `
    )
    .order("order_index", { ascending: true, foreignTable: "modules" })
    .order("order_index", { ascending: true, foreignTable: "modules.units" })
    .order("order_index", {
      ascending: true,
      foreignTable: "modules.units.lessons",
    });

  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }

  return (data || []) as Course[];
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

// ---------------user_srs_progress----------

// Fetch quiz attempts for a user (optionally filter by quiz_id)
export async function fetchUserQuizAttempts(userId: string, quizId?: string) {
  const query = supabase
    .from("user_quiz_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (quizId) {
    query.eq("quiz_id", quizId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching quiz attempts:", error);
    throw error;
  }

  return data;
}

// Fetch SRS (Spaced Repetition) progress for a user (optionally filter by card_id)
export async function fetchUserSRSProgress(userId: string, cardId?: string) {
  const query = supabase
    .from("user_srs_progress")
    .select("*")
    .eq("user_id", userId);

  if (cardId) {
    query.eq("card_id", cardId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching SRS progress:", error);
    throw error;
  }

  return data;
}

// Fetch course progress for a user (optionally filter by course_id)
export async function fetchUserCourseProgress(userId: string, courseId?: string) {
  const query = supabase
    .from("user_course_progress")
    .select("*")
    .eq("user_id", userId);

  if (courseId) {
    query.eq("course_id", courseId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching course progress:", error);
    throw error;
  }

  return data;
}

export async function fetchUnitProgress(userId: string, unitId: string) {
  // Count total lessons in unit
  const { data: totalLessonsData } = await supabase
    .from("lessons")
    .select("id")
    .eq("unit_id", unitId);

  const totalLessons = totalLessonsData?.length || 0;
  if (totalLessons === 0) return 0;

  // Count completed lessons by user in this unit
  const { data: userProgress } = await supabase
    .from("user_course_progress")
    .select("completed_lessons")
    .eq("user_id", userId)
    .eq("current_unit_id", unitId);

  const completedLessons = userProgress?.[0]?.completed_lessons || 0;

  return Math.round((completedLessons / totalLessons) * 100);
}

// Count completed lessons for a module
export async function fetchModuleProgress(userId: string, moduleId: string) {
  // Get all units in module
  const { data: units } = await supabase
    .from("units")
    .select("id")
    .eq("module_id", moduleId);

  if (!units || units.length === 0) return 0;

  // Compute average progress across all units
  let sumProgress = 0;
  for (const unit of units) {
    sumProgress += await fetchUnitProgress(userId, unit.id);
  }

  return Math.round(sumProgress / units.length);
}

// Count completed lessons for a course
export async function fetchCourseProgress(userId: string, courseId: string) {
  // Get all modules in course
  const { data: modules } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId);

  if (!modules || modules.length === 0) return 0;

  let sumProgress = 0;
  for (const module of modules) {
    sumProgress += await fetchModuleProgress(userId, module.id);
  }

  return Math.round(sumProgress / modules.length);
}