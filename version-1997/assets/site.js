(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const siteNav = document.querySelector('[data-site-nav]');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
    }, { once: true });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    let timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const index = Number(dot.getAttribute('data-hero-dot'));
        showSlide(index);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  const input = document.querySelector('[data-filter-input]');

  if (input && initialQuery) {
    input.value = initialQuery;
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].map(normalize).join(' ');
  }

  function applyFilter(query) {
    const scope = document.querySelector('[data-filter-scope]');
    const countEl = document.querySelector('[data-result-count]');

    if (!scope) {
      return;
    }

    const keyword = normalize(query);
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    let visible = 0;

    cards.forEach(function (card) {
      const matched = !keyword || cardText(card).includes(keyword);
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (countEl) {
      countEl.textContent = visible + ' 部内容';
    }
  }

  if (input) {
    applyFilter(input.value);
    input.addEventListener('input', function () {
      applyFilter(input.value);
    });
  }

  document.querySelectorAll('[data-chip]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (!input) {
        return;
      }
      input.value = chip.getAttribute('data-chip') || '';
      applyFilter(input.value);
      input.focus();
    });
  });

  const reset = document.querySelector('[data-filter-reset]');
  if (reset && input) {
    reset.addEventListener('click', function () {
      window.setTimeout(function () {
        input.value = '';
        applyFilter('');
      }, 0);
    });
  }
})();
