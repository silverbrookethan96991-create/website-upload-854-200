document.addEventListener('DOMContentLoaded', function () {
  var header = document.querySelector('.site-header');
  var prefix = header ? header.getAttribute('data-prefix') || '' : '';
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      if (!query) {
        event.preventDefault();
        window.location.href = prefix + 'search.html';
        return;
      }
      event.preventDefault();
      window.location.href = prefix + 'search.html?q=' + encodeURIComponent(query);
    });
  });

  setupHero();
  setupFilters();
});

function setupHero() {
  var root = document.querySelector('[data-hero]');
  if (!root) {
    return;
  }

  var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
  if (!slides.length) {
    return;
  }

  var current = 0;
  var timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function start() {
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      stop();
      show(index);
      start();
    });
  });

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  show(0);
  start();
}

function setupFilters() {
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  if (!cards.length) {
    return;
  }

  var search = document.querySelector('[data-search]');
  var year = document.querySelector('[data-year]');
  var type = document.querySelector('[data-type]');
  var genre = document.querySelector('[data-genre]');
  var count = document.querySelector('[data-count]');
  var empty = document.querySelector('[data-empty-state]');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  if (search && query) {
    search.value = query;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function matches(card) {
    var keyword = normalize(search ? search.value : '');
    var selectedYear = normalize(year ? year.value : '');
    var selectedType = normalize(type ? type.value : '');
    var selectedGenre = normalize(genre ? genre.value : '');
    var text = normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-category'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' '));

    if (keyword && text.indexOf(keyword) === -1) {
      return false;
    }
    if (selectedYear && normalize(card.getAttribute('data-year')) !== selectedYear) {
      return false;
    }
    if (selectedType && normalize(card.getAttribute('data-type')).indexOf(selectedType) === -1) {
      return false;
    }
    if (selectedGenre && normalize(card.getAttribute('data-genre')).indexOf(selectedGenre) === -1) {
      return false;
    }
    return true;
  }

  function apply() {
    var visible = 0;
    cards.forEach(function (card) {
      var ok = matches(card);
      card.hidden = !ok;
      if (ok) {
        visible += 1;
      }
    });
    if (count) {
      count.textContent = visible + ' 部影片';
    }
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  [search, year, type, genre].forEach(function (control) {
    if (control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    }
  });

  apply();
}
