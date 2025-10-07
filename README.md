-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contacts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  unit_id uuid,
  title text NOT NULL,
  content jsonb,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lessons_pkey PRIMARY KEY (id),
  CONSTRAINT lessons_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id)
);
CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid,
  title text NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT modules_pkey PRIMARY KEY (id),
  CONSTRAINT modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  provider text,
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.quiz_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_id uuid,
  question_text jsonb NOT NULL,
  options jsonb,
  correct_answer jsonb,
  explanation jsonb,
  created_at timestamp with time zone DEFAULT now(),
  lesson_id uuid,
  source_exam text,
  course_id uuid,
  module_id uuid,
  unit_id uuid,
  CONSTRAINT quiz_questions_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id),
  CONSTRAINT quiz_questions_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id),
  CONSTRAINT quiz_questions_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT quiz_questions_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id),
  CONSTRAINT quiz_questions_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id)
);
CREATE TABLE public.quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lesson_id uuid,
  passing_score integer DEFAULT 70,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quizzes_pkey PRIMARY KEY (id),
  CONSTRAINT quizzes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);
CREATE TABLE public.units (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  module_id uuid,
  title text NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT units_pkey PRIMARY KEY (id),
  CONSTRAINT units_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id)
);
CREATE TABLE public.user_course_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  current_module_id uuid,
  current_unit_id uuid,
  current_lesson_id uuid,
  completed_lessons integer DEFAULT 0,
  total_lessons integer DEFAULT 0,
  last_accessed timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  progress_percentage integer DEFAULT 0,
  CONSTRAINT user_course_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_course_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_course_progress_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT user_course_progress_current_module_id_fkey FOREIGN KEY (current_module_id) REFERENCES public.modules(id),
  CONSTRAINT user_course_progress_current_unit_id_fkey FOREIGN KEY (current_unit_id) REFERENCES public.units(id),
  CONSTRAINT user_course_progress_current_lesson_id_fkey FOREIGN KEY (current_lesson_id) REFERENCES public.lessons(id)
);
CREATE TABLE public.user_quiz_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quiz_id uuid NOT NULL,
  lesson_id uuid,
  score integer,
  passed boolean,
  attempted_at timestamp with time zone DEFAULT now(),
  course_id uuid,
  module_id uuid,
  unit_id uuid,
  CONSTRAINT user_quiz_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT user_quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id),
  CONSTRAINT user_quiz_attempts_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id),
  CONSTRAINT user_quiz_attempts_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT user_quiz_attempts_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id),
  CONSTRAINT user_quiz_attempts_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id)
);
CREATE TABLE public.user_srs_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL,
  ease_factor double precision DEFAULT 2.5,
  interval_days integer DEFAULT 1,
  repetitions integer DEFAULT 0,
  correct_attempts integer DEFAULT 0,
  wrong_attempts integer DEFAULT 0,
  last_reviewed timestamp with time zone,
  next_review timestamp with time zone,
  score integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  course_id uuid,
  module_id uuid,
  unit_id uuid,
  lesson_id uuid,
  last_viewed timestamp with time zone,
  CONSTRAINT user_srs_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_srs_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_srs_progress_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id),
  CONSTRAINT user_srs_progress_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT user_srs_progress_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id),
  CONSTRAINT user_srs_progress_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id),
  CONSTRAINT user_srs_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);