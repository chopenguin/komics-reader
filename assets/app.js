/* ============================================================
   小漫畫書房 — 閱讀器邏輯（純前端，無需建置）
   ============================================================ */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const escapeHtml = (s = '') => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

const getWork = id => WORKS.find(w => w.id === id);
const getCategory = id => CATEGORIES.find(c => c.id === id);

/* ---------- 閱讀進度 ---------- */
const PROGRESS_KEY = 'komics-reader-progress';

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); }
  catch { return {}; }
}
function getProgress(id) { return loadProgress()[id] || 0; }
function saveProgress(id, page) {
  const all = loadProgress();
  all[id] = page;
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(all)); } catch { /* 無痕模式忽略 */ }
}

/* ---------- 路由 ---------- */
function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'read' && parts[1]) {
    const work = getWork(parts[1]);
    if (work) return { view: 'reader', work, page: parseInt(parts[2], 10) || 0 };
  }
  return { view: 'library' };
}

const state = { category: 'all', query: '', reader: null };

function render() {
  const route = parseRoute();
  document.body.classList.toggle('is-reading', route.view === 'reader');
  if (route.view === 'reader') renderReader(route);
  else renderLibrary();
}

/* ============================================================
   書架
   ============================================================ */

function visibleWorks() {
  const q = state.query.trim().toLowerCase();
  return WORKS.filter(w => {
    const matchCat = state.category === 'all' || w.category === state.category;
    const haystack = [w.title, w.originalTitle, w.author, w.description, ...(w.tags || []), getCategory(w.category)?.name || ''].join(' ').toLowerCase();
    return matchCat && (!q || haystack.includes(q));
  });
}

function cardHtml(work) {
  const cat = getCategory(work.category);
  const progress = getProgress(work.id);
  const pct = Math.round((progress + 1) / work.pages.length * 100);
  const continueText = progress > 0 && progress < work.pages.length - 1 ? `讀到第 ${progress + 1} 頁` : (progress >= work.pages.length - 1 ? '已讀完' : '');
  return `
    <article class="work-card" data-work="${escapeHtml(work.id)}" tabindex="0" role="link" aria-label="閱讀 ${escapeHtml(work.title)}">
      <div class="cover">
        <img src="${escapeHtml(work.pages[0])}" alt="${escapeHtml(work.title)} 封面" loading="lazy">
        <div class="cover-top">
          <span class="cover-tag">${cat ? cat.icon + ' ' + escapeHtml(cat.name) : '未分類'}</span>
        </div>
        <div class="cover-bottom">
          <span class="read-badge">${continueText || '開始閱讀'}</span>
          <span class="cover-tag pages">${work.pages.length} 頁</span>
        </div>
        ${progress > 0 ? `<div class="progress-line"><i style="width:${pct}%"></i></div>` : ''}
      </div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(work.title)}</div>
        <div class="card-original">原標題：${escapeHtml(work.originalTitle || '—')}</div>
        <p class="card-desc">${escapeHtml(work.description || '')}</p>
        <div class="card-meta">
          <span class="author"><span class="avatar-dot">${escapeHtml((work.author || '?').slice(0, 1))}</span>${escapeHtml(work.author || '佚名')}</span>
          <span class="read-link">閱讀 →</span>
        </div>
      </div>
    </article>`;
}

function renderGrid() {
  const grid = $('#work-grid');
  if (!grid) return;
  const list = visibleWorks();
  grid.innerHTML = list.length
    ? list.map(cardHtml).join('')
    : `<div class="empty"><div>🔍</div><b>找不到作品</b>試試其他分類或搜尋關鍵字。</div>`;
  const counter = $('#result-count');
  if (counter) counter.textContent = `共 ${list.length} 部作品`;
}

function renderLibrary() {
  const usedCats = CATEGORIES.filter(c => WORKS.some(w => w.category === c.id));
  const totalPages = WORKS.reduce((n, w) => n + w.pages.length, 0);

  $('#app').innerHTML = `
    <header class="site-header">
      <a class="brand" href="#/" aria-label="回到書架">
        <img src="assets/icon.svg" alt="">
        <div>
          <div class="brand-name">${escapeHtml(SITE.name)}</div>
          <div class="brand-sub">MANGA READER · GH PAGES</div>
        </div>
      </a>
      <div class="header-spacer"></div>
      <div class="header-stat">藏書 <b>${WORKS.length}</b> 部 · <b>${totalPages}</b> 頁</div>
    </header>

    <main class="library">
      <section class="hero">
        <div class="hero-eyebrow">漫畫收藏 · 隨時翻閱</div>
        <h1>把喜歡的<span>小漫畫</span><br>收進這個書房。</h1>
        <p>${escapeHtml(SITE.subtitle)}。依分類瀏覽、支援中文標題，點開就能一頁一頁慢慢看。</p>
        <div class="stats">
          <div class="stat"><b>${WORKS.length}</b><span>作品數</span></div>
          <div class="stat"><b>${usedCats.length}</b><span>作品分類</span></div>
          <div class="stat"><b>${totalPages}</b><span>漫畫頁數</span></div>
        </div>
      </section>

      <section>
        <div class="section-head">
          <h2 class="section-title">書架 <small id="result-count">共 ${WORKS.length} 部作品</small></h2>
          <label class="search-box">
            <span class="search-icon">⌕</span>
            <input id="search" type="search" placeholder="搜尋標題、作者、標籤…" value="${escapeHtml(state.query)}" autocomplete="off">
          </label>
        </div>

        <div class="categories" id="categories">
          <button class="cat-chip ${state.category === 'all' ? 'active' : ''}" data-cat="all">
            📚 全部 <span class="count">${WORKS.length}</span>
          </button>
          ${usedCats.map(c => `
            <button class="cat-chip ${state.category === c.id ? 'active' : ''}" data-cat="${escapeHtml(c.id)}">
              ${c.icon} ${escapeHtml(c.name)}
              <span class="count">${WORKS.filter(w => w.category === c.id).length}</span>
            </button>`).join('')}
        </div>

        <div class="work-grid" id="work-grid"></div>
      </section>
    </main>

    <footer class="site-footer">${escapeHtml(SITE.name)} · 以 GitHub Pages 部署 · ${escapeHtml(SITE.author)}</footer>`;

  renderGrid();

  $('#categories').addEventListener('click', e => {
    const chip = e.target.closest('.cat-chip');
    if (!chip) return;
    state.category = chip.dataset.cat;
    $$('.cat-chip').forEach(c => c.classList.toggle('active', c === chip));
    renderGrid();
  });

  $('#search').addEventListener('input', e => {
    state.query = e.target.value;
    renderGrid();
  });

  $('#work-grid').addEventListener('click', e => {
    const card = e.target.closest('.work-card');
    if (card) location.hash = `#/read/${card.dataset.work}`;
  });
  $('#work-grid').addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.work-card');
    if (card) { e.preventDefault(); location.hash = `#/read/${card.dataset.work}`; }
  });
}

/* ============================================================
   閱讀器
   ============================================================ */

const ZOOM_MODES = [
  { id: 'fit',    label: '適合視窗' },
  { id: 'width',  label: '適合寬度' },
  { id: 'height', label: '適合高度' },
];

function renderReader(route) {
  const work = route.work;
  const total = work.pages.length;
  const start = route.page > 0 ? route.page - 1 : getProgress(work.id);
  state.reader = {
    work,
    page: clamp(start, 0, total - 1),
    mode: 'single',
    zoom: 0,
  };

  $('#app').innerHTML = `
    <div class="reader">
      <div class="reader-top">
        <a class="back-btn" href="#/" title="返回書架">← <span>書架</span></a>
        <div class="reader-title">
          <b>${escapeHtml(work.title)}</b>
          <span>${escapeHtml(work.originalTitle)} · ${escapeHtml(work.author)}</span>
        </div>
        <div class="reader-tools">
          <button class="mode-btn active" id="mode-btn" title="切換單頁／連續捲動">單頁</button>
          <div class="tool-group">
            <button class="icon-btn" id="zoom-out" title="縮小">−</button>
            <span class="zoom-label" id="zoom-label">適合視窗</span>
            <button class="icon-btn" id="zoom-in" title="放大">＋</button>
          </div>
          <div class="page-indicator" id="page-indicator"></div>
        </div>
      </div>

      <div class="reader-stage zoom-fit" id="stage" tabindex="-1">
        <button class="page-nav prev" id="prev" title="上一頁">‹</button>
        <div class="page-wrap" id="page-wrap"><img id="main-img" alt=""></div>
        <button class="page-nav next" id="next" title="下一頁">›</button>
      </div>

      <div class="reader-bottom">
        <div class="thumb-strip" id="thumbs">
          ${work.pages.map((p, i) => `
            <button class="thumb" data-page="${i}" title="第 ${i + 1} 頁">
              <img src="${escapeHtml(p)}" alt="第 ${i + 1} 頁縮圖" loading="lazy">
              <span>${i + 1}</span>
            </button>`).join('')}
        </div>
        <div class="reader-hint">
          <kbd>←</kbd><kbd>→</kbd> 翻頁 · <kbd>+</kbd><kbd>−</kbd> 縮放 · <kbd>0</kbd> 復原 · <kbd>Esc</kbd> 返回書架 · 手機可左右滑動
        </div>
      </div>
    </div>`;

  const stage = $('#stage');
  const img = $('#main-img');

  img.addEventListener('load', () => $('#page-wrap').classList.remove('loading'));
  img.addEventListener('error', () => {
    const wrap = $('#page-wrap');
    wrap.classList.remove('loading');
    wrap.textContent = '這頁圖片無法載入 😢';
  });

  $('#prev').addEventListener('click', () => setPage(state.reader.page - 1));
  $('#next').addEventListener('click', () => setPage(state.reader.page + 1));

  $('#zoom-in').addEventListener('click', () => setZoom(state.reader.zoom + 1));
  $('#zoom-out').addEventListener('click', () => setZoom(state.reader.zoom - 1));
  $('#zoom-label').addEventListener('click', () => setZoom(0));

  $('#mode-btn').addEventListener('click', toggleMode);

  $('#thumbs').addEventListener('click', e => {
    const thumb = e.target.closest('.thumb');
    if (thumb) setPage(Number(thumb.dataset.page));
  });

  // 滑動翻頁
  let touchX = null, touchY = null;
  stage.addEventListener('touchstart', e => {
    if (state.reader.mode !== 'single') return;
    touchX = e.changedTouches[0].clientX;
    touchY = e.changedTouches[0].clientY;
  }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (touchX === null || state.reader.mode !== 'single') return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      setPage(state.reader.page + (dx < 0 ? 1 : -1));
    }
    touchX = touchY = null;
  }, { passive: true });

  // 連續模式：依捲動位置更新頁碼
  let ticking = false;
  stage.addEventListener('scroll', () => {
    if (state.reader.mode !== 'scroll' || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const wraps = $$('.page-wrap', stage);
      let best = 0, bestDist = Infinity;
      wraps.forEach((w, i) => {
        const d = Math.abs(w.offsetTop - stage.scrollTop - 16);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      if (best !== state.reader.page) setPage(best, { updateUrl: false, scroll: false });
      ticking = false;
    });
  });

  updatePageUI();
  stage.focus({ preventScroll: true });
}

function setZoom(index) {
  const r = state.reader;
  const next = clamp(index, 0, ZOOM_MODES.length - 1);
  if (next === r.zoom) return;
  r.zoom = next;
  const mode = ZOOM_MODES[next];
  const stage = $('#stage');
  stage.classList.remove('zoom-fit', 'zoom-width', 'zoom-height');
  stage.classList.add('zoom-' + mode.id);
  $('#zoom-label').textContent = mode.label;
  stage.scrollTop = 0;
}

function toggleMode() {
  const r = state.reader;
  const btn = $('#mode-btn');
  const stage = $('#stage');
  const wrap = $('#page-wrap');

  if (r.mode === 'single') {
    r.mode = 'scroll';
    btn.textContent = '連續';
    btn.classList.remove('active');
    wrap.style.display = 'none';
    $('#prev').style.display = 'none';
    $('#next').style.display = 'none';
    stage.classList.add('mode-scroll');
    stage.classList.remove('zoom-fit', 'zoom-width', 'zoom-height');
    // 把所有頁一次呈現
    const container = document.createElement('div');
    container.id = 'scroll-pages';
    container.innerHTML = r.work.pages.map((p, i) => `
      <div class="page-wrap" data-page="${i}">
        <img src="${escapeHtml(p)}" alt="第 ${i + 1} 頁" loading="lazy">
      </div>`).join('');
    stage.appendChild(container);
    requestAnimationFrame(() => {
      const target = $(`#scroll-pages .page-wrap[data-page="${r.page}"]`, stage);
      if (target) stage.scrollTop = target.offsetTop - 16;
    });
  } else {
    r.mode = 'single';
    btn.textContent = '單頁';
    btn.classList.add('active');
    $('#scroll-pages')?.remove();
    wrap.style.display = '';
    $('#prev').style.display = '';
    $('#next').style.display = '';
    stage.classList.remove('mode-scroll');
    stage.classList.add('zoom-' + ZOOM_MODES[r.zoom].id);
    stage.scrollTop = 0;
  }
  updatePageUI();
}

function setPage(page, options = {}) {
  const { updateUrl = true, scroll = true } = options;
  const r = state.reader;
  if (!r) return;
  const next = clamp(page, 0, r.work.pages.length - 1);
  if (next === r.page && !scroll) return;
  r.page = next;
  saveProgress(r.work.id, next);
  if (updateUrl) history.replaceState(null, '', `#/read/${r.work.id}/${next + 1}`);
  updatePageUI({ scroll });
}

function updatePageUI({ scroll = true } = {}) {
  const r = state.reader;
  if (!r) return;
  const total = r.work.pages.length;

  $('#page-indicator').innerHTML = `<b>${r.page + 1}</b> / ${total}`;
  $('#prev').disabled = r.page === 0;
  $('#next').disabled = r.page === total - 1;

  $$('.thumb').forEach((t, i) => t.classList.toggle('active', i === r.page));
  const activeThumb = $('.thumb.active');
  if (activeThumb && scroll) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

  if (r.mode === 'single') {
    const img = $('#main-img');
    $('#page-wrap').classList.add('loading');
    img.alt = `${r.work.title} 第 ${r.page + 1} 頁`;
    img.src = r.work.pages[r.page];
    if (img.complete && img.naturalWidth) $('#page-wrap').classList.remove('loading');
    $('#stage').scrollTop = 0;
  } else if (scroll) {
    const target = $(`#scroll-pages .page-wrap[data-page="${r.page}"]`, $('#stage'));
    if (target) $('#stage').scrollTo({ top: target.offsetTop - 16, behavior: 'smooth' });
  }
}

/* ---------- 鍵盤 ---------- */
document.addEventListener('keydown', e => {
  if (!state.reader) return;
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  const r = state.reader;

  if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); setPage(r.page + 1); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); setPage(r.page - 1); }
  else if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom(r.zoom + 1); }
  else if (e.key === '-' || e.key === '_') { e.preventDefault(); setZoom(r.zoom - 1); }
  else if (e.key === '0') { e.preventDefault(); setZoom(0); }
  else if (e.key === 'Escape') { e.preventDefault(); location.hash = '#/'; }
});

window.addEventListener('hashchange', render);
render();
