/* ============================================
   跳島行李清單 — 可勾選 + localStorage 記憶
   ============================================ */

const STORAGE_KEY = 'greece-packing-checked';
let checked = {};
let totalItems = 0;

function loadChecked() {
  try { checked = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { checked = {}; }
}
function saveChecked() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checked)); } catch {}
}

function updateProgress() {
  const done = Object.values(checked).filter(Boolean).length;
  const pct = totalItems ? Math.round(done / totalItems * 100) : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `已打包 ${done} / ${totalItems} 項（${pct}%）`;
}

function makeId(cat, i) { return `${cat}__${i}`; }

function renderChecklist(data) {
  const wrap = document.getElementById('checklist');
  totalItems = 0;
  wrap.innerHTML = data.categories.map((cat, ci) => {
    const rows = cat.items.map((item, i) => {
      totalItems++;
      const id = makeId(ci, i);
      const isChecked = checked[id] ? 'checked' : '';
      return `
        <label class="check-row ${checked[id] ? 'done' : ''}" data-id="${id}">
          <input type="checkbox" ${isChecked}>
          <span class="check-box"></span>
          <span class="check-label">${item}</span>
        </label>`;
    }).join('');
    return `
      <div class="check-category">
        <h3 class="check-cat-title"><i data-lucide="${cat.icon}" class="cat-icon"></i> ${cat.name}</h3>
        <div class="check-items">${rows}</div>
      </div>`;
  }).join('');

  wrap.querySelectorAll('.check-row').forEach(row => {
    const input = row.querySelector('input');
    input.addEventListener('change', () => {
      checked[row.dataset.id] = input.checked;
      row.classList.toggle('done', input.checked);
      saveChecked();
      updateProgress();
    });
  });
  updateProgress();
}

function resetChecklist() {
  checked = {};
  saveChecked();
  document.querySelectorAll('.check-row').forEach(row => {
    row.querySelector('input').checked = false;
    row.classList.remove('done');
  });
  updateProgress();
}

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

document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  loadChecked();
  document.getElementById('reset-btn').addEventListener('click', resetChecklist);
  try {
    const data = await (await fetch('data/packing.json')).json();
    renderChecklist(data);
  } catch (err) {
    document.getElementById('checklist').innerHTML =
      '<p style="color:var(--ink-soft)">內容載入中…（請以本機伺服器或部署後檢視）</p>';
    console.error(err);
  }
});
