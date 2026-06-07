/* ============================================
   好吃餐廳集合頁 — 橫式文章卡片 + 三大區 Tab
   ============================================ */

let allArticles = [];

function render(region) {
  const grid = document.getElementById('items-grid');
  const hint = document.getElementById('empty-hint');
  const list = region === 'all' ? allArticles : allArticles.filter(a => a.region_key === region);
  renderFoodArticleCards(grid, list, 'horizontal');
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

document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  initTabs();
  try {
    allArticles = await loadFoodArticles();
    render('all');
  } catch (err) {
    document.getElementById('items-grid').innerHTML =
      '<p style="color:var(--ink-soft)">內容載入中…（請以本機伺服器或部署後檢視）</p>';
    console.error(err);
  }
});
