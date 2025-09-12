// 去除顶部显示按钮，仅在 shli.io 下执行
(function() {
  if (window.location.hostname !== 'shli.io') return;

  ['radix-:r0:', 'radix-:r2:'].forEach(id => {
    const btn = document.querySelector(`button#${id.replace(/:/g, '\\:')}`);
    if (btn) btn.remove();
  });
})();
