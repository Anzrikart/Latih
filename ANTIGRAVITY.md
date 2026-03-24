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
| Target users | Children aged 7–12, parents, primary school teachers |
| Language | Bahasa Malaysia primary, English secondary |
| Hosting | GitHub Pages (static only — no server, no backend) |
| Code generator | Antigravity (Claude) — Haru does not write code manually |

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| UI | Bootstrap 5 | Load from local `/assets/css/bootstrap.min.css` |
| Markdown | marked.js | Load from local `/assets/js/marked.min.js` |
| Diagrams | Mermaid.js | Load from local `/assets/js/mermaid.min.js` |
| Charts | Chart.js | Load from local `/assets/js/chart.min.js` |
| Offline | Service Worker + Cache API | Native browser API |
| Sound | Web Audio API | Native — no library |
| Storage | `localStorage` + static JSON | Zero backend |
| Icons | Bootstrap Icons (CDN or local) | Inline SVG preferred |

**Hard rules:**
- No Node.js. No npm. No build tools. No bundlers.
- No external API calls. No backend. No database server.
- All JS libraries must be loadable from the local `/assets/js/` folder.
- Every file must work by opening it directly in a browser or via GitHub Pages.

---

## File Structure

Every file you create must go in the correct location. Never deviate from this structure.

```
latih/
├── index.html                  ← Login / user select screen
├── app.html                    ← Main app shell (loaded post-login)
├── sw.js                       ← Service Worker
├── manifest.json               ← PWA manifest
├── README.md                   ← Project documentation
├── ANTIGRAVITY.md              ← This file
│
├── assets/
│   ├── css/
│   │   ├── bootstrap.min.css
│   │   └── latih.css           ← All custom styles
│   ├── js/
│   │   ├── bootstrap.bundle.min.js
│   │   ├── marked.min.js
│   │   ├── mermaid.min.js
│   │   ├── chart.min.js
│   │   └── latih.js            ← Main app logic
│   └── sounds/
│       └── (optional .mp3 files)
│
├── modules/
│   ├── auth.js                 ← Multi-user session
│   ├── paper-engine.js         ← Paper render + scoring
│   ├── profile.js              ← Profile, timetable
│   ├── grades.js               ← Grade history + charts
│   ├── kanban.js               ← Kanban board
│   ├── reminders.js            ← Reminders
│   └── memo.js                 ← Memo / notes
│
├── data/
│   └── users.json              ← Empty seed (app populates via localStorage)
│
└── papers/
    ├── _template/
    │   ├── question.md
    │   ├── answers.json
    │   └── rubric.json
    └── (one folder per paper)
```

---

## Design System

Antigravity must apply this design system to every screen it builds. Do not deviate.

### Palette

```css
--bg:           #F7F5F0;   /* page background */
--surface:      #FFFFFF;   /* cards, panels */
--surface2:     #F0EDE6;   /* secondary surfaces, hover states */
--border:       #DDD9D0;   /* all borders */
--text:         #1A1814;   /* primary text */
--text2:        #6B6760;   /* secondary text */
--text3:        #9B978F;   /* placeholder, muted labels */
--accent:       #2B5CE6;   /* primary action colour */
--accent-soft:  #EBF0FD;   /* accent backgrounds, selected states */
--green:        #1A7A4A;   /* correct / success */
--green-soft:   #E6F5EE;
--red:          #C0392B;   /* wrong / error */
--red-soft:     #FDEEEC;
--amber:        #B45309;   /* warning / pending */
--amber-soft:   #FEF3C7;
--radius:       10px;
--shadow:       0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
```

### Typography

```css
font-family: 'DM Sans', sans-serif;      /* body */
font-family: 'DM Serif Display', serif;  /* headings, logo */
font-family: 'JetBrains Mono', monospace; /* code editor only */
```

Load from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Rules
- Clean, minimal. No gradients. No heavy shadows.
- Bootstrap used for grid and utilities only — all component styles are custom.
- Every interactive element has a hover and active state.
- Sound feedback on every meaningful user action (Web Audio API — see Sound section).
- Mobile-first. Every screen must work at 375px width.
- Bahasa Malaysia for all student-facing UI strings. English allowed in dev/admin UI.

---

## localStorage Schema

All user data is stored in `localStorage`. Keys are prefixed with `latih_`.

```javascript
// Active session
localStorage.setItem('latih_session', JSON.stringify({ current_user: "user_001" }));

// All users index
localStorage.setItem('latih_users', JSON.stringify({
  "user_001": {
    "id": "user_001",
    "name": "Ahmad Faris",
    "school": "SK Taman Maju",
    "year": 4,
    "avatar_color": "#2B5CE6",
    "created": "2026-03-24"
  }
}));

// Grade history (per user)
localStorage.setItem('latih_grades_user_001', JSON.stringify([
  {
    "paper_id": "matematik-tahun4-pecahan",
    "date": "2026-03-24",
    "score": 8,
    "max": 10,
    "pct": 80,
    "grade": "A",
    "time_taken_s": 720,
    "answers": { "S1": "B", "S2": "15" }
  }
]));

// Kanban (per user)
localStorage.setItem('latih_kanban_user_001', JSON.stringify({
  "todo":  [{ "id": "t1", "text": "Siapkan latihan BM", "due": "2026-03-25" }],
  "doing": [],
  "done":  []
}));

// Memos (per user)
localStorage.setItem('latih_memos_user_001', JSON.stringify([
  { "id": "m1", "text": "Exam Sains: 28 Mac", "pinned": true, "created": "2026-03-20" }
]));

// Reminders (per user)
localStorage.setItem('latih_reminders_user_001', JSON.stringify([
  { "id": "r1", "text": "Buat latihan Matematik", "time": "19:00", "days": ["Monday","Wednesday","Friday"] }
]));

// Timetable (per user)
localStorage.setItem('latih_timetable_user_001', JSON.stringify({
  "Monday":    ["BM", "Matematik", "Sains"],
  "Tuesday":   ["BI", "Sejarah", "Matematik"],
  "Wednesday": ["BM", "Pendidikan Islam", "Sains"],
  "Thursday":  ["BI", "Matematik", "Sejarah"],
  "Friday":    ["BM", "Sains", "Pendidikan Moral"]
}));
```

**Helper functions** — always include these in any file that touches localStorage:

```javascript
const Store = {
  get: (key) => { try { return JSON.parse(localStorage.getItem('latih_' + key)); } catch { return null; } },
  set: (key, val) => localStorage.setItem('latih_' + key, JSON.stringify(val)),
  del: (key) => localStorage.removeItem('latih_' + key),
  currentUser: () => { const s = Store.get('session'); return s ? s.current_user : null; },
  userKey: (key) => key + '_' + Store.currentUser()
};
```

---

## Paper Format

Every question paper is three files in one folder under `/papers/`.

### `question.md` syntax

```markdown
---
title: [Paper title in Bahasa Malaysia]
subject: [Matematik | BM | BI | Sains | Sejarah | Pendidikan Islam | Pendidikan Moral]
year: [1–6]
duration: [minutes]
total_marks: [number]
---

## [Section heading]

**S1** [mcq:2]
[Question text in Bahasa Malaysia]

\`\`\`mermaid
[optional diagram]
\`\`\`

- [ ] A. [option]
- [ ] B. [option]
- [ ] C. [option]
- [ ] D. [option]

**JAWAPAN**: [A|B|C|D]

---

**S2** [fill:2]
[Sentence with] ___BLANK___ [in it]

**JAWAPAN**: [correct text | alternative spelling]

---

**S3** [short:2]
[Question text]

**JAWAPAN**: [answer | alternative]

---

**S4** [essay:5]
[Essay prompt]

**JAWAPAN**: [model answer for teacher reference]
```

### Question type codes

| Code | Type | Scoring |
|---|---|---|
| `mcq` | Multiple choice (A/B/C/D) | Auto — exact match |
| `true_false` | True / False | Auto — exact match |
| `fill` | Fill in the blank | Auto — normalised string match |
| `short` | Short written answer | Auto — normalised string match |
| `matching` | Matching pairs | Auto |
| `essay` | Essay / long answer | Manual — flagged for teacher review |

**Normalised match** means: trim whitespace, lowercase, strip trailing punctuation. Pipe `|` separates accepted alternatives.

### `answers.json` structure

```json
{
  "paper_id": "folder-name-here",
  "questions": [
    { "id": "S1", "type": "mcq",   "correct": "B",       "marks": 2 },
    { "id": "S2", "type": "fill",  "correct": "15 | lima belas", "marks": 2 },
    { "id": "S3", "type": "short", "correct": "8",        "marks": 2 },
    { "id": "S4", "type": "essay", "correct": "",         "marks": 5, "auto_score": false }
  ]
}
```

### `rubric.json` structure

```json
{
  "paper_id": "folder-name-here",
  "title": "Full paper title",
  "subject": "Matematik",
  "year": 4,
  "duration_minutes": 30,
  "total_marks": 10,
  "difficulty": "mudah | sederhana | sukar",
  "tags": ["topic", "subtopic"],
  "created": "YYYY-MM-DD",
  "author": "Cikgu / Parent name"
}
```

---

## Scoring Logic

Antigravity must implement scoring exactly as follows. Never deviate.

```javascript
function scoreAnswer(userRaw, correctRaw, type) {
  if (type === 'essay') return null; // pending teacher review

  const normalise = s => String(s).trim().toLowerCase().replace(/[.,!?;:]+$/, '');
  const user = normalise(userRaw);
  const accepted = correctRaw.split('|').map(normalise);

  if (type === 'mcq' || type === 'true_false') {
    return accepted.includes(String(userRaw).trim().toUpperCase()) ||
           accepted.includes(user);
  }
  return accepted.includes(user);
}
```

---

## Grading Scale

```javascript
function getGrade(pct) {
  if (pct >= 90) return { grade: 'A+', label: 'Cemerlang',    color: 'var(--green)'  };
  if (pct >= 80) return { grade: 'A',  label: 'Cemerlang',    color: 'var(--green)'  };
  if (pct >= 70) return { grade: 'B',  label: 'Kepujian',     color: 'var(--green)'  };
  if (pct >= 60) return { grade: 'C',  label: 'Lulus',        color: 'var(--amber)'  };
  if (pct >= 50) return { grade: 'D',  label: 'Lulus',        color: 'var(--amber)'  };
  return          { grade: 'E',  label: 'Perlu Usaha',  color: 'var(--red)'    };
}
```

---

## Sound System

Every screen must include this sound module. Call the relevant function on user actions.

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
    notify:  () => tone(740, 0.12, 'sine', 0.10)
  };
})();
```

| Event | Function |
|---|---|
| Button tap / option select | `Sound.tap()` |
| Correct answer revealed | `Sound.correct()` |
| Wrong answer revealed | `Sound.wrong()` |
| Paper submitted | `Sound.submit()` |
| Reminder / notification | `Sound.notify()` |

---

## UI Patterns

### Toast notification

```javascript
function toast(msg, type = 'info') {
  const t = document.createElement('div');
  const colors = { info: '#2B5CE6', success: '#1A7A4A', error: '#C0392B', warning: '#B45309' };
  t.style.cssText = `position:fixed;bottom:20px;right:20px;background:${colors[type]};color:white;
    padding:8px 16px;border-radius:8px;font-size:13px;font-weight:500;z-index:9999;
    opacity:0;transform:translateY(6px);transition:all 0.2s;pointer-events:none;`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 200); }, 2000);
}
```

### Confirm dialog (replacing browser `confirm()`)

Use a Bootstrap modal — never use `window.confirm()`.

### Empty state

When a list (grades, kanban, memos) is empty:

```html
<div style="text-align:center;padding:40px 20px;color:var(--text3);">
  <div style="font-size:32px;margin-bottom:8px;">📭</div>
  <div style="font-size:14px;">[Context-appropriate empty message in BM]</div>
</div>
```

---

## Build Order (Phases)

Build in this sequence. Do not skip phases. Each phase produces working, committable code.

| Phase | Files to produce | Description |
|---|---|---|
| **1** | `index.html`, `assets/css/latih.css` | Login screen — user select, create new user |
| **2** | `app.html`, `modules/auth.js`, `assets/js/latih.js` | App shell — nav, routing between sections |
| **3** | `modules/paper-engine.js` | Paper render + answer capture + scoring (already prototyped) |
| **4** | `modules/profile.js` | Profile page — name, school, year, timetable |
| **5** | `modules/grades.js` | Grade history list + Chart.js progress chart |
| **6** | `modules/kanban.js` | Kanban board — drag or button-based column move |
| **7** | `modules/reminders.js`, `modules/memo.js` | Reminders + memo pad |
| **8** | `sw.js`, `manifest.json` | Service Worker + PWA manifest |

---

## Command Reference

Use these exact commands when talking to Antigravity. Copy and paste as-is.

---

### Start Phase 1

```
Build Phase 1 of Project Latih.

Produce two files:
1. `index.html` — the login / user select screen
2. `assets/css/latih.css` — the full custom stylesheet

Requirements for index.html:
- Shows existing user profiles as avatar cards (avatar is a coloured circle with initials)
- "Tambah Pengguna" button opens a form to create a new user (name, school, year 1–6, pick avatar colour)
- Selecting a user sets localStorage latih_session and redirects to app.html
- If no users exist, show onboarding: "Selamat datang ke Latih! Buat profil pertama anda."
- Sound.tap() on every interaction
- Fully responsive (375px minimum width)
- Apply the full design system from ANTIGRAVITY.md

Do not produce placeholder or skeleton code. Output complete, working files.
```

---

### Start Phase 2

```
Build Phase 2 of Project Latih.

Produce:
1. `app.html` — the main app shell
2. `modules/auth.js` — session management
3. `assets/js/latih.js` — app initialisation and section router

Requirements:
- app.html has a bottom navigation bar (mobile-first) with icons for:
  Latihan (papers), Gred (grades), Tugasan (kanban), Peringatan (reminders), Profil
- Active section is shown; others are hidden (display:none)
- Top bar shows current user name + avatar + a logout button (returns to index.html)
- auth.js exports: getCurrentUser(), getUser(id), saveUser(data), logout()
- latih.js initialises the app, loads the current user, sets up nav routing
- If no session exists, redirect to index.html immediately
- Apply full design system. Mobile-first.
```

---

### Start Phase 3

```
Build Phase 3 of Project Latih — the Paper Engine.

Produce: `modules/paper-engine.js`

Requirements:
- Fetches /papers/index.json (list of available papers with id, title, subject, year, difficulty)
- Renders a paper browser in the Latihan section: filterable by subject and year
- On paper select: fetches question.md and answers.json, renders the paper
- Paper render: Markdown via marked.js, Mermaid diagrams, all question types (mcq, fill, short, essay)
- Answer capture per question type
- On submit: scores all auto-scored questions using the scoreAnswer() function from ANTIGRAVITY.md
- Shows result: score, percentage, grade using getGrade() from ANTIGRAVITY.md
- Saves result to localStorage using the grade schema from ANTIGRAVITY.md
- Sound feedback: Sound.tap(), Sound.correct(), Sound.wrong(), Sound.submit()
- Essay questions show "Menunggu semakan guru" badge — not scored
```

---

### Generate a Paper

```
Generate a complete Latih question paper.

Details:
- Subject: [e.g. Matematik]
- Year: [e.g. Tahun 4]
- Topic: [e.g. Pecahan]
- Questions: [e.g. 5 MCQ worth 1 mark each, 3 fill-in-the-blank worth 2 marks each]
- Duration: [e.g. 20 minit]
- Difficulty: [mudah | sederhana | sukar]
- Author: [e.g. Cikgu Haru]

Produce all three files, ready to save:
1. papers/[folder-name]/question.md
2. papers/[folder-name]/answers.json
3. papers/[folder-name]/rubric.json

All question text in Bahasa Malaysia.
Follow the exact format in ANTIGRAVITY.md.
```

---

### Fix a Bug

```
Fix a bug in Project Latih.

File: [filename]
Problem: [describe what is broken]
Expected behaviour: [describe what should happen]

Output the complete corrected file. Do not output diffs or partial code.
```

---

### Add a Feature

```
Add a feature to Project Latih.

Feature: [describe the feature in plain language]
File(s) to modify: [list the files involved, or say "you decide"]
Design system: apply the full design system from ANTIGRAVITY.md

Output every modified file in full. Do not output partial code.
```

---

### Build a Specific Screen

```
Build the [screen name] screen for Project Latih.

Location in app: [which section / nav tab it belongs to]
Features required:
- [list each feature or behaviour]

Apply full design system. Mobile-first. Output complete file(s).
```

---

## Current Project Status

Update this section manually after each session.

```
Phase 1:  [ ] Not started
Phase 2:  [ ] Not started
Phase 3:  [✅] Prototype complete — testpad-preview.html
Phase 4:  [ ] Not started
Phase 5:  [ ] Not started
Phase 6:  [ ] Not started
Phase 7:  [ ] Not started
Phase 8:  [ ] Not started

Last updated: 2026-03-24
Last built by: Antigravity
```

---

## Important Reminders for Antigravity

1. **Always output complete files** — never partial code, never `// ... rest of file unchanged`
2. **Never use external CDN links** for JS libraries — reference local `/assets/js/` paths
3. **Always include the Sound module** in every HTML file that has user interaction
4. **Always include the Store helpers** in every file that touches localStorage
5. **All user-facing text** in Bahasa Malaysia unless the user specifies otherwise
6. **Mobile-first always** — test mentally at 375px before outputting
7. **No backend, no server, no API** — if a feature requires a server, flag it and offer a localStorage-based alternative
8. **When in doubt, build simpler** — Latih is for children; complexity is a bug

---

*ANTIGRAVITY.md — Project Latih command reference.*  
*Keep this file updated as the project grows.*
