(function () {
  // 判断域名
  if (window.location.hostname !== 'shli.io') return;

  // ===================
  // 动态插入样式
  // ===================
  const style = document.createElement('style');
  style.textContent = `
    body {
      margin: 0;
      height: 200vh;
      background-color: #1a1a1a;
      color: white;
    }

    .fragment {
      position: fixed;
      width: 10px;
      height: 10px;
      clip-path: polygon(0 0, 100% 0, 100% 100%);
      transform-origin: center;
      animation: shatter 1.5s ease-out forwards;
      pointer-events: none;
      z-index: 9988;
      background-color: rgba(255, 255, 255, 0.8);
    }

    @keyframes shatter {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(var(--dx), var(--dy)) rotate(var(--angle)) scale(0.5);
        opacity: 0;
      }
    }

    #backToTop {
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 1000;
      background-color: transparent;
      color: white;
      border: none;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
      transition: opacity 0.3s, transform 0.3s;
      display: none;
    }

    #backToTop:hover {
      transform: scale(1.1);
    }

    #backToTop::before {
      content: "🚀";
      font-size: 24px;
      display: block;
      line-height: 60px;
      text-align: center;
    }
  `;
  document.head.appendChild(style);

  // ===================
  // 创建返回顶部按钮
  // ===================
  const backToTopButton = document.createElement('button');
  backToTopButton.id = 'backToTop';
  document.body.appendChild(backToTopButton);

  // ===================
  // 碎玻璃特效逻辑
  // ===================
  document.addEventListener('click', e => {
    createShatterEffect(e.clientX, e.clientY);
  });

  function createShatterEffect(x, y) {
    const fragmentCount = 20;
    for (let i = 0; i < fragmentCount; i++) {
      const fragment = document.createElement('div');
      fragment.className = 'fragment';

      const angle = Math.random() * 360;
      const distance = Math.random() * 200 + 50;
      const dx = Math.cos((angle * Math.PI) / 180) * distance;
      const dy = Math.sin((angle * Math.PI) / 180) * distance;

      fragment.style.left = `${x}px`;
      fragment.style.top = `${y}px`;
      fragment.style.setProperty('--dx', `${dx}px`);
      fragment.style.setProperty('--dy', `${dy}px`);
      fragment.style.setProperty('--angle', `${Math.random() * 720}deg`);

      document.body.appendChild(fragment);
      setTimeout(() => fragment.remove(), 1500);
    }
  }

  // ===================
  // 返回顶部按钮逻辑
  // ===================
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopButton.style.display = 'block';
    } else {
      backToTopButton.style.display = 'none';
    }
  });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
})();
