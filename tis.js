// 非授权提示（黑白闪两下 + 红色一次 + 抖动）——仅在非 shli.io 时显示
(function () {
  const SAFE_HOST = 'shli.io';
  if (window.location.hostname === SAFE_HOST) return;

  const ID = 'shli-unauth-warning-bw-red';
  if (document.getElementById(ID)) return; // 防止重复插入

  // 创建样式
  const style = document.createElement('style');
  style.id = ID + '-style';
  style.textContent = `
    /* 黑白闪两次 → 红色一次 */
    @keyframes bw-red-blink {
      0%, 20%   { background: #ffffff; color: #111111; }  /* 白 */
      10%, 30%  { background: #000000; color: #ffffff; }  /* 黑 */
      40%       { background: #ffffff; color: #111111; }  /* 白 */
      50%       { background: #000000; color: #ffffff; }  /* 黑 */
      60%, 70%  { background: #ff0000; color: #ffffff; }  /* 红 */
      100%      { background: #ffffff; color: #111111; }  /* 回到白 */
    }

    /* 抖动效果 */
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-5px); }
      40% { transform: translateX(5px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }

    #${ID} {
      position: fixed;
      left: 20px;
      right: 20px;
      top: 20px;
      z-index: 2147483647;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 8px 28px rgba(0,0,0,0.35);
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.5;
      animation: bw-red-blink 2s linear infinite, shake 0.6s ease-in-out infinite;
    }

    #${ID} button.shli-close {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(0,0,0,0.15);
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
      backdrop-filter: blur(4px);
    }
    #${ID} button.shli-close:hover {
      opacity: 0.85;
    }
    @media (max-width: 420px) {
      #${ID} { font-size: 16px; padding: 16px; }
      #${ID} button.shli-close { font-size: 14px; padding: 8px 14px; }
    }
  `;
  document.head.appendChild(style);

  // 创建提示节点
  const wrapper = document.createElement('div');
  wrapper.id = ID;
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', '未经授权嵌入提示');

  const msg = document.createElement('div');
  msg.className = 'shli-msg';
  msg.innerHTML = `<strong>偷你妈,傻批东西,给你妈两刀</strong><br>检测到此脚本没有在你爹域名 <code>${SAFE_HOST}</code> 上运行。`;

  const btn = document.createElement('button');
  btn.className = 'shli-close';
  btn.type = 'button';
  btn.textContent = '你妈死了';
  btn.addEventListener('click', () => wrapper.remove());

  wrapper.appendChild(msg);
  wrapper.appendChild(btn);

  function insertNow() {
    (document.body || document.documentElement).appendChild(wrapper);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertNow, { once: true });
  } else {
    insertNow();
  }
})();
