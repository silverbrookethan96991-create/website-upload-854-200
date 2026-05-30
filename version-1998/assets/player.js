(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }

    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var url = video ? video.getAttribute("data-video-url") : "";
    var hlsInstance = null;
    var started = false;

    function showOverlay() {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          showOverlay();
        });
      }
    }

    function attachWithHls() {
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showOverlay();
          }
        });
        return true;
      }
      return false;
    }

    function start() {
      if (!video || !url) {
        return;
      }
      hideOverlay();
      video.controls = true;

      if (started) {
        playVideo();
        return;
      }
      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
        return;
      }

      if (!attachWithHls()) {
        video.src = url;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
