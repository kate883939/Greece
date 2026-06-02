/* ============================================
   住宿推薦集合頁 — Tab 篩選 + 卡片牆
   ============================================ */

let allStays = [];

function stayCard(item) {
  return `
    <article class="card reveal" data-region="${item.region_key}">
      <a href="${item.page}" class="card-img">
        <span class="card-tag hot">${item.rating}</span>
        <img src="${item.image}" alt="${item.name_zh}" loading="lazy">
      </a>
      <div class="card-body">
        <div class="card-region">${item.region}・${item.location}</div>
        <h3 class="card-name"><a href="${item.page}">${item.name_zh}</a><span class="en">${item.name_en}</span></h3>
        <div class="card-facts">
          <span>🛏 ${item.room}</span>
          <span>🌙 ${item.nights}</span>
          <span>💰 ${item.price_band}</span>
        </div>
        <p class="card-blurb">${item.blurb}</p>
        <div class="card-actions">
          <a class="card-btn-sm" href="${item.page}">實住心得 →</a>
        </div>
      </div>
    </article>`;
}

function render(region) {
  const grid = document.getElementById('stays-grid');
  const hint = document.getElementById('empty-hint');
  const list = region === 'all' ? allStays : allStays.filter(s => s.region_key === region);
  grid.innerHTML = list.map(stayCard).join('');
  hint.hidden = list.length > 0;
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

// ---------- 行動版選單（共用） ----------
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

// ---------- 滾動進場（共用） ----------
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
  initTabs();
  try {
    const res = await fetch('data/accommodations.json');
    allStays = await res.json();
    render('all');
  } catch (err) {
    document.getElementById('stays-grid').innerHTML =
      '<p style="color:var(--ink-soft)">內容載入中…（請以本機伺服器或部署後檢視）</p>';
    console.error(err);
  }
});
