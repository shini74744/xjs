(function () {
  // 域名判断
  if (window.location.hostname !== 'shli.io') return;

  // 判断是否为移动设备
  function isMobileDevice() {
      return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
  }

  // 创建页面背景
  document.body.style.margin = '0';
  document.body.style.minHeight = '200vh';
  document.body.style.overflowY = 'scroll';
  document.body.style.backgroundImage = "url('https://t.alcy.cc/tx')"; // 可替换为 your-background.jpg
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';

  // 创建插图元素
  const illustration = document.createElement('div');
  illustration.id = 'illustration';
  illustration.style.position = 'absolute';
  illustration.style.width = '100px';
  illustration.style.height = '100px';
  illustration.style.backgroundImage = "url('https://t.alcy.cc/tx')"; // 插图链接
  illustration.style.backgroundSize = 'contain';
  illustration.style.backgroundRepeat = 'no-repeat';
  illustration.style.backgroundPosition = 'center';
  illustration.style.top = '50px';
  illustration.style.left = '50px';
  illustration.style.cursor = 'grab';
  illustration.style.userSelect = 'none';
  illustration.style.zIndex = '9999';

  // 仅在非移动设备显示
  if (!isMobileDevice()) {
      document.body.appendChild(illustration);

      let isDragging = false;
      let offsetX, offsetY;

      const targetX = 300;
      const targetY = 500;
      const targetWidth = 200;
      const targetHeight = 200;

      illustration.addEventListener('mousedown', (e) => {
          isDragging = true;
          offsetX = e.clientX - illustration.getBoundingClientRect().left;
          offsetY = e.clientY - illustration.getBoundingClientRect().top;
          illustration.style.cursor = 'grabbing';
          document.documentElement.style.overflow = 'visible';
      });

      document.addEventListener('mousemove', (e) => {
          if (isDragging) {
              illustration.style.left = e.clientX - offsetX + 'px';
              illustration.style.top = e.clientY - offsetY + 'px';
          }
      });

      document.addEventListener('mouseup', () => {
          if (isDragging) {
              isDragging = false;
              illustration.style.cursor = 'grab';
              document.documentElement.style.overflow = '';

              const illusRect = illustration.getBoundingClientRect();

              if (
                  illusRect.left >= targetX &&
                  illusRect.top >= targetY &&
                  illusRect.right <= targetX + targetWidth &&
                  illusRect.bottom <= targetY + targetHeight
              ) {
                  illustration.style.left = (targetX + (targetWidth - illusRect.width) / 2) + 'px';
                  illustration.style.top = (targetY + (targetHeight - illusRect.height) / 2) + 'px';
              }
          }
      });
  } else {
      illustration.style.display = 'none';
  }
})();
