import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, CircleHelp, DoorOpen, Download, GraduationCap, Headphones, KeyRound, LogIn, Map, Plus, RefreshCw, ShieldCheck, Star, Trash2, Users, Volume2 } from 'lucide-react';
import { locations } from './data/locations.js';
import { signInStudent, signInTeacher, signOut, teacherRequest } from './lib/auth.js';
import { supabase, supabaseReady } from './lib/supabase.js';

function speakArabic(text) {
  if (!('speechSynthesis' in window)) return alert('Fitur suara belum didukung browser ini.');
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA'; utterance.rate = 0.78;
  window.speechSynthesis.speak(utterance);
}

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('student');
  const [absen, setAbsen] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const user = mode === 'student'
        ? await signInStudent(absen, password)
        : await signInTeacher(email, password);
      await onLogin(user, mode);
    } catch (e) { setError(e.message || 'Login belum berhasil.'); }
    finally { setBusy(false); }
  }
  return <main className="login-page">
    <div className="login-art" aria-hidden="true"><div className="sun">☀️</div><div className="cloud cloud-one">☁️</div><div className="cloud cloud-two">☁️</div><div className="hill hill-back"></div><div className="hill hill-front"></div><div className="castle">🏰</div><div className="tree tree-one">🌳</div><div className="tree tree-two">🌲</div><div className="mascot">🦊</div><div className="signpost">مَرْحَبًا!<br/><small>Marhaban!</small></div></div>
    <section className="login-card"><div className="brand-mark">ك</div><p className="eyebrow">PETUALANGAN BAHASA ARAB</p><h1>{mode === 'student' ? 'Halo, Petualang!' : 'Halo, Guru!'} ✨</h1><p className="login-subtitle">{mode === 'student' ? 'Masukkan nomor absen dan sandi kelas untuk mulai menjelajah.' : 'Masuk untuk mengelola akun dan melihat progres belajar murid.'}</p>
      <div className="login-tabs"><button className={mode === 'student' ? 'active' : ''} onClick={() => {setMode('student');setError('');}}>Login Murid</button><button className={mode === 'teacher' ? 'active' : ''} onClick={() => {setMode('teacher');setError('');}}>Login Guru</button></div>
      <form className="login-form" onSubmit={submit}>
        {mode === 'student' ? <><label htmlFor="absen">Nomor absen</label><input id="absen" inputMode="numeric" autoComplete="username" placeholder="Contoh: 02" value={absen} onChange={e => setAbsen(e.target.value)} required /></> : <><label htmlFor="teacherEmail">Email guru</label><input id="teacherEmail" type="email" autoComplete="username" placeholder="email guru" value={email} onChange={e => setEmail(e.target.value)} required /></>}
        <label htmlFor="password">Kata sandi {mode === 'student' ? 'kelas' : 'guru'}</label><input id="password" type="password" autoComplete="current-password" placeholder="Masukkan kata sandi" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div className="error-message" role="alert">{error}</div>}
        <button className="primary-button login-button" disabled={busy} type="submit"><LogIn size={18}/>{busy ? 'Sedang masuk…' : 'Masuk ke KalimQuest'}</button>
      </form>
      {!supabaseReady && <p className="setup-warning">Mode persiapan: hubungkan Supabase melalui file .env sebelum login dapat digunakan.</p>}
      <div className="login-note"><ShieldCheck size={16}/><span>Akun murid dan guru memiliki akses yang berbeda.</span></div><p className="tiny-footer">Belajar sedikit demi sedikit, jadi jago setiap hari! 🌟</p>
    </section>
  </main>;
}

function TeacherDashboard({ user, onLogout }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [names, setNames] = useState('');
  const [classPassword, setClassPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetAbsen, setResetAbsen] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  async function refresh() {
    setLoading(true); setError('');
    try { const result = await teacherRequest('teacher-list'); setStudents(result.students || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);
  const completedTotal = students.reduce((sum, s) => sum + (s.completed_locations || []).length, 0);
  const totalStars = students.reduce((sum, s) => sum + (s.stars || 0), 0);
  async function createStudents(event) {
    event.preventDefault(); setNotice(''); setError('');
    const list = names.split(/[\n,;]+/).map(x => x.trim()).filter(Boolean).map(line => {
      const parts = line.split(/\s+/);
      const absen = parts.shift();
      return { absen, display_name: parts.join(' ') };
    });
    if (!list.length) return setError('Masukkan minimal satu nomor absen. Format: 02 Nama Murid, satu murid per baris.');
    setBusy(true);
    try {
      const result = await teacherRequest('teacher-create-students', { students: list, password: classPassword });
      const created = result.results.filter(r => r.status === 'created').length;
      const exists = result.results.filter(r => r.status === 'exists').length;
      const failed = result.results.filter(r => r.status === 'error');
      setNotice(`${created} akun dibuat, ${exists} akun sudah ada.${failed.length ? ' Gagal: ' + failed.map(x => `${x.absen} (${x.message})`).join('; ') : ''}`);
      setNames(''); setClassPassword(''); await refresh();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function resetStudentPassword(event) {
    event.preventDefault(); setError(''); setNotice('');
    try {
      const result = await teacherRequest('teacher-reset-password', { absen: resetAbsen, password: resetPassword });
      setNotice(result.message); setResetAbsen(''); setResetPassword('');
    } catch (e) { setError(e.message); }
  }
  async function deleteStudent(absen) {
    if (!window.confirm(`Hapus akun murid ${absen} beserta progresnya? Tindakan ini tidak dapat dibatalkan.`)) return;
    setError(''); setNotice('');
    try { const result = await teacherRequest('teacher-delete-student', { absen }); setNotice(result.message); await refresh(); }
    catch (e) { setError(e.message); }
  }
  function exportCsv() {
    const rows = [['Nomor absen','Nama','Lokasi selesai','Total lokasi','Bintang','Jawaban benar','Percobaan kuis','Terakhir diperbarui'], ...students.map(s => [s.absen,s.display_name,(s.completed_locations || []).join('|'),locations.length,s.stars,s.quiz_correct,s.quiz_attempts,s.updated_at || ''])];
    const csv = rows.map(row => row.map(v => `"${String(v ?? '').replaceAll('"','""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], {type:'text/csv;charset=utf-8;'}));
    const a = document.createElement('a'); a.href = url; a.download = 'rekap-kalimquest.csv'; a.click(); URL.revokeObjectURL(url);
  }
  return <main className="teacher-page">
    <header className="topbar"><div className="mini-brand"><span>ك</span> KalimQuest <em>Guru</em></div><div className="teacher-user"><GraduationCap size={18}/>{user.email}</div><button className="logout-button" onClick={onLogout}><DoorOpen size={18}/><span>Keluar</span></button></header>
    <section className="teacher-content">
      <div className="teacher-heading"><div><p className="eyebrow">RUANG PENDAMPING</p><h1>Dashboard Guru 👩‍🏫</h1><p>Kelola akun murid dan pantau perjalanan belajar Bahasa Arab.</p></div><button className="outline-button" onClick={refresh}><RefreshCw size={16}/> Perbarui data</button></div>
      {error && <div className="error-message notice">{error}</div>}{notice && <div className="success-message notice">{notice}</div>}
      <div className="teacher-stats"><div className="stat-card"><Users/><span>Total akun murid</span><strong>{students.length}</strong></div><div className="stat-card"><Map/><span>Lokasi diselesaikan</span><strong>{completedTotal}</strong></div><div className="stat-card"><Star/><span>Total bintang</span><strong>{totalStars}</strong></div></div>
      <div className="teacher-grid">
        <section className="panel"><div className="panel-heading"><div><h2><Users size={20}/> Buat akun murid</h2><p>Masukkan satu nomor absen per baris. Nama boleh dikosongkan.</p></div></div>
          <form className="teacher-form" onSubmit={createStudents}><label htmlFor="studentList">Daftar nomor absen dan nama</label><textarea id="studentList" rows="5" value={names} onChange={e => setNames(e.target.value)} placeholder={'02 Alya\n03 Bima\n04 Citra'} required/><label htmlFor="classPassword">Kata sandi bersama untuk akun baru</label><input id="classPassword" type="password" minLength="8" value={classPassword} onChange={e => setClassPassword(e.target.value)} placeholder="Minimal 8 karakter" required/><p className="form-hint">Kata sandi yang sama akan diberikan ke akun baru dalam proses ini. Akun yang sudah ada tidak akan diubah.</p><button className="primary-button" disabled={busy}><Plus size={17}/>{busy ? 'Membuat akun…' : 'Buat akun murid'}</button></form>
        </section>
        <section className="panel"><div className="panel-heading"><div><h2><KeyRound size={20}/> Atur ulang sandi</h2><p>Ganti kata sandi untuk murid yang lupa sandi.</p></div></div>
          <form className="teacher-form" onSubmit={resetStudentPassword}><label htmlFor="resetAbsen">Nomor absen murid</label><input id="resetAbsen" value={resetAbsen} onChange={e => setResetAbsen(e.target.value)} inputMode="numeric" placeholder="Contoh: 02" required/><label htmlFor="resetPassword">Kata sandi baru</label><input id="resetPassword" type="password" minLength="8" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="Minimal 8 karakter" required/><button className="outline-button" type="submit"><RefreshCw size={16}/> Atur ulang sandi</button></form>
        </section>
      </div>
      <section className="panel student-panel"><div className="panel-heading table-heading"><div><h2><BookOpen size={20}/> Progres murid</h2><p>Progres tersimpan dari aktivitas murid yang login.</p></div><button className="outline-button" onClick={exportCsv} disabled={!students.length}><Download size={16}/> Unduh CSV</button></div>
        {loading ? <p className="empty-state">Memuat data murid…</p> : students.length === 0 ? <p className="empty-state">Belum ada akun murid. Buat akun pertama melalui formulir di atas.</p> : <div className="table-scroll"><table><thead><tr><th>Absen</th><th>Nama</th><th>Lokasi selesai</th><th>Bintang</th><th>Kuis benar</th><th>Terakhir aktif</th><th>Aksi</th></tr></thead><tbody>{students.map(s => <tr key={s.user_id}><td><strong>{s.absen}</strong></td><td>{s.display_name || '—'}</td><td><div className="mini-progress"><span>{(s.completed_locations || []).length}/{locations.length}</span><div><i style={{width:`${(s.completed_locations || []).length / locations.length * 100}%`}}/></div></div></td><td>⭐ {s.stars}</td><td>{s.quiz_correct}/{s.quiz_attempts}</td><td>{s.last_sign_in_at ? new Date(s.last_sign_in_at).toLocaleDateString('id-ID') : 'Belum login'}</td><td><button className="icon-button danger" title={`Hapus akun ${s.absen}`} onClick={() => deleteStudent(s.absen)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>}
      </section>
      <p className="privacy-note"><ShieldCheck size={16}/> Kata sandi tidak ditampilkan atau disimpan sebagai teks biasa. Dashboard hanya bisa mengakses fungsi administrasi setelah email guru diverifikasi di server.</p>
    </section>
  </main>;
}

function StudentWorld({ user, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [stars, setStars] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [activeLocation, setActiveLocation] = useState(null);
  const [stage, setStage] = useState('learn');
  const [choice, setChoice] = useState('');
  const [feedback, setFeedback] = useState('');
  const current = useMemo(() => locations.find(x => x.id === activeLocation), [activeLocation]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase || !user) return;
      const { data, error } = await supabase.from('student_progress').select('*').eq('user_id', user.id).maybeSingle();
      if (!cancelled && !error && data) {
        setProfile(data); setCompleted(data.completed_locations || []); setStars(data.stars || 0);
        setQuizCorrect(data.quiz_correct || 0); setQuizAttempts(data.quiz_attempts || 0);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  async function save(next) {
    if (!supabase || !user) return;
    const payload = { user_id:user.id, absen:profile?.absen || user.user_metadata?.absen || user.email?.match(/^absen(\d+)/)?.[1] || '', display_name:profile?.display_name || user.user_metadata?.display_name || '', completed_locations:next.completed, stars:next.stars, quiz_correct:next.correct, quiz_attempts:next.attempts, updated_at:new Date().toISOString() };
    const { data, error } = await supabase.from('student_progress').upsert(payload, {onConflict:'user_id'}).select().single();
    if (error) setFeedback('Progres belum tersimpan. Periksa koneksi lalu coba lagi.');
    else setProfile(data);
  }
  function openLocation(location) { setActiveLocation(location.id); setStage('learn'); setChoice(''); setFeedback(''); }
  async function finishMission() {
    if (!current) return;
    const nextAttempts = quizAttempts + 1;
    const correct = choice === current.answer;
    const nextCorrect = quizCorrect + (correct ? 1 : 0);
    if (!correct) {
      setQuizAttempts(nextAttempts); setQuizCorrect(nextCorrect);
      await save({completed, stars, correct:nextCorrect, attempts:nextAttempts});
      setFeedback('Belum tepat. Coba dengarkan dan perhatikan kosakatanya lagi, ya!');
      return;
    }
    const nextCompleted = completed.includes(current.id) ? completed : [...completed, current.id];
    const nextStars = stars + (completed.includes(current.id) ? 0 : 1);
    setCompleted(nextCompleted); setStars(nextStars); setQuizAttempts(nextAttempts); setQuizCorrect(nextCorrect);
    await save({completed:nextCompleted, stars:nextStars, correct:nextCorrect, attempts:nextAttempts});
    setFeedback('Hebat! Misi berhasil. Kamu mendapat satu bintang! ⭐');
  }
  if (current) return <main className="lesson-page"><header className="topbar"><button className="back-button" onClick={() => setActiveLocation(null)}><ArrowLeft size={18}/> Kembali ke peta</button><div className="mini-brand"><span>ك</span> KalimQuest</div><div className="star-pill"><Star size={17} fill="currentColor"/> {stars} bintang</div></header><section className="lesson-wrap">
    <div className={`lesson-hero ${current.color}`}><div><p className="eyebrow">LOKASI PETUALANGAN</p><h1>{current.emoji} {current.title}</h1><p>{current.intro}</p></div><div className="lesson-arabic" lang="ar" dir="rtl">{current.arabic}</div></div>
    <div className="stage-tabs"><button className={stage==='learn'?'selected':''} onClick={()=>{setStage('learn');setFeedback('');}}><BookOpen size={17}/> Belajar kata</button><button className={stage==='mission'?'selected':''} onClick={()=>{setStage('mission');setFeedback('');}}><Star size={17}/> Misi seru</button><button className={stage==='sentence'?'selected':''} onClick={()=>setStage('sentence')}><CircleHelp size={17}/> Kalimat ajaib</button></div>
    {stage==='learn' && <><div className="section-heading"><div><h2>Koleksi kosakata</h2><p>Lihat gambar, baca kata, lalu tekan tombol suara.</p></div><span className="count-chip">{current.words.length} kata</span></div><div className="word-grid">{current.words.map(w=><article className="word-card" key={w.ar}><div className="word-emoji">{w.emoji}</div><h3 lang="ar" dir="rtl">{w.ar}</h3><p className="latin">{w.latin}</p><p className="translation">{w.id}</p><button className="sound-button" onClick={()=>speakArabic(w.ar)}><Volume2 size={16}/> Dengarkan</button></article>)}</div><div className="lesson-bottom"><span>Tip: dengarkan dua kali supaya makin ingat.</span><button className="primary-button" onClick={()=>setStage('mission')}>Mulai misi <ArrowRight size={18}/></button></div></>}
    {stage==='mission' && <section className="mission-card"><div className="mission-icon">🧩</div><p className="eyebrow">MISI KECIL, BINTANG BESAR!</p><h2>{current.question}</h2><button className="listen-prompt" onClick={()=>speakArabic(current.words.find(w=>w.id===current.answer)?.ar || current.answer)}><Headphones size={17}/> Dengarkan kata</button><div className="choice-grid">{current.choices.map(c=><button key={c} className={`choice-button ${choice===c?'chosen':''}`} onClick={()=>{setChoice(c);setFeedback('');}}>{c}</button>)}</div><button className="primary-button check-button" disabled={!choice} onClick={finishMission}><Check size={18}/> Periksa jawaban</button>{feedback && <div className={`feedback ${feedback.startsWith('Hebat')?'success':'retry'}`} role="status">{feedback}</div>}{feedback.startsWith('Hebat') && <button className="text-button" onClick={()=>{setStage('sentence');setFeedback('');}}>Lanjut ke kalimat ajaib <ArrowRight size={16}/></button>}</section>}
    {stage==='sentence' && <section className="sentence-card"><div className="sentence-illustration">{current.emoji}</div><p className="eyebrow">KALIMAT AJAIB</p><h2 lang="ar" dir="rtl">{current.sentence}</h2><p className="sentence-translation">{current.translation}</p><button className="sound-button" onClick={()=>speakArabic(current.sentence)}><Volume2 size={16}/> Dengarkan kalimat</button><p className="sentence-tip">Coba ucapkan pelan-pelan, lalu ulangi sekali lagi.</p><button className="primary-button" onClick={()=>setActiveLocation(null)}>Kembali ke peta <Map size={17}/></button></section>}
  </section></main>;

  return <main className="world-page"><header className="topbar world-topbar"><div className="mini-brand"><span>ك</span> KalimQuest</div><div className="welcome">Ahlan wa sahlan, {profile?.display_name || `Petualang ${profile?.absen || user.user_metadata?.absen || ''}`}! 👋</div><div className="top-actions"><div className="star-pill"><Star size={17} fill="currentColor"/> {stars} bintang</div><button className="logout-button" onClick={onLogout}><DoorOpen size={18}/><span>Keluar</span></button></div></header>
    <section className="world-intro"><div><p className="eyebrow">PETA PETUALANGANMU</p><h1>Ke mana kita hari ini? 🧭</h1><p>Jelajahi tempat seru, kumpulkan kosakata, dan buka semua rahasia Bahasa Arab!</p></div><div className="progress-card"><div className="progress-top"><span>Progres petualangan</span><strong>{completed.length}/{locations.length}</strong></div><div className="progress-track"><div style={{width:`${completed.length/locations.length*100}%`}}/></div><small>{completed.length===locations.length?'Hebat! Semua lokasi selesai!':'Selesaikan misi untuk mengumpulkan bintang.'}</small></div></section>
    <section className="map-world" aria-label="Peta lokasi KalimQuest"><div className="map-cloud cloud-a">☁️</div><div className="map-cloud cloud-b">☁️</div><div className="map-sun">☀️</div><svg className="map-path" viewBox="0 0 1000 460" preserveAspectRatio="none" aria-hidden="true"><path d="M 85 350 C 170 330, 180 180, 300 195 S 420 360, 510 300 S 620 100, 700 150 S 820 340, 920 210" /></svg><div className="map-label label-top">PETA KATA-KATA</div>{locations.map((loc,i)=>{const pos=[{left:'10%',top:'48%'},{left:'29%',top:'18%'},{left:'47%',top:'52%'},{left:'66%',top:'20%'},{left:'82%',top:'47%'}][i];const done=completed.includes(loc.id);return <button key={loc.id} className={`location-pin ${loc.color} ${done?'done':''}`} style={pos} onClick={()=>openLocation(loc)}><span className="pin-art">{done?'🏆':loc.emoji}</span><span className="pin-number">{done?<Check size={13}/>:i+1}</span><span className="pin-title">{loc.title}</span><span className="pin-arabic" lang="ar" dir="rtl">{loc.arabic}</span><span className="pin-status">{done?'✓ Selesai':'Ayo jelajahi!'}</span></button>})}<div className="map-decoration deco-one">🌼</div><div className="map-decoration deco-two">🌴</div><div className="map-decoration deco-three">🍄</div><div className="map-decoration deco-four">🌷</div><div className="map-footer-sign">🌟 Setiap kata adalah petualangan baru!</div></section>
    <section className="bottom-summary"><div className="summary-icon"><ShieldCheck size={23}/></div><div><strong>Progresmu tersimpan otomatis</strong><p>Keluar kapan saja. Saat masuk lagi, petualanganmu akan menunggu di sini.</p></div><div className="summary-right"><span>{completed.length} lokasi selesai</span><span>{stars} ⭐ terkumpul</span></div></section><footer className="site-footer">KalimQuest <span>•</span> Belajar Bahasa Arab sambil bermain</footer>
  </main>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState(null);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({data}) => {
      const next = data.session?.user;
      if (next) { setUser(next); setMode(next.email === import.meta.env.VITE_TEACHER_EMAIL ? 'teacher' : 'student'); }
    });
    const {data:listener} = supabase.auth.onAuthStateChange((_event,session) => {
      const next = session?.user || null; setUser(next);
      if (!next) setMode(null);
      else setMode(next.email === import.meta.env.VITE_TEACHER_EMAIL ? 'teacher' : 'student');
    });
    return () => listener.subscription.unsubscribe();
  }, []);
  async function afterLogin(nextUser, loginMode) {
    setUser(nextUser); setMode(loginMode);
  }
  async function logout() {
    await signOut(); setUser(null); setMode(null);
  }
  if (!user) return <LoginScreen onLogin={afterLogin}/>;
  if (mode === 'teacher') return <TeacherDashboard user={user} onLogout={logout}/>;
  return <StudentWorld user={user} onLogout={logout}/>;
}