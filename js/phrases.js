/* ============================================
   點餐常見單字 — 表格渲染
   ============================================ */

function initNav() {
  if (window.initSiteNav) window.initSiteNav();
}

function renderPhrases(data) {
  if (data.intro) document.getElementById('phrases-intro').textContent = data.intro;
  const wrap = document.getElementById('phrases');
  wrap.innerHTML = data.categories.map(cat => {
    const rows = cat.items.map(it => `
      <tr><td class="phrase-en">${it.en}</td><td class="phrase-zh">${it.zh}</td></tr>
    `).join('');
    return `
      <div class="phrase-category">
        <h3 class="phrase-cat-title"><i data-lucide="${cat.icon}" class="cat-icon"></i> ${cat.name}</h3>
        <table class="phrase-table"><tbody>${rows}</tbody></table>
      </div>`;
  }).join('');
  if (window.lucide) window.lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  try {
    const data = await (await fetch('data/phrases.json')).json();
    renderPhrases(data);
  } catch (err) {
    document.getElementById('phrases').innerHTML =
      '<p style="color:var(--ink-soft)">內容載入中…（請以本機伺服器或部署後檢視）</p>';
    console.error(err);
  }
});
