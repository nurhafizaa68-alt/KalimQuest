# KalimQuest Full-stack MVP

KalimQuest adalah web pembelajaran Bahasa Arab berbasis permainan untuk murid SD. Versi ini mencakup:
- Login murid memakai nomor absen dan satu kata sandi kelas bersama.
- Login guru terpisah memakai email dan kata sandi guru.
- Dashboard guru: tambah akun murid, lihat progres, hapus/nonaktifkan akun melalui alur admin, dan rekap CSV.
- Peta lima tema, kartu kosakata, audio browser, misi pilihan ganda, bintang dan progres.
- Supabase Auth + PostgreSQL + Row Level Security.
- Netlify Functions untuk operasi administratif yang memerlukan service role key.

## Penting soal sandi bersama
Semua murid dapat menggunakan kata sandi kelas yang sama, tetapi username/nomor absen tetap berbeda. Risiko: murid yang mengetahui nomor absen teman dapat mencoba masuk ke akun temannya. Berikan sandi hanya kepada kelas dan pertimbangkan menggantinya setelah uji coba. Sistem **tidak menyimpan kata sandi asli** di tabel murid; Supabase Auth menyimpan kredensial secara aman. Guru tidak bisa melihat sandi yang sudah dipakai, hanya dapat menetapkan sandi awal atau menggantinya.

## A. Persiapan
1. Install Node.js versi LTS: https://nodejs.org/
2. Install Visual Studio Code: https://code.visualstudio.com/
3. Buat proyek di https://supabase.com/
4. Di Supabase **Project Settings → API**, salin Project URL dan anon/public key.
5. Salin `.env.example` menjadi `.env`, isi `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, dan `VITE_TEACHER_EMAIL` dengan email guru yang sama dengan `TEACHER_EMAIL`.
6. Di Supabase **SQL Editor → New query**, jalankan seluruh isi `supabase/schema.sql`.

## B. Buat akun guru pertama
1. Di Supabase buka **Authentication → Users → Add user**.
2. Buat akun guru memakai email sungguhan yang kamu kelola dan password kuat.
3. Untuk mengunci akses dashboard guru, isi environment variable `TEACHER_EMAIL` dengan email tersebut pada Netlify. Untuk lokal, tambahkan `TEACHER_EMAIL` di `.env` tanpa awalan VITE_.
4. Untuk operasi pembuatan akun murid, Netlify Function memverifikasi email login guru cocok dengan `TEACHER_EMAIL`. Di lokal, Netlify Functions tidak otomatis dijalankan oleh `npm run dev`; gunakan Netlify CLI (`npx netlify dev`) setelah mengatur environment variables. Frontend masih bisa dijalankan dengan `npm run dev`, tetapi fitur admin memerlukan fungsi Netlify.

## C. Environment variables Netlify (WAJIB)
Di Netlify **Site configuration → Environment variables**, tambahkan:
- `VITE_SUPABASE_URL` = Project URL Supabase
- `VITE_SUPABASE_ANON_KEY` = anon/public key Supabase
- `SUPABASE_URL` = Project URL Supabase
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key dari Supabase API settings (rahasia, hanya server function)
- `TEACHER_EMAIL` = email guru yang dibuat di langkah B
- `VITE_TEACHER_EMAIL` = email guru yang sama (dipakai frontend untuk memilih dashboard setelah login)

Jangan pernah menaruh `SUPABASE_SERVICE_ROLE_KEY` pada variabel `VITE_`, file `.env.example`, kode frontend, atau repository GitHub. Setelah mengubah environment variables, lakukan redeploy.

## D. Jalankan di komputer
1. Buka folder proyek di VS Code.
2. Buka Terminal → New Terminal.
3. Jalankan `npm install`.
4. Salin `.env.example` ke `.env` dan isi URL serta anon key.
5. Untuk tampilan murid dan login, jalankan `npm run dev`.
6. Untuk mencoba Netlify Functions (dashboard guru dan pembuatan akun), pasang Netlify CLI dan jalankan:
   ```bash
   npx netlify dev
   ```
   Jika diminta, login Netlify dan pilih/tautkan site. Pastikan environment variables backend tersedia di sesi lokal (jangan commit `.env`).

## E. Buat repository GitHub
1. Buat repository baru, misalnya `kalimquest`.
2. Upload seluruh isi folder proyek, kecuali `.env`, `node_modules`, dan `dist`.
3. Pastikan `.gitignore` tetap ada.
4. Hubungkan repository dari Netlify melalui **Add new site → Import an existing project**.

## F. Deploy Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Tambahkan semua environment variables bagian C.
- Deploy/redeploy. Setelah deploy, uji login guru, buat satu akun uji murid, login murid di browser lain, selesaikan misi, logout, lalu login lagi untuk memastikan progres tersimpan.

## G. Catatan dan batasan MVP
- Email internal murid berbentuk `absen02@students.kalimquest.invalid`. Domain `.invalid` memang tidak dapat menerima email; akun dibuat admin melalui server function, dan login murid tetap memakai nomor absen. Ini cocok untuk login username/sandi tanpa email murid. Jangan aktifkan alur konfirmasi email untuk akun ini.
- Jika project Supabase mewajibkan konfirmasi email, matikan konfirmasi email untuk metode email/password pada Authentication settings agar akun murid buatan admin dapat login tanpa email.
- Guru harus memakai email yang sama dengan `TEACHER_EMAIL`.
- Akun guru dibuat manual di Supabase; dashboard tidak menyediakan pendaftaran guru publik.
- Fungsi reset password menetapkan password kelas yang baru ke akun murid terpilih. Supabase tidak mengizinkan membaca password lama.
- Audio menggunakan speech synthesis browser; suara Arab tergantung dukungan perangkat.
- Ini MVP pendidikan, bukan sistem sekolah berskala besar. Sebelum dipakai dengan data anak sungguhan, lakukan uji coba terbatas, lindungi daftar absen, dan jangan mengumpulkan data pribadi yang tidak diperlukan.
