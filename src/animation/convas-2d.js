//* ✅ - [ 2D-фон из частиц: плексус-сеть для тёмных демо-страниц ]
//* createParticleBackground({ canvas }) — точки дрейфуют, между близкими
//* рисуются линии. Возвращает { start, stop }. Уважает reduced-motion

export function createParticleBackground({ canvas } = {}) {
   const ctx = canvas.getContext('2d');
   const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

   let width = 0;
   let height = 0;
   let particles = [];
   let raf = null;

   const MAX_DIST = 130; // px — дальше линии не рисуем
   const DENSITY = 9000; // px² на одну частицу

   function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;

      const count = Math.min(140, Math.floor((width * height) / DENSITY));
      particles = Array.from({ length: count }, () => ({
         x: Math.random() * width,
         y: Math.random() * height,
         vx: (Math.random() - 0.5) * 0.4,
         vy: (Math.random() - 0.5) * 0.4,
         r: Math.random() * 1.6 + 0.6,
      }));
   }

   function frame() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
         const a = particles[i];

         // Дрейф и отскок от краёв
         a.x += a.vx;
         a.y += a.vy;
         if (a.x < 0 || a.x > width) a.vx *= -1;
         if (a.y < 0 || a.y > height) a.vy *= -1;

         // Линии между близкими частицами
         for (let k = i + 1; k < particles.length; k++) {
            const b = particles[k];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist < MAX_DIST) {
               ctx.strokeStyle = `rgba(47, 128, 237, ${
                  (1 - dist / MAX_DIST) * 0.3
               })`;
               ctx.beginPath();
               ctx.moveTo(a.x, a.y);
               ctx.lineTo(b.x, b.y);
               ctx.stroke();
            }
         }

         // Точка
         ctx.fillStyle = 'rgba(96, 165, 250, 0.75)';
         ctx.beginPath();
         ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
         ctx.fill();
      }

      raf = requestAnimationFrame(frame);
   }

   return {
      start() {
         resize();
         window.addEventListener('resize', resize);

         if (reduce) {
            // Одна статичная отрисовка без анимации
            frame();
            cancelAnimationFrame(raf);
            return;
         }
         raf = requestAnimationFrame(frame);
      },

      stop() {
         cancelAnimationFrame(raf);
         window.removeEventListener('resize', resize);
      },
   };
}
