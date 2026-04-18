(function () {
  // ✅ 只在指定域名生效
  if (window.location.hostname !== "shli.io") return;

  /* =========================
   * ✅ 你最常改的参数都在这里
   * ========================= */

  // --- PC端（桌面）位置：右上角 ---
  const DESKTOP_RIGHT_MIN_PX = 0;   // PC端：距离右侧最小值
  const DESKTOP_RIGHT_MAX_PX = 16;  // PC端：距离右侧最大值
  const DESKTOP_TOP_MIN_PX   = 0;   // PC端：距离顶部最小值
  const DESKTOP_TOP_MAX_PX   = 16;  // PC端：距离顶部最大值

  // --- PC端（桌面）宽度自适应 ---
  const DESKTOP_W_MIN_PX     = 160; // PC端：最小宽度
  const DESKTOP_W_VW         = 18;  // PC端：理想宽度 = 18vw
  const DESKTOP_W_MAX_PX     = 260; // PC端：最大宽度

  // --- PC端图片比例（原来 240:60 = 4:1）---
  const DESKTOP_RATIO_W      = 4;
  const DESKTOP_RATIO_H      = 1;

  // --- 手机端（移动）位置：顶部居中 ---
  const MOBILE_TOP_MIN_PX    = 6;   // 手机端：距离顶部最小值
  const MOBILE_TOP_MAX_PX    = 12;  // 手机端：距离顶部最大值
  const MOBILE_X_OFFSET_PX   = 15;  // 手机端：水平微调，正数往右，负数往左

  // --- 手机端（移动）宽度自适应 ---
  const MOBILE_W_MIN_PX      = 130; // 手机端：最小宽度
  const MOBILE_W_VW          = 42;  // 手机端：理想宽度 = 42vw
  const MOBILE_W_MAX_PX      = 180; // 手机端：最大宽度

  // --- 手机端图片比例（原来 170:44）---
  const MOBILE_RATIO_W       = 170;
  const MOBILE_RATIO_H       = 44;

  // --- 显示/隐藏触发 ---
  const TOP_THRESHOLD_PX     = 5;   // 距离顶部<=多少px算“在顶部”

  // --- 图片地址 ---
  const BG_URL =
    "https://count.getloli.com/@tongji?name=tongji&theme=random&padding=7&offset=0&align=top&scale=1&pixelated=1&darkmode=auto";

  /* =========================
   * ✅ 创建元素与样式
   * ========================= */
  const footer = document.createElement("div");
  footer.className = "footer-background";

  const style = document.createElement("style");
  style.textContent = `
    .footer-background {
      background-image: url('${BG_URL}');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center center;
      pointer-events: none;
      z-index: 9988;
    }

    /* ✅ PC：右上角悬浮，自适应尺寸 */
    .footer-background.is-desktop {
      position: fixed;
      right: clamp(${DESKTOP_RIGHT_MIN_PX}px, 1vw, ${DESKTOP_RIGHT_MAX_PX}px);
      top: clamp(${DESKTOP_TOP_MIN_PX}px, 1vw, ${DESKTOP_TOP_MAX_PX}px);

      width: clamp(${DESKTOP_W_MIN_PX}px, ${DESKTOP_W_VW}vw, ${DESKTOP_W_MAX_PX}px);
      aspect-ratio: ${DESKTOP_RATIO_W} / ${DESKTOP_RATIO_H};

      opacity: 0;
      transform: scale(0);
      transform-origin: top right;
      transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
      display: block;
    }

    /* ✅ 手机：顶部居中，自适应尺寸 */
    .footer-background.is-mobile {
      position: fixed;
      left: calc(50% + ${MOBILE_X_OFFSET_PX}px);
      top: clamp(${MOBILE_TOP_MIN_PX}px, 2vw, ${MOBILE_TOP_MAX_PX}px);

      width: clamp(${MOBILE_W_MIN_PX}px, ${MOBILE_W_VW}vw, ${MOBILE_W_MAX_PX}px);
      aspect-ratio: ${MOBILE_RATIO_W} / ${MOBILE_RATIO_H};

      transform: translateX(-50%);
      opacity: 1;
      transition: none;
      display: block;
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(footer);

  /* =========================
   * ✅ 控制显示逻辑
   * - PC：在顶部显示，下滑隐藏（缩放淡出动画）
   * - 手机：在顶部显示，下滑隐藏（直接display none）
   * ========================= */
  function updateFooter() {
    const isMobile = window.innerWidth < 768;
    const atTop = window.scrollY <= TOP_THRESHOLD_PX;

    if (isMobile) {
      footer.classList.remove("is-desktop");
      footer.classList.add("is-mobile");
      footer.style.display = atTop ? "block" : "none";
      return;
    }

    footer.classList.remove("is-mobile");
    footer.classList.add("is-desktop");
    footer.style.display = "block";
    footer.style.opacity = atTop ? "1" : "0";
    footer.style.transform = atTop ? "scale(1)" : "scale(0)";
  }

  window.addEventListener("scroll", updateFooter, { passive: true });
  window.addEventListener("resize", updateFooter);
  window.addEventListener("load", updateFooter);

  updateFooter();
})();
