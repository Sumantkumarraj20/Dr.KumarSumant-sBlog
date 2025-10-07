import { supabase } from "./supabaseClient";

export const recordProgress = async (
  userId: string,
  courseId?: string,
  moduleId?: string,
  unitId?: string,
  lessonId?: string
) => {
  if (!userId) return;

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
        // Supabase/PostgREST expects the `on_conflict` query param to be a
        // comma-separated list of column names. Previously this used a
        // constraint name which caused a 42703 (column does not exist) error.
        // Use the natural unique key columns instead.
        onConflict: "user_id,lesson_id",
      }
    );

  if (error) {
    console.error("❌ Error recording progress:", error);
  }
};
