(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var button = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var tabs = qsa('[data-hero-tab]', root);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      tabs.forEach(function (tab, tabIndex) {
        tab.classList.toggle('is-active', tabIndex === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(tab.getAttribute('data-hero-tab')) || 0);
        start();
      });
    });
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var form = qs('[data-filter-form]');
    var list = qs('[data-filter-list]');
    if (!form || !list) {
      return;
    }
    var keyword = qs('[data-filter-keyword]', form);
    var year = qs('[data-filter-year]', form);
    var region = qs('[data-filter-region]', form);
    var type = qs('[data-filter-type]', form);
    var empty = qs('[data-filter-empty]');
    var cards = qsa('.movie-card', list);
    var params = new URLSearchParams(window.location.search);
    if (keyword && params.get('q')) {
      keyword.value = params.get('q');
    }
    function apply() {
      var q = normalize(keyword && keyword.value);
      var selectedYear = normalize(year && year.value);
      var selectedRegion = normalize(region && region.value);
      var selectedType = normalize(type && type.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matched = true;
        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (selectedYear && normalize(card.getAttribute('data-year')) !== selectedYear) {
          matched = false;
        }
        if (selectedRegion && normalize(card.getAttribute('data-region')) !== selectedRegion) {
          matched = false;
        }
        if (selectedType && normalize(card.getAttribute('data-type')) !== selectedType) {
          matched = false;
        }
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    [keyword, year, region, type].forEach(function (field) {
      if (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      }
    });
    apply();
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = qs('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.2/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function initPlayer() {
    var video = qs('#movie-player');
    var button = qs('[data-play-button]');
    var state = qs('[data-player-state]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-hls');
    var sourceReady = false;
    var pendingPlay = false;
    function setState(text) {
      if (state) {
        state.textContent = text;
      }
    }
    function tryPlay() {
      if (!sourceReady) {
        pendingPlay = true;
        setState('播放源加载中');
        return;
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          if (button) {
            button.classList.add('is-hidden');
          }
          setState('正在播放');
        }).catch(function () {
          setState('请再次点击播放');
        });
      }
    }
    function markReady() {
      sourceReady = true;
      setState('高清播放已就绪');
      if (pendingPlay) {
        pendingPlay = false;
        tryPlay();
      }
    }
    if (source && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', markReady, { once: true });
    } else if (source) {
      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, markReady);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setState('播放源暂不可用');
            }
          });
        } else {
          video.src = source;
          markReady();
        }
      });
    }
    if (button) {
      button.addEventListener('click', tryPlay);
    }
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.classList.remove('is-hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initFilters();
    initPlayer();
  });
})();
