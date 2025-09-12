(function () {
  // 域名判断，如果不是 shli.io 则不执行
  if (window.location.hostname !== 'shli.io') return;

  // 字体方案（原有七个字体方案 + 空方案）
  const fontSchemes = [
    // 1. 抖音 Sans
    `
    @font-face {
        font-family: 'Douyin Sans';
        src: url('https://cdn.jsdelivr.net/gh/bytedance/fonts@main/DouyinSans/DouyinSansBold.ttf') format('truetype');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
    }
    * {
        font-family: 'Douyin Sans', sans-serif !important;
    }
    h1, h2, h3, h4, h5 {
        font-family: 'Douyin Sans', sans-serif !important;
        font-weight: bold;
    }
    `,

    // 2. HarmonyOS Sans
    `
    @import url('https://s1.hdslb.com/bfs/static/jinkela/long/font/regular.css');
    @import url('https://s1.hdslb.com/bfs/static/jinkela/long/font/medium.css');
    * {
        font-family: 'HarmonyOS_Regular', 'HarmonyOS Sans SC', 'HarmonyOS Sans', sans-serif !important;
    }
    h1, h2, h3, h4, h5 {
        font-family: 'HarmonyOS_Medium', 'HarmonyOS Sans SC', 'HarmonyOS Sans', sans-serif !important;
    }
    button, input, select, textarea {
        font-family: 'HarmonyOS_Regular', 'HarmonyOS Sans SC', 'HarmonyOS Sans', sans-serif !important;
    }
    `,

    // 3. OPPO Sans
    `
    @font-face {
        font-family: 'OPPO Sans';
        font-weight: 400;
        font-display: swap;
        src: url('https://code.oppo.com/content/dam/oppo/common/fonts/font2/new-font/OPPOSansOS2-5000-Regular.woff2') format('woff2');
    }
    @font-face {
        font-family: 'OPPO Sans';
        font-weight: 500;
        font-display: swap;
        src: url('https://code.oppo.com/content/dam/oppo/common/fonts/font2/new-font/OPPOSansOS2-5000-Medium.woff2') format('woff2');
    }
    * {
        font-family: 'OPPO Sans', sans-serif !important;
    }
    h1, h2, h3, h4, h5 {
        font-family: 'OPPO Sans', sans-serif !important;
        font-weight: 500;
    }
    `,

    // 4. Mi Sans
    `
    @import url('https://cdn-font.hyperos.mi.com/font/css?family=MiSans:400,500,600,700:Chinese_Simplify,Latin&display=swap');
    * {
        font-family: 'MiSans', sans-serif !important;
    }
    h1, h2, h3, h4, h5 {
        font-family: 'MiSans', sans-serif !important;
        font-weight: 600;
    }
    `,

    // 5. 华康金刚黑
    `
    @import url('https://fonts.bytedance.com/dfd/api/v1/css?family=DFPKingGothicGB-Regular&display=swap');
    @import url('https://fonts.bytedance.com/dfd/api/v1/css?family=DFPKingGothicGB-medium&display=swap');
    * {
        font-family: 'DFPKingGothicGB-Regular', sans-serif !important;
    }
    h1, h2, h3, h4, h5 {
        font-family: 'DFPKingGothicGB-medium', sans-serif !important;
    }
    `,

    // 6. Noto Sans SC
    `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');
    * {
        font-family: 'Noto Sans SC', sans-serif !important;
    }
    h1, h2, h3, h4, h5 {
        font-family: 'Noto Sans SC', sans-serif !important;
        font-weight: 700;
    }
    `,

    // 7. 霞鹜文楷
    `
    @import url('https://cdn.bootcdn.net/ajax/libs/lxgw-wenkai-screen-webfont/1.7.0/style.min.css');
    * {
        font-family: 'LXGW WenKai Screen';
    }
    h1, h2, h3, h4, h5 {
        font-family: 'LXGW WenKai Screen', sans-serif;
    }
    `,

    // 8. 空方案：使用系统默认字体
    `/* 使用系统默认字体，不做任何修改 */`
  ];

  // 随机选择一个方案
  const randomIndex = Math.floor(Math.random() * fontSchemes.length);
  const chosenScheme = fontSchemes[randomIndex];

  // 插入到 <head>
  const style = document.createElement('style');
  style.textContent = chosenScheme;
  document.head.appendChild(style);

  console.log(`🎨 本次使用的字体方案: #${randomIndex + 1}`);
})();
