/* ============================================
   住宿卡片 — 全站共用
   資料來源：data/accommodations.json
   ============================================ */

/**
 * @param {object} item
 * @param {{ showFacts?: boolean, regionMode?: 'full'|'location' }} options
 */
function stayCardHtml(item, options = {}) {
  const showFacts = options.showFacts ?? false;
  const regionMode = options.regionMode ?? 'full';
  const regionLine = regionMode === 'location'
    ? item.location
    : `${item.region}・${item.location}`;

  const factsBlock = showFacts ? `
        <div class="card-facts">
          <span>🛏 ${item.room}</span>
          <span>🌙 ${item.nights}</span>
          <span>💰 ${item.price_band}</span>
        </div>` : '';

  return `
    <a class="card card-article reveal" href="${item.page}" data-region="${item.region_key}">
      <div class="card-img">
        <span class="card-tag hot">${item.rating}</span>
        <img src="${item.image}" alt="${item.name_zh}" loading="lazy">
      </div>
      <div class="card-body">
        <div class="card-region">${regionLine}</div>
        <h3 class="card-name">${item.name_zh}<span class="en">${item.name_en}</span></h3>${factsBlock}
        <p class="card-blurb">${item.blurb}</p>
      </div>
    </a>`;
}
