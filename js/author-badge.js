/* ============================================
   作者 Badge — Tripick 設計系統
   ============================================ */

const AUTHOR_BADGE = {
  name: 'Kate',
  photo: 'images/authors/kate.png',
  date: '2026 年 5 月',
};

const AUTHOR_BADGE_NOTES = {
  food: '實際用餐',
  stay: '實住',
  transport: '親身走訪',
  tips: '整理',
  packing: '整理',
  itinerary: '走訪',
  phrases: '整理',
  general: '整理',
};

function authorBadgeHtml(type) {
  const suffix = AUTHOR_BADGE_NOTES[type] || AUTHOR_BADGE_NOTES.general;
  const note = `${AUTHOR_BADGE.date}${suffix}`;
  const avatarInner = AUTHOR_BADGE.photo
    ? `<img src="${AUTHOR_BADGE.photo}" alt="${AUTHOR_BADGE.name}">`
    : AUTHOR_BADGE.name.charAt(0);
  return `<div class="author-badge">
  <div class="author-badge__avatar">${avatarInner}</div>
  <span class="author-badge__text">
    <span class="author-badge__name">${AUTHOR_BADGE.name}</span>
    <span class="author-badge__dot" aria-hidden="true">·</span>
    ${note}
  </span>
</div>`;
}

function initAuthorBadge() {
  const type = document.body.dataset.authorBadge;
  if (!type) return;
  const html = authorBadgeHtml(type);
  const h1 = document.querySelector('.article-heading h1');
  if (h1) {
    h1.insertAdjacentHTML('afterend', html);
    return;
  }
  const crumb = document.querySelector('.article-main > .breadcrumb, .article-wrap > .breadcrumb');
  if (crumb) crumb.insertAdjacentHTML('afterend', html);
}

window.authorBadgeHtml = authorBadgeHtml;
window.initAuthorBadge = initAuthorBadge;

document.addEventListener('DOMContentLoaded', initAuthorBadge);
