/* 26.6.5更新 */
(() => {
  const VERSION = "original-stable";

  const containerPath =
    "#root > div.flex.min-h-screen.w-full.flex-col > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info";

  const selectorSection = "section.flex.items-center.my-2.w-full";

  // 清理之前测试版留下的监听器/定时器，避免多个脚本一起跑导致跳动
  try {
    if (window.__DNM_OBSERVER__) window.__DNM_OBSERVER__.disconnect();
    if (window.__DNM_ORIGINAL_OBSERVER__) window.__DNM_ORIGINAL_OBSERVER__.disconnect();
    if (window.__DNM_INTERVAL__) clearInterval(window.__DNM_INTERVAL__);
    if (window.__DNM_ORIGINAL_INTERVAL__) clearInterval(window.__DNM_ORIGINAL_INTERVAL__);
    if (window.__DNM_TIMER__) clearTimeout(window.__DNM_TIMER__);
    if (window.__DNM_DEBOUNCE__) clearTimeout(window.__DNM_DEBOUNCE__);
    if (window.__dnm_debounce_timer__) clearTimeout(window.__dnm_debounce_timer__);
  } catch (e) {}

  let lastUrl = location.href;
  let busy = false;
  let arranged = false;

  let cache = {
    container: null,
    section: null,
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

  function checkUrlChange() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      arranged = false;
      cache.container = null;
      cache.section = null;
    }
  }

  function refreshCache() {
    if (!cache.container || !document.contains(cache.container)) {
      cache.container =
        document.querySelector(containerPath) ||
        document.querySelector(".server-info");

      cache.section = null;
    }

    if (!cache.container) return;

    if (!cache.section || !document.contains(cache.section)) {
      cache.section =
        cache.container.querySelector(selectorSection) ||
        findSectionByText(cache.container);
    }
  }

  function findSectionByText(container) {
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

  function putDetailAboveNetwork(container, detailPanel, networkPanel) {
    if (!container || !detailPanel || !networkPanel) return;
    if (detailPanel === networkPanel) return;

    const parent = detailPanel.parentElement;

    if (!parent || parent !== networkPanel.parentElement) return;

    parent.insertBefore(detailPanel, networkPanel);

    if (detailPanel.nextElementSibling !== networkPanel) {
      parent.insertBefore(networkPanel, detailPanel.nextElementSibling);
    }
  }

  async function injectLayout() {
    if (busy) return;
    busy = true;

    try {
      checkUrlChange();
      refreshCache();
      cleanupOldCloneCode();

      const container = cache.container;
      const section = cache.section;

      if (!container || !section) return;

      const detailBtn = findButton(section, ["详细", "详情"]);
      const networkBtn = findButton(section, ["网络"]);

      if (!detailBtn || !networkBtn) {
        hideSection(section);
        return;
      }

      if (!arranged) {
        // 1. 切到详细，拿到详细原始块
        clickReal(detailBtn);
        await sleep(300);

        const detailPanel = findActivePanel(container, section);

        // 2. 切到网络，拿到网络原始块
        clickReal(networkBtn);
        await sleep(300);

        const networkPanel = findActivePanel(container, section);

        // 3. 强制显示 server-info 里的原始子块，不 clone
        Array.from(container.children).forEach(child => {
          forceShow(child, section);
        });

        // 4. 排序：详细在上，网络在下
        putDetailAboveNetwork(container, detailPanel, networkPanel);

        arranged = true;
      } else {
        Array.from(container.children).forEach(child => {
          forceShow(child, section);
        });
      }

      // 5. 隐藏“详细 / 网络”按钮
      hideSection(section);
    } finally {
      busy = false;
    }
  }

  let scheduled = false;

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

    injectLayout();

    window.__DNM_ORIGINAL_OBSERVER__ = new MutationObserver(() => {
      schedule();
    });

    window.__DNM_ORIGINAL_OBSERVER__.observe(root, {
      childList: true,
      subtree: true,
    });

    window.__DNM_ORIGINAL_INTERVAL__ = setInterval(() => {
      injectLayout();
    }, 3000);
  }

  startObserver();
})();
