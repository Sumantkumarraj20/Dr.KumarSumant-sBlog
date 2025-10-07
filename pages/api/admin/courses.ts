import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/admin-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAdmin(req, res);
  if (!user) return; // requireAdmin already sent response

  try {
    switch (req.method) {
      case 'GET':
        const { data: courses, error } = await supabaseServer
          .from('courses')
          .select(`
            *,
            modules:modules(
              *,
              units:units(
                *,
                lessons:lessons(
                  *,
                  quizzes:quizzes(
                    *,
                    questions:quiz_questions(*)
                  )
                )
              )
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        // Sort courses and their nested relationships by order_index
        const sortedCourses = (courses || []).map(course => ({
          ...course,
          modules: (course.modules || [])
            .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
            .map(module => ({
              ...module,
              units: (module.units || [])
                .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                .map(unit => ({
                  ...unit,
                  lessons: (unit.lessons || [])
                    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                    .map(lesson => ({
                      ...lesson,
                      quizzes: (lesson.quizzes || [])
                        // Quizzes might not have order_index, sort by created_at
                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        .map(quiz => ({
                          ...quiz,
                          questions: (quiz.questions || [])
                            // Questions might not have order_index, sort by created_at
                            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        }))
                    }))
                }))
            }))
        }));

        return res.json(sortedCourses);

      case 'POST':
        const { title, description, user_id } = req.body;
        const { data: newCourse, error: createError } = await supabaseServer
          .from('courses')
          .insert([{ 
            title, 
            description, 
            created_by: user_id 
          }])
          .select()
          .single();
        
        if (createError) throw createError;
        return res.status(201).json(newCourse);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Courses API error:', error);
    return res.status(500).json({ error: error.message });
  }
}