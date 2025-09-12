(function() {
  // 判断域名
  if (window.location.hostname !== 'shli.io') return;

  // ------------------ 纯 JS 版本：底部 IP iframe ------------------
  const ipIframeWrapper = document.createElement('div');
  ipIframeWrapper.id = 'ip-iframe';
  ipIframeWrapper.style.cssText = `
      position: fixed;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      width: 90%;
      max-width: 650px;
      height: 125px;
      z-index: 9988;
      opacity: 0;
      transition: opacity 0.5s ease, transform 0.5s ease;
      pointer-events: none;
  `;

  const ipIframe = document.createElement('iframe');
  ipIframe.src = 'https://ip.skk.moe/simple-dark';
  ipIframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  `;

  ipIframeWrapper.appendChild(ipIframe);
  document.body.appendChild(ipIframeWrapper);

  function isDesktop() {
      return !/Mobi|Android/i.test(navigator.userAgent);
  }

  if (!isDesktop()) {
      ipIframeWrapper.style.display = 'none';
  }

  let timeoutId = null;
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', function () {
      const currentScrollY = window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrolledToBottom = viewportHeight + currentScrollY >= pageHeight - 2;

      if (currentScrollY < lastScrollY) {
          clearTimeout(timeoutId);
          hideIframe();
      } else {
          if (isDesktop() && scrolledToBottom) {
              clearTimeout(timeoutId);
              timeoutId = setTimeout(() => {
                  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
                      showIframe();
                  }
              }, 300);
          } else {
              clearTimeout(timeoutId);
              hideIframe();
          }
      }

      lastScrollY = currentScrollY;
  });

  function showIframe() {
      ipIframeWrapper.style.opacity = '1';
      ipIframeWrapper.style.transform = 'translateX(-50%) translateY(0)';
      ipIframeWrapper.style.pointerEvents = 'auto';
  }

  function hideIframe() {
      ipIframeWrapper.style.opacity = '0';
      ipIframeWrapper.style.transform = 'translateX(-50%) translateY(20px)';
      ipIframeWrapper.style.pointerEvents = 'none';
  }

})();
