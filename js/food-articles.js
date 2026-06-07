/* ============================================
   美食文章 — 共用資料與卡片
   ============================================ */

let _foodArticlesCache = null;

async function loadFoodArticles() {
  if (_foodArticlesCache) return _foodArticlesCache;
  const res = await fetch('data/food-articles.json');
  _foodArticlesCache = await res.json();
  return _foodArticlesCache;
}

/** 集合頁 / 首頁：橫式文章卡片 */
function foodArticleCardHorizontal(article) {
  const count = article.restaurants.length;
  const countLabel = count > 0 ? `${count} 間餐廳` : '內容整理中';
  return `
    <a class="card card-horizontal card-article reveal" href="${article.page}" data-region="${article.region_key}">
      <div class="card-img">
        <span class="card-tag">${article.area_zh}</span>
        <img src="${article.image}" alt="${article.title}" loading="lazy">
      </div>
      <div class="card-body">
        <div class="card-region">${article.region_zh}・${article.area_en}</div>
        <h3 class="card-name">${article.title}</h3>
        <p class="card-facts"><span>🍽 ${countLabel}</span></p>
        <p class="card-blurb">${article.blurb}</p>
        <span class="card-link">閱讀完整攻略 <i data-lucide="arrow-right"></i></span>
      </div>
    </a>`;
}

/** 地區頁：直式文章卡片（沿用 card-article 樣式） */
function foodArticleCardVertical(article) {
  return `
    <a class="card card-article reveal" href="${article.page}" data-region="${article.region_key}">
      <div class="card-img">
        <span class="card-tag">${article.area_zh}</span>
        <img src="${article.image}" alt="${article.title}" loading="lazy">
      </div>
      <div class="card-body">
        <h3 class="card-name">${article.title}<span class="en">${article.area_en}</span></h3>
        <p class="card-blurb">${article.blurb.slice(0, 48)}…</p>
        <span class="card-link">看完整介紹 <i data-lucide="arrow-right"></i></span>
      </div>
    </a>`;
}

/** 延伸閱讀用的小卡片 */
function foodArticleRelatedCard(article) {
  return `
    <a class="related-card" href="${article.page}">
      <div class="related-img"><img src="${article.image}" alt="${article.title}" loading="lazy"><span class="related-tag">美食</span></div>
      <div class="related-body">
        <div class="related-region">${article.area_zh}</div>
        <h4 class="related-name">${article.title}</h4>
        <p class="related-blurb">${article.blurb.slice(0, 46)}…</p>
      </div>
    </a>`;
}

function renderFoodArticleCards(container, articles, layout) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;
  const cardFn = layout === 'horizontal' ? foodArticleCardHorizontal : foodArticleCardVertical;
  el.innerHTML = articles.map(cardFn).join('');
  if (window.lucide) window.lucide.createIcons();
}
