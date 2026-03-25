# 📚 Project Latih

> **Latih** *(Bahasa Melayu)* — to practise, to train, to drill.  
> A name that means exactly what it does.

---

## What is Latih?

**Latih** is a free, offline-capable web application that gives primary school children a simple, distraction-free place to practise their homework and exercises.

Every question follows the **KSSR (Kurikulum Standard Sekolah Rendah)** format — the same structure used in Malaysian primary school assessments. Parents do not need to install anything. Teachers do not need a server. Students open a browser and start working.

Latih runs entirely in the browser. There is no backend, no database server, and no monthly fee. All data is stored locally on the device.

---

## Why Latih Exists

Malaysian primary school children (Year 1–6) need consistent, low-friction daily practice. Existing platforms are either:

- Too complex for young children to navigate independently
- Require paid subscriptions or internet connections
- Not aligned to the local curriculum format

Latih is built to be the opposite: simple enough for a 9-year-old to use alone, available offline, and completely free to host on GitHub Pages.

---

## Core Aims

1. **Provide daily homework practice** aligned to KSSR primary school subjects
2. **Remove barriers** — no login required for students, no internet required after first load
3. **Support multiple children** on the same device with separate profiles and grade tracking
4. **Make question authoring easy** — teachers and parents write questions in plain Markdown, no coding needed
5. **Give children immediate, honest feedback** — correct/wrong shown instantly with sound cues
6. **Track progress over time** — simple grade history and charts visible to the child and parent

---

## Subject Coverage (KSSR Year 1–6)

| Subject | Bahasa Melayu |
|---|---|
| Bahasa Malaysia | ✅ |
| Bahasa Inggeris | ✅ |
| Matematik | ✅ |
| Sains | ✅ |
| Sejarah | ✅ |
| Pendidikan Islam / Pendidikan Moral | ✅ |

Question format follows the style used in **PKSR (Pentaksiran Kendalian Sekolah Rendah)** assessments — the format that replaced UPSR after 2021.

---

## Question Types Supported

| Type | Code | Auto-scored |
|---|---|---|
| Multiple choice (4 options) | `mcq` | ✅ Yes |
| True / False | `true_false` | ✅ Yes |
| Fill in the blank | `fill` | ✅ Yes (normalised match) |
| Short answer | `short` | ✅ Yes (string match) |
| Matching | `matching` | ✅ Yes |
| Essay / structured response | `essay` | ⏳ Pending teacher review |

---

## Features

### For students
- Clean, minimal interface — no distractions
- Sound feedback on correct and wrong answers
- Progress bar shows how many questions answered
- Instant score and grade on submission
- Works offline after first page load

### For each user profile
- Name, school name, year group
- School timetable (per day)
- Grade history with chart
- Simple Kanban board (To Do / Doing / Done)
- Reminders (uses browser notifications)
- Memo / notes pad

### For question authors (teachers / parents)
- Questions written in plain Markdown — no coding needed
- Supports Mermaid diagrams (pie charts, flowcharts) inside questions
- Answer key is stored separately from question text
- New papers added by dropping files into the `/papers/` folder

---

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| UI framework | Bootstrap 5 | Responsive, well-documented, no build step |
| Markdown render | marked.js (CDN) | Fast, zero config |
| Diagram render | Mermaid.js (CDN) | Renders inside question blocks |
| Charts | Chart.js (CDN) | Grade history visualisation |
| Offline support | Service Worker + Cache API | Native browser API, no library needed |
| Sound | Web Audio API | Native, no library needed |
| Storage | `localStorage` + JSON files | Zero backend, GitHub Pages compatible |
| Hosting | GitHub Pages | Free, static, no server |
| Code generation | Antigravity (Claude) | AI-assisted — no manual coding required |

---

## Requirements

### To run Latih (end user)
- Any modern browser: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- No installation required
- No internet required after first load (offline via Service Worker)

### To host on GitHub Pages
- A free GitHub account
- A repository set to public (or private with GitHub Pro)
- GitHub Pages enabled on the `main` branch, serving from `/` root

### To add new question papers
- A plain text editor (Notepad, VS Code, etc.)
- Basic Markdown knowledge (or use Antigravity to generate papers)
- No coding required

### To develop or extend Latih
- A text editor (VS Code recommended)
- A browser with DevTools
- No Node.js, no npm, no build tools — the project is pure HTML/CSS/JS

---

## File Structure

```
latih/
│
├── index.html                  ← App entry point (login / user select screen)
├── app.html                    ← Main application shell (loaded after login)
├── sw.js                       ← Service Worker (offline caching)
├── manifest.json               ← PWA manifest (installable on mobile)
│
├── README.md                   ← This file
│
├── assets/
│   ├── css/
│   │   ├── bootstrap.min.css   ← Bootstrap 5 (local copy for offline)
│   │   └── latih.css           ← Custom styles
│   ├── js/
│   │   ├── bootstrap.bundle.min.js
│   │   ├── marked.min.js       ← Markdown renderer
│   │   ├── mermaid.min.js      ← Diagram renderer
│   │   ├── chart.min.js        ← Grade charts
│   │   └── latih.js            ← Main application logic
│   └── sounds/
│       └── (optional .mp3 files for richer sound effects)
│
├── modules/
│   ├── auth.js                 ← Multi-user session management
│   ├── paper-engine.js         ← Markdown parse, render, answer capture, scoring
│   ├── profile.js              ← User profile, school info, timetable
│   ├── grades.js               ← Grade history, chart rendering
│   ├── kanban.js               ← Kanban board (To Do / Doing / Done)
│   ├── reminders.js            ← Reminder system (Web Notifications API)
│   └── memo.js                 ← Memo / notes pad
│
├── data/
│   └── users.json              ← Seed file (empty on first run; populated by app)
│
└── papers/
    │
    ├── _template/
    │   ├── question.md         ← Blank paper template for authors
    │   ├── answers.json        ← Blank answer key template
    │   └── rubric.json         ← Blank metadata template
    │
    ├── matematik-tahun4-pecahan/
    │   ├── question.md
    │   ├── answers.json
    │   └── rubric.json
    │
    ├── bm-tahun3-karangan/
    │   ├── question.md
    │   ├── answers.json
    │   └── rubric.json
    │
    └── (more papers added here...)
```

---

## Paper Format

Each paper lives in its own folder under `/papers/`. Three files per paper:

### `question.md` — what the student sees

Written in plain Markdown. Question type and marks declared inline. Answer key lines start with `**JAWAPAN**:` and are stripped before display.

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
Rajah di bawah menunjukkan taburan buah-buahan.

\`\`\`mermaid
pie title Buah-buahan
  "Epal" : 30
  "Oren" : 45
  "Pisang" : 25
\`\`\`

Berapakah peratusan Oren?

- [ ] A. 30%
- [ ] B. 45%
- [ ] C. 25%
- [ ] D. 50%

**JAWAPAN**: B

---

**S2** [fill:2]
Lengkapkan ayat: 3/4 daripada 20 ialah ___BLANK___

**JAWAPAN**: 15

---

**S3** [short:2]
Selesaikan: 48 ÷ 6 = ?

**JAWAPAN**: 8
```

### `answers.json` — structured answer key (generated from `question.md`)

```json
{
  "paper_id": "matematik-tahun4-pecahan",
  "questions": [
    { "id": "S1", "type": "mcq",   "correct": "B",  "marks": 2 },
    { "id": "S2", "type": "fill",  "correct": "15", "marks": 2 },
    { "id": "S3", "type": "short", "correct": "8",  "marks": 2 }
  ]
}
```

### `rubric.json` — paper metadata

```json
{
  "paper_id": "matematik-tahun4-pecahan",
  "title": "Matematik Tahun 4 — Ujian Pecahan",
  "subject": "Matematik",
  "year": 4,
  "duration_minutes": 30,
  "total_marks": 10,
  "difficulty": "sederhana",
  "tags": ["pecahan", "bahagian", "KSSR"],
  "created": "2026-03-24",
  "author": "Cikgu Haru"
}
```

---

## localStorage Data Schema

All user data is stored in the browser's `localStorage`. No data leaves the device.

```
latih_users          → { user_001: { name, school, year, avatar_color }, ... }
latih_session        → { current_user: "user_001" }
latih_grades_001     → [ { paper_id, date, score, max, time_taken_s, answers }, ... ]
latih_kanban_001     → { todo: [...], doing: [...], done: [...] }
latih_memos_001      → [ { id, text, pinned, created }, ... ]
latih_reminders_001  → [ { id, text, time, days: ["Monday","Wednesday"] }, ... ]
latih_timetable_001  → { Monday: ["BM","Math"], Tuesday: [...], ... }
```

`001` is replaced by the actual user ID for each user.

---

## How to Add a New Paper

1. Create a new folder inside `/papers/` — name it clearly, e.g. `sains-tahun5-fotosintesis`
2. Copy the three files from `/papers/_template/`
3. Write the questions in `question.md` using the format shown above
4. Fill in `answers.json` and `rubric.json`
5. Commit and push to GitHub — the paper appears in Latih automatically

**Tip:** You can ask Antigravity (Claude) to generate a complete paper for you. Just describe the topic, year group, number of questions, and question types. Antigravity will produce all three files ready to copy-paste.

Example prompt for Antigravity:
> "Generate a Latih paper for Matematik Tahun 3, topic: Nombor Bulat, 5 MCQ questions worth 1 mark each and 3 fill-in-the-blank worth 2 marks each. Output question.md, answers.json, and rubric.json."

---

## Grading Scale

| Percentage | Grade | Status |
|---|---|---|
| 90 – 100% | A+ | Cemerlang |
| 80 – 89%  | A  | Cemerlang |
| 70 – 79%  | B  | Kepujian |
| 60 – 69%  | C  | Lulus |
| 50 – 59%  | D  | Lulus |
| Below 50% | E  | Perlu Usaha |

---

## Development Approach

Latih is built to be **maintained without coding expertise**. All feature development and bug fixes are handled through **Antigravity (Claude)**:

1. Describe what you want to change or add in plain language
2. Antigravity generates the updated HTML/CSS/JS
3. Copy the output into the correct file
4. Commit to GitHub

No npm. No build pipeline. No terminal commands beyond `git push`.

---

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| Phase 1 | Paper engine: Markdown render + answer capture + scoring | ✅ Done |
| Phase 2 | Multi-user login + localStorage persistence + profile | ✅ Done |
| Phase 3 | Grade history + Chart.js dashboard | ✅ Done |
| Phase 4 | Kanban + reminders + memo | ✅ Done |
| Phase 5 | Offline Service Worker + mobile layout + PWA install | ✅ Done |
| Phase 6 | Admin Panel + Paper Editor + result management | ✅ Done |
| Phase 7 | Multi-language support (Bahasa Melayu / English) | 🔲 Planned |
| Phase 8 | Parent/Teacher exportable PDF reports | 🔲 Planned |

---

## Contributing

Latih is an open project. Contributions welcome:

- **New papers** — write a paper for any KSSR subject and submit a pull request
- **Bug reports** — open a GitHub Issue with steps to reproduce
- **Feature ideas** — open a GitHub Discussion

All question content must be appropriate for primary school children (Year 1–6) and aligned to the Malaysian KSSR curriculum.

---

## Licence

MIT Licence — free to use, modify, and redistribute. Attribution appreciated but not required.

---

## Design Philosophy & Aesthetics

Latih is built with a **Premium, Modern Aesthetic** to provide a professional yet friendly experience for students and educators:

- **Glassmorphism**: Subtle use of backdrop filters and translucent surfaces for a depth-rich, modern feel.
- **Typography-First**: Using high-quality Google Fonts (*DM Serif Display* for headings, *DM Sans* for body) to ensure excellent readability.
- **Soft UI**: Rounded corners (`12px` radius), gentle shadows, and a harmonious pastel-neutral color palette.
- **Micro-animations**: Smooth transitions and hover states that make the interface feel alive and responsive.

---

*Project Latih — dibina untuk kanak-kanak Malaysia.*
