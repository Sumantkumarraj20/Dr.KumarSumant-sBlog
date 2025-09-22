import type { NextApiRequest, NextApiResponse } from 'next';
import { getPostBySlug } from '@/lib/posts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const slug = 'acne-vulgaris-hindi-guide';
  const lang = 'hi';
  const category = 'education';

  try {
    const post = await getPostBySlug(slug, lang, category);
    if (!post) {
      return res.status(404).json({ found: false, message: 'post not found' });
    }
    return res.status(200).json({ found: true, meta: post.meta });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
}
