// ------------------ 域名判断 ------------------
if (window.location.hostname !== 'shli.io') {
  console.warn('流量进度条脚本未授权的域名，停止执行');
} else {
  // ------------------ 网站进度条显示脚本 ------------------
  const SCRIPT_VERSION = 'v20250617';

  function injectCustomCSS() {
    const style = document.createElement('style');
    style.textContent = `.mt-4.w-full.mx-auto > div { display: none; }`;
    document.head.appendChild(style);
  }
  injectCustomCSS();

  const utils = (() => {
    function formatFileSize(bytes) {
      if (bytes === 0) return { value: '0', unit: 'B' };
      const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
      let size = bytes, unitIndex = 0;
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      return { value: size.toFixed(unitIndex === 0 ? 0 : 2), unit: units[unitIndex] };
    }

    function calculatePercentage(used, total) {
      used = Number(used); total = Number(total);
      if (used > 1e15 || total > 1e15) {
        used /= 1e10; total /= 1e10;
      }
      return total === 0 ? '0.00' : ((used / total) * 100).toFixed(2);
    }

    function formatDate(dateString) {
      const date = new Date(dateString);
      if (isNaN(date)) return '';
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    function getHslGradientColor(percentage) {
      const p = Math.min(Math.max(Number(percentage), 0), 100);
      const hue = 120 - (120 * (p / 100)); // 0%绿色，100%红色
      return `hsl(${hue.toFixed(0)}, 65%, 40%)`;
    }

    function fadeOutIn(el, newContent, duration = 500) {
      el.style.transition = `opacity ${duration / 2}ms`;
      el.style.opacity = '0';
      setTimeout(() => {
        el.innerHTML = newContent;
        el.style.transition = `opacity ${duration / 2}ms`;
        el.style.opacity = '1';
      }, duration / 2);
    }

    return { formatFileSize, calculatePercentage, formatDate, getHslGradientColor, fadeOutIn };
  })();

  const trafficRenderer = (() => {
    const toggleElements = [];
    function renderTrafficStats(data, config) {
      const serverMap = new Map();
      for (const cycleId in data) {
        const cycle = data[cycleId];
        if (!cycle.server_name || !cycle.transfer) continue;
        for (const serverId in cycle.server_name) {
          const name = cycle.server_name[serverId];
          const transfer = cycle.transfer[serverId];
          const { max, from, to } = cycle;
          const next_update = cycle.next_update[serverId];
          if (name && transfer !== undefined && max && from && to) {
            serverMap.set(name, { id: serverId, transfer, max, name: cycle.name, from, to, next_update });
          }
        }
      }

      serverMap.forEach((server, name) => {
        const target = Array.from(document.querySelectorAll('section.grid.items-center.gap-2'))
          .find(s => s.querySelector('p')?.textContent.trim() === name.trim());
        if (!target) return;

        const used = utils.formatFileSize(server.transfer);
        const total = utils.formatFileSize(server.max);
        const percent = utils.calculatePercentage(server.transfer, server.max);
        const progressColor = utils.getHslGradientColor(percent);
        const fromDate = utils.formatDate(server.from);
        const toDate = utils.formatDate(server.to);
        const nextUpdate = new Date(server.next_update).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

        const uniqueClass = 'traffic-stats-for-server-' + server.id;
        const container = target.closest('div');
        if (!container) return;

        const existing = container.querySelector(`.${uniqueClass}`);
        const rotateContents = [
          `<span style="color:#fff;">${fromDate}</span><span style="color:#fff;"> - </span><span style="color:#fff;">${toDate}</span>`,
          `<span style="font-size:10px; color:#fff;">本月流量统计</span>`,
          `<span class="percentage-value" style="color:${progressColor}; font-weight: 500;">${percent}%</span>`
        ];

        if (existing) {
          existing.querySelector('.used-traffic').textContent = used.value;
          existing.querySelector('.used-unit').textContent = used.unit;
          existing.querySelector('.total-traffic').textContent = total.value;
          existing.querySelector('.total-unit').textContent = total.unit;
          const bar = existing.querySelector('.progress-bar');
          bar.style.width = `${percent}%`;
          bar.style.backgroundColor = progressColor;
          const pText = existing.querySelector('.percentage-value');
          if (pText) pText.style.color = progressColor;
          return;
        }

        const refSection =
          container.querySelector('section.flex.items-center.w-full.justify-between.gap-1') ||
          container.querySelector('section.grid.items-center.gap-3');
        if (!refSection) return;

        const wrapper = document.createElement('div');
        wrapper.className = `space-y-1.5 new-inserted-element ${uniqueClass}`;
        wrapper.style.width = '100%';

        wrapper.innerHTML = `
  <div style="margin-top:-6px;">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div style="display:flex; align-items:baseline; gap:4px;">
        <span class="used-traffic" style="font-size:10px; font-weight:500; color:${progressColor};">${used.value}</span>
        <span class="used-unit" style="font-size:10px; font-weight:500; color:${progressColor};">${used.unit}</span>
        <span style="font-size:10px; color:#fff;">/</span>
        <span class="total-traffic" style="font-size:10px; color:#fff;">${total.value}</span>
        <span class="total-unit" style="font-size:10px; color:#fff;">${total.unit}</span>
      </div>
      <div class="time-info" style="font-size:10px; color:#fff; opacity:1; transition:opacity 0.3s;">
        ${rotateContents[0]}
      </div>
    </div>
    <div style="position:relative; height:6px; margin-top:1px; border-radius:9999px; background-color: rgba(100, 116, 139, 0.15);">
      <div class="progress-bar" style="
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: ${percent}%;
        max-width: 100%;
        background-color: ${progressColor};
        border-radius: 9999px;
        transition: width 0.5s ease-in-out, background-color 0.3s ease;
        box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.1);
      "></div>
    </div>
  </div>
`;

        refSection.after(wrapper);

        if (config.toggleInterval > 0) {
          const el = wrapper.querySelector('.time-info');
          if (el) toggleElements.push({ el, contents: rotateContents });
        }
      });
    }

    function startToggleCycle(interval, duration) {
      if (interval <= 0) return;
      let idx = 0;
      setInterval(() => {
        idx++;
        toggleElements.forEach(({ el, contents }) => {
          if (!document.body.contains(el)) return;
          const content = contents[idx % contents.length];
          utils.fadeOutIn(el, content, duration);
        });
      }, interval);
    }

    return { renderTrafficStats, startToggleCycle };
  })();

  const trafficDataManager = (() => {
    let cache = null;
    function fetchTrafficData(url, config, cb) {
      const now = Date.now();
      if (cache && now - cache.timestamp < config.interval) {
        return cb(cache.data);
      }
      fetch(url)
        .then(r => r.json())
        .then(data => {
          if (!data.success) return;
          const trafficData = data.data.cycle_transfer_stats;
          cache = { timestamp: now, data: trafficData };
          cb(trafficData);
        });
    }
    return { fetchTrafficData };
  })();

  const domObserver = (() => {
    const selector = 'section.server-card-list, section.server-inline-list';
    let current = null, childObs = null;

    function observe(section, cb) {
      if (childObs) childObs.disconnect();
      current = section;
      childObs = new MutationObserver(muts => {
        if (muts.some(m => m.type === 'childList')) cb();
      });
      childObs.observe(section, { childList: true, subtree: false });
      cb();
    }

    function start(cb) {
      const root = document.querySelector('main') || document.body;
      const detector = new MutationObserver(() => {
        const section = document.querySelector(selector);
        if (section && section !== current) observe(section, cb);
      });
      detector.observe(root, { childList: true, subtree: true });
      return detector;
    }

    function disconnectAll(detector) {
      if (childObs) childObs.disconnect();
      if (detector) detector.disconnect();
    }

    return { startSectionDetector: start, disconnectAll };
  })();

  (function main() {
    const defaultConfig = {
      showTrafficStats: true,
      insertAfter: true,
      interval: 60000,
      toggleInterval: 5000,
      duration: 500,
      apiUrl: '/api/v1/service',
      enableLog: false
    };

    let config = Object.assign({}, defaultConfig, window.TrafficScriptConfig || {});
    let timer = null;

    function update() {
      trafficDataManager.fetchTrafficData(config.apiUrl, config, data => {
        trafficRenderer.renderTrafficStats(data, config);
      });
    }

    function onDomChange() {
      update();
      if (!timer) timer = setInterval(update, config.interval);
    }

    trafficRenderer.startToggleCycle(config.toggleInterval, config.duration);
    const detector = domObserver.startSectionDetector(onDomChange);
    onDomChange();

    setTimeout(() => {
      const newConfig = Object.assign({}, defaultConfig, window.TrafficScriptConfig || {});
      if (JSON.stringify(newConfig) !== JSON.stringify(config)) {
        config = newConfig;
        update();
      }
    }, 100);

    window.addEventListener('beforeunload', () => {
      domObserver.disconnectAll(detector);
      if (timer) clearInterval(timer);
    });
  })();
}
