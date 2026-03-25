/**
 * assets/js/latih.js
 * Shared utilities for Project Latih — included in every page.
 * Provides: Store, Sound, toast, getGrade, scoreAnswer, updateLeaderboard
 */

/* ══════════════════════════════════════════════════════════
   Latih Config — handles path depth for Pretty URLs
══════════════════════════════════════════════════════════ */
const Latih = {
  // Returns '../' if in a subfolder like /admin/ or /app/, else './'
  get root() {
    const p = location.pathname;
    return (p.includes('/admin/') || p.includes('/app/')) ? '../' : './';
  }
};

/* ══════════════════════════════════════════════════════════
   Theme System — handles dynamic visual themes
══════════════════════════════════════════════════════════ */
const Theme = {
  list: ['minimal', 'scifi', 'lcar', 'ascii'],
  apply: (name) => {
    document.body.className = document.body.className.split(' ')
      .filter(c => !c.startsWith('theme-')).join(' ');
    
    if (name && name !== 'minimal') {
      document.body.classList.add('theme-' + name);
    }
    Store.set('theme', name);
    Theme.updateFAB();
  },
  cycle: () => {
    const current = Store.get('theme') || 'minimal';
    let idx = Theme.list.indexOf(current);
    let next = Theme.list[(idx + 1) % Theme.list.length];
    Theme.apply(next);
    if (typeof Sound !== 'undefined') Sound.tap();
  },
  updateFAB: () => {
    const fab = document.getElementById('themeFab');
    if (!fab) return;
    const current = Store.get('theme') || 'minimal';
    const icons = { minimal: '🎨', scifi: '🚀', lcar: '🖖', ascii: '💾' };
    fab.querySelector('.fab-icon').textContent = icons[current];
  },
  init: () => {
    const saved = Store.get('theme') || 'minimal';
    Theme.apply(saved);
  }
};

/* ══════════════════════════════════════════════════════════
   Clock System — live time & date
════════════════════════════════════════════════════════════ */
const Clock = {
  tick: () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    
    document.querySelectorAll('.live-clock-time').forEach(el => el.textContent = timeStr);
    document.querySelectorAll('.live-clock-date').forEach(el => el.textContent = dateStr);
  },
  start: () => {
    Clock.tick();
    setInterval(Clock.tick, 1000);
  }
};

/* ══════════════════════════════════════════════════════════
   Sound — Web Audio API tone engine (Sci-Fi Synth)
══════════════════════════════════════════════════════════ */
const Sound = (() => {
  let ctx;
  const init = () => { try { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} };
  const tone = (freq, dur, type = 'sine', vol = 0.1) => {
    init(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur);
  };
  return {
    tap:     () => tone(600, 0.1, 'sine', 0.05),
    success: () => { tone(500, 0.3, 'triangle', 0.1); setTimeout(() => tone(1000, 0.3, 'triangle', 0.1), 100); },
    error:   () => tone(150, 0.4, 'sawtooth', 0.08),
    blip:    () => tone(1200, 0.05, 'square', 0.03),
    play:    (type) => {
      if (type === 'tap') Sound.tap();
      if (type === 'success') Sound.success();
      if (type === 'error') Sound.error();
      if (type === 'blip') Sound.blip();
    }
  };
})();


// Auto-init theme and clock on load
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Clock.start();
});


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
  requireRole: (role) => {
    if (Store.currentRole() !== role) {
      location.href = Latih.root + 'index.html';
    }
  },
  getRank: (score) => {
    if (score >= 1000) return { title: 'Galactic Legend', badge: '👑' };
    if (score >= 500)  return { title: 'Star Commander', badge: '⭐' };
    if (score >= 200)  return { title: 'Space Ace', badge: '🚀' };
    if (score >= 50)   return { title: 'Pilot', badge: '🛸' };
    return { title: 'Novice Cadet', badge: '🧑‍🚀' };
  }
};


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
