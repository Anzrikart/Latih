/**
 * modules/reminders.js
 * Student Reminders and Memos
 * Requires: assets/js/latih.js
 */

const Reminders = (() => {
  let _shell = null;
  let _uid = null;
  let _ready = false;

  function init(mountId) {
    _shell = document.getElementById(mountId);
    if (!_shell) return;
    _uid = Store.currentUser();
    if (!_uid) return;

    if (!_ready) {
      _ready = true;
      _injectCSS();
    }
    render();
  }

  function _injectCSS() {
    if (document.getElementById('rm-css')) return;
    const s = document.createElement('style');
    s.id = 'rm-css';
    s.textContent = `
.rm-wrap { animation: fadeIn 0.15s ease; display: grid; gap: 24px; }
@media(min-width: 768px) { .rm-wrap { grid-template-columns: 1fr 1fr; } }

/* Cards shared styling */
.rm-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; box-shadow: var(--shadow); display: flex; flex-direction: column; }
.rm-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.rm-title { font-size: 1.1rem; font-family: 'DM Serif Display', serif; color: var(--text); }
.rm-btn-add { background: var(--accent-light); color: var(--accent); border: none; width: 32px; height: 32px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.15s; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.rm-btn-add:hover { background: var(--accent); color: white; }

/* Reminder items */
.rm-list { display: flex; flex-direction: column; gap: 12px; }
.rm-item { border: 1.5px solid var(--border); border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 14px; position: relative; transition: border-color 0.15s; }
.rm-item:hover { border-color: var(--accent-soft); }
.rm-time { font-family: 'DM Serif Display', serif; font-size: 1.2rem; color: var(--accent); letter-spacing: 0.02em; min-width: 65px; }
.rm-text { flex: 1; font-size: 14px; color: var(--text); font-weight: 500; }
.rm-days { font-size: 11px; color: var(--text3); font-weight: 600; text-transform: uppercase; margin-top: 4px; }

/* Memo items (Sticky notes style) */
.mm-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
.mm-item { background: var(--amber-soft); border: 1px solid rgba(180, 83, 9, 0.2); border-radius: 12px; padding: 16px; position: relative; cursor: pointer; transition: transform 0.1s; min-height: 120px; display: flex; flex-direction: column; }
.mm-item:active { transform: scale(0.96); }
.mm-item.is-pinned { background: var(--accent-soft); border-color: rgba(43, 92, 230, 0.2); }
.mm-pin { position: absolute; top: -8px; left: 50%; transform: translateX(-50%); font-size: 18px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2)); }
.mm-text { font-size: 13px; color: var(--text); line-height: 1.5; word-wrap: break-word; flex: 1; }
.mm-date { font-size: 10px; color: var(--text3); text-align: right; margin-top: 8px; }

/* Empty state */
.rm-empty { text-align: center; padding: 24px 16px; color: var(--text3); font-size: 13px; border: 1.5px dashed var(--border); border-radius: 8px; margin-top: auto; margin-bottom: auto; }

/* Forms UI */
.rm-form { display: none; margin-bottom: 20px; background: var(--surface2); padding: 16px; border-radius: 12px; border: 1px solid var(--border); animation: slideDown 0.2s ease; }
.rm-form.active { display: block; }
@keyframes slideDown { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }

/* Delete buttons */
.btn-del-sm { position: absolute; top: -8px; right: -8px; background: var(--surface); color: var(--text3); box-shadow: var(--shadow); border: 1px solid var(--border); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer; opacity: 0; transition: 0.15s; }
.rm-item:hover .btn-del-sm, .mm-item:hover .btn-del-sm { opacity: 1; color: var(--red); }
`;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  function render() {
    if (!_shell) return;
    
    // Create dual payload wrapping
    let html = `
      <div class="section-head">
        <h2>Peringatan & Nota</h2>
        <p>Set peringatan ulang kaji dan simpan nota ringkas.</p>
      </div>
      <div class="rm-wrap" id="rmContainer"></div>
    `;

    if (!document.getElementById('rmContainer')) {
      _shell.innerHTML = html;
    }

    const container = document.getElementById('rmContainer');
    container.innerHTML = `
      ${_renderReminders()}
      ${_renderMemos()}
    `;
  }

  /* ── Reminders ───────────────────────────────────────── */
  function _renderReminders() {
    const list = Store.get('reminders_' + _uid) || [];
    
    // Sort logic (string sort HH:mm is fine)
    list.sort((a,b) => a.time.localeCompare(b.time));

    let html = `
      <div class="rm-panel">
        <div class="rm-head">
          <div class="rm-title">Peringatan Masa ⏰</div>
          <button class="rm-btn-add" onclick="Reminders.toggleRemForm()">+</button>
        </div>
        
        <div class="rm-form" id="rmForm">
          <div class="form-latih">
            <div class="form-group" style="display:flex;gap:12px;">
              <div style="flex:1;">
                <label class="form-label">Masa</label>
                <input type="time" id="rmTime" class="form-control-latih" value="15:00">
              </div>
              <div style="flex:2;">
                <label class="form-label">Kekerapan</label>
                <select id="rmDays" class="form-control-latih">
                  <option value="Setiap Hari">Setiap Hari</option>
                  <option value="Hari Persekolahan">Hari Persekolahan</option>
                  <option value="Hujung Minggu">Hujung Minggu</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Perkara</label>
              <input type="text" id="rmText" class="form-control-latih" placeholder="Cth: Ulang kaji Matematik">
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn-latih btn-primary" style="flex:1;" onclick="Reminders.addReminder()">Simpan</button>
              <button class="btn-latih btn-ghost" onclick="Reminders.toggleRemForm()">Batal</button>
            </div>
          </div>
        </div>
        
        <div class="rm-list">`;
        
    if (list.length === 0) {
      html += `<div class="rm-empty">Tiada peringatan. Sila tambah!</div>`;
    } else {
      list.forEach((r, idx) => {
        html += `
          <div class="rm-item">
            <div class="rm-time">${escHtml(r.time)}</div>
            <div style="flex:1;min-width:0;">
              <div class="rm-text">${escHtml(r.text)}</div>
              <div class="rm-days">${escHtml(r.days)}</div>
            </div>
            <button class="btn-del-sm" onclick="Reminders.delReminder(${idx})" title="Padam">✕</button>
          </div>
        `;
      });
    }

    html += `</div></div>`;
    return html;
  }

  /* ── Memos ───────────────────────────────────────────── */
  function _renderMemos() {
    const list = Store.get('memos_' + _uid) || [];
    
    // Sort: pinned first, then new
    list.sort((a,b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.created) - new Date(a.created);
    });

    let html = `
      <div class="rm-panel">
        <div class="rm-head">
          <div class="rm-title">Nota Lekat 📌</div>
          <button class="rm-btn-add" onclick="Reminders.toggleMemoForm()">+</button>
        </div>
        
        <div class="rm-form" id="mmForm">
          <div class="form-latih">
            <div class="form-group">
              <label class="form-label">Nota Pendek</label>
              <textarea id="mmText" class="form-control-latih" style="min-height:80px;resize:vertical;" placeholder="Tulis apa sahaja..."></textarea>
            </div>
            <div class="form-group" style="display:flex;align-items:center;gap:8px;">
              <input type="checkbox" id="mmPinned" style="width:16px;height:16px;accent-color:var(--accent);">
              <label for="mmPinned" class="form-label" style="margin:0;cursor:pointer;">Pin di atas</label>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn-latih btn-primary" style="flex:1;" onclick="Reminders.addMemo()">Simpan</button>
              <button class="btn-latih btn-ghost" onclick="Reminders.toggleMemoForm()">Batal</button>
            </div>
          </div>
        </div>
        
        <div class="mm-grid">`;
        
    if (list.length === 0) {
      html += `<div class="rm-empty" style="grid-column:1/-1;">Tiada nota lekat.</div>`;
    } else {
      list.forEach((m, idx) => {
        const dStr = m.created ? m.created.slice(0,10) : '';
        html += `
          <div class="mm-item ${m.pinned ? 'is-pinned' : ''}" onclick="Reminders.togglePinMemo(${idx})">
            ${m.pinned ? '<div class="mm-pin">📌</div>' : ''}
            <div class="mm-text">${escHtml(m.text).replace(/\\n/g, '<br>')}</div>
            <div class="mm-date">${dStr}</div>
            <button class="btn-del-sm" onclick="event.stopPropagation(); Reminders.delMemo(${idx})" title="Padam">✕</button>
          </div>
        `;
      });
    }

    html += `</div></div>`;
    return html;
  }

  /* ══════════════════════════════════════════════════════
     ACTIONS
  ══════════════════════════════════════════════════════ */
  function toggleRemForm() { document.getElementById('rmForm').classList.toggle('active'); }
  function toggleMemoForm() { document.getElementById('mmForm').classList.toggle('active'); }

  function addReminder() {
    const time = document.getElementById('rmTime').value;
    const days = document.getElementById('rmDays').value;
    const text = document.getElementById('rmText').value.trim();
    if (!time || !text) { toast('Sila isikan masa dan perkara.', 'error'); return; }

    Sound.tap();
    const list = Store.get('reminders_' + _uid) || [];
    list.push({ id: 'r_' + Date.now(), time, days, text });
    Store.set('reminders_' + _uid, list);
    Sound.save();
    render();
  }

  function delReminder(idx) {
    Sound.tap();
    const list = Store.get('reminders_' + _uid) || [];
    list.splice(idx, 1);
    Store.set('reminders_' + _uid, list);
    render();
  }

  function addMemo() {
    const text = document.getElementById('mmText').value.trim();
    const pinned = document.getElementById('mmPinned').checked;
    if (!text) return;

    Sound.tap();
    const list = Store.get('memos_' + _uid) || [];
    list.push({ id: 'm_' + Date.now(), text, pinned, created: new Date().toISOString() });
    Store.set('memos_' + _uid, list);
    Sound.save();
    render();
  }

  function togglePinMemo(idx) {
    Sound.tap();
    const list = Store.get('memos_' + _uid) || [];
    list[idx].pinned = !list[idx].pinned;
    Store.set('memos_' + _uid, list);
    render();
  }

  function delMemo(idx) {
    Sound.tap();
    const list = Store.get('memos_' + _uid) || [];
    list.splice(idx, 1);
    Store.set('memos_' + _uid, list);
    render();
  }

  /* ── API ────────────────────────────────────────────── */
  return { init, toggleRemForm, toggleMemoForm, addReminder, delReminder, addMemo, togglePinMemo, delMemo };
})();
