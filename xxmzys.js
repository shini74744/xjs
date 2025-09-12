(function () {
  if (window.location.hostname !== 'shli.io') return;

  // 获取详细页中服务器名字的元素
  function getDetailNameElement() {
    return document.querySelector('div.server-name');
  }

  // 获取详细页中状态点的元素（class含 bg-green-800 或 bg-red-500）
  function getDetailStatusElement() {
    return document.querySelector('div.bg-green-800, div.bg-red-500');
  }

  // 判断是否为离线状态
  function isOffline(statusEl) {
    return statusEl && statusEl.classList.contains('bg-red-500');
  }

  // 页面每次进入，生成一个随机初始偏移（用于彩虹颜色初始值）
  const hueOffset = Math.random();

  // 在线状态颜色：使用 hue 值避开红色区间 (30°~330°)，5分钟一轮彩虹变化
  function getColorByTime() {
    const now = new Date();
    const t = now.getTime(); // 毫秒时间戳
    const cycle = 300000; // 5分钟 = 300,000ms
    const progress = ((t % cycle) / cycle + hueOffset) % 1; // 加入随机偏移
    const hue = 30 + progress * 300;
    return `hsl(${hue.toFixed(0)}, 80%, 60%)`;
  }

  let isOfflineNow = false;
  let nameEl = null;
  let progress = 0;
  let direction = 1;

  function applyColor() {
    const el = getDetailNameElement();
    const status = getDetailStatusElement();
    if (!el || !status) return;

    nameEl = el;
    isOfflineNow = isOffline(status);

    if (isOfflineNow) {
      el.style.setProperty("color", "rgba(255, 0, 0, 0.6)", "important");
      el.dataset.colorized = "offline";
    } else {
      el.style.setProperty("color", getColorByTime(), "important");
      el.dataset.colorized = "online";
    }
  }

  // 离线名字闪烁
  setInterval(() => {
    if (!isOfflineNow || !nameEl) return;
    progress += direction * 0.05;
    if (progress >= 1) {
      progress = 1;
      direction = -1;
    } else if (progress <= 0) {
      progress = 0;
      direction = 1;
    }
    const alpha = 0.4 + progress * 0.4;
    nameEl.style.setProperty("color", `rgba(255, 0, 0, ${alpha.toFixed(2)})`, "important");
  }, 100);

  // 在线名字每秒更新颜色
  setInterval(() => {
    if (nameEl && !isOfflineNow) {
      nameEl.style.setProperty("color", getColorByTime(), "important");
    }
  }, 1000);

  // 初始运行一次
  applyColor();

  // 监听 DOM 更新
  const observer = new MutationObserver(() => {
    applyColor();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
