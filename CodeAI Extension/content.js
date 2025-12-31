
function removeHost() {
  const host = document.getElementById('codeai-host');
  try { if (host) host.remove(); } catch (e) {}
}

function getOrCreateHost() {
  let host = document.getElementById('codeai-host');
  if (host) return host;

  host = document.createElement('div');
  host.id = 'codeai-host';
  host.style.all = 'initial';
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'auto';
  document.documentElement.appendChild(host);
  return host;
}

function createFloatingPanel() {
  const host = getOrCreateHost();

  if (host.shadowRoot && host.shadowRoot.getElementById('codeai-panel')) return;

  const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });

  const wrapper = document.createElement('div');
  wrapper.id = 'codeai-panel';
  wrapper.style.pointerEvents = 'auto'; // enable interactions inside panel

  const css = `
    :host { all: initial; }
    #codeai-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 360px;
      height: 420px;
      display: flex;
      flex-direction: column;
      border-radius: 10px;
      overflow: hidden;
      font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      background: #0f1416;
      color: #e6eef8;
      border: 1px solid rgba(255,255,255,0.06);
    }

    .header {
      display:flex;
      align-items:center;
      gap:12px;
      padding:12px 14px;
      background: rgba(255,255,255,0.02);
      min-height:48px;
    }

    .brand {
      display:flex;
      align-items:center;
      gap:10px;
    }

    .brand .logo {
      width:28px;
      height:28px;
      border-radius:6px;
      background: linear-gradient(180deg,#0b3b61,#0a2636);
      display:inline-flex;
      align-items:center;
      justify-content:center;
      box-shadow: inset 0 -2px 6px rgba(0,0,0,0.3);
    }

    .brand .logo svg { width:16px; height:16px; }

    .title {
      font-weight:700;
      font-size:15px;
      color: #e6eef8;
    }

    .close {
      margin-left: auto;
      background: transparent;
      border: none;
      color: #bfc8d1;
      font-size:14px;
      cursor: button;
      padding: 6px;
      line-height:1;
    }
    .close:hover { color: #fff; }

    .sep-full { height:1px; background: rgba(255,255,255,0.06); width:100%; }

    .tabs-row { display:flex; width:100%; align-items:center; padding:10px 12px; gap:6px; box-sizing: border-box; }
    .tabs { display:flex; gap:6px; width:100%; }
    .tab {
      display:flex;
      align-items:center;
      gap:8px;
      padding:6px 8px;
      border-radius:6px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: #9aa3ab;
      font-weight: 400;
      font-size:14px;
      min-width: 0;
      text-align:left;
    }
    .tab svg { width:16px; height:16px; opacity:0.95; }
    .tab.active { color: #29a8ff; }
    .tabs-underline { height:2px; background: rgba(255,255,255,0.06); width:100%; }

    .body-wrap { display:flex; flex-direction:column; flex:1; overflow: hidden; }
    .body-inner {
      padding:16px;
      flex:1;
      overflow:auto;
      line-height:1.6;
      color: #dbe6ef;
      background: transparent;
      font-size: 12px;
    }

    /* Recent row (clickable) */
    .recent { border-top: 1px solid rgba(255,255,255,0.04); padding:10px 16px; font-size:13px; color: #98a3ab; cursor:pointer; display:flex; justify-content:space-between; align-items:center; }
    .recent .label { display:flex; gap:8px; align-items:center; font-weight:700; color:inherit; }
    .recent .label svg { width:16px; height:16px; opacity:0.95; stroke: currentColor; }
    .recent .time { font-size:11px; font-weight:400; color: inherit; opacity: 0.9; }

    @media (max-width:420px) { #codeai-panel { left:10px; right:10px; width: auto; } }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  shadow.appendChild(styleEl);

  wrapper.innerHTML = `
    <div class="header">
      <div class="brand">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 7.5L4 12l4.5 4.5" stroke="#8FD0FF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5 7.5L20 12l-4.5 4.5" stroke="#8FD0FF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="title">CodeAI</div>
      </div>
      <button class="close" title="Close">✕</button>
    </div>

    <div class="sep-full"></div>

    <div class="tabs-row">
      <div class="tabs" role="tablist" aria-label="CodeAI tabs">
        <button class="tab active" data-tab="explain"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C7.03 2 3 5.58 3 10c0 2.63 1.4 4.98 3.7 6.5L6 22l5.1-2.4c.6.1 1.2.2 1.9.2 4.97 0 9-3.58 9-8s-4.03-8-9-8z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg> <span>Explain</span></button>
        <button class="tab" data-tab="output"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12h12M10 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> <span>Output</span></button>
        <button class="tab" data-tab="errors"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 17h.01" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg> <span>Errors</span></button>
        <button class="tab" data-tab="improve"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> <span>Improve</span></button>
      </div>
    </div>

    <div class="tabs-underline"></div>

    <div class="body-wrap">
      <div class="body-inner" id="codeai-content">
        Select code and right-click to see results here.
      </div>

      <div class="recent" id="recent-row" title="Open recent queries">
        <div class="label">
          <!-- small external/minimal clock icon (updated) -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M12 7v6l4 2" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke-width="1.2" /></svg>
          <span>Recent Queries</span>
        </div>
        <div class="time">›</div>
      </div>
    </div>
  `;

  shadow.appendChild(wrapper);

  // event wiring
  const closeBtn = shadow.querySelector('.close');
  if (closeBtn) closeBtn.addEventListener('click', () => { removeHost(); });

  const tabsEls = shadow.querySelectorAll('.tab');
  tabsEls.forEach(btn => {
    btn.addEventListener('click', () => {
      tabsEls.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      const content = shadow.getElementById('codeai-content');
      if (content) {
        content.dataset.currentTab = tab;
        content.textContent = 'Waiting for AI response...';
      }
    });
  });

  // clicking Recent opens history panel
  const recentRow = shadow.getElementById('recent-row');
  if (recentRow) {
    recentRow.addEventListener('click', () => {
      removeHost();
      createHistoryPanel();
    });
  }

  // Apply saved theme with light as default
  chrome.storage.sync.get(['theme'], ({ theme }) => {
    const panelEl = shadow.getElementById('codeai-panel');
    const title = shadow.querySelector('.title');
    const body = shadow.querySelector('.body-inner');
    const sepFull = shadow.querySelector('.sep-full');
    const tabsUnderline = shadow.querySelector('.tabs-underline');
    const recentSep = shadow.querySelector('.recent');

    if (!panelEl || !title || !body) return;

    if (!theme) theme = 'light';

    if (theme === 'light') {
      panelEl.style.background = 'linear-gradient(180deg,#ffffff,#f7f9fb)';
      panelEl.style.color = '#000000';
      const header = shadow.querySelector('.header');
      if (header) header.style.background = 'transparent';
      const activeTab = shadow.querySelector('.tab.active');
      if (activeTab) activeTab.style.color = '#0b66ff';
      title.style.color = '#000000';
      body.style.color = '#000000';
      shadow.querySelectorAll('.tab').forEach(t => {
        if (!t.classList.contains('active')) t.style.color = '#6b7280';
      });
      if (sepFull) sepFull.style.background = 'rgba(0,0,0,0.1)';
      if (tabsUnderline) tabsUnderline.style.background = 'rgba(0,0,0,0.15)';
      if (recentSep) recentSep.style.borderTop = '1px solid rgba(0,0,0,0.1)';
    } else { // dark
      panelEl.style.background = '#0f1416';
      panelEl.style.color = '#e6eef8';
      const activeTab = shadow.querySelector('.tab.active');
      if (activeTab) activeTab.style.color = '#29a8ff';
      title.style.color = '#ffffff';
      body.style.color = '#ffffff';
      shadow.querySelectorAll('.tab').forEach(t => {
        if (!t.classList.contains('active')) t.style.color = '#9aa3ab';
      });
      if (sepFull) sepFull.style.background = 'rgba(255,255,255,0.06)';
      if (tabsUnderline) tabsUnderline.style.background = 'rgba(255,255,255,0.06)';
      if (recentSep) recentSep.style.borderTop = '1px solid rgba(255,255,255,0.06)';
    }
  });

  // live theme updates
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    const rootShadow = document.getElementById('codeai-host')?.shadowRoot;
    if (!rootShadow) return;
    const panelEl = rootShadow.getElementById('codeai-panel');
    const title = rootShadow.querySelector('.title');
    const body = rootShadow.querySelector('.body-inner');
    if (!panelEl || !title || !body) return;

    if (changes.theme) {
      const newTheme = changes.theme.newValue;
      if (newTheme === 'light') {
        panelEl.style.background = 'linear-gradient(180deg,#ffffff,#f7f9fb)';
        panelEl.style.color = '#000000';
        const activeTab = rootShadow.querySelector('.tab.active');
        if (activeTab) activeTab.style.color = '#0b66ff';
        title.style.color = '#000000';
        body.style.color = '#000000';
        rootShadow.querySelectorAll('.tab').forEach(t => {
          if (!t.classList.contains('active')) t.style.color = '#6b7280';
        });
      } else {
        panelEl.style.background = '#0f1416';
        panelEl.style.color = '#e6eef8';
        const activeTab = rootShadow.querySelector('.tab.active');
        if (activeTab) activeTab.style.color = '#29a8ff';
        title.style.color = '#ffffff';
        body.style.color = '#ffffff';
        rootShadow.querySelectorAll('.tab').forEach(t => {
          if (!t.classList.contains('active')) t.style.color = '#9aa3ab';
        });
      }
    }
  });
}

// ---------- HISTORY PANEL ----------
function createHistoryPanel() {
  removeHost();
  const host = getOrCreateHost();
  const shadow = host.attachShadow({ mode: 'open' });

  const css = `
    :host { all: initial; }
    .history-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 360px;
      max-width: calc(100% - 40px);
      max-height: calc(100vh - 40px);
      height: auto;
      display:flex;
      flex-direction:column;
      border-radius: 10px;
      overflow: hidden;
      font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
      box-shadow: 0 10px 30px rgba(0,0,0,0.45);
      background: linear-gradient(180deg,#0f1416,#0a0d0f);
      color: #e6eef8;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .history-panel.light {
      background: linear-gradient(180deg,#ffffff,#f7f9fb);
      color: #0b1220;
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 12px 30px rgba(9,20,30,0.08);
    }
    .history-header { display:flex; align-items:center; gap:12px; padding:12px 14px; background: rgba(255,255,255,0.02); min-height:48px; }
    .history-header .title { font-weight:700; font-size:15px; display:flex; gap:10px; align-items:center; color:inherit; }
    .history-close { margin-left:auto; background:transparent; border:none; font-size:14px; cursor:pointer; color:inherit; padding:6px; line-height:1; }
    .history-list { overflow:auto; padding:12px; display:flex; flex-direction:column; gap:10px; }

    .history-row { border-radius:8px; padding:10px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); cursor:pointer; overflow: visible; transition: transform .08s ease, box-shadow .08s ease; }
    .history-row:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
    .history-panel.light .history-row { background: rgba(243,246,251,0.9); border: 1px solid rgba(0,0,0,0.04); color: #0b1220; }

    .row-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:12px; }
    .row-action { display:flex; gap:8px; align-items:center; font-weight:700; font-size:13px; color:#29a8ff; }
    .history-panel.light .row-action { color:#0b66ff; }
    .row-action svg { width:18px; height:18px; flex:0 0 auto; }

    .row-code { background: rgba(255,255,255,0.02); padding:8px; border-radius:6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:13px; color:inherit; border: 1px solid rgba(255,255,255,0.03); }
    .history-panel.light .row-code { background: rgba(247,249,251,0.95); color:#111; border: 1px solid rgba(0,0,0,0.04); }

    .row-result { color: #9aa3ab; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:8px; }
    .history-panel.light .row-result { color:#6b7280; }

    .row-meta { font-size:11px; font-weight:400; color:#9aa3ab; }

    @media (max-width:420px) { .history-panel { left:10px; right:10px; width: auto; max-width: calc(100% - 20px); } }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  shadow.appendChild(style);

  const container = document.createElement('div');
  container.className = 'history-panel';
  container.id = 'history-panel';
  container.innerHTML = `
    <div class="history-header">
      <div class="title">
  <svg class="history-back" viewBox="0 0 24 24" width="18" height="18"
       fill="none" stroke="currentColor"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19l-7-7 7-7"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"/>
  </svg>
  <span>Recent Queries</span>
</div>

      <button class="history-close" title="Close">✕</button>
    </div>
    <div class="history-list" id="history-list">
      <div style="padding:14px;text-align:center;color:#9aa3ab">Loading...</div>
    </div>
  `;
  shadow.appendChild(container);

  const panelEl = shadow.getElementById('history-panel');
  if (panelEl) {
    panelEl.style.boxSizing = 'border-box';
    panelEl.style.width = '360px';
    panelEl.style.maxWidth = 'calc(100% - 40px)';
  }

  const closeBtn = shadow.querySelector('.history-close');
  if (closeBtn) closeBtn.addEventListener('click', () => { removeHost(); });

  const backIcon = shadow.querySelector('.history-back');
  if (backIcon) {
    backIcon.style.cursor = 'pointer';
    backIcon.addEventListener('click', () => {
      removeHost();
      createFloatingPanel();
    });
  }

  chrome.storage.sync.get(['theme'], ({ theme }) => {
    const panel = shadow.getElementById('history-panel');
    if (!panel) return;
    if (theme === 'dark') {
      panel.classList.remove('light');
    } else {
      panel.classList.add('light');
    }
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    const panel = shadow.getElementById('history-panel');
    if (!panel) return;
    if (changes.theme) {
      if (changes.theme.newValue === 'dark') panel.classList.remove('light');
      else panel.classList.add('light');
    }
  });

  // load history stored locally
  chrome.storage.local.get(['codeai_history'], (res) => {
    const history = (res && res.codeai_history) ? res.codeai_history : [];
    const list = shadow.getElementById('history-list');
    list.innerHTML = '';
    if (!history || history.length === 0) {
      list.innerHTML = `<div style="padding:14px;text-align:center;color:#9aa3ab">No recent queries</div>`;
      return;
    }

    // ensure newest-first 
    const items = history.slice().sort((a,b) => (Number(b.time)||0) - (Number(a.time)||0));

    items.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'history-row';

      const icon = (entry.action === 'errors') ?
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v4" stroke-width="1.6" stroke-linecap="round"/><path d="M12 17h.01" stroke-width="1.6" stroke-linecap="round"/></svg>` :
        (entry.action === 'output') ?
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M4 12h12M10 6l6 6-6 6" stroke-width="1.6" stroke-linecap="round"/></svg>` :
        (entry.action === 'improve') ?
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke-width="1.6"/></svg>` :
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C7.03 2 3 5.58 3 10c0 2.63 1.4 4.98 3.7 6.5L6 22l5.1-2.4" stroke-width="1.4"/></svg>`;

      const rowTop = document.createElement('div');
      rowTop.className = 'row-top';
      rowTop.innerHTML = `<div class="row-action">${icon}<span style="margin-left:6px; font-weight:700; font-size:13px;">${(entry.action||'explain').toUpperCase()}</span></div><div class="row-meta">${timeAgo(entry.time||Date.now())}</div>`;

      const rowCode = document.createElement('div');
      rowCode.className = 'row-code';
      rowCode.textContent = entry.code || '';

      const rowResult = document.createElement('div');
      rowResult.className = 'row-result';
      rowResult.textContent = (entry.result || '').replace(/\s+/g,' ').trim();

      row.appendChild(rowTop);
      row.appendChild(rowCode);
      row.appendChild(rowResult);

      row.addEventListener('click', () => {
        removeHost();
        createHistoryDetailPanel(entry);
      });

      list.appendChild(row);
    });
  });
}


// detail panel 
function createHistoryDetailPanel(entry) {
  removeHost();
  const host = getOrCreateHost();
  const shadow = host.attachShadow({ mode: 'open' });

  const css = `
    :host { all: initial; }
    .detail-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 360px;
      max-width: calc(100% - 40px);
      height: auto;
      max-height: calc(100vh - 40px);
      display:flex;
      flex-direction:column;
      border-radius: 10px;
      overflow: hidden;
      font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
      box-shadow: 0 10px 30px rgba(0,0,0,0.45);
      background: linear-gradient(180deg,#0f1416,#0a0d0f);
      color: #e6eef8;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .detail-panel.light { background: linear-gradient(180deg,#ffffff,#f7f9fb); color: #0b1220; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 12px 30px rgba(9,20,30,0.08); }

    .detail-header { display:flex; align-items:center; gap:12px; padding:12px 14px; min-height:48px; background: rgba(255,255,255,0.02); }
    .detail-back { background:transparent; border:none; padding:6px; cursor:pointer; color:inherit; font-size:14px; line-height:1; display:flex; align-items:center; justify-content:center; }
    /* title inherits color, but we explicitly set it to blue for action types via class */
    .detail-title { font-weight:700; display:flex; gap:8px; align-items:center; font-size:14px; color:inherit; }
    .detail-close { margin-left:auto; background:transparent; border:none; padding:6px; cursor:pointer; color:inherit; font-size:14px; line-height:1; }

    /* action-specific title color (blue) */
    .detail-panel.action-errors .detail-title,
    .detail-panel.action-output .detail-title,
    .detail-panel.action-improve .detail-title,
    .detail-panel.action-explain .detail-title {
      color: #29a8ff;
    }
    /* light theme variant for blue */
    .detail-panel.light.action-errors .detail-title,
    .detail-panel.light.action-output .detail-title,
    .detail-panel.light.action-improve .detail-title,
    .detail-panel.light.action-explain .detail-title {
      color: #0b66ff;
    }

    .detail-body { padding:12px; overflow:auto; max-height: calc(100vh - 140px); box-sizing: border-box; }

    .detail-code {
      background: rgba(255,255,255,0.02);
      padding:12px;
      border-radius:8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
      white-space:pre-wrap;
      word-break:break-word;
      color:inherit;
      font-size:13px;
      border: 1px solid rgba(255,255,255,0.04);
      overflow-wrap: anywhere;
    }
    .detail-panel.light .detail-code { background: rgba(243,246,251,0.95); color:#111; border: 1px solid rgba(0,0,0,0.04); }

    .detail-result { color:#9aa3ab; margin-top:12px; white-space:pre-wrap; word-break:break-word; font-size:13px; overflow-wrap: anywhere; }
    .detail-panel.light .detail-result { color:#374151; }

    @media (max-width:420px) { .detail-panel { left:10px; right:10px; width: auto; max-width: calc(100% - 20px); } }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  shadow.appendChild(style);

  const icon = (entry.action === 'errors') ?
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v4" stroke-width="1.6" stroke-linecap="round"/><path d="M12 17h.01" stroke-width="1.6" stroke-linecap="round"/></svg>` :
    (entry.action === 'output') ?
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M4 12h12M10 6l6 6-6 6" stroke-width="1.6" stroke-linecap="round"/></svg>` :
    (entry.action === 'improve') ?
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke-width="1.6"/></svg>` :
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C7.03 2 3 5.58 3 10c0 2.63 1.4 4.98 3.7 6.5L6 22l5.1-2.4" stroke-width="1.4"/></svg>`;

  const container = document.createElement('div');
  container.className = 'detail-panel';
  const actionClass = `action-${(entry.action||'explain')}`;
  container.classList.add(actionClass);
  container.id = 'detail-panel';
  container.innerHTML = `
    <div class="detail-header">
      <button class="detail-back" title="Back">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M15 19l-7-7 7-7" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="detail-title">${icon}<span>${(entry.action||'Explain').toUpperCase()}</span></div>
      <button class="detail-close" title="Close">✕</button>
    </div>
    <div class="detail-body">
      <div style="font-size:12px;color:#6b7280;margin-bottom:8px">SELECTED CODE</div>
      <div class="detail-code" id="detail-code"></div>

      <div style="font-size:12px;color:#6b7280;margin-top:12px">RESULT</div>
      <div class="detail-result" id="detail-result"></div>
    </div>
  `;
  shadow.appendChild(container);

  const panel = shadow.getElementById('detail-panel');
  if (panel) {
    panel.style.boxSizing = 'border-box';
    panel.style.width = '360px';
    panel.style.maxWidth = 'calc(100% - 40px)';
  }

  const codeEl = shadow.getElementById('detail-code');
  const resultEl = shadow.getElementById('detail-result');
  const closeBtn = shadow.querySelector('.detail-close');
  const backBtn = shadow.querySelector('.detail-back');

  codeEl.textContent = entry.code || '';
  resultEl.textContent = entry.result || '';

  if (closeBtn) closeBtn.addEventListener('click', () => removeHost());
  if (backBtn) backBtn.addEventListener('click', () => {
    removeHost();
    createHistoryPanel();
  });

  chrome.storage.sync.get(['theme'], ({ theme }) => {
    if (!panel) return;
    if (theme === 'dark') panel.classList.remove('light');
    else panel.classList.add('light');
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    const panel2 = shadow.getElementById('detail-panel');
    if (!panel2) return;
    if (changes.theme) {
      if (changes.theme.newValue === 'dark') panel2.classList.remove('light');
      else panel2.classList.add('light');
    }
  });
}


function timeAgo(ts) {
  try {
    const s = Math.floor((Date.now() - (Number(ts) || Date.now()))/1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s/60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m/60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h/24);
    return `${d}d`;
  } catch (e) { return '';}
}

function ensurePanelAndShowContent(text) {
  const host = document.getElementById('codeai-host');
  const panelExists = host && host.shadowRoot && host.shadowRoot.getElementById('codeai-panel');
  if (!panelExists) createFloatingPanel();

  setTimeout(() => {
    const host2 = document.getElementById('codeai-host');
    const content = host2?.shadowRoot?.getElementById('codeai-content');
    if (content) content.textContent = text;
  }, 50);
}


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'openPanel') {
    createFloatingPanel();
  }

  if (msg.action === 'showAIResult') {
    const tabName = msg.tab || null;
    ensurePanelAndShowContent(msg.content || '');
if (tabName) {
  setTimeout(() => {
    const host2 = document.getElementById('codeai-host');
    const shadow = host2?.shadowRoot;
    if (!shadow) return;

    const tabsEls = shadow.querySelectorAll('.tab');
    tabsEls.forEach(btn => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle('active', isActive);

      // dynamically set color based on active 
      const panelEl = shadow.getElementById('codeai-panel');
      const theme = panelEl?.style.background?.includes('#ffffff') ? 'light' : 'dark';

      if (isActive) {
        btn.style.color = theme === 'light' ? '#0b66ff' : '#29a8ff';
      } else {
        btn.style.color = theme === 'light' ? '#6b7280' : '#9aa3ab';
      }
    });
  }, 70);
}

  }

  return true; 
});
// Bridge between website and extension
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (!event.data?.type) return;

  if (event.data.type === "GET_LOCAL_USAGE") {
    chrome.runtime.sendMessage(
      { action: "GET_LOCAL_USAGE" },
      (response) => {
        window.postMessage(
          {
            type: "LOCAL_USAGE_RESPONSE",
            history: response?.history || []
          },
          "*"
        );
      }
    );
  }

  if (event.data.type === "CLEAR_LOCAL_USAGE") {
    chrome.runtime.sendMessage(
      { action: "CLEAR_LOCAL_USAGE" },
      () => {}
    );
  }
});
