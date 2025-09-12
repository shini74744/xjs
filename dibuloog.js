(function() {
  // 域名判断
  if (window.location.hostname !== 'shli.io') return;

  // 1️⃣ 动态加载 Font Awesome
  function loadFontAwesome(callback) {
    if (document.getElementById('fa-script')) {
      callback();
      return;
    }
    const faLink = document.createElement('link');
    faLink.id = 'fa-script';
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
    faLink.onload = callback; // CSS 加载完成后执行
    document.head.appendChild(faLink);
  }

  // 2️⃣ 动态创建 CSS 样式（只创建一次）
  function addCustomStyle() {
    if (document.getElementById('custom-footer-style')) return;
    const style = document.createElement('style');
    style.id = 'custom-footer-style';
    style.textContent = `
.footer-link:hover { text-decoration: underline !important; opacity: 0.8; }
.server-footer-name > div, .server-footer-theme { display: flex; align-items: center; gap: 8px; font-size: 14px; }
@keyframes fadeColor { 0% { color: inherit; } 100% { color: var(--target-color); } }
@keyframes fadeLoop { 0% { opacity: 0; transform: translateY(5px); } 50% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-5px); } }
.fade-loop { animation: fadeLoop 2.5s ease-in-out infinite; }
@keyframes rotateIcon { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.rotate-icon { animation: rotateIcon 2s linear infinite; }
    `;
    document.head.appendChild(style);
  }

  // 3️⃣ 随机颜色生成函数
  function getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  }

  // 4️⃣ 给文字添加颜色渐变动画
  function animateTextColor(element, text) {
    element.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.textContent = text[i];
      span.style.setProperty('--target-color', getRandomColor());
      span.style.animation = 'fadeColor 1s ease forwards';
      span.style.animationDelay = `${i * 0.2}s`;
      element.appendChild(span);
    }
  }

  // 5️⃣ 更新左侧页脚
  function updateFooterLeft() {
    const footerLeft = document.querySelector('.server-footer-name > div:first-child');
    if (!footerLeft) return false;

    const container = document.createElement('span');
    container.classList.add('color-animate');

    const icon = document.createElement('i');
    icon.className = 'fas fa-server';
    icon.style.marginRight = '6px';
    icon.style.fontFamily = '"Font Awesome 6 Free"'; // 强制 Font Awesome 字体

    const link = document.createElement('a');
    link.href = 'https://t.me/contact/1746959833:pDG7N84llgNWazU8';
    link.target = '_blank';
    link.className = 'footer-link';
    link.style.textDecoration = 'none';

    container.appendChild(icon);
    container.appendChild(link);
    footerLeft.innerHTML = '';
    footerLeft.appendChild(container);

    const text = 'MyStatus 监控系统 ©2025';
    animateTextColor(link, text);
    setInterval(() => animateTextColor(link, text), 6000);

    return true;
  }

  // 6️⃣ 更新右侧页脚
  function updateFooterRight() {
    const footerRight = document.querySelector('.server-footer-theme');
    if (!footerRight) return false;

    const section = document.createElement('section');
    section.classList.add('fade-loop');

    const a = document.createElement('a');
    a.href = 'https://github.com/nezhahq/nezha';
    a.target = '_blank';
    a.className = 'footer-link';
    a.style.color = '#888';
    a.style.textDecoration = 'none';
    a.innerHTML = `<i class="fab fa-github rotate-icon" style="margin-right: 6px; font-family: 'Font Awesome 6 Brands';"></i> Powered by NeZha`;

    section.appendChild(a);
    footerRight.innerHTML = '';
    footerRight.appendChild(section);

    return true;
  }

  // 7️⃣ 等待 Font Awesome 加载 + 页脚渲染完成再执行
  loadFontAwesome(() => {
    addCustomStyle();

    let tries = 0;
    const timer = setInterval(() => {
      const leftOK = updateFooterLeft();
      const rightOK = updateFooterRight();
      if ((leftOK && rightOK) || tries > 20) {
        clearInterval(timer);
      }
      tries++;
    }, 500);
  });

})();
