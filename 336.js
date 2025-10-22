// =======================================================
// 全 JS 版本：视频/图片背景 + 凌晨模式提示 + 地域判断 + 交互逻辑
// 仅在 shli.io 域名（含子域名）生效；否则跳转到百度
// 变更：去掉全部预加载（preload）
// =======================================================
(function () {
  // ---- 域名白名单校验（放在最前，尽早拦截）----
  try {
    var host = (location && location.hostname) ? location.hostname.toLowerCase() : '';
    var allowed = host === 'shli.io' || host.endsWith('.shli.io');
    if (!allowed) {
      location.replace('https://www.baidu.com/');
      return;
    }
  } catch (e) {
    location.replace('https://www.baidu.com/');
    return;
  }

  // 等待 DOM 可用
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  onReady(async function init() {
    // 1) <meta name="referrer" content="no-referrer">
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

    // 2) 注入样式
    (function injectStyle() {
      const style = document.createElement('style');
      style.setAttribute('data-from', 'dynamic-video-bg-style');
      style.textContent = `
:root {
  --custom-border-color: rgba(13, 11, 9, 0.1);
  --custom-background-color: rgba(13, 11, 9, 0.4);
  --custom-background-image: unset;
}
.dark #root { background-color: unset !important; }
.dark .bg-card {
  background-color: var(--custom-background-color);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(13, 11, 9, 0.1);
  box-shadow: 0 4px 6px rgba(13, 11, 9, 0.2);
}
html.dark body { color: #f4f5f6; background: unset; position: relative; }
.video-box,.image-box{position:fixed;z-index:1;top:0;left:0;bottom:0;right:0}
.video-box video{width:100%;height:100%;object-fit:cover}
.image-box{background-size:cover;background-position:center}
#nightModeTip{
  position:fixed;top:10px;left:10px;z-index:9999;background:rgba(0,0,0,.6);
  color:#fff;padding:6px 12px;border-radius:6px;font-size:14px;opacity:0;
  pointer-events:none;transition:opacity 1s ease-in-out;
}
#nightModeTip.show{opacity:1;pointer-events:auto;}
      `;
      (document.head || document.documentElement).appendChild(style);
    })();

    // 3) 创建 DOM（视频/提示）
    const videoBox = document.createElement('div');
    videoBox.className = 'video-box';
    const videoEl = document.createElement('video');
    videoEl.id = 'myVideo';
    videoEl.muted = true;
    videoEl.autoplay = true;
    videoEl.playsInline = true;
    videoEl.loop = true;
    videoEl.preload = 'none'; // ← 不预加载

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

    // 4) 原逻辑
    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone|BlackBerry/i.test(navigator.userAgent);

    // 北京时间小时（UTC+8）
    const now = new Date();
    const utcHour = now.getUTCHours();
    const beijingHour = (utcHour + 8) % 24;
    const isNightMode = beijingHour >= 1 && beijingHour < 6;

    // 全局参数
    window.CustomLinks = '[{"link":"https://t.me/contact/1746959833:pDG7N84llgNWazU8","name":"联系我定制"},{"link":"https://github.com/hamster1963/nezha-dash","name":"GitHub"}]';
    window.CustomLogo = "https://cdn.skyimg.net/up/2025/1/13/zera6q.webp";
    window.ShowNetTransfer = "true";
    window.CustomIllustration = 'https://free.picui.cn/free/2025/04/15/67fe011873e90.gif';
    window.CustomDesc = "专业服务，技术先行";

    let isChinaUser = false;

    // ASN 判断中国大陆
    try {
      const asnResponse = await fetch('https://ipinfo.io/json?token=769fdd3c5a44a4'); // 换成你的 token 更安全
      const asnInfo = await asnResponse.json();
      const blockAsnList = ['AS9808', 'AS4134', 'AS4837'];
      const userASN = asnInfo.org || '';
      if (blockAsnList.some(asn => userASN.includes(asn))) {
        isChinaUser = true;
      }
    } catch (err) {
      console.warn('ASN 获取失败，将按默认地区处理');
    }

    // 工具：图片背景
    function mountImageBackground(url) {
      const imageBox = document.createElement('div');
      imageBox.classList.add('image-box');
      imageBox.style.backgroundImage = `url(${url})`;
      document.body.appendChild(imageBox);
    }

    // 工具：设置视频源（不主动 load）
    function setVideoSrc(url) {
      sourceEl.src = url;
      // 不再调用 videoEl.load()，交给浏览器在需要时再取流
    }

    // 凌晨模式仅对非大陆用户生效
    if (!isChinaUser && isNightMode) {
      const nightImages = [
        'https://jkapi.com/api/yo_cup?type=&apiKey=85d2491045c79dc05e67e51574ad38da',
        'https://image.anosu.top/pixiv/direct?r18=1&keyword=touhou',
        'https://imgs.serv00.net/pic.php'
      ];
      const randomNightImage = nightImages[Math.floor(Math.random() * nightImages.length)];
      mountImageBackground(randomNightImage);

      if (videoBox) videoBox.style.display = 'none';

      nightTip.classList.add('show');
      setTimeout(() => {
        nightTip.classList.remove('show');
      }, 10000);

      return;
    }

    // PC 梅花落特效
    if (!isMobile) {
      const meihuaScript = document.createElement('script');
      meihuaScript.src = 'https://api.vvhan.com/api/script/meihua';
      document.body.appendChild(meihuaScript);
    }

    // 大陆用户优先国内源
    if (isChinaUser) {
      const chinaMediaSources = [
        { type: 'image', src: 'https://t.alcy.cc/acg' },
        { type: 'image', src: 'https://t.alcy.cc/fj' },
        { type: 'video', src: 'https://t.alcy.cc/acg' },
        { type: 'video', src: 'https://alimov2.a.kwimgs.com/upic/2024/06/04/17/BMjAyNDA2MDQxNzEzMDNfMzQ5MDQ0MzY2XzEzNDA5Mjg2MjA1OV8xXzM=_b_B7b0dd942b4114cceb5ca9967fe784572.mp4?clientCacheKey=3x537cqejzpttaa_b.mp4&tt=b&di=77270081&bp=13414' },
      ];
      const randomChinaSource = chinaMediaSources[Math.floor(Math.random() * chinaMediaSources.length)];
      if (randomChinaSource.type === 'video') {
        setVideoSrc(randomChinaSource.src);
      } else {
        mountImageBackground(randomChinaSource.src);
      }
      return;
    }

    // 非大陆：移动/PC 背景
    if (isMobile) {
      const mobileMediaSources = [
        { type: 'image', src: 'https://api.lolimi.cn/API/tup/xjj.php' },
        { type: 'video', src: 'https://tc.shni.cc/api/api.php' },
        { type: 'image', src: 'https://www.onexiaolaji.cn/RandomPicture/api/?key=qq249663924' },
        { type: 'video', src: 'http://api.mmp.cc/api/shortvideo?type=mp4' },
        { type: 'video', src: 'https://t.alcy.cc/acg' },
      ];
      const randomMobileSource = mobileMediaSources[Math.floor(Math.random() * mobileMediaSources.length)];
      if (randomMobileSource.type === 'video') {
        setVideoSrc(randomMobileSource.src);
      } else {
        mountImageBackground(randomMobileSource.src);
      }
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
      if (randomPcSource.type === 'video') {
        setVideoSrc(randomPcSource.src);
      } else {
        mountImageBackground(randomPcSource.src);
      }

      // 强制夜间主题/限峰（如果前端支持）
      window.ForceTheme = 'dark';
      window.ForcePeakCutEnabled = 'true';
    }

    // 点击视频时解除静音
    videoEl?.addEventListener('click', () => {
      videoEl.muted = false;
    });

    // 点击 Logo 切换静音
    const logo = document.querySelector('.min-h-screen .cursor-pointer');
    if (logo) {
      logo.addEventListener('click', () => {
        videoEl.muted = !videoEl.muted;
      });
    }
  });
})();
