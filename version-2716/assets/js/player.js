(function () {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var button = document.querySelector('[data-player-button]');
  var message = document.querySelector('[data-player-message]');
  var hlsInstance = null;
  var hasStarted = false;

  if (!video || typeof currentVideoUrl === 'undefined') {
    return;
  }

  function showMessage(text) {
    if (!message) {
      return;
    }

    message.textContent = text;
    message.classList.add('is-visible');
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function playVideo() {
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        showMessage('点击画面即可继续观看');
      });
    }
  }

  function attachWithHls() {
    if (!window.Hls || !window.Hls.isSupported()) {
      showMessage('暂时无法播放，请稍后再试');
      return;
    }

    if (hlsInstance) {
      playVideo();
      return;
    }

    hlsInstance = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hlsInstance.loadSource(currentVideoUrl);
    hlsInstance.attachMedia(video);
    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
      playVideo();
    });
    hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
        hlsInstance.startLoad();
      } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
        hlsInstance.recoverMediaError();
      } else {
        showMessage('暂时无法播放，请稍后再试');
      }
    });
  }

  function loadLibraryAndPlay() {
    var existing = document.querySelector('script[data-hls-library]');

    if (existing) {
      existing.addEventListener('load', attachWithHls, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-library', 'true');
    script.addEventListener('load', attachWithHls);
    script.addEventListener('error', function () {
      showMessage('暂时无法播放，请稍后再试');
    });
    document.head.appendChild(script);
  }

  function start() {
    hideOverlay();

    if (hasStarted) {
      playVideo();
      return;
    }

    hasStarted = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = currentVideoUrl;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
      return;
    }

    if (window.Hls) {
      attachWithHls();
      return;
    }

    loadLibraryAndPlay();
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!hasStarted) {
      start();
      return;
    }

    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });
})();
