import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/admin-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAdmin(req, res);
  if (!user) return;

  try {
    switch (req.method) {
      case 'GET':
        // If you need a standalone lessons endpoint
        const { data: lessons, error } = await supabaseServer
          .from('lessons')
          .select('*')
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return res.json(lessons || []);

      case 'POST':
        const { title, unit_id, order_index, content } = req.body;
        const { data: newLesson, error: createError } = await supabaseServer
          .from('lessons')
          .insert([{ 
            title, 
            unit_id, 
            order_index,
            content: content || { type: "doc", content: [] }
          }])
          .select()
          .single();
        
        if (createError) throw createError;
        return res.status(201).json(newLesson);

      case 'PUT':
        const { id, title: updateTitle, order_index: updateOrderIndex, content: updateContent } = req.body;
        const { data: updatedLesson, error: updateError } = await supabaseServer
          .from('lessons')
          .update({ 
            title: updateTitle,
            ...(updateOrderIndex !== undefined && { order_index: updateOrderIndex }),
            ...(updateContent !== undefined && { content: updateContent })
          })
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        return res.json(updatedLesson);

      case 'DELETE':
        const { id: deleteId } = req.body;
        const { error: deleteError } = await supabaseServer
          .from('lessons')
          .delete()
          .eq('id', deleteId);
        
        if (deleteError) throw deleteError;
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Lessons API error:', error);
    return res.status(500).json({ error: error.message });
  }
}