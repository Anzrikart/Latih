/**
 * assets/js/latih.js
 * Shared utilities for Project Latih — included in every page.
 * Provides: Store, Sound, toast, getGrade, scoreAnswer, updateLeaderboard
 */

/* ══════════════════════════════════════════════════════════
   Store — localStorage helper (all keys prefixed latih_)
══════════════════════════════════════════════════════════ */
const Store = {
  get:         (key)      => { try { return JSON.parse(localStorage.getItem('latih_' + key)); } catch { return null; } },
  set:         (key, val) => localStorage.setItem('latih_' + key, JSON.stringify(val)),
  del:         (key)      => localStorage.removeItem('latih_' + key),
  currentUser: ()         => Store.get('session')?.current_user ?? null,
  currentRole: ()         => Store.get('session')?.role ?? null,
  userKey:     (key)      => key + '_' + Store.currentUser(),
  requireRole: (role)     => { if (Store.currentRole() !== role) location.href = 'index.html'; }
};

/* ══════════════════════════════════════════════════════════
   Sound — Web Audio API tone engine
══════════════════════════════════════════════════════════ */
const Sound = (() => {
  let ctx;
  const init = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); };
  const tone = (freq, dur, type = 'sine', vol = 0.15) => {
    init();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur);
  };
  return {
    tap:     () => tone(660, 0.06),
    correct: () => { tone(880, 0.08); setTimeout(() => tone(1100, 0.10), 90); },
    wrong:   () => tone(220, 0.18, 'sawtooth', 0.08),
    submit:  () => [523, 659, 784].forEach((f, i) => setTimeout(() => tone(f, 0.12), i * 80)),
    notify:  () => tone(740, 0.12, 'sine', 0.10),
    save:    () => { tone(440, 0.06); setTimeout(() => tone(550, 0.08), 70); }
  };
})();

/* ══════════════════════════════════════════════════════════
   toast — ephemeral notification pop-up
══════════════════════════════════════════════════════════ */
function toast(msg, type = 'info') {
  const colors = { info: '#2B5CE6', success: '#1A7A4A', error: '#C0392B', warning: '#B45309' };
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:24px;right:20px;background:${colors[type]};color:white;
    padding:10px 18px;border-radius:10px;font-size:13px;font-weight:500;z-index:9999;
    opacity:0;transform:translateY(8px);transition:all 0.2s;pointer-events:none;
    box-shadow:0 4px 16px rgba(0,0,0,0.15);font-family:'DM Sans',sans-serif;`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 200); }, 2500);
}

/* ══════════════════════════════════════════════════════════
   getGrade — converts percentage to grade object
══════════════════════════════════════════════════════════ */
function getGrade(pct) {
  if (pct >= 90) return { grade: 'A+', label: 'Cemerlang',   color: 'var(--green)'  };
  if (pct >= 80) return { grade: 'A',  label: 'Cemerlang',   color: 'var(--green)'  };
  if (pct >= 70) return { grade: 'B',  label: 'Kepujian',    color: 'var(--green)'  };
  if (pct >= 60) return { grade: 'C',  label: 'Lulus',       color: 'var(--amber)'  };
  if (pct >= 50) return { grade: 'D',  label: 'Lulus',       color: 'var(--amber)'  };
  return          { grade: 'E',  label: 'Perlu Usaha', color: 'var(--red)'    };
}

/* ══════════════════════════════════════════════════════════
   scoreAnswer — auto-scores a student answer
══════════════════════════════════════════════════════════ */
function scoreAnswer(userRaw, correctRaw, type) {
  if (type === 'essay') return null;
  const normalise = s => String(s).trim().toLowerCase().replace(/[.,!?;:]+$/, '');
  const user     = normalise(userRaw);
  const accepted = correctRaw.split('|').map(normalise);
  if (type === 'mcq' || type === 'true_false') {
    return accepted.includes(String(userRaw).trim().toUpperCase()) || accepted.includes(user);
  }
  return accepted.includes(user);
}

/* ══════════════════════════════════════════════════════════
   updateLeaderboard — recomputes and saves leaderboard
   Call after every paper submission.
══════════════════════════════════════════════════════════ */
function updateLeaderboard() {
  const users = Store.get('users') || {};
  const board = [];
  for (const [id, user] of Object.entries(users)) {
    const grades = Store.get('grades_' + id) || [];
    if (!grades.length) continue;
    const avg = Math.round(grades.reduce((s, g) => s + g.pct, 0) / grades.length);
    const subjectMap = {};
    grades.forEach(g => {
      subjectMap[g.subject] = subjectMap[g.subject] || [];
      subjectMap[g.subject].push(g.pct);
    });
    const bestSubject = Object.entries(subjectMap)
      .map(([s, ps]) => ({ s, avg: ps.reduce((a, b) => a + b, 0) / ps.length }))
      .sort((a, b) => b.avg - a.avg)[0]?.s || '—';
    board.push({ user_id: id, name: user.name, avatar_color: user.avatar_color,
                 papers_done: grades.length, avg_pct: avg, best_subject: bestSubject });
  }
  board.sort((a, b) => b.avg_pct - a.avg_pct);
  Store.set('leaderboard', board);
}

/* ══════════════════════════════════════════════════════════
   escHtml — HTML escape helper
══════════════════════════════════════════════════════════ */
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════════════════════════════════
   getInitials — first two initials from a name
══════════════════════════════════════════════════════════ */
function getInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
