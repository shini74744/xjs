(function() {
  if (window.location.hostname !== 'shli.io') return;

  // 删除按钮
  ['radix-:r0:', 'radix-:r2:'].forEach(id => {
    const btn = document.querySelector(`button#${id.replace(/:/g, '\\:')}`);
    if (btn) btn.remove();
  });

  // 删除与按钮相关的 <span class="sr-only">
  const spans = document.querySelectorAll('span.sr-only');
  spans.forEach(span => {
    if (span.textContent === 'Change language') {
      span.remove(); // 删除对应的 <span>
    }
  });
})();
