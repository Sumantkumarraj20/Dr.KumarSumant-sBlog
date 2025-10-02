import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple token-based auth (we'll improve this later)
  const authHeader = req.headers.authorization;
  
  interface CourseResponse {
  id: string;
  title: string;
  description?: string;
  created_by?: string;
  created_at?: string;
  modules?: any[];
}

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authentication' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const { data: courses, error } = await supabaseServer
          .from('courses')
          .select(`
            *,
            modules:course_modules(
              *,
              units:course_units(
                *,
                lessons:course_lessons(
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
        
        if (error) throw error;
        return res.json(courses as CourseResponse[]);

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