/* ============================================
   行程範例 — 時間軸概覽 + 地區分段摺疊
   ============================================ */

function initNav() {
  if (window.initSiteNav) window.initSiteNav();
}

function renderOverview(segments) {
  const el = document.getElementById('overview-track');
  el.innerHTML = segments.map(seg => `
    <a class="ov-segment ov-${seg.color}" href="#seg-${seg.id}">
      <span class="ov-days">${seg.days}</span>
      <span class="ov-name">${seg.name}</span>
      <span class="ov-en">${seg.en}</span>
    </a>
  `).join('<span class="ov-arrow">→</span>');
}

function dayRow(item) {
  const stay = item.stay_page
    ? `<a class="day-stay" href="${item.stay_page}"><i data-lucide="bed" class="stay-icon"></i> ${item.stay}</a>`
    : `<span class="day-stay plain"><i data-lucide="bed" class="stay-icon"></i> ${item.stay}</span>`;
  return `
    <div class="day-row">
      <div class="day-marker"><span class="day-num">${item.day}</span><span class="day-date">${item.date}</span></div>
      <div class="day-content">
        <h4 class="day-title">${item.title}</h4>
        <p class="day-summary">${item.summary}</p>
        ${stay}
      </div>
    </div>`;
}

function renderSegments(segments) {
  const wrap = document.getElementById('segments');
  wrap.innerHTML = segments.map((seg, i) => `
    <section class="seg seg-${seg.color}" id="seg-${seg.id}">
      <button class="seg-header" aria-expanded="${i === 0 ? 'true' : 'false'}">
        <div class="seg-header-text">
          <span class="seg-days">${seg.days}</span>
          <h3 class="seg-name">${seg.name} <span class="seg-en">${seg.en}</span></h3>
        </div>
        <span class="seg-toggle">⌄</span>
      </button>
      <div class="seg-body" ${i === 0 ? '' : 'hidden'}>
        <div class="day-list">${seg.items.map(dayRow).join('')}</div>
        <a class="seg-cta" href="${seg.region_page}">看 ${seg.name} 完整攻略 →</a>
      </div>
    </section>
  `).join('');

  wrap.querySelectorAll('.seg-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      body.hidden = open;
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  try {
    const d = await (await fetch('data/itinerary.json')).json();
    document.getElementById('itin-title').textContent = d.title;
    document.getElementById('itin-subtitle').textContent = d.subtitle;
    document.getElementById('itin-intro').textContent = d.intro;
    renderOverview(d.segments);
    renderSegments(d.segments);
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error('行程載入失敗', err);
  }
});
