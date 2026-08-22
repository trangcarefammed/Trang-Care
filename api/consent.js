import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Supabase is not configured' });

  const lineUserId = String(req.body?.lineUserId || '').trim();
  const displayName = String(req.body?.displayName || '').trim();
  const consentedAt = req.body?.consentedAt || new Date().toISOString();

  if (!lineUserId) return res.status(400).json({ error: 'lineUserId is required' });

  const { error } = await supabase.from('users').upsert({
    line_user_id: lineUserId,
    display_name: displayName,
    consented_at: consentedAt,
    deleted_at: null,
  }, { onConflict: 'line_user_id' });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true, consentedAt });
}
