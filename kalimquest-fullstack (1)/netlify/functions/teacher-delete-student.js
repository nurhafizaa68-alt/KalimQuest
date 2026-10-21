import { json, requireTeacher } from './_auth.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Metode tidak diizinkan.' });
  const auth = await requireTeacher(event);
  if (auth.error) return auth.error;
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Format data tidak valid.' }); }
  const absen = String(body.absen || '').trim().padStart(2, '0');
  if (!/^\d{1,3}$/.test(String(body.absen || '').trim())) return json(400, { error: 'Nomor absen tidak valid.' });
  const email = `absen${absen}@students.kalimquest.invalid`;
  const { data: { users }, error } = await auth.admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return json(500, { error: 'Tidak bisa mencari akun.' });
  const user = users.find((u) => (u.email || '').toLowerCase() === email);
  if (!user) return json(404, { error: 'Akun murid tidak ditemukan.' });
  const { error: deleteError } = await auth.admin.auth.admin.deleteUser(user.id);
  if (deleteError) return json(500, { error: 'Akun belum berhasil dihapus.' });
  return json(200, { message: `Akun murid ${absen} berhasil dihapus.` });
}