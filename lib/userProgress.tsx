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
    .from("user_progress")
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        module_id: moduleId,
        unit_id: unitId,
        lesson_id: lessonId,
        last_viewed: new Date().toISOString(),
      },
      {
        // 👇 this must be the name of a UNIQUE constraint/index in your DB
        onConflict: "user_id_lesson_id_unique",
      }
    );

  if (error) {
    console.error("❌ Error recording progress:", error);
  }
};
