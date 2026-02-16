(function() {
  // 判断域名
  if (window.location.hostname !== 'shli.io') return;

  // --------------- 动态创建右上角元素并控制显示 ---------------
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
          width: 240px;          /* 固定宽度更像角标 */
          max-width: unset;
          min-width: unset;

          position: fixed;
          right: 0;              /* 贴右上角 */
          top: 0;
          bottom: auto;
          z-index: 9988;

          opacity: 0;
          transform: scale(0);
          transform-origin: top right; /* 从右上角缩放 */
          transition: all 0.5s ease-in-out;
          pointer-events: none;  /* 不挡点击 */
      }
  `;
  document.head.appendChild(style);
  document.body.appendChild(footer);

  function updateFooterVisibility() {
      // 小屏不显示
      if (window.innerWidth < 768) {
          footer.style.display = 'none';
          return;
      }

      // 进入页面(顶部)显示，往下滚动隐藏
      const atTop = window.scrollY <= 5;

      if (atTop) {
          footer.style.display = 'block';
          footer.style.opacity = '1';
          footer.style.transform = 'scale(1)';
      } else {
          footer.style.opacity = '0';
          footer.style.transform = 'scale(0)';
      }
  }

  window.addEventListener('scroll', updateFooterVisibility, { passive: true });
  window.addEventListener('resize', updateFooterVisibility);
  window.addEventListener('load', updateFooterVisibility);
})();
