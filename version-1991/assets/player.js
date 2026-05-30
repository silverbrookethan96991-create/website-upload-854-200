document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var source = player.getAttribute('data-src');
    var playButton = player.querySelector('[data-player-play]');
    var toggleButton = player.querySelector('[data-player-toggle]');
    var muteButton = player.querySelector('[data-player-mute]');
    var fullscreenButton = player.querySelector('[data-player-fullscreen]');
    var loading = player.querySelector('[data-player-loading]');
    var errorBox = player.querySelector('[data-player-error]');
    var hlsInstance = null;
    var initialized = false;

    function showError(message) {
      if (loading) {
        loading.hidden = true;
      }
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = message;
      }
    }

    function markReady() {
      if (loading) {
        loading.hidden = true;
      }
    }

    function initializePlayer() {
      if (initialized || !video || !source) {
        return;
      }
      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, markReady);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            showError('网络错误，正在重新连接播放源。');
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            showError('媒体错误，正在尝试恢复播放。');
            hlsInstance.recoverMediaError();
          } else {
            showError('播放出错，请刷新页面后重试。');
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', markReady, { once: true });
      } else {
        showError('当前浏览器不支持 HLS 播放，请使用 Chrome、Edge、Safari 或 Firefox。');
      }
    }

    function playOrPause() {
      initializePlayer();
      if (!video) {
        return;
      }
      if (video.paused) {
        video.play().catch(function () {
          showError('浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      } else {
        video.pause();
      }
    }

    function updateState() {
      if (!video) {
        return;
      }
      player.classList.toggle('is-playing', !video.paused);
    }

    if (playButton) {
      playButton.addEventListener('click', playOrPause);
    }
    if (toggleButton) {
      toggleButton.addEventListener('click', playOrPause);
    }
    if (video) {
      video.addEventListener('click', playOrPause);
      video.addEventListener('play', updateState);
      video.addEventListener('pause', updateState);
      video.setAttribute('controls', 'controls');
    }
    if (muteButton && video) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }
    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        if (!document.fullscreenElement) {
          player.requestFullscreen().catch(function () {});
        } else {
          document.exitFullscreen();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
