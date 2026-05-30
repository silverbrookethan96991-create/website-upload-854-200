(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = selectAll('.hero-slide');
    var dots = selectAll('.hero-dot');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    show(0);
    play();
  }

  function setupFilter() {
    var input = document.querySelector('.js-filter-input');
    var sort = document.querySelector('.js-sort-select');
    var grid = document.querySelector('.js-card-grid');
    var empty = document.querySelector('.empty-state');
    if (!grid) {
      return;
    }
    var cards = selectAll('.searchable-card', grid);

    function matches(card, keyword) {
      if (!keyword) {
        return true;
      }
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-score') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-region') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
      return text.indexOf(keyword) !== -1;
    }

    function applySort() {
      if (!sort || sort.value === 'default') {
        return;
      }
      var sorted = cards.slice().sort(function (a, b) {
        if (sort.value === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }
        var av = Number(a.getAttribute('data-' + sort.value) || 0);
        var bv = Number(b.getAttribute('data-' + sort.value) || 0);
        return bv - av;
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    function update() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;
      applySort();
      cards.forEach(function (card) {
        var ok = matches(card, keyword);
        card.classList.toggle('hidden-by-filter', !ok);
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    }

    if (input) {
      input.addEventListener('input', update);
    }
    if (sort) {
      sort.addEventListener('change', update);
    }
    update();
  }

  function setupAnchors() {
    selectAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var target = document.querySelector(link.getAttribute('href'));
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-video');
    var layer = document.querySelector('.play-layer');
    var hlsInstance = null;
    var ready = false;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else {
        video.src = source;
      }
    }

    function begin() {
      prepare();
      video.controls = true;
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (layer) {
            layer.classList.remove('is-hidden');
          }
        });
      }
    }

    if (layer) {
      layer.addEventListener('click', begin);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilter();
    setupAnchors();
  });
})();
