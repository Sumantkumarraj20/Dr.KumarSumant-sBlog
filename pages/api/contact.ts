import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, email, message } = req.body;
  const { error } = await supabase.from('contacts').insert([{ name, email, message }]);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}
