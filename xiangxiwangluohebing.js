(() => {
  // 尽量减少全局长 selector 的调用次数：只保留 container 的定位
  const containerPath =
    "#root > div.flex.min-h-screen.w-full.flex-col > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info";

  // 如果你确认 section/btn 的 selector 非常稳定，也可以保留；这里做“容器内查找优先”
  const selectorSection =
    "section.flex.items-center.my-2.w-full";
  const selectorButton =
    "div.relative.cursor-pointer.rounded-3xl.px-2\\.5.py-\\[8px\\].text-\\[13px\\].font-semibold.transition-all.duration-500.text-stone-400.dark\\:text-stone-500";

  let hasTriggered = false;
  let lastUrl = location.href;

  // 缓存 DOM 引用，避免频繁 querySelector
  let cache = {
    container: null,
    section: null,
    btn: null,
  };

  // 标记已处理的元素：只对新节点做样式写入
  const processed = new WeakSet();

  // rAF 节流：MutationObserver 可能连发，这里合并为每帧最多执行一次
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      injectLayout();
    });
  };

  function checkUrlChange() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      hasTriggered = false;

      // 路由切换后 DOM 很可能重建：清空缓存，重新查找
      cache.container = null;
      cache.section = null;
      cache.btn = null;
    }
  }

  function refreshCacheIfNeeded() {
    // container 无效或不存在时，重新查找
    if (!cache.container || !document.contains(cache.container)) {
      cache.container = document.querySelector(containerPath) || null;
      cache.section = null;
      cache.btn = null;
    }
    if (!cache.container) return;

    // section/btn 只在 container 存在时从 container 内部找，减少全局 selector 成本
    if (!cache.section || !document.contains(cache.section)) {
      cache.section = cache.container.querySelector(selectorSection) || null;
    }
    if (!cache.btn || !document.contains(cache.btn)) {
      cache.btn = cache.container.querySelector(selectorButton) || null;
    }
  }

  // 将多次 setProperty 合并：只在未处理时写一次
  function forceShow(div) {
    if (processed.has(div)) return;
    processed.add(div);

    // 跳过占位符/工具条（工具条用 cache.section 判断更准）
    if (div === cache.section || div.classList.contains("flex-center")) return;

    // 写样式（一次性写完）
    div.style.setProperty("display", "block", "important");
    div.style.setProperty("visibility", "visible", "important");
    div.style.setProperty("height", "auto", "important");
    div.style.setProperty("opacity", "1", "important");
    if (div.hasAttribute("hidden")) div.removeAttribute("hidden");
  }

  function injectLayout() {
    checkUrlChange();
    refreshCacheIfNeeded();

    const container = cache.container;
    if (!container) return;

    const section = cache.section;
    const btn = cache.btn;

    // 1) 首次点击：只点击一次
    if (!hasTriggered && btn) {
      btn.click();
      hasTriggered = true;
      return;
    }

    // 2) 隐藏工具栏（仅当状态变化才写）
    if (section) {
      const cur = section.style.getPropertyValue("display");
      if (cur !== "none") section.style.setProperty("display", "none", "important");
    }

    // 3) 只处理新增 children
    // 用 HTMLCollection 直接遍历，避免 Array.from 产生临时数组
    const children = container.children;
    for (let i = 0; i < children.length; i++) {
      forceShow(children[i]);
    }
  }

  // 初始化观察器：尽量缩小观察范围（观察 container 更好；container 不在就观察 root）
  function startObserver() {
    const root = document.querySelector("#root");
    if (!root) {
      setTimeout(startObserver, 300);
      return;
    }

    // 先跑一次
    injectLayout();

    const observer = new MutationObserver(() => {
      // 不直接 injectLayout，改为 rAF 节流合并
      schedule();
    });

    // 先观察 root（容器可能还没出现）
    observer.observe(root, { childList: true, subtree: true });

    // 定期兜底：频率降低点（30s -> 60s），减少后台开销
    setInterval(() => {
      injectLayout();
    }, 60000);
  }

  startObserver();
})();
