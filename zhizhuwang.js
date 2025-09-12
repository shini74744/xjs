if (window.location.hostname === 'shli.io') {
  !function () {
      var isDesktop = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (!isDesktop) return;

      function getAttr(node, attr, defaultValue) {
          return node.getAttribute(attr) || defaultValue;
      }

      function createCanvasConfig() {
          const scripts = document.getElementsByTagName("script");
          const currentScript = scripts[scripts.length - 1];
          return {
              l: scripts.length,
              z: 10,
              o: getAttr(currentScript, "opacity", 0.5),
              c: getAttr(currentScript, "color", "0,0,0"),
              n: getAttr(currentScript, "count", 200)
          };
      }

      function resizeCanvas() {
          width = canvas.width = window.innerWidth;
          height = canvas.height = window.innerHeight;
          const ratio = window.devicePixelRatio || 1;
          canvas.width = width * ratio;
          canvas.height = height * ratio;
          canvas.getContext("2d").scale(ratio, ratio);
      }

      function drawLines() {
          ctx.clearRect(0, 0, width, height);
          var xDist, yDist, distSq, opacity;
          points.forEach(function (p1, i) {
              p1.x += p1.vx;
              p1.y += p1.vy;

              if (p1.x > width || p1.x < 0) p1.vx *= -1;
              if (p1.y > height || p1.y < 0) p1.vy *= -1;

              ctx.fillRect(p1.x - 0.5, p1.y - 0.5, 1, 1);
              for (let j = i + 1; j < allPoints.length; j++) {
                  const p2 = allPoints[j];
                  if (p2.x == null || p2.y == null) continue;
                  xDist = p1.x - p2.x;
                  yDist = p1.y - p2.y;
                  distSq = xDist * xDist + yDist * yDist;

                  if (distSq < p2.max) {
                      if (p2 === mouse && distSq >= p2.max / 2) {
                          p1.x -= 0.03 * xDist;
                          p1.y -= 0.03 * yDist;
                      }
                      opacity = (p2.max - distSq) / p2.max;
                      ctx.beginPath();
                      ctx.lineWidth = opacity / 2;
                      ctx.strokeStyle = `rgba(${config.c},${opacity + 0.2})`;
                      ctx.moveTo(p1.x, p1.y);
                      ctx.lineTo(p2.x, p2.y);
                      ctx.stroke();
                  }
              }
          });
          requestAnimationFrame(drawLines);
      }

      const config = createCanvasConfig();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      let width, height;

      canvas.id = "canvas-nest";
      canvas.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;z-index:${config.z};opacity:${config.o};pointer-events:none`;
      document.body.insertBefore(canvas, document.body.firstChild);

      let points = [], allPoints;
      const mouse = { x: null, y: null, max: 20000 };
      const random = Math.random;

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      window.addEventListener("mousemove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
      window.addEventListener("mouseout", function () { mouse.x = null; mouse.y = null; });

      for (let i = 0; i < config.n; i++) {
          const x = random() * window.innerWidth;
          const y = random() * window.innerHeight;
          const vx = (random() * 2 - 1);
          const vy = (random() * 2 - 1);
          points.push({ x, y, vx, vy, max: 12000 });
      }

      allPoints = points.concat([mouse]);
      requestAnimationFrame(drawLines);
  }();
}
