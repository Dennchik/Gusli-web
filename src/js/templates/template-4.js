//* ✅ - [ Автономная демо-страница HAZEL: template-4 ]
//* Не использует глобальные компоненты проекта: сама импортирует свои стили
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import '../../scss/templates/templates-4.scss';

//* Экземпляр инерционной прокрутки; null, если движение отключено в системе
let lenis = null;

//* ─────────────────────────────────────────────────────────────────
//* Инерционная прокрутка всей страницы
//* ─────────────────────────────────────────────────────────────────
function initSmoothScroll() {
   const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

   // При «уменьшении движения» оставляем нативную прокрутку
   if (reduce) return;

   lenis = new Lenis({ duration: 1.1 });

   const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
   };

   requestAnimationFrame(raf);

   // Якоря ведёт Lenis: нативный переход оборвал бы инерцию
   document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
         const id = link.getAttribute('href');
         if (!id || id === '#') return;

         const target = document.querySelector(id);
         if (!target) return;

         event.preventDefault();
         // Отступ на высоту фиксированной шапки
         lenis.scrollTo(target, { offset: -90 });
      });
   });
}

//* ─────────────────────────────────────────────────────────────────
//* Шапка HAZEL: после прокрутки становится непрозрачной и ниже
//* ─────────────────────────────────────────────────────────────────
function initHeader() {
   const header = document.getElementById('tmpl4-header');
   if (!header) return;

   // Прокрутили ниже шапки — она становится непрозрачной и чуть ниже
   const toggleStuck = () => {
      header.classList.toggle('is-stuck', window.scrollY > 10);
   };

   toggleStuck();
   window.addEventListener('scroll', toggleStuck, { passive: true });
}

//* ─────────────────────────────────────────────────────────────────
//* Появление секций при входе во вьюпорт: селектор получает .in.
//* Один общий наблюдатель для всех блоков с каскадными анимациями
//* ─────────────────────────────────────────────────────────────────
function initReveal(selector, threshold = 0.25) {
   const sections = document.querySelectorAll(selector);
   if (!sections.length) return;

   const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

   // Без анимаций или без поддержки IO — показываем мгновенно
   if (reduce || !('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('in'));
      return;
   }

   const io = new IntersectionObserver(
      (entries) => {
         entries.forEach((entry) => {
            if (entry.isIntersecting) {
               entry.target.classList.add('in');
               io.unobserve(entry.target);
            }
         });
      },
      { threshold },
   );

   sections.forEach((section) => io.observe(section));
}

function initFeatures() {
   initReveal('.tmpl4-features');
}

//* ─────────────────────────────────────────────────────────────────
//* Блок «We work hard»: текст и устройства въезжают при скролле
//* ─────────────────────────────────────────────────────────────────
function initWork() {
   initReveal('.tmpl4-work', 0.2);
}

//* ─────────────────────────────────────────────────────────────────
//* Цитата + навыки: колонки появляются, бары заливаются на --w
//* ─────────────────────────────────────────────────────────────────
function initQuote() {
   initReveal('.tmpl4-quote', 0.15);
}

//* ─────────────────────────────────────────────────────────────────
//* Услуги: карточки появляются каскадом при скролле
//* ─────────────────────────────────────────────────────────────────
function initServices() {
   initReveal('.tmpl4-services', 0.15);
}

//* ─────────────────────────────────────────────────────────────────
//* Портфолио: плитки появляются каскадом при скролле
//* ─────────────────────────────────────────────────────────────────
function initWorks() {
   initReveal('.tmpl4-works', 0.12);
}

//* ─────────────────────────────────────────────────────────────────
//* Достижения: при входе во вьюпорт цифры перебирают от 0 до цели
//* ─────────────────────────────────────────────────────────────────
function initStats() {
   const section = document.querySelector('.tmpl4-stats');
   if (!section) return;

   const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

   const nums = [...section.querySelectorAll('[data-count]')];

   // Сразу ставим финальные значения: без анимаций или при отсутствии IO
   const showFinal = () => {
      nums.forEach((num) => {
         num.textContent = num.dataset.count;
      });
      section.classList.add('in');
   };

   if (reduce || !('IntersectionObserver' in window)) {
      showFinal();
      return;
   }

   // Плавный перебор одной цифры за ~1.6 с с easing-out
   function countUp(num) {
      const target = parseInt(num.dataset.count, 10);
      const duration = 1600;
      const start = performance.now();

      function frame(now) {
         const t = Math.min((now - start) / duration, 1);
         // easeOutCubic — быстро в начале, замедление к концу
         const eased = 1 - (1 - t) ** 3;
         num.textContent = Math.round(target * eased);
         if (t < 1) requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
   }

   const io = new IntersectionObserver(
      (entries) => {
         entries.forEach((entry) => {
            if (entry.isIntersecting) {
               section.classList.add('in');
               nums.forEach(countUp);
               io.unobserve(entry.target);
            }
         });
      },
      { threshold: 0.3 },
   );

   io.observe(section);
}

//* ─────────────────────────────────────────────────────────────────
//* Отзывы: появление блока + переключение цитаты по клику на аватар
//* ─────────────────────────────────────────────────────────────────
function initTesti() {
   initReveal('.tmpl4-testi', 0.15);

   const section = document.querySelector('.tmpl4-testi');
   if (!section) return;

   const avatars = [...section.querySelectorAll('[data-testi]')];
   const slides = [...section.querySelectorAll('.tmpl4-testi__slide')];
   if (!avatars.length || !slides.length) return;

   avatars.forEach((avatar) => {
      avatar.addEventListener('click', () => {
         const index = Number(avatar.dataset.testi);
         if (!slides[index]) return;

         avatars.forEach((a, i) => a.classList.toggle('is-active', i === index));
         slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
      });
   });
}

//* ─────────────────────────────────────────────────────────────────
//* CTA перед портфолио: заголовок и кнопка появляются при скролле
//* ─────────────────────────────────────────────────────────────────
function initCta() {
   initReveal('.tmpl4-cta', 0.3);
}

//* ─────────────────────────────────────────────────────────────────
//* Кнопка «наверх»: показывается после экрана прокрутки, скроллит к началу
//* ─────────────────────────────────────────────────────────────────
function initToTop() {
   const btn = document.getElementById('tmpl4-totop');
   if (!btn) return;

   const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

   const toggle = () => {
      btn.classList.toggle('is-visible', window.scrollY > window.innerHeight);
   };

   toggle();
   window.addEventListener('scroll', toggle, { passive: true });

   btn.addEventListener('click', () => {
      if (lenis) {
         lenis.scrollTo(0);
         return;
      }

      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
   });
}

//* ─────────────────────────────────────────────────────────────────
//* Боковая панель: открывается бургером, закрывается крестиком,
//* кликом по затемнению и клавишей Escape
//* ─────────────────────────────────────────────────────────────────
function initPanel() {
   const burger = document.getElementById('tmpl4-burger');
   const panel = document.getElementById('tmpl4-panel');
   const overlay = document.getElementById('tmpl4-overlay');
   const close = document.getElementById('tmpl4-panel-close');
   if (!burger || !panel || !overlay || !close) return;

   const setOpen = (open) => {
      panel.classList.toggle('is-open', open);
      overlay.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', String(!open));
      burger.setAttribute('aria-expanded', String(open));
      // Фон не должен прокручиваться, пока панель открыта. Ширину
      // пропавшего скроллбара отдаём в CSS, иначе страница дёрнется вправо
      const gap = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty(
         '--t4-lock',
         open ? `${gap}px` : '0px',
      );
      document.body.classList.toggle('is-locked', open);
      // Lenis крутит страницу сам и про overflow у body не знает
      if (lenis) {
         if (open) lenis.stop();
         else lenis.start();
      }
      (open ? close : burger).focus();
   };

   burger.addEventListener('click', () => setOpen(true));
   close.addEventListener('click', () => setOpen(false));
   overlay.addEventListener('click', () => setOpen(false));

   // Пункты меню внутри панели ведут на якоря — панель закрываем
   panel.querySelectorAll('.tmpl4-panel__link').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
   });

   document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) {
         setOpen(false);
      }
   });
}

initSmoothScroll();
initHeader();
initPanel();
initFeatures();
initWork();
initQuote();
initServices();
initCta();
initWorks();
initStats();
initTesti();
initToTop();



