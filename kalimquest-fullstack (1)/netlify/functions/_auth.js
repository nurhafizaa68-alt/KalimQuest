import { createClient } from '@supabase/supabase-js';

export function json(statusCode, payload) {
  return { statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(payload) };
}

export async function requireTeacher(event) {
  const header = event.headers.authorization || event.headers.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return { error: json(401, { error: 'Login guru diperlukan.' }) };

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const teacherEmail = (process.env.TEACHER_EMAIL || '').toLowerCase();
  if (!url || !serviceKey || !teacherEmail) {
    return { error: json(500, { error: 'Konfigurasi backend belum lengkap. Periksa environment variables Netlify.' }) };
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return { error: json(401, { error: 'Sesi login tidak valid. Silakan login kembali.' }) };
  if ((data.user.email || '').toLowerCase() !== teacherEmail) {
    return { error: json(403, { error: 'Akses khusus akun guru.' }) };
  }
  return { admin, teacher: data.user };
}