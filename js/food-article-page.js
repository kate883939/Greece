/* ============================================
   美食文章頁 — 從 JSON 渲染完整內容
   用法：HTML 設定 window.FOOD_ARTICLE_ID = 'athens'
   ============================================ */

const PRICE_ORDER = ['$', '$$', '$$$', '$$$$'];

/** 從各餐廳 tag 整理用餐類型（去重、最多 4 項） */
function foodTypeSummary(restaurants) {
  const parts = [];
  const seen = new Set();
  for (const r of restaurants) {
    for (const part of (r.tag || '').split('・')) {
      const p = part.trim();
      if (p && !seen.has(p)) {
        seen.add(p);
        parts.push(p);
      }
    }
  }
  return parts.length ? parts.slice(0, 4).join('、') : '整理中';
}

/** 從各餐廳 price 整理價位帶 */
function foodPriceRange(restaurants) {
  const prices = restaurants.map(r => r.price).filter(p => PRICE_ORDER.includes(p));
  if (!prices.length) return '—';
  const idx = prices.map(p => PRICE_ORDER.indexOf(p));
  const min = PRICE_ORDER[Math.min(...idx)];
  const max = PRICE_ORDER[Math.max(...idx)];
  return min === max ? min : `${min} ~ ${max}`;
}

/** 餐廳照片：支援 photos[]，或 image + 選填 image_2 */
function normalizeRestaurantPhotos(r) {
  if (Array.isArray(r.photos) && r.photos.length) {
    return r.photos.slice(0, 2).map(p => ({
      src: p.src || p.image,
      alt: p.alt || r.name_zh,
      caption: p.caption || '',
    }));
  }
  const list = [];
  if (r.image) {
    list.push({ src: r.image, alt: r.name_zh, caption: r.photo_caption || '' });
  }
  if (r.image_2) {
    list.push({ src: r.image_2, alt: r.name_zh, caption: r.photo_caption_2 || '' });
  }
  return list;
}

function restaurantPhotosHtml(photos) {
  if (!photos.length) return '';
  if (photos.length === 1) {
    const p = photos[0];
    const cap = p.caption ? `<figcaption>${p.caption}</figcaption>` : '';
    return `<figure class="article-photo"><img src="${p.src}" alt="${p.alt}" loading="lazy">${cap}</figure>`;
  }
  const cells = photos.slice(0, 2).map(p => `
    <div class="article-photo-cell">
      <img src="${p.src}" alt="${p.alt}" loading="lazy">
      ${p.caption ? `<figcaption>${p.caption}</figcaption>` : ''}
    </div>`).join('');
  return `<figure class="article-photo article-photo-duo"><div class="article-photo-pair">${cells}</div></figure>`;
}

const RATING_KEYS = [
  ['food', '食物'],
  ['service', '服務'],
  ['view', '景觀'],
  ['revisit', '回訪'],
];

function formatStars(value) {
  if (value == null || value === '') {
    return '<span class="food-stars food-stars-na" aria-hidden="true">—</span>';
  }
  const n = Math.min(5, Math.max(1, Math.round(Number(value))));
  const stars = Array.from({ length: 5 }, (_, i) => {
    const on = i < n;
    return `<i data-lucide="star" class="food-star${on ? ' food-star-on' : ' food-star-off'}" aria-hidden="true"></i>`;
  }).join('');
  return `<span class="food-stars" role="img" aria-label="${n} 顆星">${stars}</span>`;
}

function restaurantRatingsHtml(ratings) {
  const data = ratings || {};
  const items = RATING_KEYS.map(([key, label]) =>
    `<span class="food-rating-item"><span class="food-rating-label">${label}</span>${formatStars(data[key])}</span>`
  ).join('');
  return `<div class="food-ratings">${items}</div>`;
}

function restaurantMetaHtml(r) {
  return `<div class="food-spot-meta">
    <span class="food-spot-price">價位 <span class="food-spot-price-value">${r.price}</span></span>
    ${restaurantRatingsHtml(r.ratings)}
  </div>`;
}

function restaurantSection(r) {
  const locationLine = r.location_note
    ? `<p class="food-spot-note">${r.location_note}</p>` : '';
  const ordered = r.ordered && r.ordered.length
    ? `<p><strong>我們點的：</strong>${r.ordered.join('、')}</p>` : '';
  const reservation = r.reservation
    ? `<div class="callout"><strong>訂位提醒：</strong>${r.reservation}</div>` : '';
  return `
    <section class="food-spot" id="${r.id}">
      <div class="food-spot-head">
        <span class="food-spot-tag">${r.tag}</span>
        <h2>${r.name_zh}</h2>
        ${locationLine}
        ${restaurantMetaHtml(r)}
      </div>
      ${restaurantPhotosHtml(normalizeRestaurantPhotos(r))}
      <p>${r.review}</p>
      ${ordered}
      ${reservation}
      <a class="btn btn-secondary" href="${r.map_url}" target="_blank" rel="noopener">在 Google Map 開啟 →</a>
    </section>`;
}

function extraSection(item) {
  const locationLine = item.location_note
    ? `<p class="food-spot-note">${item.location_note}</p>` : '';
  const meta = (item.price || item.ratings) ? restaurantMetaHtml(item) : '';
  return `
    <section class="food-extra" id="${item.id}">
      <div class="food-spot-head">
        <span class="food-spot-tag">${item.tag}</span>
        <h2>${item.name_zh}</h2>
        ${locationLine}
        ${meta}
      </div>
      <p>${item.review}</p>
      ${item.map_url ? `<a class="btn btn-secondary" href="${item.map_url}" target="_blank" rel="noopener">在 Google Map 開啟 →</a>` : ''}
    </section>`;
}

function extrasBlockHtml(article) {
  const extras = article.extras || [];
  if (!extras.length) return '';
  const items = extras.map(extraSection).join('');
  const intro = article.extras_intro
    ? `<p class="food-extras-lead">${article.extras_intro}</p>` : '';
  return `
    <div class="food-extras" id="extras">
      <h2>延伸介紹</h2>
      ${intro}
      ${items}
    </div>`;
}

function extrasTocHtml(extras) {
  if (!extras.length) return '';
  return extras.map(e => `<a href="#${e.id}">${e.name_zh}</a>`).join('');
}

function renderFoodArticle(article) {
  const tocLinks = article.restaurants.map(r =>
    `<a href="#${r.id}">${r.name_zh}</a>`
  ).join('');
  const extras = article.extras || [];
  const extrasToc = extrasTocHtml(extras);
  const sections = article.restaurants.map(restaurantSection).join('');
  const count = article.restaurants.length;
  const typeSummary = foodTypeSummary(article.restaurants);
  const priceRange = foodPriceRange(article.restaurants);

  document.getElementById('food-article-root').innerHTML = `
    <nav class="breadcrumb" aria-label="麵包屑">
      <a href="/">首頁</a> <span>›</span>
      <a href="restaurants.html">好吃餐廳</a> <span>›</span>
      <span>${article.area_zh}</span>
    </nav>

    <header class="article-heading">
      <h1>${article.title}</h1>
      ${window.authorBadgeHtml ? window.authorBadgeHtml('food') : ''}
      <p>${article.blurb}</p>
    </header>

    <div class="fact-bar">
      <div class="fact"><div class="label">地區</div><div class="value">${article.region_zh}・${article.area_zh}</div></div>
      <div class="fact"><div class="label">收錄餐廳</div><div class="value">${count} 間</div></div>
      <div class="fact"><div class="label">用餐類型</div><div class="value">${typeSummary}</div></div>
      <div class="fact"><div class="label">價位帶</div><div class="value">${priceRange}</div></div>
    </div>

    <nav class="article-toc article-toc-inline" aria-label="文章目錄">
      <p class="toc-title">這篇會看見</p>
      <a href="#intro">美食摘要</a>
      ${tocLinks}
      ${extrasToc}
    </nav>

    <div class="article-body">
      <h2 id="intro">美食摘要</h2>
      <p class="article-lead">${article.intro}</p>
      ${sections || '<p class="empty-hint">這個區域的餐廳整理中，敬請期待。</p>'}
      ${extrasBlockHtml(article)}
      ${count > 0 ? '<p class="food-rating-note">評分為我們個人當次用餐感受，僅供參考。</p>' : ''}
    </div>`;

  const sidebarToc = document.getElementById('food-sidebar-toc');
  if (sidebarToc) {
    sidebarToc.innerHTML = `
      <p class="toc-title">這篇會看見</p>
      <a href="#intro">美食摘要</a>
      ${tocLinks}
      ${extrasToc}`;
  }

  const relatedGrid = document.getElementById('related-grid');
  if (relatedGrid && window.FOOD_ARTICLE_ID) {
    loadFoodArticles().then(all => {
      const others = all.filter(a => a.region_key === article.region_key && a.id !== article.id);
      if (others.length === 0) return;
      document.getElementById('related-heading').textContent = `同區其他美食攻略`;
      relatedGrid.innerHTML = others.slice(0, 3).map(foodArticleRelatedCard).join('');
      document.getElementById('related-section').hidden = false;
    });
  }
}

function resolveFoodArticleId() {
  if (window.FOOD_ARTICLE_ID) return window.FOOD_ARTICLE_ID;
  const fromQuery = new URLSearchParams(window.location.search).get('id');
  if (fromQuery) return fromQuery;
  const match = window.location.pathname.match(/\/food-([^.]+)\.html$/);
  return match ? match[1] : null;
}

document.addEventListener('DOMContentLoaded', async () => {
  if (window.initSiteNav) window.initSiteNav();
  const id = resolveFoodArticleId();
  if (!id) return;
  window.FOOD_ARTICLE_ID = id;
  try {
    const all = await loadFoodArticles();
    const article = all.find(a => a.id === id);
    if (!article) return;
    renderFoodArticle(article);
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error('美食文章載入失敗', err);
  }
});
