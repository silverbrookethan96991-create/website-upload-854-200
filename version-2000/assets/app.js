(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('is-missing');
    });
  });

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    var start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        start();
      });
    });

    showSlide(0);
    start();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var sort = scope.querySelector('[data-filter-sort]');
    var list = scope.querySelector('[data-movie-list]');
    var empty = scope.querySelector('[data-empty-result]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

    var normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    var apply = function () {
      var query = normalize(input ? input.value : '');
      var mode = sort ? sort.value : 'default';
      var visible = [];

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var matched = !query || text.indexOf(query) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible.push(card);
        }
      });

      visible.sort(function (a, b) {
        if (mode === 'year') {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        }

        if (mode === 'title') {
          return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-CN');
        }

        return Number(a.getAttribute('data-order') || 0) - Number(b.getAttribute('data-order') || 0);
      });

      visible.forEach(function (card) {
        list.appendChild(card);
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible.length === 0);
      }
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    if (sort) {
      sort.addEventListener('change', apply);
    }

    apply();
  });
})();
