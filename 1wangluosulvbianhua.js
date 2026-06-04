(function () {
  // 仅在 shli.io 域名下执行
  if (window.location.hostname !== 'shli.io') return;

  // 刷新间隔（毫秒）
  const REFRESH_INTERVAL = 500;

  // 最大速率阈值（这里设为 100 MB/s）
  const MAX_SPEED = 100 * 1024 * 1024;

  const STYLE_ID = 'shli-speed-text-convert-style-v3';

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* 速率显示文本的基础样式 */
      p[class*="text-[11px]"] {
        display: inline-flex !important;
        align-items: center !important;
        margin-right: 8px !important;
        line-height: 1 !important;
        transition: color 0.5s ease !important;
        transform-origin: center center !important;
        position: relative !important;
        z-index: 1;
      }

      /* 图标样式 */
      p[class*="text-[11px]"] svg {
        flex-shrink: 0 !important;
        width: 1em;
        height: 1em;
        margin-right: 4px !important;
        vertical-align: middle !important;
      }

      /*
        核心：
        只隐藏哪吒原始文字，不删除原始 DOM。
        这样哪吒仍然可以继续刷新原始 MiB/s 数值。
      */
      p[data-shli-speed-converted="1"] {
        font-size: 0 !important;
      }

      p[data-shli-speed-converted="1"] svg {
        width: 11px !important;
        height: 11px !important;
        margin-right: 4px !important;
      }

      p[data-shli-speed-converted="1"] .shli-speed-value {
        display: inline-block !important;
        font-size: 11px !important;
        line-height: 1 !important;
        white-space: nowrap !important;
      }

      /* 定义发光、边框闪烁、背景脉动等动画 */
      @keyframes color-glow {0%,100%{text-shadow:0 0 5px rgba(255,0,0,0.7);}50%{text-shadow:0 0 15px rgba(255,50,50,1);}}
      @keyframes border-glow {0%,100%{box-shadow:0 0 6px 0 rgba(255,0,0,0.6);}50%{box-shadow:0 0 20px 4px rgba(255,0,0,1);}}
      @keyframes background-pulse {0%,100%{background-color:rgba(255,0,0,0.15);}50%{background-color:rgba(255,0,0,0.3);}}
      @keyframes text-shadow-pulse {0%,100%{text-shadow:0 0 6px rgba(255,0,0,0.6);}50%{text-shadow:0 0 18px rgba(255,0,0,1);}}
      @keyframes subtle-glow {0%,100%{opacity:1;}50%{opacity:0.75;}}

      /* 各速率等级样式 */
      .speed-level-1,.speed-level-1-dl{animation:none !important;text-shadow:none !important;}
      .speed-level-2{animation:subtle-glow 2s infinite ease-in-out !important;text-shadow:0 0 6px rgba(255,50,50,0.6) !important;font-weight:bold !important;color:rgb(255,100,100) !important;}
      .speed-level-2-dl{animation:subtle-glow 2s infinite ease-in-out !important;text-shadow:0 0 6px rgba(50,50,255,0.6) !important;font-weight:bold !important;color:rgb(100,100,255) !important;}
      .speed-level-3,.speed-level-3-dl{animation:border-glow 1.5s infinite ease-in-out !important;}
      .speed-level-4{animation:border-glow 1.5s infinite ease-in-out,background-pulse 1.8s infinite ease-in-out,subtle-glow 2s infinite ease-in-out !important;background-color:rgba(255,0,0,0.2) !important;border-radius:4px;}
      .speed-level-4-dl{animation:border-glow 1.5s infinite ease-in-out,background-pulse 1.8s infinite ease-in-out,subtle-glow 2s infinite ease-in-out !important;background-color:rgba(0,0,255,0.2) !important;border-radius:4px;}
      .speed-level-5{animation:color-glow 1.5s infinite ease-in-out,background-pulse 1.5s infinite ease-in-out,text-shadow-pulse 1.2s infinite ease-in-out,border-glow 1.2s infinite ease-in-out !important;text-shadow:0 0 18px rgba(255,0,0,1) !important;background-color:rgba(255,0,0,0.25) !important;border:1px solid rgba(255,0,0,0.6) !important;border-radius:4px;transform:scale(1.15) !important;transform-origin:center center !important;z-index:10 !important;position:relative !important;}
      .speed-level-5-dl{animation:color-glow 1.5s infinite ease-in-out,background-pulse 1.5s infinite ease-in-out,text-shadow-pulse 1.2s infinite ease-in-out,border-glow 1.2s infinite ease-in-out !important;text-shadow:0 0 18px rgba(0,0,255,1) !important;background-color:rgba(0,0,255,0.25) !important;border:1px solid rgba(0,0,255,0.6) !important;border-radius:4px;transform:scale(1.15) !important;transform-origin:center center !important;z-index:10 !important;position:relative !important;color:rgba(0,0,255,1) !important;}
    `;
    document.head.appendChild(style);
  }

  function cleanText(text) {
    return String(text || '')
      .trim()
      .replace(/,/g, '')
      .replace(/\s+/g, '');
  }

  /*
    解析哪吒原始速率。
    支持：
    19.68 MiB/s
    19.68 MiB
    29.42 M/s
    29.42 MB/s
    1.2 GiB/s
  */
  function parseRawSpeed(text) {
    const str = cleanText(text);
    if (!str) return null;

    const match = str.match(/([\d.]+)(B\/s|K\/s|M\/s|G\/s|KB\/s|MB\/s|GB\/s|KIB\/s|MIB\/s|GIB\/s|KIB|MIB|GIB)/i);
    if (!match) return null;

    const value = parseFloat(match[1]);
    if (!Number.isFinite(value)) return null;

    const unit = match[2].toUpperCase();

    const units = {
      'B/S': 1,
      'K/S': 1024,
      'M/S': 1024 * 1024,
      'G/S': 1024 * 1024 * 1024,

      'KB/S': 1024,
      'MB/S': 1024 * 1024,
      'GB/S': 1024 * 1024 * 1024,

      'KIB/S': 1024,
      'MIB/S': 1024 * 1024,
      'GIB/S': 1024 * 1024 * 1024,

      'KIB': 1024,
      'MIB': 1024 * 1024,
      'GIB': 1024 * 1024 * 1024
    };

    return value * (units[unit] || 0);
  }

  function formatMbps(bytesPerSecond) {
    const mbps = bytesPerSecond * 8 / 1024 / 1024;

    if (!Number.isFinite(mbps) || mbps <= 0) {
      return '0Mbps';
    }

    // 1024Mbps = 1Gbps
    if (mbps >= 1024) {
      return (mbps / 1024).toFixed(2) + 'Gbps';
    }

    if (mbps >= 100) {
      return mbps.toFixed(0) + 'Mbps';
    }

    if (mbps >= 10) {
      return mbps.toFixed(1) + 'Mbps';
    }

    return mbps.toFixed(2) + 'Mbps';
  }

  function ensureDisplaySpan(elem) {
    elem.dataset.shliSpeedConverted = '1';

    let span = Array.from(elem.children).find(child => {
      return child.classList && child.classList.contains('shli-speed-value');
    });

    if (!span) {
      span = document.createElement('span');
      span.className = 'shli-speed-value';
      elem.appendChild(span);
    }

    return span;
  }

  function speedToColor(speed,maxSpeed,type){
    if(speed<=0) return type==='upload'?'rgb(255,200,200)':'rgb(200,200,255)';
    const ratio=Math.min(Math.pow(speed/maxSpeed,0.4),1);
    if(type==='upload'){return `rgb(255,${Math.round(200*(1-ratio))},${Math.round(200*(1-ratio))})`;}
    return `rgb(${Math.round(200*(1-ratio))},${Math.round(200*(1-ratio))},255)`;
  }

  function applyEffect(elem,speed,type){
    elem.classList.remove('speed-level-1','speed-level-2','speed-level-3','speed-level-4','speed-level-5',
                           'speed-level-1-dl','speed-level-2-dl','speed-level-3-dl','speed-level-4-dl','speed-level-5-dl');
    const M=1024*1024;
    let level=0;
    if(speed>100*M) level=5;
    else if(speed>60*M) level=4;
    else if(speed>40*M) level=3;
    else if(speed>20*M) level=2;
    else if(speed>0) level=1;
    if(level>0){elem.classList.add(`speed-level-${level}${type==='download'?'-dl':''}`);}
  }

  function updateOne(elem, type) {
    const speed = parseRawSpeed(elem.textContent);
    if (!speed || speed <= 0) return;

    const span = ensureDisplaySpan(elem);
    const newText = formatMbps(speed);

    if (span.textContent !== newText) {
      span.textContent = newText;
    }

    elem.style.color = speedToColor(speed, MAX_SPEED, type);
    applyEffect(elem, speed, type);
  }

  function getSpeedElems() {
    return Array.from(document.querySelectorAll('p[class*="text-[11px]"]'))
      .filter(elem => parseRawSpeed(elem.textContent));
  }

  function updateSpeedColors(){
    const speedElems = getSpeedElems();
    if(speedElems.length < 2) return;

    const uploadElem = speedElems[0];
    const downloadElem = speedElems[1];

    updateOne(uploadElem, 'upload');
    updateOne(downloadElem, 'download');
  }

  setInterval(()=>{
    if(!document.hidden) updateSpeedColors();
  }, REFRESH_INTERVAL);

  updateSpeedColors();
})();
