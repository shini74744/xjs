/* 26.6.5更新 */
(() => {
  const VERSION = "20260605-optimized";

  const containerPath =
    "#root > div.flex.min-h-screen.w-full.flex-col > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info";

  const selectorSection = "section.flex.items-center.my-2.w-full";

  let lastUrl = location.href;
  let busy = false;
  let arranged = false;
  let scheduled = false;

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

  function isVisible(el) {
    if (!el) return false;

    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();

    return (
      s.display !== "none" &&
      s.visibility !== "hidden" &&
      s.opacity !== "0" &&
      r.width > 0 &&
      r.height > 0
    );
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
      cleanupOldCloneCode();
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

    let section = container.querySelector(selectorSection);

    if (section) return section;

    const candidates = Array.from(
      container.querySelectorAll("section, div, nav, [role='tablist']")
    ).filter(el => {
      if (!isVisible(el)) return false;

      const txt = textOf(el);
      const r = el.getBoundingClientRect();

      return (
        txt.includes("网络") &&
        (txt.includes("详细") || txt.includes("详情")) &&
        txt.length <= 40 &&
        r.height <= 120 &&
        r.width >= 80
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

  function cleanupOldCloneCode() {
    document
      .querySelectorAll(
        "[data-dnm-console-merged], [data-dnm-merged], [data-x-detail-network-merged], [data-x-network-merge-detail]"
      )
      .forEach(el => el.remove());
  }

  function findButton(section, words) {
    if (!section) return null;

    const nodes = Array.from(
      section.querySelectorAll("button, [role='tab'], div, span, a")
    ).filter(isVisible);

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

  function isBadBlock(el, section) {
    if (!el || el === section) return true;

    const txt = textOf(el);

    if (!txt) return true;
    if (txt.includes("©2020") || txt.includes("主题-哪吒")) return true;
    if (txt === "详细网络" || txt === "详情网络") return true;
    if (el.classList.contains("flex-center")) return true;

    return false;
  }

  function findActivePanel(container, section) {
    if (!container || !section) return null;

    const sectionRect = section.getBoundingClientRect();

    const children = Array.from(container.children).filter(el => {
      if (isBadBlock(el, section)) return false;
      if (!isVisible(el)) return false;

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

  function forceShowPanel(el, displayValue) {
    if (!el) return;

    if (el.hasAttribute("hidden")) {
      el.removeAttribute("hidden");
    }

    el.style.setProperty("display", displayValue || "block", "important");
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

  function currentPanelsStillValid() {
    return (
      cache.detailPanel &&
      cache.networkPanel &&
      document.contains(cache.detailPanel) &&
      document.contains(cache.networkPanel) &&
      cache.detailPanel !== cache.networkPanel
    );
  }

  async function arrangeOnce() {
    const container = cache.container;
    const section = cache.section;

    if (!container || !section) return false;

    const detailBtn = findButton(section, ["详细", "详情"]);
    const networkBtn = findButton(section, ["网络"]);

    if (!detailBtn || !networkBtn) {
      hideSection(section);
      return false;
    }

    // 1. 切到详细，记录详细原始面板和它原本的 display
    clickReal(detailBtn);
    await sleep(300);

    const detailPanel = findActivePanel(container, section);

    if (!detailPanel) {
      console.warn("[详情网络合并] 没找到详细面板");
      return false;
    }

    const detailDisplay = getComputedStyle(detailPanel).display || "block";

    // 2. 切到网络，记录网络原始面板和它原本的 display
    clickReal(networkBtn);
    await sleep(300);

    const networkPanel = findActivePanel(container, section);

    if (!networkPanel) {
      console.warn("[详情网络合并] 没找到网络面板");
      return false;
    }

    if (detailPanel === networkPanel) {
      console.warn("[详情网络合并] 详细和网络是同一个面板，无法无复制合并");
      return false;
    }

    const networkDisplay = getComputedStyle(networkPanel).display || "block";

    cache.detailPanel = detailPanel;
    cache.networkPanel = networkPanel;
    cache.detailDisplay = detailDisplay;
    cache.networkDisplay = networkDisplay;

    // 3. 只显示这两个面板，不碰页脚和其它块
    forceShowPanel(cache.detailPanel, cache.detailDisplay);
    forceShowPanel(cache.networkPanel, cache.networkDisplay);

    // 4. 排序：详细在上，网络在下
    sortDetailAboveNetwork(cache.detailPanel, cache.networkPanel);

    // 5. 隐藏按钮栏
    hideSection(section);

    return true;
  }

  async function injectLayout() {
    if (busy) return;
    busy = true;

    try {
      checkUrlChange();
      refreshCache();

      const container = cache.container;
      const section = cache.section;

      if (!container || !section) return;

      cleanupOldCloneCode();

      if (!arranged || !currentPanelsStillValid()) {
        arranged = await arrangeOnce();
      } else {
        forceShowPanel(cache.detailPanel, cache.detailDisplay);
        forceShowPanel(cache.networkPanel, cache.networkDisplay);
        sortDetailAboveNetwork(cache.detailPanel, cache.networkPanel);
        hideSection(section);
      }
    } finally {
      busy = false;
    }
  }

  function schedule() {
    if (scheduled) return;

    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      injectLayout();
    });
  }

  function startObserver() {
    const root = document.querySelector("#root");

    if (!root) {
      setTimeout(startObserver, 300);
      return;
    }

    cleanupOldCloneCode();

    setTimeout(injectLayout, 300);
    setTimeout(injectLayout, 1000);
    setTimeout(injectLayout, 2000);

    const observer = new MutationObserver(() => {
      clearTimeout(window.__dnm_debounce_timer__);
      window.__dnm_debounce_timer__ = setTimeout(schedule, 300);
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });

    setInterval(() => {
      injectLayout();
    }, 5000);
  }

  startObserver();
})();
