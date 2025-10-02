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
        const { title, unit_id, order_index } = req.body;
        const { data: newLesson, error } = await supabaseServer
          .from('course_lessons')
          .insert([{ 
            title, 
            unit_id, 
            order_index,
            content: { type: "doc", content: [] }
          }])
          .select()
          .single();
        
        if (error) throw error;
        return res.status(201).json(newLesson);

      case 'PUT':
        const { id, ...updateData } = req.body;
        const { data: updatedLesson, error: updateError } = await supabaseServer
          .from('course_lessons')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        return res.json(updatedLesson);

      case 'DELETE':
        const { id: deleteId } = req.body;
        const { error: deleteError } = await supabaseServer
          .from('course_lessons')
          .delete()
          .eq('id', deleteId);
        
        if (deleteError) throw deleteError;
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Lessons API error:', error);
    return res.status(500).json({ error: error.message });
  }
}