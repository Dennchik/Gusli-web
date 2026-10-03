//* ============================================================================
import Lenis from 'lenis';
//* Точка входа логики страницы: калькулятор, квиз, бриф-форма, reveal-анимации.
//* Сами функции лежат в layouts/layouts.js и построены на делегировании
//* событий — слушатели навешаны на документ и переживают любые перерисовки
//* ============================================================================
import {
   initBriefForm,
   initCalculator,
   initCasesMore,
   initFooterForm,
   initQuiz,
   initRevealAnimations,
} from './layouts/layouts.js';
import 'lenis/dist/lenis.css';

initCalculator();
initQuiz();
initBriefForm();
initFooterForm();
initCasesMore();
initRevealAnimations();

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
initSmoothScroll();
