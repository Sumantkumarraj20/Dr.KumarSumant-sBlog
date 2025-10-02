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
        const { title, course_id, order_index } = req.body;
        const { data: newModule, error } = await supabaseServer
          .from('course_modules')
          .insert([{ title, course_id, order_index }])
          .select()
          .single();
        
        if (error) throw error;
        return res.status(201).json(newModule);

      case 'PUT':
        const { id, title: updateTitle } = req.body;
        const { data: updatedModule, error: updateError } = await supabaseServer
          .from('course_modules')
          .update({ title: updateTitle })
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        return res.json(updatedModule);

      case 'DELETE':
        const { id: deleteId } = req.body;
        const { error: deleteError } = await supabaseServer
          .from('course_modules')
          .delete()
          .eq('id', deleteId);
        
        if (deleteError) throw deleteError;
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Modules API error:', error);
    return res.status(500).json({ error: error.message });
  }
}