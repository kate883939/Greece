/* ============================================
   地區頁 — 五區塊渲染 + 彈窗
   用法：在 HTML 設定 window.REGION = 'santorini'
   ============================================ */

const REGION = window.REGION;
let regionData = null;

/* ---------- 卡片模板 ---------- */
/* 彈窗型：點整張卡片在原頁開彈窗，CTA 用放大鏡 + 「看重點」 */
function modalCard(item, kind) {
  return `
    <article class="card card-modal reveal" data-kind="${kind}" data-name="${item.name_zh}">
      <div class="card-img">
        <span class="card-tag">${item.tag || ''}</span>
        <img src="${item.image}" alt="${item.name_zh}" loading="lazy">
      </div>
      <div class="card-body">
        <h3 class="card-name">${item.name_zh}<span class="en">${item.name_en}</span></h3>
        <p class="card-blurb">${(item.detail || '').slice(0, 48)}…</p>
        <span class="card-link"><i data-lucide="zoom-in"></i>看重點</span>
      </div>
    </article>`;
}

/* 文章型：整張卡片是連到獨立文章頁的連結，CTA 用箭頭 + 「看完整介紹」 */
function articleCard(item, kind) {
  return `
    <a class="card card-article reveal" href="${item.page}" data-kind="${kind}" data-name="${item.name_zh}">
      <div class="card-img">
        <span class="card-tag">${item.tag || ''}</span>
        <img src="${item.image}" alt="${item.name_zh}" loading="lazy">
      </div>
      <div class="card-body">
        <h3 class="card-name">${item.name_zh}<span class="en">${item.name_en}</span></h3>
        <p class="card-blurb">${(item.detail || '').slice(0, 48)}…</p>
        <span class="card-link">看完整介紹 <i data-lucide="arrow-right"></i></span>
      </div>
    </a>`;
}

function stayCard(item) {
  return stayCardHtml(item, { showFacts: true });
}

/* ---------- 彈窗 ---------- */
function openModal(item, kind) {
  const linkBtn = kind === 'tour'
    ? `<a class="btn btn-primary" href="${item.tour_url}" target="_blank" rel="sponsored noopener">查看行程與預訂 →</a>`
    : (item.map_url ? `<a class="btn btn-primary" href="${item.map_url}" target="_blank" rel="noopener">在 Google Map 開啟 →</a>` : '');
  document.getElementById('modal-body').innerHTML = `
    <img class="modal-img" src="${item.image}" alt="${item.name_zh}">
    <div class="modal-text">
      <span class="modal-tag">${item.tag || ''}</span>
      <h3 class="modal-title">${item.name_zh}<span class="en">${item.name_en}</span></h3>
      <p>${item.detail}</p>
      ${linkBtn}
    </div>`;
  const m = document.getElementById('modal');
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ---------- 渲染各區塊 ---------- */
function renderSection(containerId, items, kind) {
  const el = document.getElementById(containerId);
  if (!el || !items) return;
  el.innerHTML = items
    .map(it => (it.type === 'article' && it.page) ? articleCard(it, kind) : modalCard(it, kind))
    .join('');
  el.querySelectorAll('.card').forEach((card, i) => {
    const item = items[i];
    // 文章型本身是 <a> 連結，不掛彈窗事件
    if (!(item.type === 'article' && item.page)) {
      card.addEventListener('click', () => openModal(item, kind));
    }
  });
}

function renderTransport(items) {
  const el = document.getElementById('transport-list');
  if (!el || !items) return;
  el.innerHTML = items.map(t => `
    <div class="transport-item reveal">
      <div class="transport-icon"><i data-lucide="${t.icon}"></i></div>
      <div><h3>${t.title}</h3><p>${t.desc}</p></div>
    </div>`).join('');
}

function renderSouvenirs(items) {
  const el = document.getElementById('souvenir-list');
  if (!el || !items) return;
  el.innerHTML = items.map(s => `
    <div class="souvenir-item reveal">
      <h3>${s.name_zh}<span class="en">${s.name_en}</span></h3>
      <p>${s.desc}</p>
    </div>`).join('');
}

/* ---------- 共用：Nav、進場動畫 ---------- */
function initNav() {
  if (window.initSiteNav) window.initSiteNav();
}
let revealObserver;
function observeReveal() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } });
    }, { threshold: 0.1 });
  }
  document.querySelectorAll('.reveal:not(.in)').forEach(el => revealObserver.observe(el));
}

/* ---------- 啟動 ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  initNav();

  // 彈窗關閉事件
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  try {
    const res = await fetch(`data/${REGION}.json`);
    regionData = await res.json();

    renderSection('landmarks-grid', regionData.landmarks, 'landmark');
    renderSection('tours-grid', regionData.tours, 'tour');
    renderTransport(regionData.transport);
    renderSouvenirs(regionData.souvenirs);

    const foodArticles = await loadFoodArticles();
    const regionFood = foodArticles.filter(a => a.region_key === REGION);
    renderFoodArticleCards('food-grid', regionFood, 'horizontal');
    observeReveal();

    // 住宿：從 accommodations.json 篩出本區
    const accRes = await fetch('data/accommodations.json');
    const allStays = await accRes.json();
    const regionStays = allStays.filter(s => s.region_key === REGION);
    document.getElementById('stays-grid').innerHTML = regionStays.map(stayCard).join('');

    observeReveal();
    if (window.lucide) window.lucide.createIcons();

    // 若網址帶 ?modal=名稱，自動開對應彈窗（延伸閱讀導流用）
    const params = new URLSearchParams(window.location.search);
    const wantModal = params.get('modal');
    if (wantModal) {
      const pools = [
        { list: regionData.landmarks || [], kind: 'landmark' },
        { list: regionData.tours || [], kind: 'tour' }
      ];
      for (const pool of pools) {
        const found = pool.list.find(it => it.name_zh === wantModal);
        if (found) {
          openModal(found, pool.kind);
          // 捲動到對應區塊，讓關閉彈窗後也看得到
          const secId = pool.kind === 'food' ? 'food' : (pool.kind === 'tour' ? 'tours' : 'landmarks');
          const sec = document.getElementById(secId);
          if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        }
      }
    }
  } catch (err) {
    console.error('載入失敗', err);
  }
});
