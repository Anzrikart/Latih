/**
 * modules/paper-engine.js
 * Student paper browser & rendering engine.
 * Requires: assets/js/latih.js, marked.min.js, mermaid.min.js
 */

const PaperEngine = (() => {
  let _ready  = false;
  let _mReady = typeof mermaid !== 'undefined';
  let _shell  = null;
  let _uid    = null;
  let _papers = {};

  // Active paper state
  let _activePaper = null;
  let _answers = {}; // user_ans_id -> value
  let _timer   = null;
  let _timeLeft= 0;

  /* ══════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════ */
  function init(mountId) {
    _shell = document.getElementById(mountId);
    if (!_shell) return;
    _uid = Store.currentUser();
    if (!_uid) return;

    if (!_ready) {
      _ready = true;
      _injectCSS();
      if (_mReady) mermaid.initialize({ startOnLoad: false, theme: 'neutral', fontFamily: "'DM Sans',sans-serif" });
    }
    _loadPapers();
    _renderBrowseView();
  }

  /* ── CSS ──────────────────────────────────────────── */
  function _injectCSS() {
    if (document.getElementById('peng-css')) return;
    const s = document.createElement('style');
    s.id = 'peng-css';
    s.textContent = `
.pe-browse { animation: fadeIn 0.2s ease; }
.pe-filters { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; scrollbar-width: none; }
.pe-filters::-webkit-scrollbar { display: none; }
.pe-filter-chip { padding: 6px 14px; border-radius: 20px; background: var(--surface); border: 1px solid var(--border); font-size: 13px; font-weight: 600; color: var(--text2); cursor: pointer; white-space: nowrap; transition: all 0.15s; }
.pe-filter-chip:hover { border-color: var(--accent); }
.pe-filter-chip.active { background: var(--accent); color: white; border-color: var(--accent); }

.pe-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px; }
.pe-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; position: relative; overflow: hidden; }
.pe-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); border-color: var(--accent-soft); }
.pe-card-meta { display: flex; gap: 6px; margin-bottom: 12px; }
.pe-card-title { font-family: 'DM Serif Display', serif; font-size: 1.25rem; line-height: 1.3; color: var(--text); margin-bottom: 8px; }
.pe-card-desc { font-size: 13px; color: var(--text3); display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.pe-card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.pe-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 3px 6px; background: var(--surface2); color: var(--text2); border-radius: 4px; }
.pe-done-badge { position: absolute; top: 16px; right: 16px; background: var(--green-soft); color: var(--green); font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; display: flex; align-items: center; gap: 4px; }

/* Engine View */
.pe-engine { display: none; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); background: var(--bg); position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999; flex-direction: column; }
.pe-en-active { display: flex; }
.pe-en-top { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--surface); border-bottom: 1px solid var(--border); z-index: 10; }
.pe-en-timer { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; color: var(--text); background: var(--surface2); padding: 4px 10px; border-radius: 8px; }
.pe-en-timer.pe-urgent { color: var(--red); animation: pulseTimer 1s infinite; background: var(--red-soft); }
@keyframes pulseTimer { 50% { opacity: 0.5; } }

.pe-en-body { flex: 1; overflow-y: auto; padding: 24px 16px; position: relative; }
.pe-paper-sheet { max-width: 720px; margin: 0 auto; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 32px 40px; box-shadow: var(--shadow); }
@media(max-width: 600px) { .pe-paper-sheet { padding: 20px 16px; } }

.pe-en-bot { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: var(--surface); border-top: 1px solid var(--border); }

/* Injected Question Styling */
.pe-q-card { margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px dashed var(--border); }
.pe-q-card:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.pe-q-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.pe-q-num { font-weight: 800; font-size: 1.1rem; color: var(--accent); }
.pe-q-marks { font-size: 11px; font-weight: 700; color: var(--text3); background: var(--surface2); padding: 2px 6px; border-radius: 4px; }

/* Interactive Elements */
.pe-mcq-opt { display: flex; align-items: flex-start; gap: 12px; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: all 0.1s; }
.pe-mcq-opt:hover { background: var(--surface2); }
.pe-mcq-opt.selected { border-color: var(--accent); background: var(--accent-light); }
.pe-mcq-opt.selected .pe-mcq-rad { border-color: var(--accent); }
.pe-mcq-opt.selected .pe-mcq-rad::after { transform: scale(1); }
.pe-mcq-rad { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--text3); flex-shrink: 0; margin-top: 2px; position: relative; transition: border-color 0.1s; }
.pe-mcq-rad::after { content: ''; position: absolute; top: 3px; left: 3px; right: 3px; bottom: 3px; border-radius: 50%; background: var(--accent); transform: scale(0); transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pe-mcq-lbl { font-size: 14px; color: var(--text); flex: 1; pointer-events: none; }

.pe-input-text { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--text); transition: border-color 0.15s; }
.pe-input-text:focus { border-color: var(--accent); outline: none; }
textarea.pe-input-text { resize: vertical; min-height: 80px; }

/* Result overlay */
.pe-res-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: var(--bg); z-index: 1000; flex-direction: column; align-items: center; justify-content: center; animation: fadeIn 0.3s; padding: 20px; text-align: center; }
.pe-res-circle { width: 140px; height: 140px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 6px solid var(--accent); margin-bottom: 24px; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pe-res-score { font-family: 'DM Serif Display', serif; font-size: 2.5rem; line-height: 1; font-weight: 700; }
.pe-res-max { font-size: 1rem; color: var(--text3); }
@keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
`;
    document.head.appendChild(s);
  }

  function _loadPapers() {
    const all = Store.get('papers') || {};
    _papers = {};
    for (const [id, p] of Object.entries(all)) {
      if (p.published) _papers[id] = p; // Only show published papers to students
    }
  }

  /* ══════════════════════════════════════════════════════
     BROWSE VIEW
  ══════════════════════════════════════════════════════ */
  let _currentSub = '';

  function _renderBrowseView() {
    if (!_shell) return;
    const grades = Store.get('grades_' + _uid) || [];
    const doneIds = grades.map(g => g.paper_id);

    // Get unique subjects
    const subs = new Set();
    Object.values(_papers).forEach(p => { if (p.subject) subs.add(p.subject); });
    const subList = Array.from(subs).sort();

    let html = `<div class="pe-browse">
      <div class="pe-filters">
        <button class="pe-filter-chip ${!_currentSub ? 'active' : ''}" onclick="PaperEngine.filter('')">Semua</button>`;
    subList.forEach(s => {
      html += `<button class="pe-filter-chip ${_currentSub===s ? 'active' : ''}" onclick="PaperEngine.filter('${escHtml(s)}')">${escHtml(s)}</button>`;
    });
    html += `</div><div class="pe-grid">`;

    let count = 0;
    Object.values(_papers)
      .sort((a,b) => new Date(b.created) - new Date(a.created))
      .forEach(p => {
        if (_currentSub && p.subject !== _currentSub) return;
        const isDone = doneIds.includes(p.id);
        const marks = (p.answers || []).reduce((s, a) => s + (a.marks||1), 0) || p.total_marks;

        html += `
          <div class="pe-card" onclick="PaperEngine.start('${p.id}')">
            ${isDone ? '<div class="pe-done-badge">✓ Selesai</div>' : ''}
            <div class="pe-card-meta">
              <span class="badge-latih badge-accent">${escHtml(p.subject || 'Lain')}</span>
              <span class="badge-latih badge-ghost">Tahun ${p.year || '?'}</span>
            </div>
            <h3 class="pe-card-title">${escHtml(p.title || 'Kertas Tanpa Tajuk')}</h3>
            <div class="pe-card-desc">
              <span>⏱ ${p.duration_minutes || 30} minit</span>
              <span>💯 ${marks} markah</span>
            </div>
            <div class="pe-card-tags">
              ${(p.tags||[]).map(t => `<span class="pe-tag">${escHtml(t)}</span>`).join('')}
            </div>
          </div>`;
        count++;
      });

    html += `</div>`;
    if (count === 0) {
      if (Object.keys(_papers).length === 0) {
        html = `<div class="placeholder-card"><div class="ph-icon">📭</div><p>Tiada kertas soalan diterbitkan oleh guru lagi.</p></div>`;
      } else {
        html += `<div style="text-align:center;color:var(--text3);padding:40px;">Tiada kertas bagi subjek ini.</div>`;
      }
    }
    html += `</div>`;

    // Engine DOM
    html += `
      <div class="pe-engine" id="peEngine">
        <div class="pe-en-top">
          <button class="btn-latih btn-ghost btn-sm" onclick="PaperEngine.confirmExit()">✕ Tutup</button>
          <div class="pe-en-timer" id="peTimer">00:00</div>
          <button class="btn-latih btn-primary btn-sm" onclick="PaperEngine.confirmSubmit()">Hantar</button>
        </div>
        <div class="pe-en-body" id="peEngineBody">
          <div class="md-preview pe-paper-sheet" id="peSheet"></div>
        </div>
        <div class="pe-en-bot">
          <button class="btn-latih btn-secondary btn-sm" onclick="document.getElementById('peEngineBody').scrollTo({top:0,behavior:'smooth'})">↑ Atas</button>
          <button class="btn-latih btn-primary btn-sm" onclick="PaperEngine.confirmSubmit()">Hantar Kertas ➔</button>
        </div>
      </div>

      <div class="pe-res-overlay" id="peResult">
        <h2 style="font-family:'DM Serif Display',serif;font-size:2rem;margin-bottom:8px;" id="peResTitle">Tahniah!</h2>
        <p style="color:var(--text2);margin-bottom:32px;">Anda telah melengkapkan kertas ini.</p>
        <div class="pe-res-circle" id="peResCircle">
          <div class="pe-res-score" id="peResScore">0</div>
          <div class="pe-res-max" id="peResMax">/ 0</div>
        </div>
        <div style="font-size:1.5rem;font-weight:700;margin-bottom:8px;" id="peResGrade">A</div>
        <div style="font-size:14px;color:var(--text3);margin-bottom:32px;" id="peResMsg">Cemerlang</div>
        <button class="btn-latih btn-primary" onclick="PaperEngine.closeResult()">Kembali Kertas</button>
      </div>`;

    _shell.innerHTML = html;
  }

  function filter(sub) {
    Sound.tap();
    _currentSub = sub;
    _renderBrowseView();
  }

  /* ══════════════════════════════════════════════════════
     ENGINE START / RENDER
  ══════════════════════════════════════════════════════ */
  async function start(paperId) {
    Sound.tap();
    const p = _papers[paperId];
    if (!p) return;

    // Check if already done
    const grades = Store.get('grades_' + _uid) || [];
    if (grades.find(g => g.paper_id === paperId)) {
      toast('Anda sudah melengkapkan kertas ini.', 'info');
      Sound.notify();
      return;
    }

    _activePaper = p;
    _answers = {};
    document.getElementById('peEngine').classList.add('pe-en-active');

    // Parse and render paper
    const sheet = document.getElementById('peSheet');
    let md = p.question_md || '';

    // Strip out answer key blocks (just in case)
    md = md.replace(/\*\*JAWAPAN\*\*:.*$/gm, '');

    // Parse custom tags
    const answersMap = {};
    (p.answers || []).forEach(a => answersMap[a.id] = a);

    // 1. Process block tags first `[type:id]`
    // E.g. [mcq:S1] -> will be handled by post-processing the HTML
    let html = typeof marked !== 'undefined' ? marked.parse(md, { breaks: true }) : md;

    // 2. Inject interactive elements via regex replacement on the HTML
    // Match <p>[type:id]</p> or just [type:id]
    html = html.replace(/(?:<p>)?\[(mcq|true_false|fill|short|essay):([\w-]+)\](?:<\/p>)?/g, (match, type, qid) => {
      const q = answersMap[qid];
      const marks = q ? q.marks : 1;
      let ui = '';

      if (type === 'mcq' || type === 'true_false') {
        ui = `<div id="q_${qid}" class="pe-q-wrap" data-type="${type}"></div>`; // We'll move adjacent lists here
      } else if (type === 'fill' || type === 'short') {
        ui = `<div id="q_${qid}" class="pe-q-wrap" data-type="${type}">
                <input type="text" class="pe-input-text" oninput="PaperEngine.setAns('${qid}', this.value)" placeholder="Jawapan anda...">
              </div>`;
      } else if (type === 'essay') {
        ui = `<div id="q_${qid}" class="pe-q-wrap" data-type="${type}">
                <textarea class="pe-input-text" oninput="PaperEngine.setAns('${qid}', this.value)" placeholder="Taip jawapan panjang di sini..."></textarea>
              </div>`;
      }
      return `<div class="pe-q-header"><div class="pe-q-num">Soalan ${qid}</div><div class="pe-q-marks">[${marks} markah]</div></div>${ui}`;
    });

    sheet.innerHTML = html;

    // 3. Process MCQs - find lists immediately following a [mcq:S1] marker
    sheet.querySelectorAll('.pe-q-wrap[data-type="mcq"], .pe-q-wrap[data-type="true_false"]').forEach(wrap => {
      const qid = wrap.id.replace('q_', '');
      let next = wrap.nextElementSibling;
      // Skip empty paragraphs that marked might inject
      while (next && next.tagName === 'P' && !next.textContent.trim()) { next = next.nextElementSibling; }

      if (next && next.tagName === 'UL') {
        // Convert list to clickable options
        const opts = Array.from(next.querySelectorAll('li'));
        let optHtml = '';
        opts.forEach((li, i) => {
          let text = li.innerHTML;
          // Clean markdown list checkbox UI if present
          text = text.replace(/<input type="checkbox"[^>]*>/, '').trim();
          // Extract letter prefix if present (e.g. "A. Option") -> "A"
          const match = text.match(/^([A-D])\.\s*(.*)/i);
          const val = match ? match[1].toUpperCase() : String.fromCharCode(65+i);
          const label = match ? match[2] : text;

          optHtml += `
            <div class="pe-mcq-opt" id="opt_${qid}_${val}" onclick="PaperEngine.selMCQ('${qid}', '${val}')">
              <div class="pe-mcq-rad"></div>
              <div class="pe-mcq-lbl"><span style="font-weight:700;margin-right:8px;">${val}.</span> ${label}</div>
            </div>`;
        });
        wrap.innerHTML = optHtml;
        next.remove(); // Remove original ul
      }
    });

    // 4. Render Mermaid
    if (_mReady) {
      try { await mermaid.run({ nodes: sheet.querySelectorAll('pre code') }); } catch {}
    }

    document.getElementById('peEngineBody').scrollTo(0,0);

    // Start Timer
    _timeLeft = (p.duration_minutes || 30) * 60;
    _updateTimerUI();
    _timer = setInterval(() => {
      _timeLeft--;
      if (_timeLeft <= 0) {
        clearInterval(_timer);
        toast('Masa tamat!', 'warning');
        Sound.wrong();
        _submit();
      } else {
        _updateTimerUI();
      }
    }, 1000);
  }

  /* ══════════════════════════════════════════════════════
     INTERACTIONS
  ══════════════════════════════════════════════════════ */
  function selMCQ(qid, val) {
    Sound.tap();
    _answers[qid] = val;
    const wrap = document.getElementById('q_' + qid);
    if (!wrap) return;
    wrap.querySelectorAll('.pe-mcq-opt').forEach(el => el.classList.remove('selected'));
    const sel = document.getElementById(`opt_${qid}_${val}`);
    if (sel) sel.classList.add('selected');
  }

  function setAns(qid, val) {
    _answers[qid] = val;
  }

  function _updateTimerUI() {
    const el = document.getElementById('peTimer');
    if (!el) return;
    const m = Math.floor(_timeLeft / 60);
    const s = _timeLeft % 60;
    el.textContent = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    if (_timeLeft <= 300) el.classList.add('pe-urgent'); // Last 5 mins
  }

  /* ══════════════════════════════════════════════════════
     SUBMISSION & SCORING
  ══════════════════════════════════════════════════════ */
  function confirmExit() {
    Sound.tap();
    if (Object.keys(_answers).length > 0) {
      // In a real app we'd use a custom modal, but simple confirm for now to avoid complexity
      if (!window.confirm('Keluar? Jawapan anda tidak akan disimpan.')) return;
    }
    _closeEngine();
  }

  function confirmSubmit() {
    Sound.tap();
    const totalQ = (_activePaper.answers || []).length;
    const ansQ   = Object.keys(_answers).length;
    let msg = `Hantar kertas soalan?`;
    if (ansQ < totalQ) msg = `Hantar kertas? Anda baru menjawab ${ansQ} daripada ${totalQ} soalan.`;

    if (window.confirm(msg)) _submit();
  }

  function _submit() {
    if (_timer) clearInterval(_timer);
    Sound.submit();

    const p = _activePaper;
    let score = 0;
    let maxMap = {};
    let fullMax = 0;

    // Build max score map
    (p.answers || []).forEach(a => { maxMap[a.id] = a; fullMax += a.marks; });

    // Score answers using Latih.scoreAnswer shared utility
    for (const [qid, val] of Object.entries(_answers)) {
      const q = maxMap[qid];
      if (!q) continue;
      // Essay is manual marking (0 marks awarded automatically)
      if (q.type !== 'essay' && scoreAnswer(val, q.correct, q.type)) {
        score += q.marks;
      }
    }

    const max = fullMax || p.total_marks || 10;
    const pct = Math.round((score / max) * 100);
    const gr  = getGrade(pct);

    // Save to localStorage
    const grades = Store.get('grades_' + _uid) || [];
    grades.push({
      paper_id: p.id,
      subject:  p.subject,
      date:     new Date().toISOString(),
      score:    score,
      max:      max,
      pct:      pct,
      grade:    gr.grade,
      raw_ans:  {..._answers} // Save raw answers for later review (Phase 7)
    });
    Store.set('grades_' + _uid, grades);
    updateLeaderboard(); // Global recompute

    // Show Result Overlay
    const res = document.getElementById('peResult');
    document.getElementById('peResScore').textContent = score;
    document.getElementById('peResMax').textContent   = '/ ' + max;
    document.getElementById('peResGrade').textContent = gr.grade;
    document.getElementById('peResGrade').style.color = gr.color;
    document.getElementById('peResCircle').style.borderColor = gr.color;
    document.getElementById('peResMsg').textContent   = pct + '% - ' + gr.label;

    res.style.display = 'flex';
  }

  function closeResult() {
    Sound.tap();
    document.getElementById('peResult').style.display = 'none';
    _closeEngine();

    // Trigger profile re-render to show new grade if that tab is active
    if (typeof renderProfil === 'function') renderProfil();
  }

  function _closeEngine() {
    if (_timer) clearInterval(_timer);
    document.getElementById('peEngine').classList.remove('pe-en-active');
    document.getElementById('peTimer').classList.remove('pe-urgent');
    _activePaper = null;
    _answers = {};
    _renderBrowseView(); // Refresh list to show checkmark
  }

  /* ── API ────────────────────────────────────────────── */
  return { init, filter, start, selMCQ, setAns, confirmExit, confirmSubmit, closeResult };
})();
