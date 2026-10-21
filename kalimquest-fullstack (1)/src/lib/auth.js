import { supabase } from './supabase.js';

export function studentEmailFromAbsen(absen) {
  const clean = String(absen || '').trim().replace(/\s+/g, '');
  if (!/^\d{1,3}$/.test(clean)) throw new Error('Nomor absen harus berupa angka, misalnya 02.');
  return `absen${clean.padStart(2, '0')}@students.kalimquest.invalid`;
}

export async function signInStudent(absen, password) {
  if (!supabase) throw new Error('Supabase belum diatur. Ikuti langkah di README.md terlebih dahulu.');
  const email = studentEmailFromAbsen(absen);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error('Nomor absen atau kata sandi belum cocok. Coba lagi atau minta bantuan guru.');
  return data.user;
}

export async function signInTeacher(email, password) {
  if (!supabase) throw new Error('Supabase belum diatur.');
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error || !data.user) throw new Error('Email atau kata sandi guru belum cocok.');
  const allowed = import.meta.env.VITE_TEACHER_EMAIL;
  if (allowed && data.user.email?.toLowerCase() !== allowed.toLowerCase()) {
    await supabase.auth.signOut();
    throw new Error('Akun ini tidak terdaftar sebagai guru.');
  }
  return data.user;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function teacherRequest(path, body = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Sesi login berakhir. Silakan masuk kembali.');
  const response = await fetch(`/.netlify/functions/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(body)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Permintaan belum berhasil.');
  return result;
}