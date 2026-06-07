/* ============================================
   首頁 — 分享人區塊
   ============================================ */

function contributorAvatar(c) {
  if (c.photo) {
    return `<div class="contributor-card__avatar"><img src="${c.photo}" alt="${c.name}"></div>`;
  }
  return `<div class="contributor-card__avatar">${c.initial || c.name.charAt(0)}</div>`;
}

function contributorStatsHtml(stats) {
  if (!stats || !stats.length) return '';
  const items = stats.map(s =>
    `<span class="contributor-card__stat"><i data-lucide="${s.icon}" aria-hidden="true"></i>${s.text}</span>`
  ).join('');
  return `<div class="contributor-card__divider"></div><div class="contributor-card__stats">${items}</div>`;
}

function contributorCard(c) {
  const tags = (c.tags || []).map(t => `<span class="contributor-card__tag">${t}</span>`).join('');
  return `<article class="contributor-card reveal">
    ${contributorAvatar(c)}
    <h3 class="contributor-card__name">${c.name}</h3>
    <p class="contributor-card__role">${c.role}</p>
    <p class="contributor-card__bio">${c.bio}</p>
    ${tags ? `<div class="contributor-card__tags">${tags}</div>` : ''}
    ${contributorStatsHtml(c.stats)}
  </article>`;
}

async function initContributors() {
  const grid = document.getElementById('contributors-grid');
  if (!grid) return;
  try {
    const res = await fetch('data/contributors.json');
    const list = await res.json();
    grid.innerHTML = list.map(contributorCard).join('');
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error('分享人區塊載入失敗', err);
  }
}

document.addEventListener('DOMContentLoaded', initContributors);
