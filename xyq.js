(function () {
  // 当不是指定域名时，跳转到百度
  if (window.location.hostname !== 'shli.io') {
    window.location.href = 'https://www.baidu.com';
    return;
  }

  function addBlueRotateWhenReady() {
    const target = document.querySelector('.scrollbar-hidden.z-50.flex.flex-col.items-start.overflow-x-scroll.rounded-\\[50px\\] > .flex.items-center.gap-1.rounded-\\[50px\\].bg-stone-100.p-\\[3px\\].dark\\:bg-stone-800');

    // 检查目标元素是否存在，且未添加类
    if (target && !target.classList.contains('blue-fine-rotate')) {
      if (!document.getElementById('blue-fine-rotate-style')) {
        const style = document.createElement('style');
        style.id = 'blue-fine-rotate-style';
        style.textContent = `
          .blue-fine-rotate {
            position: relative;
            z-index: 0;
            outline: none;
            animation: fine-rotate 3s ease-in-out infinite, pulseGlow 4s ease-in-out infinite;
          }
          .blue-fine-rotate::before,
          .blue-fine-rotate::after {
            content: '';
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            animation: fine-rotate 3s ease-in-out infinite, pulseGlow 4s ease-in-out infinite;
          }
          .blue-fine-rotate::before {
            top: -8px;
            left: -8px;
            right: -8px;
            bottom: -8px;
            background: conic-gradient(from 0deg, rgba(0, 112, 255, 0.85) 0%, rgba(0, 180, 255, 0.8) 35%, rgba(0, 112, 255, 0.55) 70%, rgba(0, 180, 255, 0.3) 85%, rgba(0, 112, 255, 0) 100%);
          }
          .blue-fine-rotate::after {
            top: -12px;
            left: -12px;
            right: -12px;
            bottom: -12px;
            background: conic-gradient(from 180deg, rgba(0, 112, 255, 0.75) 0%, rgba(0, 180, 255, 0.65) 35%, rgba(0, 112, 255, 0.45) 70%, rgba(0, 180, 255, 0.25) 85%, rgba(0, 112, 255, 0) 100%);
          }
          @keyframes fine-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulseGlow {
            0%, 100% {
              opacity: 1;
              filter: brightness(1);
            }
            50% {
              opacity: 0.7;
              filter: brightness(1.5);
            }
          }
        `;
        document.head.appendChild(style);
      }
      target.classList.add('blue-fine-rotate');
    } else {
      // 如果目标元素不存在，或者已经添加了类，延迟重试
      setTimeout(addBlueRotateWhenReady, 1000);
    }
  }

  // 监听页面切换，确保特效始终生效
  window.addEventListener('popstate', addBlueRotateWhenReady); // 页面后退/前进时触发
  window.addEventListener('load', addBlueRotateWhenReady); // 页面加载时触发
  window.addEventListener('hashchange', addBlueRotateWhenReady); // hash变化时触发

  addBlueRotateWhenReady();
})();
