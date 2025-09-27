// lib/adminApi.ts
import { supabase } from "./supabaseClient";
import type { JSONContent } from "@tiptap/react";

// --- Types ---
export type Course = {
  id: string;
  title: string;
  description?: string;
  created_by?: string;
  created_at?: string;
  modules?: Module[];
};

export type Module = {
  id: string;
  title: string;
  description?: string;
  order_index?: number;
  created_at?: string;
  course_id: string;
  units?: Unit[];
};

export type Unit = {
  id: string;
  title: string;
  description?: string;
  order_index?: number;
  created_at?: string;
  module_id: string;
  lessons?: Lesson[];
};

export type Lesson = {
  id: string;
  title: string;
  description?: string;
  content: JSONContent;
  order_index?: number;
  created_at?: string;
  unit_id: string;
  quizzes?: Quiz[];
};

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  lesson_id: string;
  question_text: JSONContent;
  options: string[];
  correct_answer: string[];
  explanation: JSONContent;
  created_at: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  passing_score: number;
  created_at: string;
  questions?: QuizQuestion[];
}


// --- Helper to unify error handling ---
async function handle<T>(
  query: Promise<{ data: T | null; error: any }>
): Promise<T | null> {
  const { data, error } = await query;
  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }
  return data;
}



// ---------------- COURSES ----------------
export async function fetchCourses(): Promise<{ data: Course[] | null; error: any }> {
  const { data, error } = await supabase
    .from("courses")
    .select("*, modules(*)");
  return { data, error };
}

export async function createCourse(payload: Partial<Course>): Promise<{ data: Course | null; error: any }> {
  const { data, error } = await supabase
    .from("courses")
    .insert(payload)
    .select()
    .single();
  return { data, error };
}

export async function updateCourse(id: string, payload: Partial<Course>): Promise<{ data: Course | null; error: any }> {
  const { data, error } = await supabase
    .from("courses")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteCourse(id: string): Promise<{ data: Course | null; error: any }> {
  const { data, error } = await supabase
    .from("courses")
    .delete()
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

// ---------------- MODULES ----------------
export async function fetchModules(courseId: string): Promise<{ data: Module[] | null; error: any }> {
  const { data, error } = await supabase
    .from("modules")
    .select("*, units(*)")
    .eq("course_id", courseId);
  return { data, error };
}

export async function createModule(payload: Partial<Module>): Promise<{ data: Module | null; error: any }> {
  const { data, error } = await supabase
    .from("modules")
    .insert(payload)
    .select()
    .single();
  return { data, error };
}

export async function updateModule(id: string, payload: Partial<Module>): Promise<{ data: Module | null; error: any }> {
  const { data, error } = await supabase
    .from("modules")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteModule(id: string): Promise<{ data: Module | null; error: any }> {
  const { data, error } = await supabase
    .from("modules")
    .delete()
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

// ---------------- UNITS ----------------
export async function fetchUnits(moduleId: string): Promise<{ data: Unit[] | null; error: any }> {
  const { data, error } = await supabase
    .from("units")
    .select("*, lessons(*)")
    .eq("module_id", moduleId);
  return { data, error };
}

export async function createUnit(payload: Partial<Unit>): Promise<{ data: Unit | null; error: any }> {
  const { data, error } = await supabase
    .from("units")
    .insert(payload)
    .select()
    .single();
  return { data, error };
}

export async function updateUnit(id: string, payload: Partial<Unit>): Promise<{ data: Unit | null; error: any }> {
  const { data, error } = await supabase
    .from("units")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteUnit(id: string): Promise<{ data: Unit | null; error: any }> {
  const { data, error } = await supabase
    .from("units")
    .delete()
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

// ---------------- LESSONS ----------------
export async function fetchLessons(unitId: string): Promise<{ data: Lesson[] | null; error: any }> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*, quizzes(*)")
    .eq("unit_id", unitId);
  return { data, error };
}

export async function createLesson(payload: Partial<Lesson>): Promise<{ data: Lesson | null; error: any }> {
  const { data, error } = await supabase
    .from("lessons")
    .insert(payload)
    .select()
    .single();
  return { data, error };
}

export async function updateLesson(id: string, payload: Partial<Lesson>): Promise<{ data: Lesson | null; error: any }> {
  const { data, error } = await supabase
    .from("lessons")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteLesson(id: string): Promise<{ data: Lesson | null; error: any }> {
  const { data, error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

/// ---------------- QUIZZES ----------------

// Fetch all quizzes with their questions
export async function fetchQuizzes(): Promise<{ data: Quiz[]; error: any }> {
  try {
    // Fetch quizzes
    const { data: quizzes, error: quizErr } = await supabase.from("quizzes").select("*");
    if (quizErr) throw quizErr;

    // Fetch all quiz questions
    const { data: questions, error: qErr } = await supabase.from("quiz_questions").select("*");
    if (qErr) throw qErr;

    // Nest questions into quizzes
    const nested = quizzes.map((quiz: Quiz) => ({
      ...quiz,
      questions: questions.filter((q: QuizQuestion) => q.quiz_id === quiz.id),
    }));

    return { data: nested, error: null };
  } catch (error) {
    return { data: [], error };
  }
}

// Create a quiz
export async function createQuiz(
  quiz: Partial<Quiz>
): Promise<{ data: Quiz | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from("quizzes")
      .insert(quiz)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Update a quiz
export async function updateQuiz(
  id: string,
  quiz: Partial<Quiz>
): Promise<{ data: Quiz | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from("quizzes")
      .update(quiz)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Delete a quiz and its questions
export async function deleteQuiz(
  id: string
): Promise<{ data: Quiz | null; error: any }> {
  try {
    // Delete all quiz questions first
    await supabase.from("quiz_questions").delete().eq("quiz_id", id);

    const { data, error } = await supabase
      .from("quizzes")
      .delete()
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// ---------------- QUIZ QUESTIONS ----------------

// Fetch all quiz questions (optional: filter by quizId)
export async function fetchQuizQuestions(
  quizId?: string
): Promise<{ data: QuizQuestion[]; error: any }> {
  try {
    let query = supabase.from("quiz_questions").select("*");
    if (quizId) query = query.eq("quiz_id", quizId);
    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: [], error };
  }
}

// Create a quiz question
export async function createQuizQuestion(
  question: Partial<QuizQuestion>
): Promise<{ data: QuizQuestion | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from("quiz_questions")
      .insert(question)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Update a quiz question
export async function updateQuizQuestion(
  id: string,
  question: Partial<QuizQuestion>
): Promise<{ data: QuizQuestion | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from("quiz_questions")
      .update(question)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Delete a quiz question
export async function deleteQuizQuestion(
  id: string
): Promise<{ data: QuizQuestion | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from("quiz_questions")
      .delete()
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// ---------------- NEST HELPERS ----------------

// Attach quizzes (with questions) to lessons
export function attachQuizzesToLessons(lessons: Lesson[], quizzes: Quiz[]): Lesson[] {
  const map: Record<string, Quiz[]> = {};
  quizzes.forEach((q) => {
    if (!map[q.lesson_id]) map[q.lesson_id] = [];
    map[q.lesson_id].push(q);
  });
  return lessons.map((lesson) => ({
    ...lesson,
    quizzes: map[lesson.id] || [],
  }));
}

