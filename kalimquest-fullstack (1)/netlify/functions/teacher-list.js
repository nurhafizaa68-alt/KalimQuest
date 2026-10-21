import { json, requireTeacher } from './_auth.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Metode tidak diizinkan.' });
  const auth = await requireTeacher(event);
  if (auth.error) return auth.error;

  const { data: { users }, error: usersError } = await auth.admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersError) return json(500, { error: 'Tidak bisa mengambil daftar akun.' });

  const { data: progress, error: progressError } = await auth.admin
    .from('student_progress')
    .select('user_id, absen, display_name, completed_locations, stars, quiz_correct, quiz_attempts, updated_at')
    .order('absen', { ascending: true });
  if (progressError) return json(500, { error: 'Tidak bisa mengambil progres. Pastikan schema.sql sudah dijalankan.' });

  const progressByUser = new Map((progress || []).map((row) => [row.user_id, row]));
  const students = users
    .filter((user) => (user.email || '').endsWith('@students.kalimquest.invalid'))
    .map((user) => {
      const row = progressByUser.get(user.id);
      const absenFromEmail = (user.email || '').match(/^absen(\d+)@/i)?.[1] || '';
      return {
        user_id: user.id,
        absen: row?.absen || absenFromEmail,
        display_name: row?.display_name || '',
        completed_locations: row?.completed_locations || [],
        stars: row?.stars || 0,
        quiz_correct: row?.quiz_correct || 0,
        quiz_attempts: row?.quiz_attempts || 0,
        updated_at: row?.updated_at || null,
        last_sign_in_at: user.last_sign_in_at || null
      };
    }).sort((a, b) => Number(a.absen) - Number(b.absen));

  return json(200, { students });
}