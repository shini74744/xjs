(() => {
  const ISO_UTC_RE = /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z\b/g;

  function toBeijingTime(utcStr) {
    const d = new Date(utcStr);
    if (Number.isNaN(d.getTime())) return utcStr;

    const parts = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(d).reduce((acc, item) => {
      acc[item.type] = item.value;
      return acc;
    }, {});

    return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
  }

  function replaceInTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;

    const original = node.nodeValue;
    if (!original || !ISO_UTC_RE.test(original)) return;

    ISO_UTC_RE.lastIndex = 0;
    node.nodeValue = original.replace(ISO_UTC_RE, (m) => toBeijingTime(m));
  }

  function scan(root) {
    if (!root) return;

    if (root.nodeType === Node.TEXT_NODE) {
      replaceInTextNode(root);
      return;
    }

    if (root.nodeType !== Node.ELEMENT_NODE) return;
    if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT'].includes(root.tagName)) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      replaceInTextNode(node);
    }
  }

  // 首次扫描
  scan(document.body);

  // 监听后续动态加载内容
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'characterData') {
        replaceInTextNode(m.target);
      }
      m.addedNodes.forEach(scan);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  console.log('页面 UTC 时间已自动转换为北京时间');
})();
