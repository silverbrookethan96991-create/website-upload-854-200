import { H as Hls } from './hls-vendor-dru42stk.js';

export function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var button = document.getElementById(options.buttonId);
  var layer = document.getElementById(options.layerId);
  var stream = options.source;
  var loaded = false;

  if (!video || !stream) {
    return;
  }

  var loadStream = function () {
    if (loaded) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (Hls && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    loaded = true;
  };

  var startPlayback = function () {
    loadStream();

    if (layer) {
      layer.classList.add('is-hidden');
    }

    var playTask = video.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  };

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      startPlayback();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (layer) {
      layer.classList.add('is-hidden');
    }
  });
}
