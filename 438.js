(function () {
  // ✅ 只在指定域名生效
  if (window.location.hostname !== "shli.io") return;

  /* =========================
   * ✅ 你最常改的参数都在这里
   * ========================= */

  // --- PC端（桌面）位置与大小：右上角 ---
  const DESKTOP_RIGHT_PX = 0;   // ← PC：距离右侧(px)，想往左就调大
  const DESKTOP_TOP_PX   = 0;   // ← PC：距离顶部(px)，想往下就调大
  const DESKTOP_W_PX     = 240; // ← PC：宽度(px)
  const DESKTOP_H_PX     = 60;  // ← PC：高度(px)

  // --- 手机端（移动）位置与大小：顶部居中 ---
  const MOBILE_TOP_PX    = 8;   // ← 手机：距离顶部(px)，想往下就调大
  const MOBILE_W_PX      = 150; // ← 手机：宽度(px)
  const MOBILE_H_PX      = 44;  // ← 手机：高度(px)
  const MOBILE_X_OFFSET_PX = 0; // ← 手机：水平微调(px)，正数往右，负数往左

  // --- 显示/隐藏触发 ---
  const TOP_THRESHOLD_PX = 5;   // ← 距离顶部<=多少px算“在顶部”：越大越容易显示

  // --- 图片地址 ---
  const BG_URL =
    "https://count.getloli.com/@tongji?name=tongji&theme=booru-mjg&padding=7&offset=0&align=top&scale=1&pixelated=1&darkmode=auto";

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

    /* ✅ PC：右上角悬浮（顶部显示，下滑隐藏） */
    .footer-background.is-desktop {
      position: fixed;
      right: ${DESKTOP_RIGHT_PX}px;   /* ← 改这里：PC左右位置（离右侧距离） */
      top: ${DESKTOP_TOP_PX}px;       /* ← 改这里：PC上下位置（离顶部距离） */
      width: ${DESKTOP_W_PX}px;       /* ← 改这里：PC宽度 */
      height: ${DESKTOP_H_PX}px;      /* ← 改这里：PC高度 */
      opacity: 0;
      transform: scale(0);
      transform-origin: top right;
      transition: all 0.5s ease-in-out;
      display: block;
    }

    /* ✅ 手机：顶部居中固定（顶部显示，下滑隐藏） */
    .footer-background.is-mobile {
      position: fixed;
      left: calc(50% + ${MOBILE_X_OFFSET_PX}px); /* ← 改这里：手机左右微调 */
      top: ${MOBILE_TOP_PX}px;                   /* ← 改这里：手机距离顶部 */
      width: ${MOBILE_W_PX}px;                   /* ← 改这里：手机宽度 */
      height: ${MOBILE_H_PX}px;                  /* ← 改这里：手机高度 */
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
   * - 手机：在顶部显示，下滑隐藏（直接display none，不占位）
   * ========================= */
  function updateFooter() {
    const isMobile = window.innerWidth < 768;
    const atTop = window.scrollY <= TOP_THRESHOLD_PX; // ← 改 TOP_THRESHOLD_PX 可调“多靠近顶部才显示”

    if (isMobile) {
      footer.classList.remove("is-desktop");
      footer.classList.add("is-mobile");

      // ✅ 手机：顶部显示 / 下滑隐藏
      footer.style.display = atTop ? "block" : "none";
      return;
    }

    footer.classList.remove("is-mobile");
    footer.classList.add("is-desktop");

    // ✅ PC：顶部显示 / 下滑隐藏（保留动画）
    footer.style.opacity = atTop ? "1" : "0";
    footer.style.transform = atTop ? "scale(1)" : "scale(0)";
  }

  window.addEventListener("scroll", updateFooter, { passive: true });
  window.addEventListener("resize", updateFooter);
  window.addEventListener("load", updateFooter);

  updateFooter();
})();
