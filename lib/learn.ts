// lib/learn.ts
import { supabase } from "../lib/supabaseClient";

// ---------- Generic fetch helper with sorting ----------
async function fetchTable<T>(
  table: string,
  filters?: Record<string, any>,
  select: string = "*",
  orderBy: string = "created_at",
  ascending: boolean = false
): Promise<T[]> {
  let query = supabase.from(table).select(select);
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  // Apply ordering
  query = query.order(orderBy, { ascending });

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

// ---------- Fetchers with proper sorting ----------
export const fetchCourses = async (): Promise<Course[]> =>
  fetchTable<Course>(
    "courses",
    undefined,
    "id, title, description, created_at",
    "created_at", // Sort by creation date (newest first)
    false
  );

export const fetchModules = async (courseId: string): Promise<Module[]> => {
  const { data, error } = await supabase
    .from("modules")
    .select("id, course_id, title, description, order_index, created_at")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true }) // Primary sort by order_index
    .order("created_at", { ascending: true }); // Secondary sort by creation date

  if (error) {
    console.error("Error fetching modules:", error);
    throw error;
  }

  return data || [];
};

export const fetchUnits = async (moduleId: string): Promise<Unit[]> => {
  const { data, error } = await supabase
    .from("units")
    .select("id, module_id, title, description, order_index, created_at")
    .eq("module_id", moduleId)
    .order("order_index", { ascending: true }) // Primary sort by order_index
    .order("created_at", { ascending: true }); // Secondary sort by creation date

  if (error) {
    console.error("Error fetching units:", error);
    throw error;
  }

  return data || [];
};

export const fetchLessons = async (unitId: string): Promise<Lesson[]> => {
  const { data, error } = await supabase
    .from("lessons")
    .select("id, unit_id, title, content, order_index, created_at")
    .eq("unit_id", unitId)
    .order("order_index", { ascending: true }) // Primary sort by order_index
    .order("created_at", { ascending: true }); // Secondary sort by creation date

  if (error) {
    console.error("Error fetching lessons:", error);
    throw error;
  }

  return (data || []).map(row => ({
    ...row,
    content: normalizeContent(row.content),
  }));
};

export const fetchQuizzes = async (lessonId: string): Promise<Quiz[]> => {
  const { data, error } = await supabase
    .from("quizzes")
    .select("id, lesson_id, passing_score, created_at")
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: true }); // Sort by creation date (oldest first)

  if (error) {
    console.error("Error fetching quizzes:", error);
    throw error;
  }

  return data || [];
};

export const fetchQuizQuestions = async (
  quizId: string
): Promise<QuizQuestion[]> => {
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("id, quiz_id, question, options, answer, created_at")
    .eq("quiz_id", quizId)
    .order("created_at", { ascending: true }); // Sort by creation date (oldest first)

  if (error) {
    console.error("Error fetching quiz questions:", error);
    throw error;
  }

  return data || [];
};

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

// ---------- Deep fetch: course → modules → units → lessons with proper sorting ----------
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
    .order("created_at", { ascending: false }) // Courses by newest first
    .order("order_index", { ascending: true, foreignTable: "modules" }) // Modules by order_index
    .order("order_index", { ascending: true, foreignTable: "modules.units" }) // Units by order_index
    .order("order_index", { ascending: true, foreignTable: "modules.units.lessons" }) // Lessons by order_index
    .order("created_at", { ascending: true, foreignTable: "modules.units.lessons.quizzes" }) // Quizzes by oldest first
    .order("created_at", { ascending: true, foreignTable: "modules.units.lessons.quizzes.quiz_questions" }); // Questions by oldest first

  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }

  return (data || []) as Course[];
};

// ---------- User progress fetchers with sorting ----------

// Fetch quiz attempts for a user (optionally filter by quiz_id)
export async function fetchUserQuizAttempts(userId: string, quizId?: string) {
  let query = supabase
    .from("user_quiz_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("attempted_at", { ascending: false }); // Most recent attempts first

  if (quizId) {
    query = query.eq("quiz_id", quizId);
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
  let query = supabase
    .from("user_srs_progress")
    .select("*")
    .eq("user_id", userId)
    .order("next_review", { ascending: true }) // Due cards first
    .order("updated_at", { ascending: false }); // Then by most recently updated

  if (cardId) {
    query = query.eq("card_id", cardId);
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
  let query = supabase
    .from("user_course_progress")
    .select("*")
    .eq("user_id", userId)
    .order("progress_percentage", { ascending: false }) // Highest progress first
    .order("last_accessed", { ascending: false }); // Then by most recently accessed

  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching course progress:", error);
    throw error;
  }

  return data;
}

// Fetch all lessons with progress for a user, sorted by order_index
export async function fetchUserLessonsWithProgress(userId: string, unitId?: string) {
  let query = supabase
    .from("lessons")
    .select(`
      *,
      user_quiz_attempts!inner(
        user_id,
        score,
        passed,
        attempted_at
      )
    `)
    .eq("user_quiz_attempts.user_id", userId)
    .order("order_index", { ascending: true }) // Lessons in order
    .order("created_at", { ascending: true });

  if (unitId) {
    query = query.eq("unit_id", unitId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching user lessons with progress:", error);
    throw error;
  }

  return data;
}

// Fetch all courses with progress for dashboard, sorted by progress
export async function fetchUserCoursesWithProgress(userId: string) {
  const { data, error } = await supabase
    .from("user_course_progress")
    .select(`
      *,
      courses!inner(
        id,
        title,
        description,
        created_at
      )
    `)
    .eq("user_id", userId)
    .order("progress_percentage", { ascending: false }) // Highest progress first
    .order("last_accessed", { ascending: false }); // Then by most recent

  if (error) {
    console.error("Error fetching user courses with progress:", error);
    throw error;
  }

  return data;
}

export async function fetchUnitProgress(userId: string, unitId: string) {
  // Count total lessons in unit
  const { data: totalLessonsData } = await supabase
    .from("lessons")
    .select("id")
    .eq("unit_id", unitId)
    .order("order_index", { ascending: true }); // Get lessons in order

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
  // Get all units in module, sorted by order_index
  const { data: units } = await supabase
    .from("units")
    .select("id")
    .eq("module_id", moduleId)
    .order("order_index", { ascending: true });

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
  // Get all modules in course, sorted by order_index
  const { data: modules } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  if (!modules || modules.length === 0) return 0;

  let sumProgress = 0;
  for (const module of modules) {
    sumProgress += await fetchModuleProgress(userId, module.id);
  }

  return Math.round(sumProgress / modules.length);
}

// Fetch all available courses for enrollment, sorted by creation date
export async function fetchAvailableCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, description, created_at")
    .order("created_at", { ascending: false }); // Newest courses first

  if (error) {
    console.error("Error fetching available courses:", error);
    throw error;
  }

  return data || [];
}

// Fetch recent activity for a user, sorted by date
export async function fetchUserRecentActivity(userId: string, limit: number = 10) {
  const { data, error } = await supabase
    .from("user_quiz_attempts")
    .select(`
      *,
      lessons!inner(
        title,
        units!inner(
          title,
          modules!inner(
            title,
            courses!inner(
              title
            )
          )
        )
      )
    `)
    .eq("user_id", userId)
    .order("attempted_at", { ascending: false }) // Most recent activity first
    .limit(limit);

  if (error) {
    console.error("Error fetching user recent activity:", error);
    throw error;
  }

  return data;
}

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