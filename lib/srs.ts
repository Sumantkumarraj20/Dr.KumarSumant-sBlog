// lib/srs.ts
import { supabase } from "./supabaseClient";
import type { QuizQuestion } from "./adminApi"; // or where you keep types

export type SRSRow = {
  id: string;
  user_id: string;
  question_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  last_reviewed: string | null;
  next_review: string | null;
  quiz_questions?: QuizQuestion; // joined quiz question
};

function clampEF(ef: number) {
  return ef < 1.3 ? 1.3 : ef;
}

/**
 * SM-2 update
 * quality: 0..5
 */
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

  // Update EF
  ef = prevEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  ef = clampEF(ef);

  return { ease_factor: ef, repetitions, interval_days: interval };
}

/**
 * Fetch due SRS rows for a user (joins quiz_questions).
 * Returns up to `limit` cards ordered by next_review.
 */
export async function fetchDueCards(userId: string, limit = 30) {
  if (!userId) return { data: [] as SRSRow[], error: "no-user" };

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("user_progress")
    .select("*, quiz_questions(*)")
    .eq("user_id", userId)
    .lte("next_review", nowIso)
    .order("next_review", { ascending: true })
    .limit(limit);

  return { data: (data || []) as SRSRow[], error };
}

/**
 * Record a review with given quality (0..5).
 * Creates or updates a user_progress row.
 * Returns the updated row.
 */
export async function recordReview(
  userId: string,
  questionId: string,
  quality: number
) {
  if (!userId || !questionId) throw new Error("userId and questionId required");

  // get existing row (if any)
  const { data: existing, error: fetchErr } = await supabase
    .from("user_progress")
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
    ease_factor,
    interval_days,
    repetitions,
    last_reviewed: now.toISOString(),
    next_review: nextReviewDate,
  };

  if (rowId) {
    const { data, error } = await supabase
      .from("user_progress")
      .update(payload)
      .eq("id", rowId)
      .select()
      .single();
    return { data, error };
  } else {
    // insert new row
    const { data, error } = await supabase
      .from("user_progress")
      .insert(payload)
      .select()
      .single();
    return { data, error };
  }
}

/**
 * Convenience: call from quiz after user answers question.
 * qualityForAnswer: if correct -> 4 (Good), incorrect -> 2 (Fail/Again)
 */
export async function recordQuizAnswer(
  userId: string,
  questionId: string,
  correct: boolean
) {
  const quality = correct ? 4 : 2;
  return recordReview(userId, questionId, quality);
}
