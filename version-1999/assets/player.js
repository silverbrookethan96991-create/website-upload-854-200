import { H as Hls } from './hls-vendor.js';

document.addEventListener('DOMContentLoaded', function () {
  var video = document.getElementById('movie-player');
  var trigger = document.getElementById('play-trigger');
  var message = document.querySelector('[data-player-message]');

  if (!video || !trigger) {
    return;
  }

  var source = video.getAttribute('data-src');
  var hasLoaded = false;
  var hls = null;

  function showMessage(text) {
    if (!message) {
      return;
    }
    message.textContent = text;
    message.classList.add('show');
  }

  function hideMessage() {
    if (message) {
      message.textContent = '';
      message.classList.remove('show');
    }
  }

  function playVideo() {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        showMessage('浏览器阻止了自动播放，请再次点击播放器播放。');
      });
    }
  }

  function initHls() {
    if (!source) {
      showMessage('当前页面没有可用播放源。');
      return;
    }

    hideMessage();
    trigger.classList.add('hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage('播放源加载失败，请刷新页面或更换浏览器后重试。');
          if (hls) {
            hls.destroy();
            hls = null;
          }
        }
      });
      return;
    }

    showMessage('当前浏览器暂不支持 HLS 播放，请使用 Chrome、Edge、Firefox 或 Safari。');
  }

  trigger.addEventListener('click', function () {
    if (!hasLoaded) {
      hasLoaded = true;
      initHls();
      return;
    }
    trigger.classList.add('hidden');
    playVideo();
  });

  video.addEventListener('play', function () {
    trigger.classList.add('hidden');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime > 0 && !video.ended) {
      trigger.classList.remove('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
