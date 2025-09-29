1️⃣ Database mappings
a) user_quiz_attempts

Tracks lesson quiz attempts.

Each quiz attempt updates this table.

score field → % of questions correct.

passed → if lesson is “completed” (all questions correct once).

b) user_srs_progress

Tracks individual question spaced repetition.

Each question attempted at least once is updated here.

Fields: ease_factor, interval_days, repetitions, correct_attempts, wrong_attempts, last_reviewed, next_review.

c) user_course_progress

Tracks overall course progress per user.

completed_lessons / total_lessons → shows lesson completion progress.

current_lesson_id, current_unit_id, current_module_id → last viewed location.

last_accessed → last activity timestamp.

2️⃣ Refactor LessonContent.tsx

Display lesson content + quiz inline.

Show lesson completion % at top.

On quiz submit:

Save/update user_quiz_attempts for this lesson.

Update user_srs_progress per question (correct/wrong, repetitions, interval).

Update user_course_progress if lesson is completed.

Key changes in code:

// inside handleQuizComplete
async function handleQuizComplete(quizResults: {questionId: string, correct: boolean}[], score: number) {
  // 1️⃣ Save quiz attempt
  await supabase.from("user_quiz_attempts").insert({
    user_id: userId,
    lesson_id: lesson.id,
    quiz_id: lesson.quiz_id,
    score,
    passed: score === 100,
  }).upsert({ onConflict: ["user_id", "lesson_id", "quiz_id"] });

  // 2️⃣ Update SRS for each question
  for (const q of quizResults) {
    await supabase.from("user_srs_progress").upsert({
      user_id: userId,
      question_id: q.questionId,
      correct_attempts: q.correct ? 1 : 0,
      wrong_attempts: q.correct ? 0 : 1,
      last_reviewed: new Date(),
      // calculate next_review using your SRS algorithm
    }, { onConflict: ["user_id", "question_id"] });
  }

  // 3️⃣ Update course progress if lesson fully completed
  if(score === 100) {
    await supabase.rpc("increment_completed_lessons", { user_uuid: userId, course_uuid: courseId });
  }

  // navigate
  if (nextLesson) onNavigateLesson(nextLesson);
  else onGoToNext(lesson);
}


Note: You can implement increment_completed_lessons as a Postgres stored procedure or do it via JS query: increment completed_lessons in user_course_progress.

3️⃣ Refactor LessonQuiz.tsx

Track user answers in local state.

On submit → call handleQuizComplete above.

Display lesson completion % dynamically:

const lessonCompletion = (correctAnswers / totalQuestions) * 100;


Show tiny pie chart next to lesson title.

4️⃣ Refactor LessonPage.tsx

Fetch lesson completion % from user_quiz_attempts.

Display as tiny pie chart in each lesson card.

Also highlight lessons already completed (maybe green outline or checkmark).

const progress = userQuizAttempts[lesson.id]?.score ?? 0;

5️⃣ Refactor UnitPage and ModulePage

For each unit, display lessons + their completion (sum of lesson scores / total lessons).

For module, show unit completion % (sum of units completed / total units).

Update current_unit_id in user_course_progress whenever a user opens a unit.

6️⃣ Refactor CoursePage

Display module completion %.

Last visited module/unit/lesson from user_course_progress.

Add “resume course” button that opens last viewed lesson.

7️⃣ Dashboard Page

Display user insights:

Metric	Source
Current Lesson / Unit / Module	user_course_progress
Last Accessed	user_course_progress.last_accessed
Overall Quiz Performance	avg(user_quiz_attempts.score)
Total Lessons Completed	user_course_progress.completed_lessons
Total Lessons in Course	user_course_progress.total_lessons
SRS due cards	count where next_review <= now() from user_srs_progress
Repetition count	sum of user_srs_progress.repetitions

Can use pie charts, progress bars, counters from Chakra or chart.js/recharts.

8️⃣ Suggested Architecture
CoursePage
 ├─ ModulePage
 │   ├─ UnitPage
 │   │   ├─ LessonPage
 │   │   │   ├─ LessonContent
 │   │   │   └─ LessonQuiz
DashboardPage


Each page queries user_course_progress for current location and completion.

Each lesson quiz updates user_quiz_attempts and user_srs_progress.

Completion triggers update to user_course_progress.completed_lessons.