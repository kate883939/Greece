/* ============================================
   首頁 Hero — Crossfade + Stories 進度條
   ============================================ */

function initHeroCarousel(root) {
  if (!root) return;

  const viewport = root.querySelector('.hero-carousel__viewport');
  const stage = root.querySelector('.hero-carousel__stage');
  const slides = [...root.querySelectorAll('.hero-carousel__slide')];
  const progressItems = [...root.querySelectorAll('.hero-carousel__progress-item')];
  if (!viewport || slides.length < 2) return;

  const intervalMs = 5000;
  const slideRatio = 0.78;
  let index = 0;
  let timer = null;
  let touchStartX = 0;
  let quoteReady = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.style.setProperty('--hero-interval', `${intervalMs}ms`);

  function slideWidth() {
    return viewport.clientWidth * slideRatio;
  }

  function syncLayout() {
    const w = slideWidth();
    const cardHeight = w * 4 / 3;
    root.style.setProperty('--hero-slide-width', `${w}px`);
    root.style.setProperty('--hero-card-height', `${cardHeight}px`);
    if (stage) stage.style.height = `${cardHeight}px`;
    viewport.style.height = `${cardHeight}px`;
  }

  function restartProgressFill(item) {
    const fill = item.querySelector('.hero-carousel__progress-fill');
    if (!fill || reducedMotion) return;
    fill.style.animation = 'none';
    fill.offsetHeight;
    fill.style.animation = '';
  }

  function restartKenBurns(slide) {
    const img = slide?.querySelector('.hero-carousel__card img');
    if (!img || reducedMotion) return;
    img.style.animation = 'none';
    img.offsetHeight;
    img.style.animation = '';
  }

  function activeSlideImage() {
    return slides[index]?.querySelector('.hero-carousel__card img');
  }

  function updateQuote() {
    const quoteEl = root.querySelector('.hero-quote');
    const slide = slides[index];
    if (!quoteEl || !slide) return;

    const apply = () => {
      const textEl = quoteEl.querySelector('.hero-quote__text');
      const authorEl = quoteEl.querySelector('.hero-quote__author');
      const img = quoteEl.querySelector('.hero-quote__avatar img');
      if (textEl) {
        const quote = slide.dataset.quote || '';
        textEl.textContent = quote;
        textEl.title = quote;
      }
      if (authorEl) authorEl.textContent = slide.dataset.author || '';
      if (img) {
        img.src = slide.dataset.authorPhoto || '';
        img.alt = slide.dataset.author || '';
      }
    };

    if (reducedMotion || !quoteReady) {
      quoteReady = true;
      apply();
      quoteEl.classList.remove('is-entering');
      quoteEl.classList.add('is-visible');
      return;
    }

    quoteEl.classList.remove('is-visible');
    quoteEl.classList.add('is-entering');

    window.setTimeout(() => {
      apply();
      quoteEl.classList.remove('is-entering');
      void quoteEl.offsetHeight;
      quoteEl.classList.add('is-visible');
    }, 200);
  }

  function updateProgress() {
    progressItems.forEach((item, i) => {
      item.classList.remove('is-active', 'is-done');
      item.setAttribute('aria-selected', i === index ? 'true' : 'false');
      const fill = item.querySelector('.hero-carousel__progress-fill');
      if (fill) fill.style.animation = 'none';

      if (i < index) item.classList.add('is-done');
      else if (i === index) {
        item.classList.add('is-active');
        restartProgressFill(item);
      }
    });
  }

  function goTo(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    restartKenBurns(slides[index]);
    updateQuote();
    updateProgress();
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startTimer() {
    stopTimer();
    if (reducedMotion) {
      timer = setInterval(() => goTo(index + 1), intervalMs);
    }
  }

  function onSlideComplete() {
    goTo(index + 1);
  }

  if (!reducedMotion) {
    progressItems.forEach((item) => {
      const fill = item.querySelector('.hero-carousel__progress-fill');
      if (fill) {
        fill.addEventListener('animationend', () => {
          if (item.classList.contains('is-active')) onSlideComplete();
        });
      }
    });
  }

  progressItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      goTo(i);
      startTimer();
    });
  });

  function pauseProgress() {
    const fill = progressItems[index]?.querySelector('.hero-carousel__progress-fill');
    if (fill) fill.style.animationPlayState = 'paused';
    const img = activeSlideImage();
    if (img) img.style.animationPlayState = 'paused';
  }

  function resumeProgress() {
    const fill = progressItems[index]?.querySelector('.hero-carousel__progress-fill');
    if (fill) fill.style.animationPlayState = 'running';
    const img = activeSlideImage();
    if (img) img.style.animationPlayState = 'running';
  }

  root.addEventListener('mouseenter', () => {
    stopTimer();
    pauseProgress();
  });
  root.addEventListener('mouseleave', () => {
    resumeProgress();
    startTimer();
  });
  root.addEventListener('focusin', () => {
    stopTimer();
    pauseProgress();
  });
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget)) {
      resumeProgress();
      startTimer();
    }
  });

  root.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  root.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(deltaX) >= 40) goTo(index + (deltaX < 0 ? 1 : -1));
    startTimer();
  }, { passive: true });

  window.addEventListener('resize', () => {
    syncLayout();
    goTo(index);
  });

  syncLayout();
  goTo(0);
  startTimer();
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroCarousel(document.getElementById('hero-carousel'));
});
