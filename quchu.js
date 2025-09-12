(function () {
  // 只在 shli.io 域名下执行
  if (window.location.hostname !== 'shli.io') return;
// 去除顶部显示按钮

['radix-:r0:', 'radix-:r2:'].forEach(id => {
  const btn = document.querySelector(`button#${id.replace(/:/g, '\\:')}`);
  if (btn) btn.remove();
});
