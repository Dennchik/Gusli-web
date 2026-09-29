//* ✅ - [ Автономная демо-страница IT-студии: template-3 ]
//* Не использует глобальные компоненты проекта: сама импортирует свои стили
import '../../scss/templates/templates-3.scss';
import '../../scss/templates/assets/page-loader.scss';
import '../../scss/templates/assets/convas-2d.scss';
import { createParticleBackground } from '../animation/convas-2d.js';
import AnchorScroller from '../modules/AnchorScroller.js';
import loaded from '../utils/preloader.js';
//* ─────────────────────────────────────────────────────────────────
//* AnchorScroller — всегда (и на мобилке, и на ПК)
//* Здесь передаём smoother, чтобы он использовал правильный scrollTo с
//* offset'ом
//* ─────────────────────────────────────────────────────────────────
new AnchorScroller({
   headerSelector: '.offset-header',
   selector: '.anchor-link',
   //* раскомментируйте, если понадобится внутри навигатора
   // smoother: gsapSmoother,
   onCloseSidebar: (sidebar) => sidebar?.classList.remove('_show'),
   onCloseButton: (button) => button?.classList.remove('_open'),
});
// * Опционально: слушаем событие от навигатора (если нужно куда-то ещё)
window.addEventListener('activeSectionChanged', (e) => {
   console.log('Active section changed:', e.detail);
});
//* ─────────────────────────────────────────────────────────────────
//* Фон: частицы на canvas. Запускаем только если canvas есть в DOM
//* ─────────────────────────────────────────────────────────────────
const particleCanvas = document.getElementById('particleCanvas');
if (particleCanvas) {
   const bg = createParticleBackground({ canvas: particleCanvas });
   bg.start();
}

//* Прелоадер: скрываем только если элемент существует
if (document.querySelector('.page-loader')) {
   loaded('.page-loader');
}

//* ─────────────────────────────────────────────────────────────────
//* Шапка: плотный фон после скролла + мобильный бургер
//* ─────────────────────────────────────────────────────────────────
function initHeader() {
   const header = document.getElementById('tmpl3-header');
   if (!header) return;

   // При скролле больше 40px вешаем класс — шапка получает плотный фон
   const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
   };
   window.addEventListener('scroll', onScroll, { passive: true });
   onScroll();

   const burger = header.querySelector('.tmpl3-burger');
   const nav = header.querySelector('.tmpl3-header__nav');
   if (!burger || !nav) return;

   // Бургер переключает полноэкранное мобильное меню
   burger.addEventListener('click', () => {
      header.classList.toggle('nav-open');
      nav.classList.toggle('_open');
   });

   // Клик по ссылке в мобильном меню закрывает его
   nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
         header.classList.remove('nav-open');
         nav.classList.remove('_open');
      });
   });
}

//* ─────────────────────────────────────────────────────────────────
//* Hero-слайдер: автопрокрутка + стрелки, точки, счётчик
//* ─────────────────────────────────────────────────────────────────
function initHeroSlider() {
   const slides = [...document.querySelectorAll('.hs-slide')];
   const section = document.querySelector('.tmpl3-hs');
   if (!slides.length || !section) return;

   const dots = [...document.querySelectorAll('.tmpl3-hs__dot')];
   const num = document.getElementById('hsNum');
   const prev = document.getElementById('hsArr-prev');
   const next = document.getElementById('hsArr-next');

   // Без стрелок управлять слайдером нечем — выходим
   if (!prev || !next) return;

   const AUTOPLAY_DELAY = 4000; // мс между авто-переключениями

   // Стартовый индекс берём из разметки (слайд с .is-active)
   let index = Math.max(
      0,
      slides.findIndex((s) => s.classList.contains('is-active'))
   );
   let timer = null;

   //* Переключение на слайд i: цикл по кругу (i - 1 → последний)
   function goTo(i) {
      index = (i + slides.length) % slides.length;

      // Слайды: активному — .is-active, остальным скрываем
      slides.forEach((slide, k) => {
         slide.classList.toggle('is-active', k === index);
      });

      // Точки пагинации синхронно со слайдами
      dots.forEach((dot, k) => {
         dot.classList.toggle('is-active', k === index);
      });

      // Счётчик «текущий / всего»
      if (num) num.textContent = index + 1;
   }

   // Автопрокрутка: сбрасываем таймер (после ручного действия
   // отсчёт начинается заново) и листаем вперёд
   function restartAutoplay() {
      clearInterval(timer);
      timer = setInterval(() => goTo(index + 1), AUTOPLAY_DELAY);
   }

   // Пауза автопрокрутки, пока курсор над слайдером или полосой
   function pauseAutoplay() {
      clearInterval(timer);
   }

   // Ручное действие: переключаемся и перезапускаем отсчёт
   function manualGo(i) {
      pauseAutoplay();
      goTo(i);
      restartAutoplay();
   }

   // ── Слушатели ──
   // Стрелки: ручное переключение (по кругу)
   prev.addEventListener('click', () => manualGo(index - 1));
   next.addEventListener('click', () => manualGo(index + 1));

   // Точки: прямой переход на слайд по индексу
   dots.forEach((dot, k) => dot.addEventListener('click', () => manualGo(k)));

   // Пауза при наведении на сам слайдер и на нижнюю полосу
   section.addEventListener('mouseenter', pauseAutoplay);
   section.addEventListener('mouseleave', () => {
      clearInterval(timer);
      timer = setInterval(() => goTo(index + 1), AUTOPLAY_DELAY);
   });

   // Свайп на тач-устройствах: влево — следующий слайд, вправо — предыдущий
   let touchStartX = 0;
   section.addEventListener(
      'touchstart',
      (e) => {
         touchStartX = e.changedTouches[0].clientX;
      },
      { passive: true }
   );
   section.addEventListener(
      'touchend',
      (e) => {
         const dx = e.changedTouches[0].clientX - touchStartX;
         if (Math.abs(dx) < 48) return;
         manualGo(index + (dx < 0 ? 1 : -1));
      },
      { passive: true }
   );

   // ── Старт ──
   restartAutoplay();
}

//* ─────────────────────────────────────────────────────────────────
//* Появление блоков при скролле: [data-anim] получает .in.
//* При prefers-reduced-motion показываем всё сразу
//* ─────────────────────────────────────────────────────────────────
function initReveal() {
   const items = document.querySelectorAll('.tmpl3 [data-anim]');
   if (!items.length) return;

   const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

   // Без анимаций или без поддержки IO — показываем мгновенно
   if (reduce || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('in'));
      return;
   }

   // Как только блок вошёл во вьюпорт — добавляем .in и отписываемся
   const io = new IntersectionObserver(
      (entries) => {
         entries.forEach((entry) => {
            if (entry.isIntersecting) {
               entry.target.classList.add('in');
               io.unobserve(entry.target);
            }
         });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
   );

   items.forEach((el) => io.observe(el));
}

//* ── Инициализация ──
initHeader();
initHeroSlider();
initReveal();
