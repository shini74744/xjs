(function () {
  if (window.location.hostname !== "shli.io") return;

  // 目标：这个 <div class="flex items-center gap-2"> 里面的链接
  const LINK_SELECTOR = 'a.custom-login-link[href="/dashboard"]';

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
      transform-origin: top right;
      transition: all .5s ease-in-out;
    }

    /* 手机：作为普通块元素，插在目标元素下面 */
    .footer-background.is-mobile{
      position: static;
      width: 180px;
      height: 44px;
      margin-top: 8px;
      transform-origin: center;
      transition: none;
    }
  `;
  document.head.appendChild(style);

  // 先丢到 body，后面会根据端调整位置
  document.body.appendChild(footer);

  function insertAfterTargetOnMobile() {
    const link = document.querySelector(LINK_SELECTOR);
    if (!link) return false;

    // 你给的就是这个 div（优先用它）
    const box = link.closest("div.flex.items-center.gap-2") || link.closest("div") || link.parentElement;
    if (!box || !box.parentElement) return false;

    // 关键：插在 box 的“下面”，不是 inside
    box.insertAdjacentElement("afterend", footer);
    return true;
  }

  function update() {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      footer.classList.remove("is-desktop");
      footer.classList.add("is-mobile");

      // 手机端：强制可见（避免被之前内联样式压住）
      footer.style.display = "block";
      footer.style.opacity = "1";
      footer.style.transform = "scale(1)";

      insertAfterTargetOnMobile();
      return;
    }

    // PC端：右上角悬浮 + 顶部显示，下滑隐藏
    if (footer.parentElement !== document.body) document.body.appendChild(footer);

    footer.classList.remove("is-mobile");
    footer.classList.add("is-desktop");

    const atTop = window.scrollY <= 5;
    footer.style.display = "block";
    footer.style.opacity = atTop ? "1" : "0";
    footer.style.transform = atTop ? "scale(1)" : "scale(0)";
  }

  // 兜底：DOM 动态渲染时，目标元素晚出现也能插进去
  const observer = new MutationObserver(() => {
    if (window.innerWidth < 768) insertAfterTargetOnMobile();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // 再兜底：前几秒轮询（有些框架 MutationObserver 也可能错过时机）
  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (window.innerWidth < 768 && insertAfterTargetOnMobile()) {
      clearInterval(timer);
    }
    if (tries >= 40) clearInterval(timer); // 大约 10 秒
  }, 250);

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  window.addEventListener("load", update);

  update();
})();
