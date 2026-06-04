(function () {
  // 只在 shli.io 域名下执行
  if (window.location.hostname !== 'shli.io') return;

  // 兜底刷新频率。主要靠 MutationObserver 实时跟随哪吒数据变化
  const REFRESH_INTERVAL = 200;

  // 原来的最大速度阈值：30MB/s
  const MAX_SPEED = 30 * 1024 * 1024;

  const STYLE_ID = 'shli-speed-color-style-v3';

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @keyframes shli-flash-soft {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }

      @keyframes shli-flash-fast {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.25; }
      }

      .shli-upload-boost-1 {
        font-weight: 700 !important;
        animation: shli-flash-soft 1s infinite;
        text-shadow: 0 0 4px rgba(255, 0, 0, 0.55);
      }

      .shli-upload-boost-2 {
        font-weight: 700 !important;
        animation: shli-flash-fast 0.7s infinite;
        text-shadow: 0 0 7px rgba(255, 0, 0, 0.85);
        transform: scale(1.05);
      }

      .shli-upload-boost-3 {
        font-weight: 700 !important;
        animation: shli-flash-fast 0.5s infinite;
        text-shadow: 0 0 10px rgba(255, 0, 0, 1);
        transform: scale(1.15);
        background: rgba(255, 0, 0, 0.10);
        border-radius: 4px;
        padding: 0 3px;
      }

      .shli-download-boost-1 {
        font-weight: 700 !important;
        animation: shli-flash-soft 1s infinite;
        text-shadow: 0 0 4px rgba(0, 120, 255, 0.55);
      }

      .shli-download-boost-2 {
        font-weight: 700 !important;
        animation: shli-flash-fast 0.7s infinite;
        text-shadow: 0 0 7px rgba(0, 120, 255, 0.85);
        transform: scale(1.05);
      }

      .shli-download-boost-3 {
        font-weight: 700 !important;
        animation: shli-flash-fast 0.5s infinite;
        text-shadow: 0 0 10px rgba(0, 120, 255, 1);
        transform: scale(1.15);
        background: rgba(0, 120, 255, 0.10);
        border-radius: 4px;
        padding: 0 3px;
      }
    `;
    document.head.appendChild(style);
  }

  function cleanText(text) {
    return String(text || '')
      .trim()
      .replace(/,/g, '')
      .replace(/\s+/g, '');
  }

  function parseSpeed(speedStr) {
    const str = cleanText(speedStr);

    const match = str.match(/^([\d.]+)(B\/s|K\/s|KB\/s|M\/s|MB\/s|G\/s|GB\/s|Kbps|Mbps|Gbps)$/i);
    if (!match) return null;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    // 哪吒原始单位：按 Byte/s 处理
    const byteUnits = {
      'B/S': 1,
      'K/S': 1024,
      'KB/S': 1024,
      'M/S': 1024 * 1024,
      'MB/S': 1024 * 1024,
      'G/S': 1024 * 1024 * 1024,
      'GB/S': 1024 * 1024 * 1024
    };

    // 已经是 bit/s 的单位
    const bitUnits = {
      'KBPS': 1000,
      'MBPS': 1000 * 1000,
      'GBPS': 1000 * 1000 * 1000
    };

    if (byteUnits[unit]) {
      return {
        bytesPerSecond: value * byteUnits[unit],
        kind: 'byte'
      };
    }

    if (bitUnits[unit]) {
      return {
        bytesPerSecond: value * bitUnits[unit] / 8,
        kind: 'bit'
      };
    }

    return null;
  }

  function isSpeedElement(elem) {
    return !!parseSpeed(elem.textContent);
  }

  function formatMbps(bytesPerSecond) {
    // 用 1024 进制，这样哪吒的 11.58M/s 会直接变成 92.6Mbps
    const mbps = bytesPerSecond * 8 / 1024 / 1024;

    if (!Number.isFinite(mbps) || mbps <= 0) {
      return '0Mbps';
    }

    if (mbps >= 1000) {
      return (mbps / 1000).toFixed(2) + 'Gbps';
    }

    if (mbps >= 100) {
      return mbps.toFixed(0) + 'Mbps';
    }

    if (mbps >= 10) {
      return mbps.toFixed(1) + 'Mbps';
    }

    return mbps.toFixed(2) + 'Mbps';
  }

  function speedToColor(speed, maxSpeed, type) {
    const logSpeed = Math.log10(speed + 1);
    const logMax = Math.log10(maxSpeed + 1);
    const ratio = Math.min(logSpeed / logMax, 1);

    if (type === 'upload') {
      const r = 255;
      const g = Math.round(255 * (1 - ratio));
      const b = Math.round(255 * (1 - ratio));
      return `rgb(${r},${g},${b})`;
    }

    const r = Math.round(255 * (1 - ratio));
    const g = Math.round(255 * (1 - ratio));
    const b = 255;
    return `rgb(${r},${g},${b})`;
  }

  function clearEffect(elem) {
    elem.classList.remove(
      'shli-upload-boost-1',
      'shli-upload-boost-2',
      'shli-upload-boost-3',
      'shli-download-boost-1',
      'shli-download-boost-2',
      'shli-download-boost-3'
    );
  }

  function applyEffect(elem, speed, type) {
    clearEffect(elem);

    if (speed > 30 * 1024 * 1024) {
      elem.classList.add(type === 'upload' ? 'shli-upload-boost-3' : 'shli-download-boost-3');
    } else if (speed > 20 * 1024 * 1024) {
      elem.classList.add(type === 'upload' ? 'shli-upload-boost-2' : 'shli-download-boost-2');
    } else if (speed > 10 * 1024 * 1024) {
      elem.classList.add(type === 'upload' ? 'shli-upload-boost-1' : 'shli-download-boost-1');
    }
  }

  function updateOne(elem, type) {
    const currentText = cleanText(elem.textContent);

    let speed = 0;
    let parsed = null;

    // 如果当前文本就是本脚本上次写入的结果，直接使用缓存速度，避免 Mbps 被反复换算
    if (
      elem.dataset.shliSpeedOutput &&
      currentText === elem.dataset.shliSpeedOutput &&
      elem.dataset.shliSpeedBytes
    ) {
      speed = Number(elem.dataset.shliSpeedBytes) || 0;
    } else {
      parsed = parseSpeed(currentText);
      if (!parsed) return;

      speed = parsed.bytesPerSecond;

      // 只转换哪吒原始的 B/s、K/s、M/s、G/s
      // 如果已经是 Mbps / Gbps，就不再重复改文本
      if (parsed.kind === 'byte') {
        const newText = formatMbps(speed);

        elem.dataset.shliSpeedBytes = String(speed);
        elem.dataset.shliSpeedOutput = cleanText(newText);

        if (currentText !== cleanText(newText)) {
          elem.textContent = newText;
        }
      } else {
        elem.dataset.shliSpeedBytes = String(speed);
        elem.dataset.shliSpeedOutput = currentText;
      }
    }

    // 关键：取消所有过渡，数值、颜色、缩放都直接变化
    elem.style.transition = 'none';

    elem.style.color = speedToColor(speed, MAX_SPEED, type);

    applyEffect(elem, speed, type);
  }

  function updateSpeedColors() {
    const elems = Array.from(
      document.querySelectorAll('div.flex.items-center.text-xs.font-semibold')
    ).filter(isSpeedElement);

    // 按你给出的结构：第一个是上传，第二个是下载
    for (let i = 0; i < elems.length; i += 2) {
      const uploadElem = elems[i];
      const downloadElem = elems[i + 1];

      if (uploadElem) updateOne(uploadElem, 'upload');
      if (downloadElem) updateOne(downloadElem, 'download');
    }
  }

  let observerTimer = null;

  function scheduleUpdate() {
    if (observerTimer) return;

    observerTimer = setTimeout(() => {
      observerTimer = null;
      if (!document.hidden) updateSpeedColors();
    }, 0);
  }

  function start() {
    updateSpeedColors();

    setInterval(() => {
      if (!document.hidden) updateSpeedColors();
    }, REFRESH_INTERVAL);

    const observer = new MutationObserver(() => {
      scheduleUpdate();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
