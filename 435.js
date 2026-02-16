(function () {
  if (window.location.hostname !== "shli.io") return;

  // 这两个关键词用来定位“标题栏”和“概览”
  const BRAND_TEXT = "nezha云监控";
  const OVERVIEW_TEXT = "概览";

  const footer = document.createElement("div");
  footer.className = "footer-background";

  const style = document.createElement("style");
  style.textContent = `
    .footer-background{
      background-image: url('https://count.getloli.com/@tongji?name=tongji&theme=booru-mjg&padding=7&offset=0&align=top&scale=1&pixelated=1&darkmode=auto');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center center;
      pointer-events: none;
      z-index: 9988;
    }

    /* PC：右上角悬浮 */
    .footer-background.is-desktop{
      position: fixed;
      right: 0;
      top: 0;
      width: 240px;
      height: 60px;
      opacity: 0;
      transform: scale(0);
      transform-origin: top right;
      transition: all .5s ease-in-out;
      display: block;
    }

    /* 手机：插在标题栏下面（正常文档流） */
    .footer-background.is-mobile{
      position: static;
      width: 180px;
      height: 44px;
      margin: 8px auto 10px; /* 居中 + 留出上下间距 */
      opacity: 1;
      transform: scale(1);
      transition: none;
      display: block;
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(footer);

  // --------- 工具：找包含某段文字的“第一个可用元素” ----------
  function findFirstElementContainingText(text) {
    const root = document.body;
    if (!root) return null;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode(node) {
          const tag = node.tagName;
          if (!tag) return NodeFilter.FILTER_SKIP;
          if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_SKIP;

          const t = (node.textContent || "").trim();
          if (!t || t.length > 2000) return NodeFilter.FILTER_SKIP; // 避免抓到超大容器

          return t.includes(text) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      }
    );

    return walker.nextNode();
  }

  // --------- 手机端：把 footer 插到“标题栏”下面（afterend） ----------
  function placeFooterOnMobile() {
    const brandNode = findFirstElementContainingText(BRAND_TEXT);
    if (brandNode) {
      // 优先找 header/nav；没有就找一个合理的 div 容器
      const headerBox =
        brandNode.closest("header") ||
        brandNode.closest("nav") ||
        brandNode.closest("div");

      if (headerBox && headerBox.parentElement) {
        headerBox.insertAdjacentElement("afterend", footer); // ✅ 在元素下面，不是 inside
        return true;
      }
    }

    // 兜底：如果没找到标题栏，就插到“概览”前面
    const overviewNode = findFirstElementContainingText(OVERVIEW_TEXT);
    if (overviewNode && overviewNode.parentElement) {
      // 插在概览节点前面，也能落在“标题与概览之间”
      overviewNode.insertAdjacentElement("beforebegin", footer);
      return true;
    }

    return false;
  }

  // --------- PC端：固定放 body（不依赖结构） ----------
  function placeFooterOnDesktop() {
    if (footer.parentElement !== document.body) {
      document.body.appendChild(footer);
    }
  }

  function update() {
    const isMobile = window.innerWidth < 768;
    const atTop = window.scrollY <= 5;

    if (isMobile) {
      footer.classList.remove("is-desktop");
      footer.classList.add("is-mobile");

      // 手机端：必须先放到正确位置
      placeFooterOnMobile();

      // 手机端：顶部显示，往下滑直接隐藏（不占位）
      footer.style.display = atTop ? "block" : "none";
      return;
    }

    // Desktop：右上角 + 动画显示/隐藏
    placeFooterOnDesktop();
    footer.classList.remove("is-mobile");
    footer.classList.add("is-desktop");

    footer.style.opacity = atTop ? "1" : "0";
    footer.style.transform = atTop ? "scale(1)" : "scale(0)";
  }

  // 动态渲染兜底：监听 DOM 变化，确保手机端能插进去
  const observer = new MutationObserver(() => {
    if (window.innerWidth < 768) placeFooterOnMobile();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // 再兜底：前几秒轮询（防止某些框架晚渲染）
  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (window.innerWidth < 768 && placeFooterOnMobile()) clearInterval(timer);
    if (tries >= 40) clearInterval(timer); // ~10秒
  }, 250);

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  window.addEventListener("load", update);

  update();
})();
