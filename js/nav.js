/* ============================================
   共用導覽列：手機選單
   ============================================ */
(function () {
  function isPreviewMode() {
    return new URLSearchParams(window.location.search).get('preview') === 'true';
  }

  function enablePreviewLinks() {
    if (!isPreviewMode()) return;

    document.addEventListener('click', event => {
      const target = event.target;
      const link = target instanceof Element ? target.closest('a[href]') : null;
      if (!link || link.target || link.hasAttribute('download')) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;

      url.searchParams.set('preview', 'true');
      link.href = url.pathname + url.search + url.hash;
    }, true);
  }

  function resetSubmenu(links) {
    links.classList.remove('submenu-open');
    links.querySelectorAll('.dropdown.active').forEach(d => d.classList.remove('active'));
  }

  function closeNav(links, toggle) {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    resetSubmenu(links);
  }

  window.initSiteNav = function initSiteNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links || links.dataset.navReady === 'true') return;

    links.dataset.navReady = 'true';
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      if (!isOpen) resetSubmenu(links);
    });

    document.querySelectorAll('.dropdown').forEach(dropdown => {
      const dropToggle = dropdown.querySelector('.dropdown-toggle');
      const menu = dropdown.querySelector('.dropdown-menu');
      if (!dropToggle || !menu) return;

      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'nav-back';
      back.innerHTML =
        '<span class="nav-back-arrow" aria-hidden="true">‹</span>' +
        '<span>' + dropToggle.textContent.trim() + '</span>';
      menu.insertBefore(back, menu.firstChild);

      dropToggle.addEventListener('click', event => {
        if (window.innerWidth <= 720) {
          event.preventDefault();
          links.classList.add('submenu-open');
          dropdown.classList.add('active');
        }
      });

      back.addEventListener('click', () => {
        links.classList.remove('submenu-open');
        dropdown.classList.remove('active');
      });
    });

    links.querySelectorAll('a:not(.dropdown-toggle)').forEach(link => {
      link.addEventListener('click', () => closeNav(links, toggle));
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeNav(links, toggle);
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.initSiteNav();
    enablePreviewLinks();
  });
})();
