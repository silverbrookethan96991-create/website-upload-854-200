(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobilePanel = qs('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5000);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(i);
        startHero();
      });
    });

    startHero();
  }

  var filterPanel = qs('[data-filter-panel]');
  var filterList = qs('[data-filter-list]') || document;
  if (filterPanel) {
    var textInput = qs('[data-card-search]', filterPanel);
    var categorySelect = qs('[data-card-category]', filterPanel);
    var regionSelect = qs('[data-card-region]', filterPanel);
    var yearSelect = qs('[data-card-year]', filterPanel);
    var cards = qsa('[data-title]', filterList);

    function matchValue(value, wanted) {
      return !wanted || String(value || '') === String(wanted);
    }

    function applyFilters() {
      var keyword = textInput ? textInput.value.trim().toLowerCase() : '';
      var category = categorySelect ? categorySelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var visible = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          visible = false;
        }
        if (!matchValue(card.getAttribute('data-category'), category)) {
          visible = false;
        }
        if (!matchValue(card.getAttribute('data-region'), region)) {
          visible = false;
        }
        if (!matchValue(card.getAttribute('data-year'), year)) {
          visible = false;
        }
        card.style.display = visible ? '' : 'none';
      });
    }

    [textInput, categorySelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }

  var searchPage = qs('[data-search-page]');
  if (searchPage && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = qs('[data-search-form] input', searchPage);
    var resultBox = qs('[data-search-results]', searchPage);
    var titleBox = qs('[data-search-title]', searchPage);
    if (input) {
      input.value = query;
    }

    function createCard(movie) {
      var image = './' + movie.cover + '.jpg';
      var detail = './movie/movie-' + movie.id + '.html';
      var category = './category/' + movie.categorySlug + '.html';
      return [
        '<article class="movie-card compact">',
        '<a class="poster-wrap" href="' + detail + '" aria-label="' + escapeHtml(movie.title) + '">',
        '<img src="' + image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
        '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
        '<span class="play-hover"><i></i></span>',
        '</a>',
        '<div class="card-body">',
        '<h3><a href="' + detail + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="card-meta"><a href="' + category + '">' + escapeHtml(movie.categoryName) + '</a><span>' + escapeHtml(movie.region) + '</span></div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderResults() {
      var normalized = query.toLowerCase();
      var results = window.SEARCH_MOVIES.filter(function (movie) {
        if (!normalized) {
          return true;
        }
        return [movie.title, movie.oneLine, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.categoryName]
          .join(' ')
          .toLowerCase()
          .indexOf(normalized) !== -1;
      }).slice(0, 180);

      if (titleBox) {
        titleBox.textContent = query ? '与“' + query + '”相关的影片' : '热门影片列表';
      }
      if (resultBox) {
        resultBox.innerHTML = results.length ? results.map(createCard).join('') : '<div class="no-results">没有找到相关影片</div>';
      }
    }

    renderResults();
  }
})();
