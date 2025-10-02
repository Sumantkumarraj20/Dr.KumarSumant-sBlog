// Utility function to make authenticated API calls
const adminApiCall = async (endpoint: string, options: RequestInit = {}) => {
  // Get the current session token from Supabase
  const { supabase } = await import('@/lib/supabaseClient');
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`/api/admin/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  // For DELETE operations that return 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Course operations
export const createCourse = async (data: { title: string; description?: string }) => {
  const { supabase } = await import('@/lib/supabaseClient');
  const { data: { user } } = await supabase.auth.getUser();
  
  return adminApiCall('courses', {
    method: 'POST',
    body: JSON.stringify({ 
      ...data, 
      user_id: user?.id 
    }),
  });
};

export const updateCourse = (id: string, data: { title?: string; description?: string }) =>
  adminApiCall(`courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteCourse = (id: string) =>
  adminApiCall(`courses/${id}`, {
    method: 'DELETE',
  });

// Module operations
export const createModule = (data: { title: string; course_id: string; order_index: number }) =>
  adminApiCall('modules', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateModule = (id: string, data: { title: string }) =>
  adminApiCall('modules', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data }),
  });

export const deleteModule = (id: string) =>
  adminApiCall('modules', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });

// Unit operations
export const createUnit = (data: { title: string; module_id: string; order_index: number }) =>
  adminApiCall('units', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateUnit = (id: string, data: { title: string }) =>
  adminApiCall('units', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data }),
  });

export const deleteUnit = (id: string) =>
  adminApiCall('units', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });

// Lesson operations
export const createLesson = (data: { 
  title: string; 
  unit_id: string; 
  order_index: number; 
  content?: any 
}) =>
  adminApiCall('lessons', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      content: data.content || { type: "doc", content: [] }
    }),
  });

export const updateLesson = (id: string, data: { 
  title?: string; 
  content?: any; 
  order_index?: number 
}) =>
  adminApiCall('lessons', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data }),
  });

export const deleteLesson = (id: string) =>
  adminApiCall('lessons', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });

// Quiz operations
export const createQuiz = (data: { lesson_id: string; passing_score: number }) =>
  adminApiCall('quizzes', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const deleteQuiz = (id: string) =>
  adminApiCall('quizzes', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });

// Quiz Question operations
export const createQuizQuestion = (data: { 
  lesson_id: string; 
  quiz_id: string; 
  question_text: any; 
  options: string[]; 
  correct_answer: string[]; 
  explanation: any;
}) =>
  adminApiCall('quiz-questions', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const deleteQuizQuestion = (id: string) =>
  adminApiCall('quiz-questions', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });

// Fetch operations
export const fetchCourseWithContent = () =>
  adminApiCall('courses');