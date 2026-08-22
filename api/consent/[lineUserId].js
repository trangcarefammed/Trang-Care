import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Supabase is not configured' });

  const lineUserId = String(req.query?.lineUserId || '').trim();
  if (!lineUserId) return res.status(400).json({ error: 'lineUserId is required' });

  const { data, error } = await supabase
    .from('users')
    .select('consented_at, deleted_at')
    .eq('line_user_id', lineUserId)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({
    consented: Boolean(data?.consented_at) && !data?.deleted_at,
    consentedAt: data?.consented_at || null,
  });
}
