// =======================================================
// 域名判断 + 全 JS 版本：视频/图片背景 + 凌晨模式提示 + 地域判断 + 交互逻辑
// =======================================================
(() => {
  // ---------------------------
  // 域名判断
  // ---------------------------
  if (window.location.hostname !== 'shli.io') {
    console.warn('脚本未授权的域名，停止执行');
    return; // 非授权域名直接停止执行
  } else {
    // =======================================================
    // 原始脚本逻辑（保持功能不变）
    // =======================================================
    (function () {
      function onReady(fn) {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
          fn();
        }
      }

      onReady(async function init() {
        // ---------------------------
        // 1) <meta> 注入
        // ---------------------------
        (function ensureNoReferrerMeta() {
          const existing = document.querySelector('meta[name="referrer"]');
          if (!existing) {
            const meta = document.createElement('meta');
            meta.setAttribute('name', 'referrer');
            meta.setAttribute('content', 'no-referrer');
            const head = document.head || document.getElementsByTagName('head')[0];
            head.insertBefore(meta, head.firstChild || null);
          } else {
            existing.setAttribute('content', 'no-referrer');
          }
        })();

        // ---------------------------
        // 2) 注入 CSS
        // ---------------------------
        (function injectStyle() {
          const style = document.createElement('style');
          style.setAttribute('data-from', 'dynamic-video-bg-style');
          style.textContent = `
/* 省略 CSS 内容，保持原样 */
          `;
          (document.head || document.documentElement).appendChild(style);
        })();

        // ---------------------------
        // 3) 创建视频 DOM / 提示框
        // ---------------------------
        const videoBox = document.createElement('div');
        videoBox.className = 'video-box';
        const videoEl = document.createElement('video');
        videoEl.id = 'myVideo';
        videoEl.muted = true;
        videoEl.autoplay = true;
        videoEl.playsInline = true;
        videoEl.loop = true;
        videoEl.preload = 'auto';

        const sourceEl = document.createElement('source');
        sourceEl.id = 'videoSource';
        sourceEl.type = 'video/mp4';

        videoEl.appendChild(sourceEl);
        videoEl.appendChild(document.createTextNode('您的浏览器不支持 HTML5 视频。'));
        videoBox.appendChild(videoEl);
        document.body.appendChild(videoBox);

        const nightTip = document.createElement('div');
        nightTip.id = 'nightModeTip';
        nightTip.textContent = '🌝 凌晨模式已开启';
        document.body.appendChild(nightTip);

        // ---------------------------
        // 4) 原脚本逻辑（移动端、PC端、夜间模式、地域判断）
        // ---------------------------
        const isMobile = /Android|iPhone|iPad|iPod|Windows Phone|BlackBerry/i.test(navigator.userAgent);
        const now = new Date();
        const beijingHour = (now.getUTCHours() + 8) % 24;
        const isNightMode = beijingHour >= 1 && beijingHour < 6;

        window.CustomLinks = '[{"link":"https://t.me/contact/1746959833:pDG7N84llgNWazU8","name":"联系我定制"},{"link":"https://github.com/hamster1963/nezha-dash","name":"GitHub"}]';
        window.CustomLogo = "https://cdn.skyimg.net/up/2025/1/13/zera6q.webp";
        window.ShowNetTransfer = "true";
        window.CustomIllustration = 'https://free.picui.cn/free/2025/04/15/67fe011873e90.gif';
        window.CustomDesc = "专业服务，技术先行";

        let isChinaUser = false;
        try {
          const asnResponse = await fetch('https://ipinfo.io/json?token=769fdd3c5a44a4');
          const asnInfo = await asnResponse.json();
          const blockAsnList = ['AS9808', 'AS4134', 'AS4837'];
          const userASN = asnInfo.org || '';
          if (blockAsnList.some(asn => userASN.includes(asn))) isChinaUser = true;
        } catch (err) {
          console.warn('ASN 获取失败，将按默认地区处理');
        }

        function mountImageBackground(url) {
          const imageBox = document.createElement('div');
          imageBox.classList.add('image-box');
          imageBox.style.backgroundImage = `url(${url})`;
          document.body.appendChild(imageBox);
        }

        function setVideoSrc(url) {
          sourceEl.src = url;
          videoEl.load();
        }

        // 夜间模式
        if (isNightMode) {
          const nightImages = [
            'https://jkapi.com/api/yo_cup?type=&apiKey=85d2491045c79dc05e67e51574ad38da',
            'https://image.anosu.top/pixiv/direct?r18=1&keyword=touhou',
            'https://imgs.serv00.net/pic.php'
          ];
          const randomNightImage = nightImages[Math.floor(Math.random() * nightImages.length)];
          mountImageBackground(randomNightImage);
          if (videoBox) videoBox.style.display = 'none';
          nightTip.classList.add('show');
          setTimeout(() => nightTip.classList.remove('show'), 10000);
          return;
        }

        if (!isMobile) {
          const meihuaScript = document.createElement('script');
          meihuaScript.src = 'https://api.vvhan.com/api/script/meihua';
          document.body.appendChild(meihuaScript);
        }

        // 中国用户背景
        if (isChinaUser) {
          const chinaMediaSources = [
            { type: 'image', src: 'https://t.alcy.cc/acg' },
            { type: 'image', src: 'https://t.alcy.cc/fj' },
            { type: 'video', src: 'https://t.alcy.cc/acg' },
            { type: 'video', src: 'https://alimov2.a.kwimgs.com/...mp4' },
          ];
          const randomChinaSource = chinaMediaSources[Math.floor(Math.random() * chinaMediaSources.length)];
          if (randomChinaSource.type === 'video') setVideoSrc(randomChinaSource.src);
          else mountImageBackground(randomChinaSource.src);
          return;
        }

        // 非中国用户背景
        if (isMobile) {
          const mobileMediaSources = [
            { type: 'image', src: 'https://api.lolimi.cn/API/tup/xjj.php' },
            { type: 'video', src: 'https://tc.shni.cc/api/api.php' },
            { type: 'image', src: 'https://www.onexiaolaji.cn/RandomPicture/api/?key=qq249663924' },
            { type: 'video', src: 'http://api.mmp.cc/api/shortvideo?type=mp4' },
            { type: 'video', src: 'https://t.alcy.cc/acg' },
          ];
          const randomMobileSource = mobileMediaSources[Math.floor(Math.random() * mobileMediaSources.length)];
          if (randomMobileSource.type === 'video') setVideoSrc(randomMobileSource.src);
          else mountImageBackground(randomMobileSource.src);
        } else {
          const pcMediaSources = [
            { type: 'video', src: 'http://api.mmp.cc/api/ksvideo?type=mp4&id=BianZhuang' },
            { type: 'video', src: 'https://tc.shni.cc/api/api.php' },
            { type: 'image', src: 'https://api.lolimi.cn/API/meinv/api.php?type=image' },
            { type: 'video', src: 'http://api.mmp.cc/api/shortvideo?type=mp4' },
            { type: 'image', src: 'https://imgapi.xl0408.top/index.php' },
            { type: 'video', src: 'https://t.alcy.cc/acg' },
          ];
          const randomPcSource = pcMediaSources[Math.floor(Math.random() * pcMediaSources.length)];
          if (randomPcSource.type === 'video') setVideoSrc(randomPcSource.src);
          else mountImageBackground(randomPcSource.src);

          window.ForceTheme = 'dark';
          window.ForcePeakCutEnabled = 'true';
        }

        // 点击视频解除静音
        videoEl?.addEventListener('click', () => {
          videoEl.muted = false;
        });

        const logo = document.querySelector('.min-h-screen .cursor-pointer');
        if (logo) {
          logo.addEventListener('click', () => {
            videoEl.muted = !videoEl.muted;
          });
        }
      });
    })();
  }
})();
