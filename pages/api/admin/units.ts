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
        const { title, module_id, order_index } = req.body;
        const { data: newUnit, error } = await supabaseServer
          .from('course_units')
          .insert([{ title, module_id, order_index }])
          .select()
          .single();
        
        if (error) throw error;
        return res.status(201).json(newUnit);

      case 'PUT':
        const { id, title: updateTitle } = req.body;
        const { data: updatedUnit, error: updateError } = await supabaseServer
          .from('course_units')
          .update({ title: updateTitle })
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        return res.json(updatedUnit);

      case 'DELETE':
        const { id: deleteId } = req.body;
        const { error: deleteError } = await supabaseServer
          .from('course_units')
          .delete()
          .eq('id', deleteId);
        
        if (deleteError) throw deleteError;
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Units API error:', error);
    return res.status(500).json({ error: error.message });
  }
}