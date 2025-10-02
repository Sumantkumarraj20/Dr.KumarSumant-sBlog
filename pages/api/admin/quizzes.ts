import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authentication' });
  }

  try {
    switch (req.method) {
      case 'POST':
        const { lesson_id, passing_score } = req.body;
        const { data: newQuiz, error } = await supabaseServer
          .from('quizzes')
          .insert([{ lesson_id, passing_score }])
          .select()
          .single();
        
        if (error) throw error;
        return res.status(201).json(newQuiz);

      case 'DELETE':
        const { id: deleteId } = req.body;
        const { error: deleteError } = await supabaseServer
          .from('quizzes')
          .delete()
          .eq('id', deleteId);
        
        if (deleteError) throw deleteError;
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['POST', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Quizzes API error:', error);
    return res.status(500).json({ error: error.message });
  }
}