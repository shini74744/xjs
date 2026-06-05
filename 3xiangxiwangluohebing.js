(() => {
  const VERSION = "20260605-fast-no-wait";

  const containerPath =
    "#root > div.flex.min-h-screen.w-full.flex-col > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info";

  const selectorSection = "section.flex.items-center.my-2.w-full";

  const FALLBACK_DELAY = 80;
  const FALLBACK_TIMEOUT = 500;

  if (window.__DNM_OBSERVER__) {
    window.__DNM_OBSERVER__.disconnect();
  }

  if (window.__DNM_INTERVAL__) {
    clearInterval(window.__DNM_INTERVAL__);
  }

  if (window.__DNM_TIMER__) {
    clearTimeout(window.__DNM_TIMER__);
  }

  let lastUrl = location.href;
  let busy = false;
  let arranged = false;

  let cache = {
    container: null,
    section: null,
    detailPanel: null,
    networkPanel: null,
    detailDisplay: "block",
    networkDisplay: "block",
  };

  console.log("[详情网络合并] loaded:", VERSION);

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function textOf(el) {
    return (el?.innerText || el?.textContent || "")
      .replace(/\s+/g, "")
      .trim();
  }

  function isRealElement(el) {
    if (!el) return false;

    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();

    return (
      s.display !== "none" &&
      s.visibility !== "hidden" &&
      r.width > 0 &&
      r.height > 0
    );
  }

  function getPreferredDisplay(el) {
    if (!el) return "block";

    const s = getComputedStyle(el);

    if (s.display && s.display !== "none") {
      return s.display;
    }

    const cls = String(el.className || "");

    if (cls.includes("grid")) return "grid";
    if (cls.includes("flex")) return "flex";

    return "block";
  }

  function resetState() {
    arranged = false;

    cache = {
      container: null,
      section: null,
      detailPanel: null,
      networkPanel: null,
      detailDisplay: "block",
      networkDisplay: "block",
    };
  }

  function checkUrlChange() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      resetState();
      cleanupOldCode();
    }
  }

  function findContainer() {
    return (
      document.querySelector(containerPath) ||
      document.querySelector(".server-info")
    );
  }

  function findTabSection(container) {
    if (!container) return null;

    const section = container.querySelector(selectorSection);
    if (section) return section;

    const candidates = Array.from(
      container.querySelectorAll("section, div, nav, [role='tablist']")
    ).filter(el => {
      const txt = textOf(el);
      const r = el.getBoundingClientRect();

      return (
        txt.includes("网络") &&
        (txt.includes("详细") || txt.includes("详情")) &&
        txt.length <= 40 &&
        r.width >= 60 &&
        r.height <= 120
      );
    });

    candidates.sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      return ar.width * ar.height - br.width * br.height;
    });

    return candidates[0] || null;
  }

  function refreshCache() {
    if (!cache.container || !document.contains(cache.container)) {
      cache.container = findContainer();
      cache.section = null;
    }

    if (!cache.container) return;

    if (!cache.section || !document.contains(cache.section)) {
      cache.section = findTabSection(cache.container);
    }
  }

  function cleanupOldCode() {
    document
      .querySelectorAll(
        "[data-dnm-console-merged], [data-dnm-merged], [data-x-detail-network-merged], [data-x-network-merge-detail]"
      )
      .forEach(el => el.remove());
  }

  function isFooterOrBadBlock(el, section) {
    if (!el || el === section) return true;

    const txt = textOf(el);

    if (!txt) return true;
    if (txt.includes("©2020") || txt.includes("主题-哪吒")) return true;
    if (txt === "详细网络" || txt === "详情网络") return true;
    if (el.classList.contains("flex-center")) return true;

    return false;
  }

  function isNetworkPanel(el) {
    const txt = textOf(el);

    const hasTimeTabs =
      txt.includes("实时") &&
      txt.includes("7天") &&
      txt.includes("30天");

    const hasCharts =
      (txt.includes("中央处理器") || txt.includes("CPU")) &&
      txt.includes("内存") &&
      txt.includes("磁盘");

    const hasNet =
      txt.includes("TCP") &&
      txt.includes("UDP");

    const hasSpeed =
      txt.includes("上传") &&
      txt.includes("下载");

    return hasTimeTabs || hasCharts || hasNet || hasSpeed;
  }

  function getPanelCandidates(container, section) {
    if (!container) return [];

    const children = Array.from(container.children).filter(el => {
      if (isFooterOrBadBlock(el, section)) return false;
      if (el === section) return false;

      const txt = textOf(el);

      return txt.length > 3 || el.children.length > 0;
    });

    return children;
  }

  function findPanelsWithoutClick(container, section) {
    const candidates = getPanelCandidates(container, section);

    if (candidates.length < 2) {
      return null;
    }

    const networkPanel = candidates.find(isNetworkPanel);

    if (!networkPanel) {
      return null;
    }

    const detailPanel =
      candidates.find(el => el !== networkPanel && !isNetworkPanel(el)) || null;

    if (!detailPanel || detailPanel === networkPanel) {
      return null;
    }

    return {
      detailPanel,
      networkPanel,
      detailDisplay: getPreferredDisplay(detailPanel),
      networkDisplay: getPreferredDisplay(networkPanel),
    };
  }

  function forceShowPanel(el, displayValue) {
    if (!el) return;

    if (el.hasAttribute("hidden")) {
      el.removeAttribute("hidden");
    }

    el.style.setProperty("display", displayValue || getPreferredDisplay(el), "important");
    el.style.setProperty("visibility", "visible", "important");
    el.style.setProperty("height", "auto", "important");
    el.style.setProperty("opacity", "1", "important");
    el.style.setProperty("overflow", "visible", "important");
  }

  function hideSection(section) {
    if (!section) return;

    section.style.setProperty("display", "none", "important");
    section.style.setProperty("visibility", "hidden", "important");
    section.style.setProperty("height", "0", "important");
    section.style.setProperty("margin", "0", "important");
    section.style.setProperty("padding", "0", "important");
    section.style.setProperty("overflow", "hidden", "important");
  }

  function sortDetailAboveNetwork(detailPanel, networkPanel) {
    if (!detailPanel || !networkPanel) return;
    if (detailPanel === networkPanel) return;

    const parent = detailPanel.parentElement;

    if (!parent || parent !== networkPanel.parentElement) return;

    parent.insertBefore(detailPanel, networkPanel);

    if (detailPanel.nextElementSibling !== networkPanel) {
      parent.insertBefore(networkPanel, detailPanel.nextElementSibling);
    }
  }

  function applyPanels(detailPanel, networkPanel, detailDisplay, networkDisplay, section) {
    forceShowPanel(detailPanel, detailDisplay);
    forceShowPanel(networkPanel, networkDisplay);

    sortDetailAboveNetwork(detailPanel, networkPanel);

    hideSection(section);
  }

  function tryDirectArrange() {
    const container = cache.container;
    const section = cache.section;

    if (!container || !section) return false;

    const result = findPanelsWithoutClick(container, section);

    if (!result) return false;

    cache.detailPanel = result.detailPanel;
    cache.networkPanel = result.networkPanel;
    cache.detailDisplay = result.detailDisplay;
    cache.networkDisplay = result.networkDisplay;

    applyPanels(
      cache.detailPanel,
      cache.networkPanel,
      cache.detailDisplay,
      cache.networkDisplay,
      section
    );

    arranged = true;
    return true;
  }

  function findButton(section, words) {
    if (!section) return null;

    const nodes = Array.from(
      section.querySelectorAll("button, [role='tab'], div, span, a")
    );

    const target = nodes.find(el => words.includes(textOf(el)));
    if (!target) return null;

    let cur = target;

    while (cur && cur !== section) {
      const s = getComputedStyle(cur);
      const cls = String(cur.className || "");

      if (
        cur.tagName === "BUTTON" ||
        cur.getAttribute("role") === "tab" ||
        cur.hasAttribute("aria-selected") ||
        s.cursor === "pointer" ||
        cls.includes("cursor-pointer")
      ) {
        return cur;
      }

      cur = cur.parentElement;
    }

    return target;
  }

  function clickReal(btn) {
    if (!btn) return;

    ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(type => {
      try {
        btn.dispatchEvent(
          new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
      } catch (e) {}
    });

    try {
      btn.click();
    } catch (e) {}
  }

  function findActivePanel(container, section) {
    const sectionRect = section.getBoundingClientRect();

    const children = Array.from(container.children).filter(el => {
      if (isFooterOrBadBlock(el, section)) return false;
      if (!isRealElement(el)) return false;

      const r = el.getBoundingClientRect();

      return (
        r.height > 20 &&
        r.width > 100 &&
        r.top >= sectionRect.top - 10
      );
    });

    children.sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();

      if (ar.top !== br.top) return ar.top - br.top;

      return br.width * br.height - ar.width * ar.height;
    });

    return children[0] || null;
  }

  async function fallbackClickArrange() {
    const container = cache.container;
    const section = cache.section;

    if (!container || !section) return false;

    const detailBtn = findButton(section, ["详细", "详情"]);
    const networkBtn = findButton(section, ["网络"]);

    if (!detailBtn || !networkBtn) {
      hideSection(section);
      return false;
    }

    const oldOpacity = container.style.opacity;
    const oldTransition = container.style.transition;

    // 只在兜底点击时短暂透明，不再全局等待
    container.style.setProperty("opacity", "0", "important");
    container.style.setProperty("transition", "none", "important");

    try {
      clickReal(detailBtn);
      await sleep(FALLBACK_DELAY);

      const detailPanel = findActivePanel(container, section);
      if (!detailPanel) return false;

      clickReal(networkBtn);
      await sleep(FALLBACK_DELAY);

      const networkPanel = findActivePanel(container, section);
      if (!networkPanel || networkPanel === detailPanel) return false;

      cache.detailPanel = detailPanel;
      cache.networkPanel = networkPanel;
      cache.detailDisplay = getPreferredDisplay(detailPanel);
      cache.networkDisplay = getPreferredDisplay(networkPanel);

      applyPanels(
        cache.detailPanel,
        cache.networkPanel,
        cache.detailDisplay,
        cache.networkDisplay,
        section
      );

      arranged = true;
      return true;
    } finally {
      container.style.opacity = oldOpacity || "";
      container.style.transition = oldTransition || "";
    }
  }

  function currentPanelsStillValid() {
    return (
      cache.detailPanel &&
      cache.networkPanel &&
      document.contains(cache.detailPanel) &&
      document.contains(cache.networkPanel) &&
      cache.detailPanel !== cache.networkPanel
    );
  }

  async function injectLayout() {
    if (busy) return;

    busy = true;

    try {
      checkUrlChange();
      refreshCache();
      cleanupOldCode();

      const container = cache.container;
      const section = cache.section;

      if (!container || !section) return;

      if (arranged && currentPanelsStillValid()) {
        applyPanels(
          cache.detailPanel,
          cache.networkPanel,
          cache.detailDisplay,
          cache.networkDisplay,
          section
        );
        return;
      }

      // 第一优先：不点击、不等待，直接排列
      if (tryDirectArrange()) {
        return;
      }

      // 第二兜底：只在找不到网络面板时，短暂点击获取
      window.__DNM_TIMER__ = setTimeout(async () => {
        if (!arranged) {
          await fallbackClickArrange();
        }
      }, 0);
    } finally {
      busy = false;
    }
  }

  function schedule() {
    clearTimeout(window.__DNM_DEBOUNCE__);
    window.__DNM_DEBOUNCE__ = setTimeout(injectLayout, 80);
  }

  function startObserver() {
    const root = document.querySelector("#root");

    if (!root) {
      setTimeout(startObserver, 80);
      return;
    }

    cleanupOldCode();

    // 尽量立即执行
    injectLayout();

    window.__DNM_OBSERVER__ = new MutationObserver(() => {
      schedule();
    });

    window.__DNM_OBSERVER__.observe(root, {
      childList: true,
      subtree: true,
    });

    window.__DNM_INTERVAL__ = setInterval(() => {
      injectLayout();
    }, 5000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver, { once: true });
  } else {
    startObserver();
  }
})();
