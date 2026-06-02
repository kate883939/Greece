/* ============================================
   集合頁（著名景點 / 好吃餐廳）
   做法 A：自動合併三個地區 JSON
   用法：HTML 設定 window.COLLECTION = 'landmarks' 或 'food'
   ============================================ */

const COLLECTION = window.COLLECTION;       // 'landmarks' | 'food'
const REGIONS = [
  { key: 'athens',    file: 'data/athens.json' },
  { key: 'crete',     file: 'data/crete.json' },
  { key: 'santorini', file: 'data/santorini.json' }
];

let allItems = [];

/* ---------- 卡片 ---------- */
function itemCard(item, idx) {
  return `
    <article class="card reveal" data-region="${item.region_key}" data-idx="${idx}">
      <div class="card-img">
        <span class="card-tag">${item.tag || ''}</span>
        <img src="${item.image}" alt="${item.name_zh}" loading="lazy">
      </div>
      <div class="card-body">
        <div class="card-region">${item.region_zh}</div>
        <h3 class="card-name">${item.name_zh}<span class="en">${item.name_en}</span></h3>
        <p class="card-blurb">${(item.detail || '').slice(0, 50)}…</p>
        <span class="card-link">看詳細</span>
      </div>
    </article>`;
}

/* ---------- 大彈窗 ---------- */
function openModal(item) {
  const linkBtn = item.tour_url
    ? `<a class="btn btn-primary" href="${item.tour_url}" target="_blank" rel="sponsored noopener">查看行程與預訂 →</a>`
    : (item.map_url ? `<a class="btn btn-primary" href="${item.map_url}" target="_blank" rel="noopener">在 Google Map 開啟 →</a>` : '');
  document.getElementById('modal-body').innerHTML = `
    <img class="modal-img" src="${item.image}" alt="${item.name_zh}">
    <div class="modal-text">
      <div class="modal-meta">
        <span class="modal-region">${item.region_zh}</span>
        <span class="modal-tag">${item.tag || ''}</span>
      </div>
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

/* ---------- 渲染 + 篩選 ---------- */
function render(region) {
  const grid = document.getElementById('items-grid');
  const hint = document.getElementById('empty-hint');
  const list = region === 'all' ? allItems : allItems.filter(i => i.region_key === region);
  grid.innerHTML = list.map((it) => itemCard(it, allItems.indexOf(it))).join('');
  hint.hidden = list.length > 0;
  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openModal(allItems[+card.dataset.idx]));
  });
  observeReveal();
}

function initTabs() {
  document.querySelectorAll('#region-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#region-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      render(tab.dataset.region);
    });
  });
}

/* ---------- 共用 ---------- */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle) toggle.addEventListener('click', () => links.classList.toggle('open'));
  document.querySelectorAll('.dropdown-toggle').forEach(t => {
    t.addEventListener('click', (e) => {
      if (window.innerWidth <= 720) { e.preventDefault(); t.closest('.dropdown').classList.toggle('open'); }
    });
  });
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
  initTabs();

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  try {
    const results = await Promise.all(REGIONS.map(r => fetch(r.file).then(res => res.json())));
    results.forEach((data, i) => {
      const regionKey = REGIONS[i].key;
      const regionZh = data.region.name_zh;
      (data[COLLECTION] || []).forEach(item => {
        allItems.push({ ...item, region_key: regionKey, region_zh: regionZh });
      });
    });
    render('all');
  } catch (err) {
    document.getElementById('items-grid').innerHTML =
      '<p style="color:var(--ink-soft)">內容載入中…（請以本機伺服器或部署後檢視）</p>';
    console.error(err);
  }
});
