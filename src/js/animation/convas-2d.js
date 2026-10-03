export function createParticleBackground(options = {}) {
   const config = {
      canvas: null,
      particleCount: 120,
      connectDist: 130,
      mouseRadius: 180,
      baseSpeed: 1.0,
      colorTheme: 'cyan',
      themes: {
         cyan: {
            bg: '#040d21',
            particle: 'rgba(56, 189, 248, 0.9)',
            line: '56, 189, 248',
            mouseLine: '125, 211, 252',
         },
         blue: {
            bg: '#080e2b',
            particle: 'rgba(129, 140, 248, 0.9)',
            line: '129, 140, 248',
            mouseLine: '165, 180, 252',
         },
         white: {
            bg: 'rgb(197 210 237)',
            particle: 'rgba(7 32 102)',
            line: '7, 32, 102',
            mouseLine: '7, 32, 102',
         },
      },
      ...options,
   };

   const canvas = config.canvas || document.getElementById('particleCanvas');
   if (!canvas) {
      console.warn('particle-background: canvas не найден, модуль не запущен');
      return {
         start() {},
         stop() {},
         setParticleCount() {},
         setConnectDist() {},
         setMouseRadius() {},
         setBaseSpeed() {},
         setTheme() {},
         get config() {
            return config;
         },
      };
   }
   const ctx = canvas.getContext('2d');

   const mouse = {
      x: null,
      y: null,
      radius: config.mouseRadius,
      active: false,
   };

   let particles = [];
   let rafId = null;
   let running = false;

   class Particle {
      constructor(w, h) {
         this.x = Math.random() * w;
         this.y = Math.random() * h;
         this.vx = (Math.random() - 0.5) * 1.5;
         this.vy = (Math.random() - 0.5) * 1.5;
         this.radius = Math.random() * 1.8 + 1.2;
         this.baseRadius = this.radius;
         this.mass = this.radius;
      }

      update(w, h) {
         this.x += this.vx * config.baseSpeed;
         this.y += this.vy * config.baseSpeed;

         if (this.x < 0) {
            this.x = 0;
            this.vx *= -1;
         }
         if (this.x > w) {
            this.x = w;
            this.vx *= -1;
         }
         if (this.y < 0) {
            this.y = 0;
            this.vy *= -1;
         }
         if (this.y > h) {
            this.y = h;
            this.vy *= -1;
         }

         if (mouse.active && mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < config.mouseRadius) {
               const forceDirectionX = dx / distance;
               const forceDirectionY = dy / distance;
               const maxDistance = config.mouseRadius;
               const force = (maxDistance - distance) / maxDistance;
               const attractionStrength = 0.6;
               this.x += forceDirectionX * force * attractionStrength * 3;
               this.y += forceDirectionY * force * attractionStrength * 3;
               this.radius = this.baseRadius + force * 2;
            } else {
               this.radius = this.baseRadius;
            }
         } else {
            this.radius = this.baseRadius;
         }
      }

      draw() {
         ctx.beginPath();
         ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
         const theme = config.themes[config.colorTheme];
         ctx.fillStyle = theme.particle;
         ctx.shadowBlur = 8;
         ctx.shadowColor = theme.particle;
         ctx.fill();
         ctx.shadowBlur = 0;
      }
   }

   function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
   }

   function initParticles() {
      particles = [];
      for (let i = 0; i < config.particleCount; i++) {
         particles.push(new Particle(canvas.width, canvas.height));
      }
   }

   function connectParticles() {
      const activeTheme = config.themes[config.colorTheme];
      const maxDist = config.connectDist;

      for (let a = 0; a < particles.length; a++) {
         for (let b = a + 1; b < particles.length; b++) {
            const dx = particles[a].x - particles[b].x;
            const dy = particles[a].y - particles[b].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
               const opacity = 1 - dist / maxDist;
               ctx.beginPath();
               ctx.moveTo(particles[a].x, particles[a].y);
               ctx.lineTo(particles[b].x, particles[b].y);
               ctx.strokeStyle = `rgba(${activeTheme.line}, ${opacity * 0.4})`;
               ctx.lineWidth = 0.8;
               ctx.stroke();
            }
         }

         if (mouse.active && mouse.x !== null && mouse.y !== null) {
            const mdx = particles[a].x - mouse.x;
            const mdy = particles[a].y - mouse.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mdist < config.mouseRadius) {
               const mOpacity = 1 - mdist / config.mouseRadius;
               ctx.beginPath();
               ctx.moveTo(particles[a].x, particles[a].y);
               ctx.lineTo(mouse.x, mouse.y);
               ctx.strokeStyle = `rgba(${activeTheme.mouseLine}, ${mOpacity * 0.8})`;
               ctx.lineWidth = 1.2;
               ctx.stroke();
            }
         }
      }
   }

   function animate() {
      ctx.fillStyle = config.themes[config.colorTheme].bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
         particles[i].update(canvas.width, canvas.height);
         particles[i].draw();
      }

      connectParticles();
      rafId = requestAnimationFrame(animate);
   }

   // ==== Обработчики ====
   const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
   };
   const onMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
      mouse.active = false;
   };
   const onTouchMove = (e) => {
      if (e.touches.length > 0) {
         mouse.x = e.touches[0].clientX;
         mouse.y = e.touches[0].clientY;
         mouse.active = true;
      }
   };
   const onTouchEnd = () => {
      mouse.x = null;
      mouse.y = null;
      mouse.active = false;
   };

   // ============================================================
   // UI: подключаем только если элементы существуют
   // ============================================================
   function bindUI() {
      const toggleBtn = document.getElementById('toggleControls');
      const controlsPanel = document.getElementById('controlsPanel');

      // Панель управления — опциональна
      if (toggleBtn && controlsPanel) {
         toggleBtn.addEventListener('click', () => {
            const isOpen =
               !controlsPanel.classList.contains('translate-x-full');
            if (isOpen) {
               controlsPanel.classList.add(
                  'translate-x-full',
                  'opacity-0',
                  'pointer-events-none'
               );
               controlsPanel.classList.remove(
                  'translate-x-0',
                  'opacity-100',
                  'pointer-events-auto'
               );
            } else {
               controlsPanel.classList.remove(
                  'translate-x-full',
                  'opacity-0',
                  'pointer-events-none'
               );
               controlsPanel.classList.add(
                  'translate-x-0',
                  'opacity-100',
                  'pointer-events-auto'
               );
            }
         });
      }

      // Каждый слайдер проверяем отдельно
      const countInput = document.getElementById('particleCount');
      if (countInput) {
         countInput.addEventListener('input', (e) => {
            config.particleCount = parseInt(e.target.value);
            const label = document.getElementById('countVal');
            if (label) label.textContent = config.particleCount;
            initParticles();
         });
      }

      const distInput = document.getElementById('connectDist');
      if (distInput) {
         distInput.addEventListener('input', (e) => {
            config.connectDist = parseInt(e.target.value);
            const label = document.getElementById('distVal');
            if (label) label.textContent = config.connectDist;
         });
      }

      const mouseRadiusInput = document.getElementById('mouseRadius');
      if (mouseRadiusInput) {
         mouseRadiusInput.addEventListener('input', (e) => {
            config.mouseRadius = parseInt(e.target.value);
            const label = document.getElementById('mouseRadiusVal');
            if (label) label.textContent = config.mouseRadius;
         });
      }

      const speedInput = document.getElementById('particleSpeed');
      if (speedInput) {
         speedInput.addEventListener('input', (e) => {
            config.baseSpeed = parseFloat(e.target.value);
            const label = document.getElementById('speedVal');
            if (label) label.textContent = config.baseSpeed.toFixed(1);
         });
      }

      // Кнопки тем
      const themeButtons = document.querySelectorAll('.theme-btn');
      if (themeButtons.length > 0) {
         themeButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
               const themeName = e.target.getAttribute('data-theme');
               if (themeName && config.themes[themeName]) {
                  config.colorTheme = themeName;
                  document.body.style.backgroundColor =
                     config.themes[themeName].bg;
               }
            });
         });
      }
   }

   // ==== Публичное API ====
   return {
      start() {
         if (running) return;
         running = true;
         window.addEventListener('resize', resizeCanvas);
         window.addEventListener('mousemove', onMouseMove);
         window.addEventListener('mouseleave', onMouseLeave);
         window.addEventListener('touchmove', onTouchMove, { passive: true });
         window.addEventListener('touchend', onTouchEnd);
         bindUI(); // ← подключаем UI, если он есть
         resizeCanvas();
         animate();
      },
      stop() {
         running = false;
         cancelAnimationFrame(rafId);
         window.removeEventListener('resize', resizeCanvas);
         window.removeEventListener('mousemove', onMouseMove);
         window.removeEventListener('mouseleave', onMouseLeave);
         window.removeEventListener('touchmove', onTouchMove);
         window.removeEventListener('touchend', onTouchEnd);
      },
      setParticleCount(n) {
         config.particleCount = n;
         initParticles();
      },
      setConnectDist(n) {
         config.connectDist = n;
      },
      setMouseRadius(n) {
         config.mouseRadius = n;
         mouse.radius = n;
      },
      setBaseSpeed(n) {
         config.baseSpeed = n;
      },
      setTheme(name) {
         if (config.themes[name]) config.colorTheme = name;
      },
      get config() {
         return config;
      },
   };
}
