// 合并版：链接栏悬停改色 + 登录链接暖金（仅 shli.io）
(function () {
  if (location.hostname !== 'shli.io') return;

  // 1) 给“联系我定制 / GitHub”这组加标识
  const bar = document.querySelector('div.flex.items-center.gap-2.w-fit');
  if (bar) bar.classList.add('custom-link-bar');

  // 2) 给“登录”链接加标识
  const login = document.querySelector('div.flex.items-center.gap-2 a[href="/dashboard"]');
  if (login) login.classList.add('custom-login-link');

  // 3) 注入合并样式
  const style = document.createElement('style');
  style.textContent = `
    /* —— 链接栏：禁用任何状态下的下划线 —— */
    .custom-link-bar a,
    .custom-link-bar a:hover,
    .custom-link-bar a:focus,
    .custom-link-bar a:active { text-decoration: none !important; }

    /* 仅在悬停时改变颜色 —— Telegram */
    .custom-link-bar a[href^="https://t.me/contact/1746959833:pDG7N84llgNWazU8"]:hover {
      color: #27A7E5 !important;
    }

    /* 仅在悬停时改变颜色 —— GitHub（亮/暗） */
    .custom-link-bar a[href*="github.com/hamster1963/nezha-dash"]:hover {
      color: #24292F !important;
    }
    .dark .custom-link-bar a[href*="github.com/hamster1963/nezha-dash"]:hover {
      color: #E6EDF3 !important;
    }

    /* —— 登录链接：默认暖金，悬停换色，无下划线，轻微上浮 —— */
    .custom-login-link {
      color: #CA8A04 !important;                 /* 默认暖金（亮色主题） */
      text-decoration: none !important;
      transition: transform .18s ease, letter-spacing .18s ease, color .18s ease, text-shadow .18s ease;
      will-change: transform, letter-spacing, color, text-shadow;
    }
    .dark .custom-login-link { color: #FACC15 !important; }     /* 暗色下默认暖金 */

    .custom-login-link:hover,
    .custom-login-link:focus-visible {
      color: #D97706 !important;                 /* 悬停金（亮色主题） */
      transform: translateY(-0.5px) scale(1.02);
      letter-spacing: 0.2px;
      text-decoration: none !important;
      text-shadow: 0 0 0.25em rgba(217,119,6,0.25);
    }
    .dark .custom-login-link:hover,
    .dark .custom-login-link:focus-visible {
      color: #FDE68A !important;                 /* 悬停金（暗色主题） */
      text-shadow: 0 0 0.25em rgba(253,230,138,0.25);
    }
  `;
  document.documentElement.appendChild(style);
})();
