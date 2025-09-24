// components/LessonQuiz.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

interface Lesson {
  id: string;
  title: string;
  content: any;
}

interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string[];
  explanation?: string;
}

interface LessonQuizProps {
  lessonId: string;
  userId: string;
}

export default function LessonQuiz({ lessonId, userId }: LessonQuizProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [showLesson, setShowLesson] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showRetryOptions, setShowRetryOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch lesson
        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("*")
          .eq("id", lessonId)
          .single();

        if (lessonError || !lessonData) {
          console.error("Lesson fetch error:", lessonError);
          return;
        }
        setLesson(lessonData);

        // Fetch quiz
        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .select("id")
          .eq("lesson_id", lessonId)
          .maybeSingle(); // allows null

        if (quizError) {
          console.error("Quiz fetch error:", quizError);
          return;
        }

        if (!quizData?.id) {
          console.warn("No quiz for this lesson.");
          setQuizQuestions([]);
          return;
        }

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("quiz_questions")
          .select("id, question_text, options, correct_answer, explanation")
          .eq("quiz_id", quizData.id)
          .order("created_at", { ascending: true });

        if (questionsError) {
          console.error("Questions fetch error:", questionsError);
          return;
        }

        setQuizQuestions(questionsData || []);
      } catch (err) {
        console.error("Unexpected fetch error:", err);
      }
    };

    fetchData();
  }, [lessonId]);
  if (!lesson) return <div>Loading lesson...</div>;
  if (quizQuestions.length === 0) return <div>Loading quiz...</div>;

  const currentQuestion = quizQuestions[currentQuestionIndex];

  const handleFinishLesson = () => {
    setShowLesson(false);
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = async (option: string) => {
    setSelectedOption(option);
    const isCorrect = currentQuestion.correct_answer.includes(option);

    if (isCorrect) {
      // Insert into user_progress for SRS
      await supabase.from("user_progress").insert({
        user_id: userId,
        question_id: currentQuestion.id,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 1,
        last_reviewed: new Date(),
        next_review: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day later
      });

      // Move to next question
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowRetryOptions(false);
    } else {
      setShowRetryOptions(true);
    }
  };

  const handleRetry = () => {
    setShowRetryOptions(false);
    setSelectedOption(null);
  };

  const handleGoBackToLesson = () => {
    setShowLesson(true);
    setShowRetryOptions(false);
    setSelectedOption(null);
  };

  // Check if quiz is completed
  if (!showLesson && currentQuestionIndex >= quizQuestions.length) {
    return (
      <div>
        🎉 Quiz Completed! You can review the lesson again or proceed to next
        unit.
      </div>
    );
  }

  return (
    <div className="p-4 border rounded shadow-md max-w-2xl mx-auto">
      {showLesson ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">{lesson.title}</h2>
          <div className="mb-4">{lesson.content}</div>
          <button
            onClick={handleFinishLesson}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Start Quiz
          </button>
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-semibold mb-2">
            Question {currentQuestionIndex + 1} / {quizQuestions.length}
          </h3>
          <p className="mb-4">{currentQuestion.question_text}</p>
          <div className="grid gap-2">
            {currentQuestion.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={!!selectedOption}
                className={`px-4 py-2 border rounded text-left ${
                  selectedOption === opt
                    ? currentQuestion.correct_answer.includes(opt)
                      ? "bg-green-300"
                      : "bg-red-300"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {showRetryOptions && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleGoBackToLesson}
                className="px-4 py-2 bg-yellow-500 text-white rounded"
              >
                Go Back to Lesson
              </button>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Retry Question
              </button>
            </div>
          )}

          {selectedOption && !showRetryOptions && (
            <p className="mt-2 text-green-700 font-medium">
              Correct! ✅ {currentQuestion.explanation || ""}
            </p>
          )}
          {selectedOption && showRetryOptions && (
            <p className="mt-2 text-red-700 font-medium">
              Incorrect ❌ {currentQuestion.explanation || ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
