/* ============================================
   希臘旅遊指南 — 首頁互動
   著名景點 / 跟團 → 從三地區 JSON 合併，點卡片開大彈窗
   好吃餐廳 → 美食文章橫式卡片
   住宿 → 連到實住介紹頁
   ============================================ */

const REGIONS = [
  { key: 'athens',    zh: '希臘本島', file: 'data/athens.json' },
  { key: 'crete',     zh: '克里特島', file: 'data/crete.json' },
  { key: 'santorini', zh: '聖托里尼', file: 'data/santorini.json' }
];

const store = { landmarks: [], tours: [] };

function initNav() {
  if (window.initSiteNav) window.initSiteNav();
}

function accommodationCard(item) {
  return stayCardHtml(item);
}

function modalCard(item, kind, idx) {
  return `
    <article class="card reveal" data-kind="${kind}" data-idx="${idx}">
      <div class="card-img">
        <span class="card-tag${kind === 'tours' ? ' hot' : ''}">${kind === 'tours' ? '跟團推薦' : (item.tag || '')}</span>
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
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

function renderModalSection(containerId, items, kind, limit) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const list = limit ? items.slice(0, limit) : items;
  el.innerHTML = list.map((it, i) => modalCard(it, kind, i)).join('');
  el.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openModal(list[+card.dataset.idx]));
  });
}

let revealObserver;
function observeReveal() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } });
    }, { threshold: 0.12 });
  }
  document.querySelectorAll('.reveal:not(.in)').forEach(el => revealObserver.observe(el));
}

document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  observeReveal();

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  try {
    const acc = await (await fetch('data/accommodations.json')).json();
    document.getElementById('accommodations-grid').innerHTML =
      acc.slice(0, 4).map(accommodationCard).join('');
  } catch (err) { console.error(err); }

  try {
    const articles = await loadFoodArticles();
    renderFoodArticleCards('restaurants-grid', articles.slice(0, 3), 'horizontal');
    observeReveal();
  } catch (err) { console.error(err); }

  try {
    const results = await Promise.all(REGIONS.map(r => fetch(r.file).then(res => res.json())));
    results.forEach((data, i) => {
      const zh = REGIONS[i].zh;
      (data.landmarks || []).forEach(it => store.landmarks.push({ ...it, region_zh: zh }));
      (data.tours || []).forEach(it => store.tours.push({ ...it, region_zh: zh }));
    });
    renderModalSection('landmarks-grid', store.landmarks, 'landmarks', 6);
    renderModalSection('tours-grid', store.tours, 'tours', 3);
  } catch (err) { console.error(err); }

  observeReveal();
});
