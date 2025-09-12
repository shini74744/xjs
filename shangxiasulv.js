(function () {
  // 只在 shli.io 域名下执行
  if (window.location.hostname !== 'shli.io') return;

  const REFRESH_INTERVAL = 500; // 刷新间隔，单位毫秒，越小刷新越频繁
  const MAX_SPEED = 30 * 1024 * 1024; // 最高速度阈值，30MB/s，超过这个应用最高级特效

  // 动态插入CSS样式，用于不同速度等级的闪烁动画和样式效果
  const style = document.createElement('style');
  style.textContent = `
    /* 轻度闪烁动画，周期1秒 */
    @keyframes flash-soft {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    /* 快速闪烁动画，周期0.7秒 */
    @keyframes flash-fast {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.2; }
    }
    /* 上传速度超过10MB/s的轻度特效 */
    .speed-boost-1 {
      font-weight: bold; /* 加粗字体 */
      animation: flash-soft 1s infinite; /* 轻度闪烁动画 */
      text-shadow: 0 0 4px rgba(255, 0, 0, 0.5); /* 红色阴影 */
    }
    /* 上传速度超过20MB/s的中度特效 */
    .speed-boost-2 {
      font-weight: bold;
      animation: flash-fast 0.7s infinite; /* 快速闪烁 */
      text-shadow: 0 0 6px rgba(255, 0, 0, 0.8); /* 更明显阴影 */
      transform: scale(1.05); /* 略微放大 */
    }
    /* 上传速度超过30MB/s的高级特效 */
    .speed-boost-3 {
      font-weight: bold;
      animation: flash-fast 0.5s infinite; /* 更快闪烁 */
      text-shadow: 0 0 10px rgba(255, 0, 0, 1); /* 强烈阴影 */
      transform: scale(1.15); /* 明显放大 */
      background-color: rgba(255, 0, 0, 0.08); /* 红色背景高亮 */
      border-radius: 4px; /* 圆角 */
    }
    /* 下载速度对应的轻度特效，蓝色阴影 */
    .speed-boost-1-dl {
      font-weight: bold;
      animation: flash-soft 1s infinite;
      text-shadow: 0 0 4px rgba(0, 0, 255, 0.5);
    }
    /* 下载速度中度特效 */
    .speed-boost-2-dl {
      font-weight: bold;
      animation: flash-fast 0.7s infinite;
      text-shadow: 0 0 6px rgba(0, 0, 255, 0.8);
      transform: scale(1.05);
    }
    /* 下载速度高级特效 */
    .speed-boost-3-dl {
      font-weight: bold;
      animation: flash-fast 0.5s infinite;
      text-shadow: 0 0 10px rgba(0, 0, 255, 1);
      transform: scale(1.15);
      background-color: rgba(0, 0, 255, 0.08);
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);

  /**
   * 解析速度字符串，返回字节/秒数值
   * @param {string} speedStr 速率字符串，例如 "123K/s", "1.2M/s"
   * @returns {number} 速率，单位字节/秒
   */
  function parseSpeed(speedStr) {
    if (!speedStr) return 0;
    const units = { 'B/s': 1, 'K/s': 1024, 'M/s': 1024 * 1024, 'G/s': 1024 * 1024 * 1024 };
    const regex = /^([\d.]+)([BKMG]\/s)$/;
    const match = speedStr.match(regex);
    if (!match) return 0;
    return parseFloat(match[1]) * (units[match[2]] || 1);
  }

  /**
   * 根据速率计算颜色，使用对数比例映射，白色渐变到红色或蓝色
   * @param {number} speed 当前速度，单位字节/秒
   * @param {number} maxSpeed 最大速度阈值，单位字节/秒
   * @param {string} type 'upload' 或 'download'
   * @returns {string} CSS rgb颜色字符串
   */
  function speedToColor(speed, maxSpeed, type) {
    const logSpeed = Math.log10(speed + 1); // 防止log(0)出错
    const logMax = Math.log10(maxSpeed + 1);
    const ratio = Math.min(logSpeed / logMax, 1); // 归一化到0-1之间

    if (type === 'upload') {
      const r = 255;
      const g = Math.round(255 * (1 - ratio));
      const b = Math.round(255 * (1 - ratio));
      return `rgb(${r},${g},${b})`;
    } else {
      const r = Math.round(255 * (1 - ratio));
      const g = Math.round(255 * (1 - ratio));
      const b = 255;
      return `rgb(${r},${g},${b})`;
    }
  }

  /**
   * 根据速率给元素应用不同等级的动画特效类
   * @param {HTMLElement} elem 要操作的DOM元素
   * @param {number} speed 当前速度，单位字节/秒
   * @param {string} type 'upload' 或 'download'
   */
  function applyEffect(elem, speed, type) {
    const classList = elem.classList;
    // 移除所有特效类，避免叠加
    classList.remove(
      'speed-boost-1', 'speed-boost-2', 'speed-boost-3',
      'speed-boost-1-dl', 'speed-boost-2-dl', 'speed-boost-3-dl'
    );

    // 根据速率区间添加对应动画样式类
    if (speed > 30 * 1024 * 1024) { // 超过30MB/s
      classList.add(type === 'upload' ? 'speed-boost-3' : 'speed-boost-3-dl');
    } else if (speed > 20 * 1024 * 1024) { // 20-30MB/s
      classList.add(type === 'upload' ? 'speed-boost-2' : 'speed-boost-2-dl');
    } else if (speed > 10 * 1024 * 1024) { // 10-20MB/s
      classList.add(type === 'upload' ? 'speed-boost-1' : 'speed-boost-1-dl');
    }
  }

  /**
   * 主刷新函数，更新所有卡片的速率颜色和特效
   */
  function updateSpeedColors() {
    // 选择所有服务器卡片
    const cards = document.querySelectorAll('div.rounded-lg.border.bg-card.text-card-foreground.shadow-lg');
    cards.forEach(card => {
      // 找到速率显示元素（上传和下载）
      const speedElems = card.querySelectorAll(
        'section.grid.grid-cols-5 > div.flex.flex-col > div.flex.items-center.text-xs.font-semibold'
      );
      if (speedElems.length >= 5) {
        const uploadElem = speedElems[3];   // 上传速率元素
        const downloadElem = speedElems[4]; // 下载速率元素

        const uploadStr = uploadElem.textContent.trim();
        const downloadStr = downloadElem.textContent.trim();

        // 解析速度
        const uploadSpeed = parseSpeed(uploadStr);
        const downloadSpeed = parseSpeed(downloadStr);

        // 设置颜色和动画过渡
        uploadElem.style.transition = 'color 0.5s ease, transform 0.5s ease';
        downloadElem.style.transition = 'color 0.5s ease, transform 0.5s ease';

        // 应用对数颜色渐变
        uploadElem.style.color = speedToColor(uploadSpeed, MAX_SPEED, 'upload');
        downloadElem.style.color = speedToColor(downloadSpeed, MAX_SPEED, 'download');

        // 应用动画特效
        applyEffect(uploadElem, uploadSpeed, 'upload');
        applyEffect(downloadElem, downloadSpeed, 'download');
      }
    });
  }

  // 启动定时器，定时刷新颜色和特效，页面隐藏时暂停刷新
  setInterval(() => {
    if (!document.hidden) updateSpeedColors();
  }, REFRESH_INTERVAL);
})();
