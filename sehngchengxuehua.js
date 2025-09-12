(function () {
  if (window.location.hostname !== 'shli.io') return;

  // ------------------ 纯 JS 雪花飘落效果 ------------------

  // 1. 创建雪花样式
  const snowflakeStyle = document.createElement('style');
  snowflakeStyle.textContent = `
      body {
          margin: 0;
          background: transparent;
          overflow-x: hidden;
          position: relative;
      }

      .snowflake {
          position: fixed;
          top: -10px;
          color: white;
          font-size: 10px;
          animation: fall linear infinite;
          opacity: 0.8;
          z-index: 9988;
          pointer-events: none;
      }

      @keyframes fall {
          0% {
              transform: translateX(0px) translateY(0px);
              opacity: 0.8;
          }
          50% {
              transform: translateX(20px) translateY(50vh);
          }
          100% {
              transform: translateX(-20px) translateY(100vh);
              opacity: 0;
          }
      }
  `;
  document.head.appendChild(snowflakeStyle);

  // 2. 创建单个雪花
  function createSnowflake() {
      const snowflake = document.createElement("div");
      const snowflakeCharacters = ["✼", "✽", "❄"];
      snowflake.className = "snowflake";
      snowflake.textContent = snowflakeCharacters[Math.floor(Math.random() * snowflakeCharacters.length)];
      snowflake.style.left = Math.random() * 100 + "vw";
      snowflake.style.animationDuration = (4 + Math.random() * 4) + "s";
      snowflake.style.fontSize = (10 + Math.random() * 20) + "px";
      snowflake.style.opacity = (0.5 + Math.random() * 0.5);
      document.body.appendChild(snowflake);
      snowflake.addEventListener("animationend", () => snowflake.remove());
  }

  // 3. 控制雪花生成
  function initializeSnowflakes(maxCount) {
      const interval = 2000;
      let activeSnowflakes = 0;
      const createBatch = () => {
          if (activeSnowflakes < maxCount) {
              createSnowflake();
              activeSnowflakes++;
          }
      };
      setInterval(createBatch, interval);
  }

  // 4. 判断设备类型，控制雪花数量
  const isMobile = window.innerWidth <= 768;
  const snowflakeCount = isMobile ? 20 : 40;

  // 5. 初始化雪花效果
  initializeSnowflakes(snowflakeCount);
})();
