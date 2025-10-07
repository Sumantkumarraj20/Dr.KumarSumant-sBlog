import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from './supabase-server';

export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authentication' });
    return null;
  }

  const token = authHeader.slice(7);

  try {
    // Verify token and get user
    const { data: userData, error: userErr } = await supabaseServer.auth.getUser(token as string);
    if (userErr || !userData?.user) {
      res.status(401).json({ error: 'Invalid token' });
      return null;
    }

    const user = userData.user;

    // Check profiles table for is_admin flag
    const { data: profile, error: profileErr } = await supabaseServer
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr) {
      console.error('Error fetching profile for admin check:', profileErr);
      res.status(500).json({ error: 'Internal error' });
      return null;
    }

    if (!profile || !profile.is_admin) {
      res.status(403).json({ error: 'Admin access required' });
      return null;
    }

    return user;
  } catch (err: any) {
    console.error('Admin auth error:', err);
    res.status(500).json({ error: 'Authentication error' });
    return null;
  }
}
