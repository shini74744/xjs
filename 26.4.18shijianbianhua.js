(function () {
  // —— 域名白名单（仅 shli.io 及其子域名生效）——
  try {
    var host = (location && location.hostname) ? location.hostname.toLowerCase() : '';
    var allowed = host === 'shli.io' || host.endsWith('.shli.io');
    if (!allowed) {
      location.replace('https://www.baidu.com/');
      return;
    }
  } catch (e) {
    location.replace('https://www.baidu.com/');
    return;
  }

  // ===== 终点颜色：更亮的红绿蓝 =====
  const HOUR_END = [255, 40, 40];   // 红
  const MIN_END  = [40, 255, 100];  // 绿
  const SEC_END  = [40, 120, 255];  // 蓝
  const WHITE    = [255, 255, 255];

  let lastTime = {
    h: null,
    m: null,
    s: null
  };

  function mixColor(start, end, ratio) {
    ratio = Math.max(0, Math.min(1, ratio));
    const r = Math.round(start[0] + (end[0] - start[0]) * ratio);
    const g = Math.round(start[1] + (end[1] - start[1]) * ratio);
    const b = Math.round(start[2] + (end[2] - start[2]) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function applyColorToGroup(group, color) {
    if (!group) return;

    group.style.color = color;
    group.querySelectorAll('[data-issues-count-enter], [data-issues-count-exit]').forEach(el => {
      el.style.color = color;
    });
  }

  function getDirectTimeGroups(root) {
    if (!root) return [];

    const groups = [];

    for (const child of root.children) {
      if (child.matches && child.matches('[data-issues-count-animation="true"]')) {
        groups.push(child);
        continue;
      }

      const directAnimatedChild = Array.from(child.children || []).find(
        el => el.matches && el.matches('[data-issues-count-animation="true"]')
      );

      if (directAnimatedChild) {
        groups.push(directAnimatedChild);
      }
    }

    return groups;
  }

  function findTimeRoot() {
    const roots = document.querySelectorAll('div.flex.items-center.font-medium.text-sm');

    for (const root of roots) {
      const groups = getDirectTimeGroups(root);
      const colonCount = Array.from(root.children).filter(
        el => el.tagName === 'SPAN' && el.textContent.trim() === ':'
      ).length;

      if (groups.length === 3 && colonCount === 2) {
        return root;
      }
    }

    return null;
  }

  function colorizeTime(force = false) {
    const root = findTimeRoot();
    if (!root) return;

    const groups = getDirectTimeGroups(root);
    if (groups.length !== 3) return;

    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    const hourColor = mixColor(WHITE, HOUR_END, h / 23);
    const minColor  = mixColor(WHITE, MIN_END,  m / 59);
    const secColor  = mixColor(WHITE, SEC_END,  s / 59);

    if (force || h !== lastTime.h) applyColorToGroup(groups[0], hourColor);
    if (force || m !== lastTime.m) applyColorToGroup(groups[1], minColor);
    if (force || s !== lastTime.s) applyColorToGroup(groups[2], secColor);

    root.querySelectorAll('span.opacity-50').forEach(el => {
      el.style.color = 'rgba(255,255,255,0.72)';
    });

    lastTime = { h, m, s };
  }

  colorizeTime(true);

  setInterval(() => {
    colorizeTime(false);
  }, 250);

  const observer = new MutationObserver(() => {
    colorizeTime(true);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
