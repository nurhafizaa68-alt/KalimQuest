import { json, requireTeacher } from './_auth.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Metode tidak diizinkan.' });
  const auth = await requireTeacher(event);
  if (auth.error) return auth.error;

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Format data tidak valid.' }); }
  const password = String(body.password || '');
  const students = Array.isArray(body.students) ? body.students : [];
  if (password.length < 8) return json(400, { error: 'Kata sandi kelas minimal 8 karakter.' });
  if (!students.length || students.length > 100) return json(400, { error: 'Masukkan 1 sampai 100 nomor absen.' });

  const normalized = [];
  for (const item of students) {
    const absen = String(item.absen || '').trim();
    const displayName = String(item.display_name || '').trim().slice(0, 80);
    if (!/^\d{1,3}$/.test(absen)) return json(400, { error: `Nomor absen "${absen}" tidak valid.` });
    normalized.push({ absen: absen.padStart(2, '0'), displayName });
  }
  const unique = new Set(normalized.map((s) => s.absen));
  if (unique.size !== normalized.length) return json(400, { error: 'Ada nomor absen yang duplikat di daftar.' });

  const { data: { users }, error: listError } = await auth.admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) return json(500, { error: 'Tidak bisa memeriksa akun yang sudah ada.' });
  const existing = new Set(users.map((u) => (u.email || '').toLowerCase()));
  const results = [];

  for (const student of normalized) {
    const email = `absen${student.absen}@students.kalimquest.invalid`;
    if (existing.has(email)) {
      results.push({ absen: student.absen, status: 'exists', message: 'Akun sudah ada; sandi tidak diubah.' });
      continue;
    }
    const { data, error } = await auth.admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { absen: student.absen, display_name: student.displayName, account_type: 'student' }
    });
    if (error || !data.user) {
      results.push({ absen: student.absen, status: 'error', message: error?.message || 'Gagal membuat akun.' });
      continue;
    }
    const { error: progressError } = await auth.admin.from('student_progress').insert({
      user_id: data.user.id,
      absen: student.absen,
      display_name: student.displayName,
      completed_locations: [],
      stars: 0,
      quiz_correct: 0,
      quiz_attempts: 0
    });
    if (progressError) {
      await auth.admin.auth.admin.deleteUser(data.user.id);
      results.push({ absen: student.absen, status: 'error', message: 'Akun dibatalkan karena data progres gagal dibuat.' });
      continue;
    }
    results.push({ absen: student.absen, status: 'created', message: 'Akun berhasil dibuat.' });
  }

  return json(200, { results });
}