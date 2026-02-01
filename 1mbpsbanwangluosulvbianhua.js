(function () {
  // 仅在 shli.io 域名下执行
  if (window.location.hostname !== 'shli.io') return;

  // 刷新间隔（毫秒）
  const REFRESH_INTERVAL = 500;
  // 最大速率阈值（这里设为 100 MB/s）
  const MAX_SPEED = 100 * 1024 * 1024;

  // 注入 CSS 样式，用于不同速率等级的颜色和动画效果
  const style = document.createElement('style');
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

  // 将速率字符串转换为字节数
  function parseSpeed(speedStr) {
    if (!speedStr) return 0;
    const units = {'B/s':1,'K/s':1024,'M/s':1024*1024,'MiB/s':1024*1024,'G/s':1024*1024*1024,'GiB/s':1024*1024*1024};
    const regex = /^([\d.]+)\s*([BKMG]i?B\/s)$/i;
    const match = speedStr.match(regex);
    if (!match) return 0;
    return parseFloat(match[1]) * (units[match[2]]||1);
  }

  function bytesToMbps(bytes) {
    return (bytes * 8) / (1024 * 1024); // 转换为Mbps
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

  function updateSpeedColors(){
    const speedElems=document.querySelectorAll('p[class*="text-[11px]"]');
    if(speedElems.length<2) return;
    const uploadElem=speedElems[0];
    const downloadElem=speedElems[1];
    const uploadSpeed=parseSpeed(uploadElem.textContent.trim());
    const downloadSpeed=parseSpeed(downloadElem.textContent.trim());
    
    // 将字节数转换为 Mbps
    const uploadMbps = bytesToMbps(uploadSpeed);
    const downloadMbps = bytesToMbps(downloadSpeed);

    // 更新文本内容为 Mbps 格式
    uploadElem.textContent = `${uploadMbps.toFixed(2)} Mbps`;
    downloadElem.textContent = `${downloadMbps.toFixed(2)} Mbps`;

    // 更新颜色和效果
    uploadElem.style.color = speedToColor(uploadSpeed, MAX_SPEED, 'upload');
    downloadElem.style.color = speedToColor(downloadSpeed, MAX_SPEED, 'download');
    applyEffect(uploadElem, uploadSpeed, 'upload');
    applyEffect(downloadElem, downloadSpeed, 'download');
  }

  // 每 500 毫秒更新速率
  setInterval(()=>{
    if(!document.hidden) updateSpeedColors();
  }, REFRESH_INTERVAL);
})();
