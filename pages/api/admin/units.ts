import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/admin-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAdmin(req, res);
  if (!user) return;

  try {
    switch (req.method) {
      case 'GET':
        // If you need a standalone units endpoint
        const { data: units, error } = await supabaseServer
          .from('units')
          .select('*')
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return res.json(units || []);

      case 'POST':
        const { title, module_id, order_index } = req.body;
        const { data: newUnit, error: createError } = await supabaseServer
          .from('units')
          .insert([{ title, module_id, order_index }])
          .select()
          .single();
        
        if (createError) throw createError;
        return res.status(201).json(newUnit);

      case 'PUT':
        const { id, title: updateTitle, order_index: updateOrderIndex } = req.body;
        const { data: updatedUnit, error: updateError } = await supabaseServer
          .from('units')
          .update({ 
            title: updateTitle,
            ...(updateOrderIndex !== undefined && { order_index: updateOrderIndex })
          })
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        return res.json(updatedUnit);

      case 'DELETE':
        const { id: deleteId } = req.body;
        const { error: deleteError } = await supabaseServer
          .from('units')
          .delete()
          .eq('id', deleteId);
        
        if (deleteError) throw deleteError;
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Units API error:', error);
    return res.status(500).json({ error: error.message });
  }
}