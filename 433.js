(function () {
  // 判断域名
  if (window.location.hostname !== "shli.io") return;

  // 目标：手机端要插到这个链接所在块的下面
  const MOBILE_TARGET_LINK_SELECTOR = "a.custom-login-link";

  // 创建元素
  const footer = document.createElement("div");
  footer.className = "footer-background";

  // 样式（PC固定右上角；手机端改为插入布局流里）
  const style = document.createElement("style");
  style.textContent = `
    .footer-background {
      background-image: url('https://count.getloli.com/@tongji?name=tongji&theme=booru-mjg&padding=7&offset=0&align=top&scale=1&pixelated=1&darkmode=auto');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center center;

      height: 60px;
      width: 240px;

      z-index: 9988;
      pointer-events: none;

      opacity: 0;
      transform: scale(0);
      transform-origin: top right;
      transition: all 0.5s ease-in-out;
    }

    /* PC：固定右上角 */
    .footer-background.is-desktop {
      position: fixed;
      right: 0;
      top: 0;
      bottom: auto;
      display: block; /* 由JS控制透明度/缩放 */
    }

    /* 手机：插入到目标元素下方（不固定） */
    .footer-background.is-mobile {
      position: static;
      display: block;
      opacity: 1;
      transform: scale(1);
      transform-origin: center;
      width: 180px;     /* 手机上别太大，你也可以改 */
      height: 44px;
      margin-top: 8px;  /* 跟上面的元素留点距离 */
    }
  `;
  document.head.appendChild(style);

  // 确保 footer 在 DOM 里（先放 body，后面会根据端调整位置）
  document.body.appendChild(footer);

  function placeFooterOnMobile() {
    const link = document.querySelector(MOBILE_TARGET_LINK_SELECTOR);
    if (!link) return false;

    // 优先找你给的那种外层 div.flex.items-center.gap-2；找不到就退回父级 div
    const targetBox =
      link.closest("div.flex.items-center.gap-2") ||
      link.closest("div") ||
      link.parentElement;

    if (!targetBox) return false;

    // 放到该块“下面”
    if (footer.parentElement !== targetBox.parentElement) {
      targetBox.insertAdjacentElement("afterend", footer);
    } else {
      // 同一个父级时也确保顺序在后面
      if (targetBox.nextSibling !== footer) {
        targetBox.insertAdjacentElement("afterend", footer);
      }
    }
    return true;
  }

  function placeFooterOnDesktop() {
    // 放回 body 末尾（固定定位不需要依赖某个元素）
    if (footer.parentElement !== document.body) {
      document.body.appendChild(footer);
    }
  }

  function updateFooter() {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      footer.classList.remove("is-desktop");
      footer.classList.add("is-mobile");

      // 插到指定元素下面（如果元素还没渲染出来，会由 observer 再尝试）
      placeFooterOnMobile();
      return;
    }

    // Desktop 行为：右上角，顶部显示，往下隐藏
    placeFooterOnDesktop();
    footer.classList.remove("is-mobile");
    footer.classList.add("is-desktop");

    const atTop = window.scrollY <= 5;
    if (atTop) {
      footer.style.opacity = "1";
      footer.style.transform = "scale(1)";
    } else {
      footer.style.opacity = "0";
      footer.style.transform = "scale(0)";
    }
  }

  // 如果页面是前端动态渲染，元素可能晚点出现：用 MutationObserver 兜底
  const observer = new MutationObserver(() => {
    // 只有手机端才需要盯着插入点
    if (window.innerWidth < 768) {
      placeFooterOnMobile();
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("scroll", updateFooter, { passive: true });
  window.addEventListener("resize", updateFooter);
  window.addEventListener("load", updateFooter);

  // 立即跑一次
  updateFooter();
})();
