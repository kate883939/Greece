/* ============================================
   延伸閱讀 — 文章底部推薦
   用法：在文章 HTML 設定
     window.RELATED = { region: 'santorini', selfId: 'kudos' };
   selfId 為住宿文章自己的 id（交通文章可省略）
   ============================================ */
(function () {
  const REGION_FILE = {
    athens: 'data/athens.json',
    crete: 'data/crete.json',
    santorini: 'data/santorini.json'
  };
  const REGION_PAGE = {
    athens: 'athens.html',
    crete: 'crete.html',
    santorini: 'santorini.html'
  };

  function stayCard(s) {
    return `
      <a class="related-card" href="${s.page}">
        <div class="related-img"><img src="${s.image}" alt="${s.name_zh}" loading="lazy"><span class="related-tag hot">住宿</span></div>
        <div class="related-body">
          <div class="related-region">${s.location}</div>
          <h4 class="related-name">${s.name_zh}</h4>
          <p class="related-blurb">${s.blurb}</p>
        </div>
      </a>`;
  }

  // 景點：連到地區頁並帶 ?modal= 參數
  function modalItemCard(item, regionKey, kindLabel) {
    const url = `${REGION_PAGE[regionKey]}?modal=${encodeURIComponent(item.name_zh)}`;
    return `
      <a class="related-card" href="${url}">
        <div class="related-img"><img src="${item.image}" alt="${item.name_zh}" loading="lazy"><span class="related-tag">${kindLabel}</span></div>
        <div class="related-body">
          <div class="related-region">${item.tag || ''}</div>
          <h4 class="related-name">${item.name_zh}</h4>
          <p class="related-blurb">${(item.detail || '').slice(0, 46)}…</p>
        </div>
      </a>`;
  }

  function foodArticleCard(article) {
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

  document.addEventListener('DOMContentLoaded', async () => {
    const cfg = window.RELATED;
    const wrap = document.getElementById('related-grid');
    if (!cfg || !wrap) return;

    try {
      const [accs, regionData] = await Promise.all([
        fetch('data/accommodations.json').then(r => r.json()),
        fetch(REGION_FILE[cfg.region]).then(r => r.json())
      ]);

      let cards = [];
      let heading = '延伸閱讀';

      // 1. 優先：同地區其他住宿（排除自己）
      const otherStays = accs.filter(s => s.region_key === cfg.region && s.id !== cfg.selfId);

      if (otherStays.length > 0) {
        heading = '這個地區的其他住宿';
        cards = otherStays.slice(0, 3).map(stayCard);
      } else {
        // 2. 備案：同地區景點 + 美食文章
        heading = `探索更多${regionData.region.name_zh}`;
        const landmarks = (regionData.landmarks || []).slice(0, 2).map(it => modalItemCard(it, cfg.region, '景點'));
        const foods = (await fetch('data/food-articles.json').then(r => r.json()))
          .filter(a => a.region_key === cfg.region)
          .slice(0, 1)
          .map(foodArticleCard);
        cards = [...landmarks, ...foods];
      }

      if (cards.length === 0) return;
      document.getElementById('related-heading').textContent = heading;
      wrap.innerHTML = cards.join('');
      document.getElementById('related-section').hidden = false;
    } catch (err) {
      console.error('延伸閱讀載入失敗', err);
    }
  });
})();
