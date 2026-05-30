import { H as Hls } from './hls-dru42stk.js';

function setupPlayer(shell) {
  const video = shell.querySelector('video');
  const button = shell.querySelector('[data-player-play]');
  const status = shell.querySelector('[data-player-status]');
  const source = shell.getAttribute('data-video-src');
  let hlsInstance = null;
  let isReady = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function attachSource() {
    if (!video || !source || isReady) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      isReady = true;
      setStatus('已加载原生 HLS 播放源');
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        isReady = true;
        setStatus('播放源加载完成');
      });
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放源加载异常，请刷新后重试');
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
        }
      });
      return;
    }

    setStatus('当前浏览器不支持 HLS 播放');
  }

  async function playVideo() {
    attachSource();

    if (!video) {
      return;
    }

    try {
      await video.play();
      if (button) {
        button.classList.add('is-hidden');
      }
      setStatus('正在播放');
    } catch (error) {
      setStatus('已加载播放源，请再次点击播放');
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
      setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
      setStatus('已暂停');
    });
  }
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
