import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/admin-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAdmin(req, res);
  if (!user) return;

  try {
    switch (req.method) {
      case 'POST':
        const { lesson_id, quiz_id, question_text, options, correct_answer, explanation } = req.body;
        const { data: newQuestion, error } = await supabaseServer
          .from('quiz_questions')
          .insert([{ 
            lesson_id, 
            quiz_id, 
            question_text, 
            options, 
            correct_answer, 
            explanation 
          }])
          .select()
          .single();
        
        if (error) throw error;
        return res.status(201).json(newQuestion);

      case 'DELETE':
        const { id: deleteId } = req.body;
        const { error: deleteError } = await supabaseServer
          .from('quiz_questions')
          .delete()
          .eq('id', deleteId);
        
        if (deleteError) throw deleteError;
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['POST', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Quiz Questions API error:', error);
    return res.status(500).json({ error: error.message });
  }
}