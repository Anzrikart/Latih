/**
 * modules/kanban.js
 * Student Kanban Board (To Do, Doing, Done)
 * Requires: assets/js/latih.js
 */

const Kanban = (() => {
  let _shell = null;
  let _uid = null;
  let _ready = false;
  
  // Default empty state
  const defaultData = { todo: [], doing: [], done: [] };

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
    if (document.getElementById('kb-css')) return;
    const s = document.createElement('style');
    s.id = 'kb-css';
    s.textContent = `
/* Kanban Board */
.kb-wrap { animation: fadeIn 0.15s ease; }

/* Add Task Input */
.kb-add-row { display: flex; gap: 8px; margin-bottom: 24px; position: sticky; top: 56px; z-index: 10; background: var(--bg); padding-top: 8px; padding-bottom: 8px; }
.kb-input { flex: 1; padding: 12px 16px; border: 1.5px solid var(--border); border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.15s; box-shadow: var(--shadow); }
.kb-input:focus { border-color: var(--accent); }

/* Columns container */
.kb-cols { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px; snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
/* Hide scrollbar for cleaner look on mobile */
.kb-cols::-webkit-scrollbar { display: none; }
.kb-col { flex: 0 0 85%; max-width: 320px; background: var(--surface2); border: 1px solid var(--border); border-radius: 16px; padding: 16px; scroll-snap-align: center; display: flex; flex-direction: column; }
@media(min-width: 768px) {
  .kb-cols { flex-wrap: wrap; flex-direction: row; }
  .kb-col { flex: 1; max-width: none; }
}

.kb-col-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.kb-col-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text2); display: flex; align-items: center; gap: 8px; }
.kb-count { background: var(--surface); border: 1px solid var(--border); color: var(--text3); font-size: 11px; padding: 2px 8px; border-radius: 12px; }

/* Task Card */
.kb-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); position: relative; animation: slideUp 0.2s ease; }
.kb-card:last-child { margin-bottom: 0; }
.kb-card-text { font-size: 14px; color: var(--text); line-height: 1.4; word-wrap: break-word; margin-bottom: 12px; }

/* Card Actions */
.kb-actions { display: flex; gap: 6px; justify-content: flex-end; }
.kb-btn { background: var(--surface2); border: none; color: var(--text2); width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; transition: all 0.15s; }
.kb-btn:hover { background: var(--accent); color: white; }
.kb-btn-del:hover { background: var(--red); color: white; }

.kb-empty { text-align: center; padding: 32px 16px; color: var(--text3); font-size: 13px; font-style: italic; border: 1.5px dashed var(--border); border-radius: 8px; margin-top: auto; }
`;
    document.head.appendChild(s);
  }

  function _load() {
    return Store.get('kanban_' + _uid) || JSON.parse(JSON.stringify(defaultData));
  }

  function _save(data) {
    Store.set('kanban_' + _uid, data);
  }

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  function render() {
    if (!_shell) return;
    const data = _load();

    const cols = [
      { id: 'todo',  title: 'Pemerhatian 💡', emoji: '💡', list: data.todo || [] },
      { id: 'doing', title: 'Sedang Dibuat ⏳', emoji: '⏳', list: data.doing || [] },
      { id: 'done',  title: 'Selesai ✅',     emoji: '✅', list: data.done || [] }
    ];

    let html = `
      <div class="kb-wrap">
        <div class="kb-add-row">
          <input type="text" id="kbNewInput" class="kb-input" placeholder="Tambah tugasan baru..." onkeydown="if(event.key==='Enter') Kanban.addTask()">
          <button class="btn-latih btn-primary" onclick="Kanban.addTask()">+</button>
        </div>
        <div class="kb-cols">
    `;

    cols.forEach((col, cIdx) => {
      html += `
        <div class="kb-col">
          <div class="kb-col-head">
            <div class="kb-col-title">${col.title} <span class="kb-count">${col.list.length}</span></div>
          </div>
          <div class="kb-cards">`;
          
      if (col.list.length === 0) {
        html += `<div class="kb-empty">Kosong</div>`;
      } else {
        col.list.forEach((task, tIdx) => {
          html += `
            <div class="kb-card">
              <div class="kb-card-text">${escHtml(task.text)}</div>
              <div class="kb-actions">
                ${cIdx > 0 ? `<button class="kb-btn" onclick="Kanban.moveTask('${col.id}', ${tIdx}, -1)" title="Pindah kiri">←</button>` : ''}
                ${cIdx < cols.length - 1 ? `<button class="kb-btn" onclick="Kanban.moveTask('${col.id}', ${tIdx}, 1)" title="Pindah kanan">→</button>` : ''}
                <button class="kb-btn kb-btn-del" onclick="Kanban.delTask('${col.id}', ${tIdx})" style="margin-left:auto;" title="Padam">✕</button>
              </div>
            </div>`;
        });
      }

      html += `
          </div>
        </div>`;
    });

    html += `
        </div>
      </div>`;

    // Keep the "Tugasan" header intact, only replace inner container
    let container = document.getElementById('kbContainer');
    if (!container) {
      _shell.innerHTML = `
        <div class="section-head">
          <h2>Tugasan</h2>
          <p>Urus kerja sekolah dan ulang kaji anda di sini.</p>
        </div>
        <div id="kbContainer"></div>
      `;
      container = document.getElementById('kbContainer');
    }
    container.innerHTML = html;
  }

  /* ══════════════════════════════════════════════════════
     ACTIONS
  ══════════════════════════════════════════════════════ */
  function addTask() {
    const input = document.getElementById('kbNewInput');
    const text = input.value.trim();
    if (!text) return;

    Sound.tap();
    const data = _load();
    if (!data.todo) data.todo = [];
    data.todo.push({ id: 'kb_' + Date.now(), text });
    
    _save(data);
    Sound.save();
    render();
  }

  function moveTask(colId, idx, dir) {
    Sound.tap();
    const data = _load();
    const lists = ['todo', 'doing', 'done'];
    const currentListIdx = lists.indexOf(colId);
    if (currentListIdx === -1) return;

    const newListIdx = currentListIdx + dir;
    if (newListIdx < 0 || newListIdx >= lists.length) return;

    const sourceList = data[colId];
    const targetList = data[lists[newListIdx]];

    const task = sourceList.splice(idx, 1)[0];
    if (task) {
      if (!targetList) data[lists[newListIdx]] = [];
      data[lists[newListIdx]].push(task);
      _save(data);
      render();
    }
  }

  function delTask(colId, idx) {
    Sound.tap();
    const data = _load();
    if (data[colId]) {
      data[colId].splice(idx, 1);
      _save(data);
      render();
    }
  }

  /* ── API ────────────────────────────────────────────── */
  return { init, render, addTask, moveTask, delTask };
})();
