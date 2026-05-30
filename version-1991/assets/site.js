document.addEventListener('DOMContentLoaded', function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    img.addEventListener('error', function () {
      var parent = img.parentElement;
      if (parent) {
        parent.classList.add('media-missing');
      }
    }, { once: true });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function startHeroTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHeroTimer();
      });
    });

    showSlide(0);
    startHeroTimer();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var list = scope.parentElement.querySelector('[data-filter-list]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-card]')) : [];
    var keywordInput = scope.querySelector('[data-filter-keyword]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var regionSelect = scope.querySelector('[data-filter-region]');
    var resetButton = scope.querySelector('[data-filter-reset]');
    var count = scope.parentElement.querySelector('[data-result-count]');

    function applyFilters() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var matched = true;

        if (keyword && title.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '共 ' + visible + ' 部影片';
      }
    }

    [keywordInput, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        applyFilters();
      });
    }
  });
});
