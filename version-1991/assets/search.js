document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('globalSearchInput');
  var categorySelect = document.getElementById('globalCategorySelect');
  var sortSelect = document.getElementById('globalSortSelect');
  var button = document.getElementById('globalSearchButton');
  var results = document.getElementById('globalSearchResults');
  var count = document.getElementById('globalSearchCount');
  var movies = [];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function getQueryParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      q: params.get('q') || '',
      sort: params.get('sort') || 'score'
    };
  }

  function renderCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-card>',
      '  <a class="movie-card-link" href="' + escapeHtml(movie.url) + '" title="' + escapeHtml(movie.title) + '">',
      '    <div class="movie-thumb">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-fallback />',
      '      <div class="thumb-fallback"><span>' + escapeHtml(movie.title.slice(0, 6)) + '</span></div>',
      '      <div class="thumb-shade"></div>',
      '      <div class="thumb-badges"><span>' + escapeHtml(movie.categories[0]) + '</span><span>' + movie.year + '</span></div>',
      '      <div class="thumb-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre.split('/')[0].trim()) + '</span></div>',
      '      <div class="play-hover" aria-hidden="true">▶</div>',
      '    </div>',
      '    <div class="movie-info">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="tag-row">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('\n');
  }

  function matches(movie, keyword, category) {
    var haystack = [
      movie.title,
      movie.region,
      movie.type,
      movie.genre,
      movie.oneLine,
      movie.summary,
      String(movie.year),
      movie.tags.join(' '),
      movie.categories.join(' ')
    ].join(' ').toLowerCase();

    if (keyword && haystack.indexOf(keyword) === -1) {
      return false;
    }
    if (category && movie.categories.indexOf(category) === -1) {
      return false;
    }
    return true;
  }

  function sortMovies(items, sort) {
    return items.slice().sort(function (a, b) {
      if (sort === 'year') {
        return b.year - a.year || b.score - a.score;
      }
      if (sort === 'title') {
        return a.title.localeCompare(b.title, 'zh-Hans-CN');
      }
      return b.score - a.score || b.year - a.year;
    });
  }

  function runSearch() {
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var category = categorySelect ? categorySelect.value : '';
    var sort = sortSelect ? sortSelect.value : 'score';
    var filtered = sortMovies(movies.filter(function (movie) {
      return matches(movie, keyword, category);
    }), sort).slice(0, 120);

    if (results) {
      results.innerHTML = filtered.map(renderCard).join('\n');
    }
    if (count) {
      count.textContent = '找到 ' + filtered.length + ' 部影片' + (filtered.length === 120 ? '（已显示前 120 条）' : '');
    }

    document.querySelectorAll('img[data-fallback]').forEach(function (img) {
      img.addEventListener('error', function () {
        var parent = img.parentElement;
        if (parent) {
          parent.classList.add('media-missing');
        }
      }, { once: true });
    });
  }

  fetch('assets/movies.json')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      movies = data;
      var params = getQueryParams();
      if (input) {
        input.value = params.q;
      }
      if (sortSelect) {
        sortSelect.value = params.sort;
      }
      runSearch();
    });

  [input, categorySelect, sortSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', runSearch);
      control.addEventListener('change', runSearch);
    }
  });

  if (button) {
    button.addEventListener('click', runSearch);
  }
});
