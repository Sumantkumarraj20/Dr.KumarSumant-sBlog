// lib/srs.ts
import { supabase } from "./supabaseClient";

export type SRSRow = {
  id: string;
  user_id: string;
  question_id: string;
  course_id?: string;
  module_id?: string;
  unit_id?: string;
  lesson_id?: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  correct_attempts: number;
  wrong_attempts: number;
  last_reviewed: string | null;
  next_review: string | null;
  last_viewed?: string | null;
  score: number;
  created_at: string;
  updated_at: string;
  quiz_questions?: any; // joined quiz question
};

// Your existing SM-2 algorithm remains the same
function clampEF(ef: number) {
  return ef < 1.3 ? 1.3 : ef;
}

export function sm2Update(
  quality: number,
  prevEF = 2.5,
  prevReps = 0,
  prevInterval = 0
) {
  let ef = prevEF;
  let repetitions = prevReps;
  let interval = prevInterval;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions = prevReps + 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.max(1, Math.round(prevInterval * ef));
  }

  ef = prevEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  ef = clampEF(ef);

  return { ease_factor: ef, repetitions, interval_days: interval };
}

// FIXED: Record progress with proper hierarchical data
export const recordProgress = async (
  userId: string,
  courseId?: string,
  moduleId?: string,
  unitId?: string,
  lessonId?: string
) => {
  if (!userId || !lessonId) {
    console.error("❌ userId and lessonId are required");
    return;
  }

  const { error } = await supabase
    .from("user_srs_progress")
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        module_id: moduleId,
        unit_id: unitId,
        lesson_id: lessonId,
        last_viewed: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_lesson_unique", // Use the correct constraint name
      }
    );

  if (error) {
    console.error("❌ Error recording progress:", error);
    throw error;
  }
};

// OPTIMIZED: Fetch due cards with hierarchical context
export async function fetchDueCards(userId: string, limit = 30) {
  if (!userId) return { data: [] as SRSRow[], error: "no-user" };

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("user_srs_progress")
    .select(`
      *,
      quiz_questions (
        *,
        lessons (title, unit_id, content),
        units (title, module_id),
        modules (title, course_id),
        courses (title)
      )
    `)
    .eq("user_id", userId)
    .lte("next_review", nowIso)
    .order("next_review", { ascending: true })
    .limit(limit);

  return { data: (data || []) as SRSRow[], error };
}

// OPTIMIZED: Record review with hierarchical context
export async function recordReview(
  userId: string,
  questionId: string,
  quality: number,
  courseId?: string,
  moduleId?: string,
  unitId?: string,
  lessonId?: string
) {
  if (!userId || !questionId) throw new Error("userId and questionId required");

  // Get existing row with hierarchical data
  const { data: existing, error: fetchErr } = await supabase
    .from("user_srs_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (fetchErr) {
    console.error("SRS fetch error", fetchErr);
    throw fetchErr;
  }

  const now = new Date();
  let prevEF = 2.5;
  let prevReps = 0;
  let prevInterval = 0;
  let rowId: string | null = null;

  if (existing) {
    prevEF = existing.ease_factor ?? 2.5;
    prevReps = existing.repetitions ?? 0;
    prevInterval = existing.interval_days ?? 0;
    rowId = existing.id;
  }

  const { ease_factor, repetitions, interval_days } = sm2Update(
    quality,
    prevEF,
    prevReps,
    prevInterval
  );

  const nextReviewDate = new Date(
    now.getTime() + interval_days * 24 * 60 * 60 * 1000
  ).toISOString();

  const payload = {
    user_id: userId,
    question_id: questionId,
    course_id: courseId,
    module_id: moduleId,
    unit_id: unitId,
    lesson_id: lessonId,
    ease_factor,
    interval_days,
    repetitions,
    correct_attempts: existing?.correct_attempts || 0,
    wrong_attempts: existing?.wrong_attempts || 0,
    last_reviewed: now.toISOString(),
    next_review: nextReviewDate,
    updated_at: now.toISOString(),
  };

  // Update correct/wrong attempts based on quality
  if (quality >= 3) {
    payload.correct_attempts = (existing?.correct_attempts || 0) + 1;
  } else {
    payload.wrong_attempts = (existing?.wrong_attempts || 0) + 1;
  }

  if (rowId) {
    const { data, error } = await supabase
      .from("user_srs_progress")
      .update(payload)
      .eq("id", rowId)
      .select()
      .single();
    return { data, error };
  } else {
    const { data, error } = await supabase
      .from("user_srs_progress")
      .insert({
        ...payload,
        created_at: now.toISOString(),
      })
      .select()
      .single();
    return { data, error };
  }
}

// OPTIMIZED: Record quiz answer with full context
export async function recordQuizAnswer(
  userId: string,
  questionId: string,
  correct: boolean,
  courseId?: string,
  moduleId?: string,
  unitId?: string,
  lessonId?: string
) {
  const quality = correct ? 4 : 2;
  return recordReview(
    userId, 
    questionId, 
    quality, 
    courseId, 
    moduleId, 
    unitId, 
    lessonId
  );
}