(function () {
  if (window.location.hostname !== 'shli.io') return;

  function addBlueRotateWhenReady() {
    const target = document.querySelector('.scrollbar-hidden.z-50.flex.flex-col.items-start.overflow-x-scroll.rounded-\\[50px\\] > .flex.items-center.gap-1.rounded-\\[50px\\].bg-stone-100.p-\\[3px\\].dark\\:bg-stone-800');
    if (target) {
      if (!document.getElementById('blue-fine-rotate-style')) {
        const style = document.createElement('style');
        style.id = 'blue-fine-rotate-style';
        style.textContent = `
          .blue-fine-rotate {
            position: relative;
            z-index: 0;
            outline: none;
          }
          .blue-fine-rotate::before {
            content: '';
            position: absolute;
            top: -6px;
            left: -6px;
            right: -6px;
            bottom: -6px;
            border-radius: 56px;
            background:
              conic-gradient(
                from 0deg,
                rgba(0, 112, 255, 0.85),
                rgba(0, 180, 255, 0.7) 40%,
                rgba(0, 112, 255, 0.6) 70%,
                rgba(0, 180, 255, 0.4) 85%,
                rgba(0, 112, 255, 0)
              );
            box-shadow:
              0 0 10px 3px rgba(0, 112, 255, 0.7),
              0 0 20px 6px rgba(0, 180, 255, 0.4),
              0 0 30px 10px rgba(0, 112, 255, 0.3);
            animation: fine-rotate 2s linear infinite, pulseGlow 3s ease-in-out infinite;
            z-index: 1;
            pointer-events: none;
          }
          .blue-fine-rotate::after {
            content: '';
            position: absolute;
            top: -9px;
            left: -9px;
            right: -9px;
            bottom: -9px;
            border-radius: 59px;
            background:
              conic-gradient(
                from 180deg,
                rgba(0, 112, 255, 0.6),
                rgba(0, 180, 255, 0.4) 40%,
                rgba(0, 112, 255, 0.3) 70%,
                rgba(0, 180, 255, 0.2) 85%,
                rgba(0, 112, 255, 0)
              );
            box-shadow:
              0 0 15px 5px rgba(0, 112, 255, 0.5),
              0 0 25px 8px rgba(0, 180, 255, 0.3);
            animation: fine-rotate 3.5s linear infinite reverse, pulseGlow 4s ease-in-out infinite;
            z-index: 0;
            pointer-events: none;
          }
          @keyframes fine-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulseGlow {
            0%, 100% {
              filter: brightness(1);
              opacity: 1;
            }
            50% {
              filter: brightness(1.3);
              opacity: 0.8;
            }
          }
        `;
        document.head.appendChild(style);
      }
      target.classList.add('blue-fine-rotate');
    } else {
      setTimeout(addBlueRotateWhenReady, 1000);
    }
  }

  addBlueRotateWhenReady();
})();
