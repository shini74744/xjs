(() => {
  const VERSION = "20260605-hidden-switch-original";

  const containerPath =
    "#root > div.flex.min-h-screen.w-full.flex-col > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info";

  const selectorSection = "section.flex.items-center.my-2.w-full";

  if (window.__DNM_OBSERVER__) {
    window.__DNM_OBSERVER__.disconnect();
  }

  if (window.__DNM_INTERVAL__) {
    clearInterval(window.__DNM_INTERVAL__);
  }

  if (window.__DNM_DEBOUNCE__) {
    clearTimeout(window.__DNM_DEBOUNCE__);
  }

  let lastUrl = location.href;
  let doneUrl = "";
  let busy = false;

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
      r.width > 0 &&
      r.height > 0
    );
  }

  function findContainer() {
    return (
      document.querySelector(containerPath) ||
      document.querySelector(".server-info")
    );
  }

  function findSection(container) {
    if (!container) return null;

    const fixed = container.querySelector(selectorSection);
    if (fixed) return fixed;

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

  function getOriginalDisplay(el) {
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

  function forceShow(el, section) {
    if (!el) return;
    if (isBadBlock(el, section)) return;

    const displayValue = getOriginalDisplay(el);

    if (el.hasAttribute("hidden")) {
      el.removeAttribute("hidden");
    }

    el.style.setProperty("display", displayValue, "important");
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

  function putDetailAboveNetwork(detailPanel, networkPanel) {
    if (!detailPanel || !networkPanel) return false;
    if (detailPanel === networkPanel) return false;

    const parent = detailPanel.parentElement;

    if (!parent || parent !== networkPanel.parentElement) return false;

    parent.insertBefore(detailPanel, networkPanel);

    if (detailPanel.nextElementSibling !== networkPanel) {
      parent.insertBefore(networkPanel, detailPanel.nextElementSibling);
    }

    return true;
  }

  function hideContainerBackground(container) {
    if (!container) return null;

    const oldOpacity = container.style.opacity;
    const oldTransition = container.style.transition;
    const oldPointerEvents = container.style.pointerEvents;

    container.style.setProperty("opacity", "0", "important");
    container.style.setProperty("transition", "none", "important");
    container.style.setProperty("pointer-events", "none", "important");

    return () => {
      container.style.opacity = oldOpacity || "";
      container.style.transition = oldTransition || "";
      container.style.pointerEvents = oldPointerEvents || "";
    };
  }

  async function waitPanel(container, section, oldPanel = null) {
    for (let i = 0; i < 8; i++) {
      await sleep(50);

      const panel = findActivePanel(container, section);

      if (panel && panel !== oldPanel) {
        return panel;
      }
    }

    return findActivePanel(container, section);
  }

  async function runOnce() {
    if (busy) return;
    if (doneUrl === location.href) return;

    busy = true;

    let restoreContainer = null;

    try {
      cleanupOldCloneCode();

      const container = findContainer();
      if (!container) return;

      const section = findSection(container);
      if (!section) return;

      const detailBtn = findButton(section, ["详细", "详情"]);
      const networkBtn = findButton(section, ["网络"]);

      if (!detailBtn || !networkBtn) {
        hideSection(section);
        doneUrl = location.href;
        return;
      }

      // 核心：后台隐藏切换，避免用户看到详细/网络来回跳
      restoreContainer = hideContainerBackground(container);

      // 1. 后台切到详细，记录详细原始模块
      clickReal(detailBtn);
      const detailPanel = await waitPanel(container, section);

      if (!detailPanel) {
        console.warn("[详情网络合并] 没找到详细模块");
        return;
      }

      // 2. 后台切到网络，记录网络原始模块
      clickReal(networkBtn);
      const networkPanel = await waitPanel(container, section, detailPanel);

      if (!networkPanel) {
        console.warn("[详情网络合并] 没找到网络模块");
        return;
      }

      if (detailPanel === networkPanel) {
        console.warn("[详情网络合并] 详细和网络识别为同一个模块，停止处理");
        return;
      }

      // 3. 按最开始逻辑：强制显示原始模块，不 clone
      Array.from(container.children).forEach(child => {
        forceShow(child, section);
      });

      // 4. 排序：详细在上，网络在下
      putDetailAboveNetwork(detailPanel, networkPanel);

      // 5. 隐藏“详细 / 网络”按钮
      hideSection(section);

      doneUrl = location.href;

      console.log("[详情网络合并] 已完成：后台切换，详细在上，网络在下");
    } finally {
      if (restoreContainer) {
        restoreContainer();
      }

      busy = false;
    }
  }

  function scheduleRun() {
    if (doneUrl === location.href) return;

    clearTimeout(window.__DNM_DEBOUNCE__);
    window.__DNM_DEBOUNCE__ = setTimeout(runOnce, 80);
  }

  function start() {
    runOnce();

    const root = document.querySelector("#root") || document.documentElement;

    window.__DNM_OBSERVER__ = new MutationObserver(() => {
      if (doneUrl !== location.href) {
        scheduleRun();
      }
    });

    window.__DNM_OBSERVER__.observe(root, {
      childList: true,
      subtree: true,
    });

    // 只监听 URL 变化，不因为图表刷新反复重排
    window.__DNM_INTERVAL__ = setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        doneUrl = "";
        scheduleRun();
      }
    }, 800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
