// 合并版：移除 Search 按钮 & radix-:r0:/radix-:r2:（含动态重建）——仅 shli.io
(function () {
  if (location.hostname !== 'shli.io') return;

  // 兜底隐藏，防止闪现
  const style = document.createElement('style');
  style.textContent = `
    button[title="Search"],
    button[id="radix-:r0:"],
    button[id="radix-:r2:"] { display:none !important; visibility:hidden !important; }
  `;
  document.documentElement.appendChild(style);

  // 实际删除（并清理可能的空父容器）
  const purge = () => {
    document.querySelectorAll(
      'button[title="Search"], button[id="radix-:r0:"], button[id="radix-:r2:"]'
    ).forEach(el => {
      const box = el.parentElement;
      el.remove();
      if (box && box.childElementCount === 0 && box.textContent.trim() === '') box.remove();
    });
  };

  purge();
  new MutationObserver(purge).observe(document.documentElement, { childList: true, subtree: true });
})();
