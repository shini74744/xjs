(() => {
  const VERSION = "20260605-no-click-stable";

  const containerPath =
    "#root > div.flex.min-h-screen.w-full.flex-col > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info";

  const selectorSection = "section.flex.items-center.my-2.w-full";

  if (window.__DNM_OBSERVER__) window.__DNM_OBSERVER__.disconnect();
  if (window.__DNM_INTERVAL__) clearInterval(window.__DNM_INTERVAL__);
  if (window.__DNM_TIMER__) clearTimeout(window.__DNM_TIMER__);

  let lastUrl = location.href;
  let doneUrl = "";
  let busy = false;

  console.log("[详情网络合并] loaded:", VERSION);

  function textOf(el) {
    return (el?.innerText || el?.textContent || "")
      .replace(/\s+/g, "")
      .trim();
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

  function isBadBlock(el, section) {
    if (!el || el === section) return true;

    const txt = textOf(el);

    if (!txt) return true;
    if (txt === "详细网络" || txt === "详情网络") return true;
    if (txt.includes("©2020") || txt.includes("主题-哪吒")) return true;
    if (el.classList.contains("flex-center")) return true;

    return false;
  }

  function isNetworkPanel(el) {
    const txt = textOf(el);

    let score = 0;

    if (txt.includes("实时")) score += 2;
    if (txt.includes("7天")) score += 2;
    if (txt.includes("30天")) score += 2;

    if (txt.includes("中央处理器") || txt.includes("CPU")) score += 2;
    if (txt.includes("内存")) score += 2;
    if (txt.includes("磁盘")) score += 2;

    if (txt.includes("TCP")) score += 2;
    if (txt.includes("UDP")) score += 2;

    if (txt.includes("上传")) score += 2;
    if (txt.includes("下载")) score += 2;

    if (txt.includes("连接数")) score += 1;
    if (txt.includes("网络")) score += 1;

    return score >= 4;
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
    if (!el || isBadBlock(el, section)) return;

    const displayValue = getOriginalDisplay(el);

    if (el.hasAttribute("hidden")) {
      el.removeAttribute("hidden");
    }

    el.style.setProperty("display", displayValue, "important");
    el.style.setProperty("visibility", "visible", "important");
    el.style.setProperty("opacity", "1", "important");
    el.style.setProperty("height", "auto", "important");
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

  function getCandidatePanels(container, section) {
    if (!container) return [];

    return Array.from(container.children).filter(el => {
      if (isBadBlock(el, section)) return false;
      if (el === section) return false;

      const txt = textOf(el);
      const r = el.getBoundingClientRect();

      return (
        txt.length > 3 &&
        r.width > 80 &&
        r.height > 10
      );
    });
  }

  function sortDetailAboveNetwork(detailPanel, networkPanel) {
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

  function runOnce() {
    if (busy) return;
    if (doneUrl === location.href) return;

    busy = true;

    try {
      cleanupOldCloneCode();

      const container = findContainer();
      if (!container) return;

      const section = findSection(container);
      if (!section) return;

      const panels = getCandidatePanels(container, section);

      if (panels.length < 2) {
        return;
      }

      const networkPanel = panels.find(isNetworkPanel);

      if (!networkPanel) {
        console.warn("[详情网络合并] 没识别到网络模块，未执行，避免跳动");
        return;
      }

      const detailPanel = panels.find(el => el !== networkPanel);

      if (!detailPanel) {
        console.warn("[详情网络合并] 没识别到详细模块，未执行");
        return;
      }

      // 只显示详细和网络两个原始模块，不碰页脚
      forceShow(detailPanel, section);
      forceShow(networkPanel, section);

      // 详细在上，网络在下
      sortDetailAboveNetwork(detailPanel, networkPanel);

      // 隐藏“详细 / 网络”按钮
      hideSection(section);

      doneUrl = location.href;

      console.log("[详情网络合并] 已完成：无点击、无复制、无跳动");
    } finally {
      busy = false;
    }
  }

  function scheduleRun() {
    if (doneUrl === location.href) return;

    clearTimeout(window.__DNM_TIMER__);
    window.__DNM_TIMER__ = setTimeout(runOnce, 80);
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

    // 只检测路由变化，不参与图表刷新
    window.__DNM_INTERVAL__ = setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        doneUrl = "";
        scheduleRun();
      }
    }, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
