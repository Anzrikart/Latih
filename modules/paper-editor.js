/**
 * modules/paper-editor.js
 * Admin paper editor: list, create, edit, save, publish.
 * Requires: assets/js/latih.js, marked.min.js, mermaid.min.js
 */

const PaperEditor = (() => {
  /* ── State ─────────────────────────────────────────── */
  let _id      = null;    // current paper id (null = new)
  let _answers = [];      // [{id, type, correct, marks}]
  let _prev    = false;   // preview mode
  let _ready   = false;   // shell mounted?
  let _mReady  = false;   // mermaid ready?

  const SUBJECTS = ['BM','BI','Matematik','Sains','Sejarah','Pendidikan Islam','Pendidikan Moral'];
  const TYPES    = ['mcq','true_false','fill','short','matching','essay'];

  /* ══════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════ */
  function init(mountId) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    if (!_ready) {
      _ready = true;
      _injectCSS();
      mount.innerHTML = _html();
      if (typeof mermaid !== 'undefined') {
        mermaid.initialize({ startOnLoad: false, theme: 'neutral',
          fontFamily: "'DM Sans',sans-serif", securityLevel: 'loose' });
        _mReady = true;
      }
    }
    renderList();
    _showEmpty();
  }

  /* ── CSS ──────────────────────────────────────────── */
  function _injectCSS() {
    if (document.getElementById('pe-css')) return;
    const s = document.createElement('style');
    s.id = 'pe-css';
    s.textContent = `
.pe-shell{display:flex;min-height:calc(100vh - 104px);overflow:visible;background:var(--bg);}
.pe-list{width:250px;flex-shrink:0;border-right:1px solid var(--border);background:var(--surface);display:flex;flex-direction:column;overflow:hidden;}
.pe-list-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid var(--border);flex-shrink:0;}
.pe-list-scroll{flex:1;overflow-y:auto;}
.pe-li{padding:10px 14px;cursor:pointer;border-left:3px solid transparent;transition:background .12s,border-color .12s;}
.pe-li:hover{background:var(--surface2);}
.pe-li.active{background:var(--accent-soft);border-left-color:var(--accent);}
.pe-li-title{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pe-li-meta{font-size:11px;color:var(--text3);margin-top:3px;display:flex;gap:5px;flex-wrap:wrap;align-items:center;}
.pe-li-btns{display:flex;gap:4px;margin-top:6px;}
.pe-list-empty{padding:24px 14px;text-align:center;color:var(--text3);font-size:13px;}
.pe-wrap{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.pe-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--text2);gap:10px;padding:40px;text-align:center;}
.pe-panel{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.pe-toolbar{display:flex;align-items:center;gap:3px;padding:8px 12px;background:var(--surface);border-bottom:1px solid var(--border);flex-shrink:0;flex-wrap:wrap;}
.pe-tb{display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:32px;padding:0 8px;border:1px solid var(--border);border-radius:6px;background:var(--surface);cursor:pointer;font-size:13px;font-weight:700;color:var(--text2);transition:background .12s,color .12s;font-family:'DM Sans',sans-serif;}
.pe-tb:hover{background:var(--surface2);color:var(--text);}
.pe-tb.on{background:var(--accent-soft);color:var(--accent);border-color:var(--accent);}
.pe-sep{width:1px;height:20px;background:var(--border);margin:0 4px;}
.pe-edit-area{flex:1;display:flex;overflow:hidden;min-height:160px;}
.pe-ta{flex:1;border:none;outline:none;resize:none;padding:14px;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.75;background:var(--surface);color:var(--text);overflow-y:auto;}
.pe-prev{flex:1;padding:16px 20px;overflow-y:auto;background:var(--surface);display:none;border-left:1px solid var(--border);}
.pe-bottom{flex-shrink:0;overflow-y:auto;max-height:42vh;border-top:1px solid var(--border);}
.pe-sect{padding:12px 16px;border-bottom:1px solid var(--border);}
.pe-sect-lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-bottom:10px;}
.pe-g1{display:grid;grid-template-columns:2fr 1fr 1fr;gap:8px;margin-bottom:8px;}
.pe-g2{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;}
.pe-lbl{font-size:11px;font-weight:600;color:var(--text3);margin-bottom:3px;}
.pe-inp{width:100%;padding:6px 10px;border:1.5px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;background:var(--surface);color:var(--text);outline:none;transition:border-color .15s;min-height:34px;}
.pe-inp:focus{border-color:var(--accent);}
select.pe-inp{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B6760' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 9px center;padding-right:26px;}
.pe-key-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.pe-ans-tbl{width:100%;border-collapse:collapse;font-size:13px;}
.pe-ans-tbl th{text-align:left;padding:6px 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text3);border-bottom:1px solid var(--border);}
.pe-ans-tbl td{padding:5px 5px;border-bottom:1px solid var(--surface2);vertical-align:middle;}
.pe-ans-tbl tbody tr:last-child td{border-bottom:none;}
.pe-ai{width:100%;padding:4px 8px;border:1.5px solid var(--border);border-radius:6px;font-family:'DM Sans',sans-serif;font-size:12px;background:var(--surface);color:var(--text);outline:none;min-height:28px;}
.pe-ai:focus{border-color:var(--accent);}
select.pe-ai{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B6760' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 6px center;padding-right:20px;}
.pe-actions{display:flex;align-items:center;gap:8px;padding:11px 14px;background:var(--surface);border-top:1px solid var(--border);flex-shrink:0;flex-wrap:wrap;}
.pe-pub-yes{background:var(--green-soft);color:var(--green);font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;}
.pe-pub-no{background:var(--surface2);color:var(--text3);font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;}
@media(max-width:768px){.pe-shell{flex-direction:column;min-height:auto;}.pe-list{width:100%;height:auto;border-right:none;border-bottom:1px solid var(--border);}.pe-bottom{max-height:none;}.pe-g1{grid-template-columns:1fr;}}`;
    document.head.appendChild(s);
  }

  /* ── Shell HTML ──────────────────────────────────── */
  function _html() {
    const subOpts  = SUBJECTS.map(s => `<option>${s}</option>`).join('');
    const yearOpts = [1,2,3,4,5,6].map(y => `<option value="${y}">Tahun ${y}</option>`).join('');
    return `
<div class="pe-shell">
  <div class="pe-list">
    <div class="pe-list-head" style="gap:4px;">
      <span style="font-size:13px;font-weight:600;flex:1;">Kertas</span>
      <button class="btn-latih btn-secondary btn-sm" onclick="PaperEditor.syncFromRegistry()" title="Imbas folder /papers/ dan muat turun kertas baru">Imbas</button>
      <button class="btn-latih btn-primary btn-sm" onclick="PaperEditor.newPaper()">＋ Baru</button>
    </div>
    <div class="pe-list-scroll" id="peListScroll"></div>
  </div>
  <div class="pe-wrap">
    <div class="pe-empty" id="peEmpty">
      <div style="font-size:3rem;">📝</div>
      <div style="font-weight:600;font-size:15px;color:var(--text);">Editor Kertas Soalan</div>
      <div style="font-size:13px;color:var(--text3);">Pilih kertas di sebelah kiri atau buat kertas baru.</div>
    </div>
    <div class="pe-panel" id="pePanel" style="display:none;">
      <div class="pe-toolbar">
        <button class="pe-tb" title="Bold" onclick="PaperEditor.wrap('**','**')"><b>B</b></button>
        <button class="pe-tb" title="Italic" onclick="PaperEditor.wrap('*','*')"><i>I</i></button>
        <button class="pe-tb" title="Blok kod" onclick="PaperEditor.wrapBlock()">&#123;&#125;</button>
        <button class="pe-tb" title="Insert Mermaid" onclick="PaperEditor.insertMermaid()">⬡</button>
        <button class="pe-tb" title="Template MCQ" onclick="PaperEditor.insertMCQ()" style="font-size:11px;padding:0 6px;font-weight:600;">MCQ</button>
        <div class="pe-sep"></div>
        <button class="pe-tb" id="pePrevBtn" onclick="PaperEditor.togglePreview()" style="padding:0 10px;font-size:12px;font-weight:600;">👁 Preview</button>
      </div>
      <div class="pe-edit-area">
        <textarea class="pe-ta" id="peTa" placeholder="Tulis soalan dalam Markdown...&#10;&#10;Contoh:&#10;**S1** [mcq:2]&#10;Soalan di sini...&#10;&#10;- [ ] A. Pilihan satu&#10;- [ ] B. Pilihan dua&#10;&#10;**JAWAPAN**: A&#10;&#10;---"></textarea>
        <div class="pe-prev md-preview" id="pePrev"></div>
      </div>
      <div class="pe-bottom">
        <div class="pe-sect">
          <div class="pe-sect-lbl">Maklumat Kertas</div>
          <div class="pe-g1">
            <div><div class="pe-lbl">Tajuk</div><input id="peTitle" class="pe-inp" type="text" placeholder="Contoh: Matematik Tahun 4 — Pecahan"></div>
            <div><div class="pe-lbl">Mata Pelajaran</div><select id="peSub" class="pe-inp">${subOpts}</select></div>
            <div><div class="pe-lbl">Tahun</div><select id="peYear" class="pe-inp">${yearOpts}</select></div>
          </div>
          <div class="pe-g2">
            <div><div class="pe-lbl">Masa (minit)</div><input id="peDur" class="pe-inp" type="number" value="30" min="5" max="180"></div>
            <div><div class="pe-lbl">Jumlah Markah</div><input id="peMark" class="pe-inp" type="number" value="10" min="1"></div>
            <div><div class="pe-lbl">Kesukaran</div>
              <select id="peDiff" class="pe-inp">
                <option value="mudah">Mudah</option>
                <option value="sederhana" selected>Sederhana</option>
                <option value="sukar">Sukar</option>
              </select>
            </div>
            <div><div class="pe-lbl">Tag (koma)</div><input id="peTags" class="pe-inp" type="text" placeholder="pecahan, bahagi"></div>
          </div>
        </div>
        <div class="pe-sect">
          <div class="pe-key-head">
            <div class="pe-sect-lbl" style="margin:0;">Kunci Jawapan</div>
            <button class="btn-latih btn-secondary btn-sm" onclick="PaperEditor.addRow()">＋ Tambah Soalan</button>
          </div>
          <div style="overflow-x:auto;">
            <table class="pe-ans-tbl">
              <thead><tr><th style="width:72px;">ID</th><th style="width:120px;">Jenis</th><th>Jawapan Betul</th><th style="width:64px;">Markah</th><th style="width:32px;"></th></tr></thead>
              <tbody id="peAnsTbody"></tbody>
            </table>
          </div>
        </div>
        <div class="pe-actions">
          <button class="btn-latih btn-primary" onclick="PaperEditor.save()">💾 Simpan</button>
          <button class="btn-latih btn-secondary" id="pePubBtn" onclick="PaperEditor.togglePublish()">🌐 Terbitkan</button>
          <div style="flex:1;"></div>
          <button class="btn-latih btn-ghost btn-sm" onclick="PaperEditor.closeEditor()">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</div>`;
  }

  /* ══════════════════════════════════════════════════════
     PAPER LIST
  ══════════════════════════════════════════════════════ */
  function renderList() {
    const scroll = document.getElementById('peListScroll');
    if (!scroll) return;
    const papers = Store.get('papers') || {};
    const keys   = Object.keys(papers).sort((a, b) =>
      new Date(papers[b].created) - new Date(papers[a].created));
    scroll.innerHTML = '';
    if (!keys.length) {
      scroll.innerHTML = '<div class="pe-list-empty">Tiada kertas lagi.<br>Klik <strong>＋ Baru</strong>.</div>';
      return;
    }
    keys.forEach(id => {
      const p   = papers[id];
      const el  = document.createElement('div');
      el.className = 'pe-li' + (id === _id ? ' active' : '');
      el.id = 'peli-' + id;
      el.innerHTML = `
        <div class="pe-li-title">${escHtml(p.title || 'Kertas tanpa tajuk')}</div>
        <div class="pe-li-meta">
          <span class="badge-latih badge-accent" style="font-size:10px;">${escHtml(p.subject||'—')}</span>
          <span>Thn ${p.year||'—'}</span>
          <span class="${p.published ? 'pe-pub-yes' : 'pe-pub-no'}">${p.published ? 'Diterbit' : 'Draf'}</span>
        </div>
        <div class="pe-li-btns">
          <button class="btn-latih btn-secondary btn-sm" onclick="PaperEditor.edit('${escHtml(id)}')">Edit</button>
          <button class="btn-latih btn-danger btn-sm" onclick="PaperEditor.del('${escHtml(id)}')">Padam</button>
        </div>`;
      scroll.appendChild(el);
    });
  }

  /* ══════════════════════════════════════════════════════
     NEW / EDIT
  ══════════════════════════════════════════════════════ */
  function newPaper() {
    Sound.tap();
    _id = null; _answers = []; _prev = false;
    _fill(null); _showPanel();
  }

  function edit(id) {
    Sound.tap();
    _id = id;
    const p = (Store.get('papers') || {})[id];
    if (!p) { toast('Kertas tidak dijumpai.', 'error'); return; }
    _answers = (p.answers || []).map(r => ({...r}));
    _prev = false;
    _fill(p); _showPanel();
    document.querySelectorAll('.pe-li').forEach(el =>
      el.classList.toggle('active', el.id === 'peli-' + id));
  }

  function _fill(p) {
    _v('peTa',    p?.question_md    || '');
    _v('peTitle', p?.title          || '');
    _v('peSub',   p?.subject        || 'Matematik');
    _v('peYear',  String(p?.year    || 4));
    _v('peDur',   String(p?.duration_minutes || 30));
    _v('peMark',  String(p?.total_marks      || 10));
    _v('peDiff',  p?.difficulty     || 'sederhana');
    _v('peTags',  (p?.tags || []).join(', '));
    _renderAns();
    _setPubBtn(p?.published);
    _offPrev();
  }

  function _v(id, val) { const el = document.getElementById(id); if (el) el.value = val; }

  function _showPanel() {
    _show('pePanel', 'flex');
    _show('peEmpty', 'none');
    const ta = document.getElementById('peTa');
    if (ta) ta.focus();
  }

  function _showEmpty() {
    _show('pePanel', 'none');
    _show('peEmpty', 'flex');
    document.querySelectorAll('.pe-li').forEach(el => el.classList.remove('active'));
  }

  function _show(id, val) { const el = document.getElementById(id); if (el) el.style.display = val; }

  function closeEditor() { Sound.tap(); _id = null; _showEmpty(); }

  /* ══════════════════════════════════════════════════════
     SAVE
  ══════════════════════════════════════════════════════ */
  function save() {
    Sound.tap();
    const title = (document.getElementById('peTitle')?.value || '').trim();
    if (!title) { toast('Sila masukkan tajuk kertas.', 'warning'); return; }

    const papers = Store.get('papers') || {};
    const id     = _id || ('paper_' + Date.now());
    const exist  = papers[id] || {};

    // Sync answers from DOM
    const rows = [];
    document.querySelectorAll('#peAnsTbody tr').forEach(tr => {
      const inp = tr.querySelectorAll('input,select');
      if (inp.length >= 4) {
        const rid = (inp[0].value || '').trim();
        if (rid) rows.push({ id: rid, type: inp[1].value, correct: inp[2].value, marks: parseInt(inp[3].value)||1 });
      }
    });
    _answers = rows;

    papers[id] = {
      id, title,
      subject:          document.getElementById('peSub')?.value   || 'Matematik',
      year:             parseInt(document.getElementById('peYear')?.value)  || 1,
      duration_minutes: parseInt(document.getElementById('peDur')?.value)   || 30,
      total_marks:      parseInt(document.getElementById('peMark')?.value)  || 10,
      difficulty:       document.getElementById('peDiff')?.value  || 'sederhana',
      tags:             (document.getElementById('peTags')?.value || '').split(',').map(t=>t.trim()).filter(Boolean),
      published:        exist.published || false,
      created:          exist.created   || new Date().toISOString(),
      author:           exist.author    || 'Pentadbir',
      question_md:      document.getElementById('peTa')?.value    || '',
      answers:          _answers
    };

    if (!_id) _id = id;
    Store.set('papers', papers);
    Sound.save();
    toast('Kertas disimpan!', 'success');
    _setPubBtn(papers[id].published);
    renderList();
    document.querySelectorAll('.pe-li').forEach(el =>
      el.classList.toggle('active', el.id === 'peli-' + id));
  }

  /* ══════════════════════════════════════════════════════
     PUBLISH
  ══════════════════════════════════════════════════════ */
  function togglePublish() {
    Sound.tap();
    if (!_id) { toast('Simpan kertas dahulu sebelum menerbitkan.', 'warning'); return; }
    const papers = Store.get('papers') || {};
    if (!papers[_id]) { toast('Simpan kertas dahulu.', 'warning'); return; }
    papers[_id].published = !papers[_id].published;
    Store.set('papers', papers);
    Sound.save();
    const pub = papers[_id].published;
    _setPubBtn(pub);
    toast(pub ? 'Kertas diterbitkan!' : 'Kertas disembunyikan.', pub ? 'success' : 'info');
    renderList();
  }

  function _setPubBtn(pub) {
    const btn = document.getElementById('pePubBtn');
    if (!btn) return;
    btn.textContent = pub ? '🔒 Sembunyikan' : '🌐 Terbitkan';
    btn.className   = pub ? 'btn-latih btn-secondary' : 'btn-latih btn-success';
  }

  /* ══════════════════════════════════════════════════════
     DELETE
  ══════════════════════════════════════════════════════ */
  function del(id) {
    Sound.tap();
    const p = (Store.get('papers') || {})[id];
    if (!confirm(`Padam kertas "${p?.title || id}"?`)) return;
    const papers = Store.get('papers') || {};
    delete papers[id];
    Store.set('papers', papers);
    toast('Kertas dipadam.', 'info');
    if (_id === id) closeEditor();
    renderList();
  }

  /* ══════════════════════════════════════════════════════
     TOOLBAR
  ══════════════════════════════════════════════════════ */
  function wrap(b, a) {
    Sound.tap();
    const ta = document.getElementById('peTa'); if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = ta.value.substring(s, e) || 'teks';
    ta.setRangeText(b + sel + a, s, e, 'select'); ta.focus();
  }

  function wrapBlock() {
    Sound.tap();
    const ta = document.getElementById('peTa'); if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = ta.value.substring(s, e) || '';
    ta.setRangeText('```\n' + sel + '\n```', s, e, 'end'); ta.focus();
  }

  function insertMermaid() {
    Sound.tap();
    const ta = document.getElementById('peTa'); if (!ta) return;
    const p  = ta.selectionStart;
    ta.setRangeText('\n```mermaid\npie title Tajuk\n  "Bahagian A" : 40\n  "Bahagian B" : 60\n```\n', p, p, 'end');
    ta.focus();
  }

  function insertMCQ() {
    Sound.tap();
    const ta  = document.getElementById('peTa'); if (!ta) return;
    const num = _answers.length + 1;
    const p   = ta.selectionStart;
    ta.setRangeText(`\n**S${num}** [mcq:1]\nSoalan di sini...\n\n- [ ] A. Pilihan satu\n- [ ] B. Pilihan dua\n- [ ] C. Pilihan tiga\n- [ ] D. Pilihan empat\n\n**JAWAPAN**: A\n\n---\n`, p, p, 'end');
    ta.focus();
    _answers.push({ id: 'S' + num, type: 'mcq', correct: 'A', marks: 1 });
    _renderAns();
  }

  /* ══════════════════════════════════════════════════════
     PREVIEW
  ══════════════════════════════════════════════════════ */
  function togglePreview() {
    Sound.tap();
    _prev = !_prev;
    if (_prev) {
      _show('peTa',   'none'); // peTa is a textarea, toggling via display
      document.getElementById('peTa').style.display = 'none';
      document.getElementById('pePrev').style.display = 'block';
      document.getElementById('pePrevBtn').classList.add('on');
      _doPreview();
    } else {
      _offPrev();
    }
  }

  function _offPrev() {
    _prev = false;
    const ta   = document.getElementById('peTa');
    const prev = document.getElementById('pePrev');
    const btn  = document.getElementById('pePrevBtn');
    if (ta)   ta.style.display   = '';
    if (prev) prev.style.display = 'none';
    if (btn)  btn.classList.remove('on');
  }

  async function _doPreview() {
    const prev = document.getElementById('pePrev'); if (!prev) return;
    let md = document.getElementById('peTa')?.value || '';
    md = md.replace(/\*\*JAWAPAN\*\*:.*$/gm, '');
    md = md.replace(/\[(?:mcq|true_false|fill|short|matching|essay):\d+\]/g, '');
    if (typeof marked !== 'undefined') {
      prev.innerHTML = marked.parse(md, { breaks: true });
    } else {
      prev.textContent = md;
    }
    if (_mReady) {
      try { await mermaid.run({ nodes: prev.querySelectorAll('pre code') }); } catch {}
    }
  }

  /* ══════════════════════════════════════════════════════
     ANSWER KEY TABLE
  ══════════════════════════════════════════════════════ */
  function addRow() {
    Sound.tap();
    _answers.push({ id: 'S' + (_answers.length + 1), type: 'mcq', correct: '', marks: 1 });
    _renderAns();
  }

  function removeRow(idx) {
    Sound.tap();
    _answers.splice(idx, 1);
    _renderAns();
  }

  function _renderAns() {
    const tbody = document.getElementById('peAnsTbody'); if (!tbody) return;
    tbody.innerHTML = '';
    if (!_answers.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:10px;font-size:12px;">
        Tiada soalan. Klik <strong>＋ Tambah Soalan</strong>.</td></tr>`;
      return;
    }
    const typeOpts = TYPES.map(t => `<option value="${t}">${t}</option>`).join('');
    _answers.forEach((row, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input class="pe-ai" type="text" value="${escHtml(row.id)}" placeholder="S1"
          oninput="PaperEditor._upd(${i},'id',this.value)"></td>
        <td><select class="pe-ai" onchange="PaperEditor._upd(${i},'type',this.value)">
          ${typeOpts.replace(`"${escHtml(row.type)}"`, `"${escHtml(row.type)}" selected`)}
        </select></td>
        <td><input class="pe-ai" type="text" value="${escHtml(row.correct)}"
          placeholder="${row.type==='mcq'?'A/B/C/D':row.type==='essay'?'(guru semak)':'jawapan | alt'}"
          oninput="PaperEditor._upd(${i},'correct',this.value)"></td>
        <td><input class="pe-ai" type="number" value="${row.marks}" min="1" style="width:52px;"
          oninput="PaperEditor._upd(${i},'marks',this.value)"></td>
        <td><button class="btn-icon" style="width:28px;height:28px;font-size:14px;border-radius:6px;"
          onclick="PaperEditor.removeRow(${i})">×</button></td>`;
      tbody.appendChild(tr);
    });
  }

  function _upd(i, f, v) { if (_answers[i]) _answers[i][f] = v; }

  /* ══════════════════════════════════════════════════════
     SYNC FROM FILESYSTEM / REGISTRY
  ══════════════════════════════════════════════════════ */
  async function syncFromRegistry() {
    Sound.tap();
    toast('Mengimbas folder kertas...', 'info');
    try {
      const resp = await fetch(Latih.root + 'papers/list.json');
      if (!resp.ok) throw new Error('Could not load papers/list.json');
      const list = await resp.json();
      
      let newCount = 0;
      const papers = Store.get('papers') || {};

      for (const folder of list) {
        try {
          // Fetch rubric.json
          const rResp = await fetch(`${Latih.root}papers/${folder}/rubric.json`);
          if (!rResp.ok) continue;
          const rubric = await rResp.json();
          
          const id = rubric.paper_id || folder;
          
          // Only skip if already exists and we don't want to overwrite 
          // (Actually, let's always sync to catch updates on disk)
          
          // Fetch question.md
          const qResp = await fetch(`${Latih.root}papers/${folder}/question.md`);
          if (!qResp.ok) continue;
          const md = await qResp.text();
          
          // Fetch answers.json
          const aResp = await fetch(`${Latih.root}papers/${folder}/answers.json`);
          if (!aResp.ok) continue;
          const ans = await aResp.json();
          
          papers[id] = {
            id,
            title:            rubric.title,
            subject:          rubric.subject,
            year:             rubric.year,
            duration_minutes: rubric.duration_minutes,
            total_marks:      rubric.total_marks,
            difficulty:       rubric.difficulty,
            tags:             rubric.tags,
            published:        rubric.published ?? false,
            created:          rubric.created || new Date().toISOString(),
            author:           rubric.author || 'Sistem',
            question_md:      md,
            answers:          ans
          };
          newCount++;
        } catch (e) {
          console.error(`Error syncing ${folder}:`, e);
        }
      }
      
      Store.set('papers', papers);
      renderList();
      Sound.save();
      toast(`Berjaya mengimbas ${newCount} kertas!`, 'success');
    } catch (err) {
      toast('Gagal mengimbas registry kertas.', 'error');
      console.error(err);
    }
  }

  /* ── Public API ──────────────────────────────────────── */
  return { init, renderList, newPaper, edit, del, save, togglePublish, closeEditor,
           wrap, wrapBlock, insertMermaid, insertMCQ, togglePreview, addRow, removeRow, _upd, syncFromRegistry };
})();
