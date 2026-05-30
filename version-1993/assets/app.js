(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function text(value) {
        return String(value || '').toLowerCase();
    }

    function initMenu() {
        var toggle = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[character];
        });
    }

    function searchTemplate(item) {
        var title = escapeHtml(item.title);
        var genre = escapeHtml(item.genre);
        var region = escapeHtml(item.region);
        var year = escapeHtml(item.year);
        return [
            '<a class="search-result-item" href="' + item.url + '">',
            '<img src="' + item.cover + '" alt="' + title + '">',
            '<span><strong>' + title + '</strong><span>' + genre + ' · ' + region + ' · ' + year + '</span></span>',
            '</a>'
        ].join('');
    }

    function initSiteSearch() {
        var data = typeof SITE_SEARCH_DATA !== 'undefined' ? SITE_SEARCH_DATA : [];
        qsa('[data-search-form]').forEach(function (form) {
            var input = qs('[data-search-input]', form);
            var results = qs('[data-search-results]', form);
            if (!input || !results) {
                return;
            }
            function render() {
                var keyword = text(input.value.trim());
                if (!keyword) {
                    results.classList.remove('is-visible');
                    results.innerHTML = '';
                    return;
                }
                var items = data.filter(function (item) {
                    return text(item.title + ' ' + item.genre + ' ' + item.region + ' ' + item.category + ' ' + item.tags + ' ' + item.oneLine).indexOf(keyword) !== -1;
                }).slice(0, 14);
                results.innerHTML = items.map(searchTemplate).join('');
                results.classList.toggle('is-visible', items.length > 0);
            }
            input.addEventListener('input', render);
            input.addEventListener('focus', render);
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var first = qs('.search-result-item', results);
                if (first) {
                    window.location.href = first.getAttribute('href');
                }
            });
            document.addEventListener('click', function (event) {
                if (!form.contains(event.target)) {
                    results.classList.remove('is-visible');
                }
            });
        });
    }

    function initHero() {
        var slider = qs('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = qsa('.hero-slide', slider);
        var dots = qsa('.hero-dot', slider);
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }
    }

    function initGridFilters() {
        qsa('[data-grid-search]').forEach(function (input) {
            var block = input.closest('.section-block') || document;
            var grid = qs('[data-filter-grid]', block) || qs('[data-filter-grid]');
            if (!grid) {
                return;
            }
            var items = qsa('.movie-card, .rank-row', grid);
            input.addEventListener('input', function () {
                var keyword = text(input.value.trim());
                items.forEach(function (item) {
                    var haystack = text(item.getAttribute('data-title') + ' ' + item.getAttribute('data-category') + ' ' + item.getAttribute('data-genre') + ' ' + item.getAttribute('data-year') + ' ' + item.textContent);
                    item.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
                });
            });
        });
    }

    function initPlayers() {
        qsa('[data-player]').forEach(function (player) {
            var video = qs('video', player);
            var button = qs('[data-play-trigger]', player);
            var url = player.getAttribute('data-video-url');
            var ready = false;
            var hlsInstance = null;
            if (!video || !button || !url) {
                return;
            }
            function loadVideo() {
                return new Promise(function (resolve) {
                    if (ready) {
                        resolve();
                        return;
                    }
                    ready = true;
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = url;
                        resolve();
                        return;
                    }
                    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                        hlsInstance = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(url);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                            resolve();
                        });
                        window.setTimeout(resolve, 1200);
                        return;
                    }
                    video.src = url;
                    resolve();
                });
            }
            function playVideo() {
                loadVideo().then(function () {
                    player.classList.add('is-playing');
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(function () {});
                    }
                });
            }
            button.addEventListener('click', playVideo);
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0) {
                    player.classList.remove('is-playing');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    initMenu();
    initSiteSearch();
    initHero();
    initGridFilters();
    initPlayers();
})();
