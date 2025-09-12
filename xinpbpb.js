(() => {
    // ---------------------------
    // 域名判断
    // ---------------------------
    if (window.location.hostname !== 'shli.io') {
        console.warn('脚本未授权的域名，停止执行');
        return; // 非授权域名直接停止执行
    }

    const jumpUrl = "https://www.bing.com"; // 自定义跳转页面

    // -------------------------------
    // 0. 判断是否是移动端
    // -------------------------------
    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone|Mobi/i.test(navigator.userAgent);
    if (isMobile) {
        console.log("移动端访问，启用图片长按保护");

        let touchTimer = null;

        document.addEventListener("touchstart", e => {
            if (e.target.tagName.toLowerCase() === "img") {
                touchTimer = setTimeout(() => {
                    alert("⚠️ 此图片已保护，不能保存！");
                }, 1000);
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener("touchend", () => { clearTimeout(touchTimer); });
        document.addEventListener("touchmove", () => { clearTimeout(touchTimer); });

        document.addEventListener("contextmenu", e => {
            if (e.target.tagName.toLowerCase() === "img") e.preventDefault();
        });

        const style = document.createElement("style");
        style.innerHTML = `
          img {
            -webkit-touch-callout: none !important;
          }
        `;
        document.head.appendChild(style);

        return; // 移动端到此结束，不执行 PC 防护
    }

    // -------------------------------
    // 1. 禁用快捷键 (PC)
    // -------------------------------
    document.addEventListener("keydown", e => {
        if (
            e.keyCode === 123 ||
            (e.ctrlKey && e.shiftKey && e.keyCode === 67) ||
            (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
            (e.ctrlKey && e.keyCode === 85)
        ) {
            e.preventDefault();
            alert("检测到开发者工具快捷键，操作被阻止");
            window.location.href = jumpUrl;
        }
    });

    // -------------------------------
    // 2. 检测窗口尺寸异常变化 (PC)
    // -------------------------------
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    function isFullScreen() {
        return document.fullscreenElement ||
               document.webkitFullscreenElement ||
               document.msFullscreenElement;
    }

    window.addEventListener("resize", () => {
        const widthDiff = Math.abs(window.innerWidth - lastWidth);
        const heightDiff = Math.abs(window.innerHeight - lastHeight);

        if ((widthDiff > 50 || heightDiff > 50) && !isFullScreen()) {
            alert("检测到异常窗口变化，请关闭开发者工具。如果你想查看页面元素代码，用在自己网页上，请不要做小偷，正常联系我获取。");
            window.location.href = jumpUrl;
        }

        lastWidth = window.innerWidth;
        lastHeight = window.innerHeight;
    });

    // -------------------------------
    // 3. 反调试 (PC)
    // -------------------------------
    function antiDebug() {
        setInterval(() => {
            (function(){return false;})["constructor"]("debugger")["call"]();
        }, 50);
    }

    try { antiDebug(); } catch (err) {}

    // -------------------------------
    // 4. 禁用右键（PC）
    // -------------------------------
    document.addEventListener("contextmenu", e => {
        e.preventDefault();
        alert("右键已被禁用");
    });

    // -------------------------------
    // 5. 禁止选中（PC）
    // -------------------------------
    document.addEventListener('selectstart', e => e.preventDefault());
    document.addEventListener('mousedown', e => {
        if (e.button === 2) e.preventDefault();
    });

    const style = document.createElement('style');
    style.innerHTML = `
      body {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);

})();
