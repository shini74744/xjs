(function() {
  // 判断域名
  if (window.location.hostname !== 'shli.io') return;

  // --------------- 动态创建右下角元素并控制显示 ---------------
  const footer = document.createElement('div');
  footer.className = 'footer-background';

  const style = document.createElement('style');
  style.textContent = `
      .footer-background {
          display: none;
          background-image: url('https://count.getloli.com/@tongji?name=tongji&theme=booru-mjg&padding=7&offset=0&align=top&scale=1&pixelated=1&darkmode=auto');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center center;
          height: 60px;
          width: 20vw;
          max-width: 360px;
          min-width: 200px;
          position: fixed;
          right: 60px;
          bottom: 1px;
          z-index: 9988;
          opacity: 0;
          transform: scale(0);
          transition: all 0.5s ease-in-out;
      }
  `;
  document.head.appendChild(style);
  document.body.appendChild(footer);

  function updateFooterVisibility() {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.innerHeight + window.scrollY;

      if (window.innerWidth < 768) {
          footer.style.display = 'none';
          return;
      }

      if (scrollPosition >= scrollHeight) {
          footer.style.display = 'block';
          footer.style.opacity = '1';
          footer.style.transform = 'scale(1)';
      } else {
          footer.style.opacity = '0';
          footer.style.transform = 'scale(0)';
      }
  }

  window.addEventListener('scroll', updateFooterVisibility);
  window.addEventListener('resize', updateFooterVisibility);
  window.addEventListener('load', updateFooterVisibility);
})();
