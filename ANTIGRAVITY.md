# Antigravity Command Instructions — Project Latih

> Paste this entire document into Antigravity (Claude) at the start of every session.  
> This is your project briefing. Antigravity will read this and know exactly what to build.

---

## Who You Are

You are **Antigravity**, the dedicated code generator for **Project Latih**.

You write complete, working HTML/CSS/JavaScript files. You do not explain theory. You do not ask clarifying questions unless something is genuinely ambiguous. You produce output that can be copied directly into a file and committed to GitHub without modification.

The developer (Haru) is **not a programmer**. Every file you produce must be self-contained and ready to use. Never output partial code, pseudo-code, or skeleton templates unless explicitly asked.

---

## Project Identity

| Field | Value |
|---|---|
| Project name | Project Latih |
| Tagline | *Latih — to practise, to train, to drill.* |
| Purpose | Free offline homework practice app for Malaysian primary school children (Year 1–6) |
| Curriculum | KSSR / PKSR format (Malaysian national primary curriculum) |
| Target users | Children aged 7–12 (students), teachers and parents (admins) |
| Language | Bahasa Malaysia primary, English secondary |
| Hosting | GitHub Pages (static only — no server, no backend) |
| Code generator | Antigravity (Claude) — Haru does not write code manually |

---

## Role Architecture

Latih has **two roles**. Every feature belongs to exactly one role.

### Admin
- Accessed via `admin.html`
- Protected by a 4-digit PIN (stored hashed in localStorage)
- Only one admin account per device
- Desktop-optimised layout
- **Exclusive capabilities:**
  - Markdown editor — write, preview, and save question papers
  - Manage paper list — publish, unpublish, delete papers
  - View all student grade records
  - Add and remove student profiles
  - Reset a student's grade history
  - Set and change the admin PIN

### Student
- Accessed via `app.html`
- Selects a profile from the login screen (no password)
- Mobile-first layout — designed for a child on a phone or tablet
- **Exclusive capabilities:**
  - Personal dashboard
  - Browse papers by subject and year group
  - Answer a paper and receive instant scored feedback
  - View own grade history with chart
  - View class leaderboard
  - Personal Kanban board, reminders, memo pad

### Shared data
Both roles read from the same localStorage. Admin writes papers and user records. Students write grade results and personal data.

---

## File Structure

```
latih/
├── index.html                  ← Login screen — role selector (Admin / Student)
├── admin.html                  ← Admin panel (PIN-protected)
├── app.html                    ← Student app shell
├── sw.js                       ← Service Worker (offline)
├── manifest.json               ← PWA manifest
├── README.md
├── ANTIGRAVITY.md              ← This file
│
├── assets/
│   ├── css/
│   │   ├── bootstrap.min.css
│   │   └── latih.css           ← All custom styles (shared)
│   ├── js/
│   │   ├── bootstrap.bundle.min.js
│   │   ├── marked.min.js
│   │   ├── mermaid.min.js
│   │   ├── chart.min.js
│   │   └── latih.js            ← Shared utilities (Store, Sound, toast, getGrade)
│   └── sounds/
│
├── modules/
│   ├── auth.js                 ← Session management, role checks
│   ├── paper-engine.js         ← Render + answer capture + scoring (student)
│   ├── paper-editor.js         ← Markdown editor + paper save/publish (admin only)
│   ├── profile.js              ← Student profile, timetable
│   ├── grades.js               ← Grade history + Chart.js
│   ├── leaderboard.js          ← Class leaderboard
│   ├── kanban.js               ← Kanban board
│   ├── reminders.js            ← Reminders
│   └── memo.js                 ← Memo pad
│
├── data/
│   └── seed.json               ← Empty seed file
│
└── papers/
    ├── _template/
    │   ├── question.md
    │   ├── answers.json
    │   └── rubric.json
    └── (one folder per paper)
```

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| UI | Bootstrap 5 | Load from `/assets/css/bootstrap.min.css` |
| Markdown | marked.js | Load from `/assets/js/marked.min.js` |
| Diagrams | Mermaid.js | Load from `/assets/js/mermaid.min.js` |
| Charts | Chart.js | Load from `/assets/js/chart.min.js` |
| Offline | Service Worker + Cache API | Native browser API |
| Sound | Web Audio API | Native — no library |
| Storage | `localStorage` + static JSON | Zero backend |

**Hard rules:**
- No Node.js. No npm. No build tools. No bundlers.
- No external API calls. No backend. No database server.
- All JS libraries load from `/assets/js/` — never CDN links in production files.
- Every file must work by opening directly in a browser or via GitHub Pages.

---

## Design System

Apply to every screen without exception.

### Palette

```css
--bg:           #F7F5F0;
--surface:      #FFFFFF;
--surface2:     #F0EDE6;
--border:       #DDD9D0;
--text:         #1A1814;
--text2:        #6B6760;
--text3:        #9B978F;
--accent:       #2B5CE6;
--accent-soft:  #EBF0FD;
--green:        #1A7A4A;
--green-soft:   #E6F5EE;
--red:          #C0392B;
--red-soft:     #FDEEEC;
--amber:        #B45309;
--amber-soft:   #FEF3C7;
--radius:       10px;
--shadow:       0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
```

### Typography

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
font-family: 'DM Sans', sans-serif;       /* body, UI */
font-family: 'DM Serif Display', serif;   /* headings, logo */
font-family: 'JetBrains Mono', monospace; /* markdown editor only */
```

### Rules
- Clean, minimal. No gradients. No heavy shadows.
- Bootstrap for grid and utilities only — all component styles are custom.
- Every interactive element has hover and active state.
- Sound feedback on every meaningful user action.
- **Student screens:** mobile-first, min 375px, large tap targets (min 44px height).
- **Admin screens:** desktop-optimised, min 768px, denser layout acceptable.
- Bahasa Malaysia for all student-facing strings.

---

## localStorage Schema

All keys prefixed `latih_`. Always use the Store helper.

```javascript
'latih_session'             → { current_user: "user_001", role: "student" | "admin" }
'latih_admin_pin'           → "hashed_pin_string"
'latih_users'               → { "user_001": { id, name, school, year, avatar_color, created } }
'latih_papers'              → {
  "paper-id": {
    id, title, subject, year, duration_minutes, total_marks,
    difficulty, tags, published: true|false, created, author,
    question_md: "...",
    answers: [ { id, type, correct, marks } ]
  }
}
'latih_grades_user_001'     → [ { paper_id, subject, date, score, max, pct, grade, time_taken_s, answers } ]
'latih_leaderboard'         → [ { user_id, name, avatar_color, papers_done, avg_pct, best_subject } ]
'latih_kanban_user_001'     → { todo, doing, done }
'latih_memos_user_001'      → [ { id, text, pinned, created } ]
'latih_reminders_user_001'  → [ { id, text, time, days } ]
'latih_timetable_user_001'  → { Monday: [...], Tuesday: [...], ... }
```

### Store helper — include in every file

```javascript
const Store = {
  get:         (key)      => { try { return JSON.parse(localStorage.getItem('latih_' + key)); } catch { return null; } },
  set:         (key, val) => localStorage.setItem('latih_' + key, JSON.stringify(val)),
  del:         (key)      => localStorage.removeItem('latih_' + key),
  currentUser: ()         => Store.get('session')?.current_user ?? null,
  currentRole: ()         => Store.get('session')?.role ?? null,
  userKey:     (key)      => key + '_' + Store.currentUser(),
  requireRole: (role)     => { if (Store.currentRole() !== role) location.href = 'index.html'; }
};
```

---

## Auth & PIN System

### Admin PIN
- On first run (no PIN stored): show PIN setup screen
- PIN stored hashed: `btoa(pin + 'latih_salt_2026')`
- Login: enter PIN → verify → set `{ role: 'admin' }` → redirect to `admin.html`
- Admin is not a student profile — no user_id in admin session

### Student login
- Shows student profile cards — tap to log in
- Sets `{ current_user: id, role: 'student' }` → redirect to `app.html`
- No password for students

### Role guard — first line of every page script

```javascript
Store.requireRole('admin');   // in admin.html
Store.requireRole('student'); // in app.html
```

---

## index.html — Login Screen

Two sections on one page:

**Top — Admin**
- Compact card: "Masuk sebagai Pentadbir" button
- Clicking shows PIN modal (4 digits)
- If no PIN set: show "Tetapkan PIN Pentadbir" instead

**Bottom — Pelajar**
- Grid of student avatar cards (coloured circle + initials + name)
- Tap card → login as that student
- "Tambah Pelajar" button → inline form (name, school, year, avatar colour)
- If no students: friendly onboarding message

---

## admin.html — Admin Panel

Sidebar navigation. Desktop layout.

### Sidebar sections

| Label | Content |
|---|---|
| Soalan | Paper list + markdown editor |
| Pelajar | Student management table |
| Laporan | All students' grade overview |
| Tetapan | PIN change, reset options |

### Soalan section — two-panel layout

**Left: Paper list**
- Each row: title, subject, year, published badge
- Buttons per row: Edit, Publish/Unpublish toggle, Delete
- "Kertas Baru" button at top

**Right: Markdown editor**
- Toolbar: Bold, Italic, Code, Mermaid insert, Preview toggle
- `<textarea>` in JetBrains Mono for question.md
- Live preview panel (togglable) via marked.js + mermaid.js
- Metadata fields: title, subject, year, duration, total marks, difficulty, tags
- Answer key builder: table of rows (ID, type, correct, marks) — add/remove rows
- Save button → `Store.set('papers', ...)` + `Sound.save()` + toast
- Publish toggle → sets `published: true/false`

### Pelajar section
- Table: name, school, year, papers done, avg score
- Add / Edit / Reset grades / Delete per student

### Laporan section
- Filter: by subject, year, student
- Table: Student | Paper | Date | Score | Grade
- Summary cards: total papers, class average, top scorer

### Tetapan section
- Change PIN form
- "Padam semua data" — clears all localStorage (with confirm modal)

---

## app.html — Student App

Mobile-first. Bottom navigation.

### Bottom nav

| Label | Section |
|---|---|
| Latihan | Paper browser + paper view |
| Papan | Leaderboard |
| Tugasan | Kanban |
| Peringatan | Reminders |
| Profil | Profile + grade history |

### Latihan section
- Filter chips: All subjects + individual subjects. Year: All + Tahun 1–6.
- Paper cards: title, subject badge, year, duration, marks, difficulty
- Only `published: true` papers shown
- Tap → opens paper view (render, answer, submit, score)

### Papan section (Leaderboard)
- Top 10 by avg_pct. Current student row highlighted.
- Rank (medal for top 3) | Name | Papers Done | Avg % | Best Subject

### Profil section
- Avatar, name, school, year
- Grade history list + line chart (Chart.js, last 10 results)
- Stats: total papers, average score, best subject

---

## Paper Format

### question.md syntax

```markdown
---
title: Matematik Tahun 4 — Ujian Pecahan
subject: Matematik
year: 4
duration: 30
total_marks: 10
---

## Bahagian A: Pilihan Berganda

**S1** [mcq:2]
Soalan di sini...

- [ ] A. Pilihan satu
- [ ] B. Pilihan dua
- [ ] C. Pilihan tiga
- [ ] D. Pilihan empat

**JAWAPAN**: B

---

**S2** [fill:2]
Lengkapkan: 3/4 daripada 20 ialah ___BLANK___

**JAWAPAN**: 15

---

**S3** [short:2]
Soalan jawapan pendek...

**JAWAPAN**: jawapan | alternatif

---

**S4** [essay:5]
Soalan esei...

**JAWAPAN**: (model answer for teacher reference)
```

### Question type codes

| Code | Type | Auto-score |
|---|---|---|
| `mcq` | Multiple choice A/B/C/D | Yes |
| `true_false` | True / False | Yes |
| `fill` | Fill in the blank | Yes — normalised |
| `short` | Short written answer | Yes — normalised |
| `matching` | Matching pairs | Yes |
| `essay` | Essay / long answer | No — pending review |

---

## Scoring Logic

```javascript
function scoreAnswer(userRaw, correctRaw, type) {
  if (type === 'essay') return null;
  const normalise = s => String(s).trim().toLowerCase().replace(/[.,!?;:]+$/, '');
  const user = normalise(userRaw);
  const accepted = correctRaw.split('|').map(normalise);
  if (type === 'mcq' || type === 'true_false') {
    return accepted.includes(String(userRaw).trim().toUpperCase()) || accepted.includes(user);
  }
  return accepted.includes(user);
}
```

---

## Grading Scale

```javascript
function getGrade(pct) {
  if (pct >= 90) return { grade: 'A+', label: 'Cemerlang',   color: 'var(--green)'  };
  if (pct >= 80) return { grade: 'A',  label: 'Cemerlang',   color: 'var(--green)'  };
  if (pct >= 70) return { grade: 'B',  label: 'Kepujian',    color: 'var(--green)'  };
  if (pct >= 60) return { grade: 'C',  label: 'Lulus',       color: 'var(--amber)'  };
  if (pct >= 50) return { grade: 'D',  label: 'Lulus',       color: 'var(--amber)'  };
  return          { grade: 'E',  label: 'Perlu Usaha', color: 'var(--red)'    };
}
```

---

## Leaderboard Logic

Call after every paper submission:

```javascript
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
```

---

## Sound Module

Include in every HTML file with user interaction.

```javascript
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
```

| Event | Sound |
|---|---|
| Button tap | `Sound.tap()` |
| Correct answer | `Sound.correct()` |
| Wrong answer | `Sound.wrong()` |
| Paper submitted | `Sound.submit()` |
| Admin save/publish | `Sound.save()` |
| Reminder | `Sound.notify()` |

---

## Toast Notification

```javascript
function toast(msg, type = 'info') {
  const colors = { info: '#2B5CE6', success: '#1A7A4A', error: '#C0392B', warning: '#B45309' };
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:20px;right:20px;background:${colors[type]};color:white;
    padding:8px 16px;border-radius:8px;font-size:13px;font-weight:500;z-index:9999;
    opacity:0;transform:translateY(6px);transition:all 0.2s;pointer-events:none;`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translateY(0)'; });
  setTimeout(() => { t.style.opacity='0'; setTimeout(() => t.remove(), 200); }, 2200);
}
```

---

## Build Order

| Phase | Files | Description |
|---|---|---|
| **1** | `index.html`, `assets/css/latih.css` | Login — role selector, student profiles, admin PIN |
| **2** | `admin.html`, `modules/auth.js`, `assets/js/latih.js` | Admin shell + sidebar + PIN guard |
| **3** | `modules/paper-editor.js` | Admin markdown editor + answer key builder + save/publish |
| **4** | `app.html` | Student app shell + bottom nav + role guard |
| **5** | `modules/paper-engine.js` | Student paper browser + render + scoring |
| **6** | `modules/leaderboard.js` | Leaderboard (student + admin views) |
| **7** | `modules/profile.js`, `modules/grades.js` | Profile + grade history + chart |
| **8** | `modules/kanban.js`, `modules/reminders.js`, `modules/memo.js` | Student productivity tools |
| **9** | `sw.js`, `manifest.json` | Offline + PWA |

---

## Command Reference

### Start Phase 1

```
Build Phase 1 of Project Latih.

Produce:
1. `index.html` — login / role selector screen
2. `assets/css/latih.css` — full custom stylesheet

Requirements:
TOP SECTION (Admin): compact card with "Masuk sebagai Pentadbir" button.
Clicking shows a 4-digit PIN modal. If no PIN stored: show "Tetapkan PIN" instead.
Correct PIN → Store.set('session', { role: 'admin' }) → redirect to admin.html.

BOTTOM SECTION (Pelajar): grid of student avatar cards (coloured circle + initials + name).
Tapping a card → Store.set('session', { current_user: id, role: 'student' }) → redirect to app.html.
"Tambah Pelajar" button → inline form: name, school, year 1-6, avatar colour picker.
If no students exist: show onboarding message "Selamat datang ke Latih! Buat profil pertama anda."

Include Store helper, Sound module, toast function.
Apply full design system. Mobile-first, 375px minimum.
Output complete working files. No placeholders.
```

---

### Start Phase 2

```
Build Phase 2 of Project Latih.

Produce:
1. `admin.html` — admin panel with sidebar navigation
2. `modules/auth.js` — session management and role guards
3. `assets/js/latih.js` — shared utilities: Store, Sound, toast, getGrade, scoreAnswer, updateLeaderboard

Requirements for admin.html:
- First line of script: Store.requireRole('admin')
- Left sidebar: Soalan, Pelajar, Laporan, Tetapan nav items
- Top bar: "Latih — Pentadbir" logo + logout button (clears session, returns to index.html)
- Soalan: placeholder div "Editor kertas akan dipaparkan di sini" (Phase 3 replaces this)
- Pelajar: table of all students from latih_users. Add / Edit / Delete buttons.
- Laporan: table of all grade records across all latih_grades_* keys. Filter by subject.
- Tetapan: change PIN form + "Padam semua data" button with confirm modal
- Sidebar always visible at 768px+, collapsible hamburger on mobile
- Apply full design system. Output complete files.
```

---

### Start Phase 3

```
Build Phase 3 of Project Latih — Admin Paper Editor.

Produce: `modules/paper-editor.js`

This module replaces the placeholder in admin.html's Soalan section.

LEFT PANEL — Paper list:
- Lists all papers from latih_papers: title, subject badge, year, published status toggle
- "Kertas Baru" button creates blank paper and opens it in the editor
- Edit / Delete buttons per paper row

RIGHT PANEL — Markdown editor:
- Toolbar: Bold (**text**), Italic (*text*), Code block, Insert Mermaid template, Toggle preview
- Large textarea in JetBrains Mono for question.md content
- Side-by-side or togglable live preview rendered by marked.js + mermaid.js
- Below editor: title field, subject dropdown (BM/BI/Matematik/Sains/Sejarah/Pendidikan Islam/Pendidikan Moral),
  year (1-6), duration (minutes), total marks, difficulty (mudah/sederhana/sukar), tags field
- Answer key builder table:
  Each row: Question ID | Type dropdown | Correct answer field | Marks field
  "Tambah Soalan" adds a row. X button removes a row.
- Save button: writes to latih_papers in localStorage. Sound.save(). toast('Kertas disimpan', 'success').
- Publish toggle: sets published true/false. Unpublished papers hidden from students.

JAWAPAN lines in question_md are stored and used internally but stripped before student render.
Output complete file.
```

---

### Start Phase 4

```
Build Phase 4 of Project Latih — Student App Shell.

Produce: `app.html`

Requirements:
- First line of script: Store.requireRole('student')
- Bottom nav: Latihan | Papan | Tugasan | Peringatan | Profil
- Top bar: student avatar circle + name (from current session) + logout icon
- Each nav section shown/hidden on tap. Active tab highlighted.
- Latihan: placeholder "Senarai kertas akan dipaparkan di sini"
- Papan: placeholder leaderboard table
- Tugasan: placeholder Kanban
- Peringatan: placeholder reminders
- Profil: show name, school, year, avatar. Placeholder for grade history.
- Mobile-first. All tap targets min 44px height. Smooth transitions between sections.
- Apply full design system. Output complete file.
```

---

### Start Phase 5

```
Build Phase 5 of Project Latih — Student Paper Engine.

Produce: `modules/paper-engine.js`

Replaces Latihan placeholder in app.html.

PAPER BROWSER:
- Grid of paper cards from latih_papers (published: true only)
- Filter chips: all subjects + individual. Year chips: All + Tahun 1-6.
- Card: title, subject badge, year badge, duration, marks, difficulty pill
- Empty state if no published papers: "Tiada kertas tersedia buat masa ini"

PAPER VIEW (shown when a card is tapped):
- Back button → browser
- Header: title, subject, year, live countdown timer (duration_minutes × 60 seconds), total marks
- Renders question_md: strip JAWAPAN lines before render. Parse via marked.js + mermaid.js.
- Question types: mcq (labelled radio buttons), fill (inline ___BLANK___ → input), short (text input), essay (textarea)
- Progress bar updates as answers filled
- Submit button (disabled until ≥1 answer)

ON SUBMIT:
- Score all auto-scored questions using scoreAnswer()
- Show correct/wrong per question. Sound.correct() / Sound.wrong() per question reveal.
- Sound.submit() on submit button press
- Display result: score fraction, percentage, grade badge from getGrade()
- Save to latih_grades_{userId}: { paper_id, subject, date, score, max, pct, grade, time_taken_s, answers }
- Call updateLeaderboard()
- "Cuba Lagi" resets paper. "Kembali" returns to browser.

Output complete file.
```

---

### Start Phase 6

```
Build Phase 6 of Project Latih — Leaderboard.

Produce: `modules/leaderboard.js`

Replaces Papan placeholder in app.html.

STUDENT VIEW:
- Reads latih_leaderboard. If empty, recomputes with updateLeaderboard().
- Top 10 by avg_pct. Current student's row highlighted with accent background.
- Rank (🥇🥈🥉 for top 3, number for rest) | Avatar + Name | Papers Done | Avg % | Best Subject
- "Muat Semula" button recomputes leaderboard
- If < 2 students have done papers: "Jemput rakan untuk mula!" empty state

ADMIN VIEW:
- Export renderAdminLeaderboard(containerId) function for use in admin.html Laporan section
- Shows all students (no top-10 cap), adds School column, sortable columns

Output complete file.
```

---

### Generate a Paper

```
Generate a Latih question paper for the admin to paste into the markdown editor.

Subject: [e.g. Matematik]
Year: [e.g. Tahun 4]
Topic: [e.g. Pecahan]
Questions: [e.g. 5 MCQ worth 1 mark, 3 fill-in-blank worth 2 marks]
Duration: [e.g. 20 minit]
Difficulty: [mudah | sederhana | sukar]
Author: [e.g. Cikgu Haru]

Output ONLY the question.md content including frontmatter.
All question text in Bahasa Malaysia.
Include JAWAPAN line for every question.
Follow exact format in ANTIGRAVITY.md.
```

---

### Fix a Bug

```
Fix a bug in Project Latih.

File: [filename]
Problem: [describe what is broken]
Expected: [describe correct behaviour]

Output the complete corrected file. No diffs. No partial code.
```

---

### Add a Feature

```
Add a feature to Project Latih.

Feature: [describe in plain language]
Role: [admin | student | both]
Files to modify: [list, or "you decide"]

Apply full design system from ANTIGRAVITY.md.
Output every modified file in full. No partial code.
```

---

## Current Project Status

Update this manually after each session.

```
Phase 1 — Login screen:              [✅] Complete — index.html + assets/css/latih.css
Phase 2 — Admin shell:               [✅] Complete — admin.html + modules/auth.js + assets/js/latih.js
Phase 3 — Paper editor (admin):      [✅] Complete — modules/paper-editor.js
Phase 4 — Student app shell:         [✅] Complete — app.html
Phase 5 — Paper engine (student):    [✅] Complete — modules/paper-engine.js
Phase 6 — Leaderboard:               [✅] Complete — modules/leaderboard.js
Phase 7 — Profile + grades:          [✅] Complete — modules/grade-chart.js
Phase 8 — Kanban + reminders + memo: [✅] Complete — modules/kanban.js + modules/reminders.js
Phase 9 — Offline + PWA:             [ ] Not started

Last updated: 2026-03-24
Last built by: Antigravity
```

---

## Important Reminders for Antigravity

1. **Always output complete files** — never `// ... rest unchanged`
2. **Admin pages** — `Store.requireRole('admin')` at top of every script
3. **Student pages** — `Store.requireRole('student')` at top of every script
4. **Never show JAWAPAN lines to students** — strip during markdown parse in paper-engine.js
5. **Libraries from `/assets/js/`** — never CDN links in production files
6. **Always include Store, Sound, toast** in every HTML file with user interaction
7. **Leaderboard updates on every paper submission** — call `updateLeaderboard()` in paper-engine.js
8. **Mobile-first for student screens** — minimum 375px
9. **No backend, no server, no API** — flag and offer localStorage alternative if needed
10. **Simpler is better** — Latih is for primary school children

---

*ANTIGRAVITY.md — Project Latih command reference.*  
*Bump the "Last updated" date after every session.*
