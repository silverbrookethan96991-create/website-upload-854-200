(function () {
  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = toArray(carousel.querySelectorAll('.hero-slide'));
    var dots = toArray(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
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
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-tags') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-year') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function setupFilters() {
    var grids = toArray(document.querySelectorAll('[data-card-grid]'));
    grids.forEach(function (grid) {
      var section = grid.closest('section') || document;
      var input = section.querySelector('[data-search-input]');
      var count = section.querySelector('[data-result-count]');
      var empty = section.querySelector('[data-empty-state]');
      var buttons = toArray(section.querySelectorAll('[data-sort]'));
      var cards = toArray(grid.querySelectorAll('[data-card]'));
      var currentSort = 'id';
      var query = '';

      function sortCards() {
        var sorted = cards.slice().sort(function (a, b) {
          if (currentSort === 'score') {
            return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
          }
          if (currentSort === 'views') {
            return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
          }
          if (currentSort === 'year') {
            return String(b.getAttribute('data-year')).localeCompare(String(a.getAttribute('data-year')), 'zh-CN');
          }
          return Number(a.getAttribute('data-id')) - Number(b.getAttribute('data-id'));
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function apply() {
        var shown = 0;
        cards.forEach(function (card) {
          var visible = !query || cardText(card).indexOf(query) !== -1;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });
        if (count) {
          count.textContent = String(shown);
        }
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', function () {
          query = input.value.trim().toLowerCase();
          apply();
        });
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          currentSort = button.getAttribute('data-sort') || 'id';
          buttons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          sortCards();
          apply();
        });
      });

      sortCards();
      apply();
    });
  }

  function setupPlayers() {
    var players = toArray(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-start]');
      var source = video ? video.getAttribute('data-src') : '';
      if (!video || !source || !button) {
        return;
      }

      function start() {
        if (!player.getAttribute('data-ready')) {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            player.hlsInstance = hls;
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            video.src = source;
          }
          video.setAttribute('controls', 'controls');
          player.setAttribute('data-ready', 'true');
        }

        player.classList.add('playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            player.classList.remove('playing');
            video.setAttribute('controls', 'controls');
          });
        }
      }

      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!player.getAttribute('data-ready')) {
          start();
        }
      });
    });

    toArray(document.querySelectorAll('[data-player-jump]')).forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var player = document.querySelector('[data-player]');
        if (!player) {
          return;
        }
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var button = player.querySelector('[data-player-start]');
        if (button) {
          window.setTimeout(function () {
            button.click();
          }, 260);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupPlayers();
  });
})();
