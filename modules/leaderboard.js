/**
 * modules/leaderboard.js
 * Student Global Leaderboard display.
 * Requires: assets/js/latih.js
 */

const Leaderboard = (() => {
  let _ready = false;
  let _shell = null;

  /* ══════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════ */
  function init(mountId) {
    _shell = document.getElementById(mountId);
    if (!_shell) return;
    
    if (!_ready) {
      _ready = true;
      _injectCSS();
    }
    render();
  }

  /* ── CSS ──────────────────────────────────────────── */
  function _injectCSS() {
    if (document.getElementById('lb-css')) return;
    const s = document.createElement('style');
    s.id = 'lb-css';
    s.textContent = `
.lb-wrap { animation: fadeIn 0.2s ease; }
.lb-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
.lb-head h2 { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: var(--text); margin-bottom: 4px; }
.lb-head p { font-size: 13px; color: var(--text3); }

/* Podium - Top 3 */
.lb-podium { display: flex; align-items: flex-end; justify-content: center; gap: 12px; margin-bottom: 32px; padding: 0 10px; height: 180px; }
.lb-p-col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; flex: 1; max-width: 110px; position: relative; }
.lb-p-avatar { display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; font-weight: 700; box-shadow: var(--shadow); z-index: 2; border: 3px solid var(--surface); position: relative; }

/* Podium Details */
.lb-p-name { font-size: 13px; font-weight: 700; color: var(--text); margin-top: 8px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
.lb-p-score { font-size: 12px; font-weight: 800; color: var(--text2); }
.lb-p-score span { font-size: 9px; color: var(--text3); font-weight: 600; text-transform: uppercase; }

/* Podium Ranks styling */
.lb-p-1 { height: 100%; }
.lb-p-1 .lb-p-avatar { width: 72px; height: 72px; font-size: 28px; border-color: #FBBF24; } /* Gold */
.lb-p-1 .lb-p-rank { position: absolute; bottom: -8px; background: #FBBF24; color: #78350F; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.lb-p-1 .lb-p-name { font-size: 15px; color: var(--text); } /* larger name for 1st */
.lb-p-1 .lb-p-score { color: #D97706; font-size: 14px; }

.lb-p-2 { height: 85%; }
.lb-p-2 .lb-p-avatar { width: 56px; height: 56px; font-size: 22px; border-color: #9CA3AF; } /* Silver */
.lb-p-2 .lb-p-rank { position: absolute; bottom: -6px; background: #9CA3AF; color: #1F2937; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.lb-p-2 .lb-p-score { color: #4B5563; }

.lb-p-3 { height: 75%; }
.lb-p-3 .lb-p-avatar { width: 56px; height: 56px; font-size: 22px; border-color: #D97706; } /* Bronze */
.lb-p-3 .lb-p-rank { position: absolute; bottom: -6px; background: #D97706; color: #FFF; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.lb-p-3 .lb-p-score { color: #B45309; }

/* List - Remaining Ranks */
.lb-list { display: flex; flex-direction: column; gap: 8px; }
.lb-row { display: flex; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; gap: 14px; transition: transform 0.15s; }
.lb-row:active { transform: scale(0.98); }
.lb-row.is-me { border-color: var(--accent); background: var(--accent-light); }
.lb-r-num { width: 24px; font-size: 14px; font-weight: 800; color: var(--text3); text-align: center; font-family: 'DM Serif Display', serif; }
.lb-row.is-me .lb-r-num { color: var(--accent); }
.lb-r-info { flex: 1; min-width: 0; }
.lb-r-name { font-size: 14px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px; }
.lb-r-meta { font-size: 11px; color: var(--text3); margin-top: 2px; }
.lb-r-score { font-size: 16px; font-weight: 800; color: var(--accent); text-align: right; }
.lb-r-score span { font-size: 10px; font-weight: 600; color: var(--text3); }

/* Empty state */
.lb-empty { text-align: center; padding: 48px 24px; color: var(--text3); background: var(--surface); border: 1.5px dashed var(--border); border-radius: 16px; }
`;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  function render() {
    if (!_shell) return;
    
    // Always call updateLeaderboard() first to ensure it's fresh
    if (typeof updateLeaderboard === 'function') updateLeaderboard();
    
    const board = Store.get('leaderboard') || [];
    const _uid = Store.currentUser();

    let html = `
      <div class="lb-wrap">
        <div class="lb-head">
          <div>
            <h2>Papan Markah</h2>
            <p>Kedudukan terkini kelas.</p>
          </div>
          <button class="btn-latih btn-secondary btn-sm" onclick="Leaderboard.refresh()">↻ Segar semula</button>
        </div>`;

    if (board.length === 0) {
      html += `
        <div class="lb-empty">
          <div style="font-size:2.5rem;margin-bottom:12px;">🏆</div>
          <div style="font-size:14px;font-weight:600;color:var(--text2);margin-bottom:4px;">Belum ada markah</div>
          <div style="font-size:13px;">Papan markah akan dikemaskini apabila ujian pertama disiapkan.</div>
        </div>
      </div>`;
      _shell.innerHTML = html;
      return;
    }

    // --- PODIUM (Top 3) ---
    // Make sure we have enough padded data for the podium to render layout correctly
    const top1 = board[0];
    const top2 = board[1];
    const top3 = board[2];

    html += `<div class="lb-podium">`;
    // 2nd Place (Left)
    if (top2) html += _renderPodiumSlot(top2, 2); else html += `<div class="lb-p-col"></div>`;
    // 1st Place (Center)
    if (top1) html += _renderPodiumSlot(top1, 1);
    // 3rd Place (Right)
    if (top3) html += _renderPodiumSlot(top3, 3); else html += `<div class="lb-p-col"></div>`;
    html += `</div>`;

    // --- LIST (Rank 4+) ---
    if (board.length > 3) {
      html += `<div class="lb-list">`;
      for (let i = 3; i < board.length; i++) {
        const u = board[i];
        const isMe = u.user_id === _uid;
        const initial = escHtml(u.name.charAt(0).toUpperCase());
        
        html += `
          <div class="lb-row ${isMe ? 'is-me' : ''}">
            <div class="lb-r-num">${i + 1}</div>
            <div class="avatar avatar-sm" style="background:${u.avatar_color || 'var(--accent)'};flex-shrink:0;">${initial}</div>
            <div class="lb-r-info">
              <div class="lb-r-name">${escHtml(u.name)} ${isMe ? '<span class="badge-latih badge-accent" style="font-size:9px;padding:1px 4px;">SAYA</span>' : ''}</div>
              <div class="lb-r-meta">${u.papers_done} kertas dibuat · Terbaik: ${escHtml(u.best_subject)}</div>
            </div>
            <div class="lb-r-score">${u.avg_pct}<span>%</span></div>
          </div>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
    _shell.innerHTML = html;
  }

  function _renderPodiumSlot(u, rank) {
    const initial = escHtml(u.name.charAt(0).toUpperCase());
    const firstName = escHtml(u.name.split(' ')[0]);
    return `
      <div class="lb-p-col lb-p-${rank}">
        <div class="lb-p-avatar" style="background:${u.avatar_color || 'var(--accent)'};">
          ${initial}
          <div class="lb-p-rank">${rank}</div>
        </div>
        <div class="lb-p-name">${firstName}</div>
        <div class="lb-p-score">${u.avg_pct}<span>%</span></div>
      </div>`;
  }

  function refresh() {
    Sound.tap();
    render();
  }

  /* ── API ────────────────────────────────────────────── */
  return { init, render, refresh };
})();
