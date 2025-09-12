// 列表名字颜色变化，仅在 shli.io 下执行
(function () {
  if (window.location.hostname !== 'shli.io') return;

  // 获取所有服务器名字的 <p> 元素，符合这个类名选择器
  function getNameElements() {
    return document.querySelectorAll('p.break-normal.font-bold.tracking-tight.text-xs');
  }

  // 页面加载时随机一个初始色相偏移（0~1），用于彩虹色起点
  const initialHueOffset = Math.random();

  // 根据时间生成彩虹色（跳过红色，避免与离线冲突）
  function getCurrentRainbowColor() {
    const now = new Date();
    const cycle = 300000; // 每5分钟一圈 = 300000ms
    const t = now.getTime() % cycle;
    const progress = (t / cycle + initialHueOffset) % 1; // 加偏移后仍保持在0~1之间

    // 色相范围避开红色（用 [30°, 330°]）
    const hue = 30 + progress * 300;

    return `hsl(${hue.toFixed(0)}, 80%, 60%)`;
  }

  // 判断服务器是否离线
  function isOffline(el) {
    const div = el.parentElement;
    if (!div) return false;
    const section = div.parentElement;
    if (!section) return false;
    const statusDot = section.querySelector('span.h-2.w-2');
    if (!statusDot) return false;
    return statusDot.classList.contains('bg-red-500');
  }

  let offlineElements = new Set();
  let progress = 0;
  let direction = 1;

  function applyColorToNames() {
    offlineElements.clear();

    getNameElements().forEach(el => {
      if (isOffline(el)) {
        offlineElements.add(el);
        el.style.setProperty("color", "rgba(255, 0, 0, 0.6)", "important");
        el.dataset.colorized = "offline";
      } else {
        el.style.setProperty("color", getCurrentRainbowColor(), "important");
        el.dataset.colorized = "online";
      }
    });
  }

  // 离线红色名字闪烁
  setInterval(() => {
    progress += direction * 0.05;
    if (progress >= 1) {
      progress = 1;
      direction = -1;
    } else if (progress <= 0) {
      progress = 0;
      direction = 1;
    }

    const alpha = 0.4 + progress * 0.4;
    offlineElements.forEach(el => {
      el.style.setProperty("color", `rgba(255, 0, 0, ${alpha.toFixed(2)})`, "important");
    });
  }, 100);

  // 在线名字彩虹渐变每秒刷新
  setInterval(() => {
    getNameElements().forEach(el => {
      if (el.dataset.colorized === "online") {
        el.style.setProperty("color", getCurrentRainbowColor(), "important");
      }
    });
  }, 1000);

  // 初次应用颜色
  applyColorToNames();

  // DOM变动时更新颜色
  const observer = new MutationObserver(() => {
    applyColorToNames();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // 每小时整点重新触发颜色更新
  function msToNextHour() {
    const now = new Date();
    return (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
  }

  setTimeout(function tick() {
    applyColorToNames();
    setTimeout(tick, 60 * 60 * 1000);
  }, msToNextHour());
})();
