//* ✅ - [ Автономная демо-страница ресторана ]
//* Страница не использует глобальные компоненты проекта: сама импортирует
//* свои стили, кастомный селект (select.js) и маску телефона (imask)
import '../../scss/templates/templates-1.scss';
import { select } from '../assets/select.js';
import { maskPhone } from '../utils/mask-phone.js';

//* Шапка: плотный фон после скролла + мобильный бургер
function initHeader() {
   const header = document.getElementById('tmpl1-header');
   if (!header) return;

   const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
   };
   window.addEventListener('scroll', onScroll, { passive: true });
   onScroll();

   const burger = header.querySelector('.tmpl1-burger');
   const nav = header.querySelector('.tmpl1-header__nav');
   if (!burger || !nav) return;

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

//* Бронирование: делегированный 'submit' на документе, форма демо —
//* бэкенда нет, показываем подтверждение и сбрасываем поля
function initReserveForm() {
   const form = document.getElementById('tmpl1Reserve');
   if (!form) return;

   const ok = form.querySelector('.tmpl1__form-ok');

   document.addEventListener('submit', (e) => {
      if (e.target !== form) return;
      e.preventDefault();

      // Синхронизируем скрытое поле кастомного селекта с текущим выбором
      form.querySelectorAll('[data-select]').forEach((group) => {
         const input = group.querySelector('input[type="hidden"]');
         const btn = group.querySelector('.select__button');
         if (input && btn) {
            input.value = btn.value || btn.textContent.trim();
         }
      });

      const d = new FormData(form);
      const name = String(d.get('name') || '').trim();
      const phone = String(d.get('phone') || '').trim();
      if (!name || !phone) {
         form.querySelector('[name="name"]').focus();
         return;
      }

      form.reset();
      ok.hidden = false;
   });
}

//* Появление секций при скролле: .tmpl1 [data-anim] получает .in.
//* При prefers-reduced-motion показываем всё сразу без анимации
function initReveal() {
   const items = document.querySelectorAll('.tmpl1 [data-anim]');
   if (!items.length) return;

   const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

   if (reduce || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('in'));
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
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
   );

   items.forEach((el) => io.observe(el));
}

//* Параллакс фона hero: картинка уезжает медленнее контента.
//* Пишем в независимое свойство translate, чтобы не конфликтовать
//* с CSS-анимацией масштаба (Ken Burns). Уважает reduced-motion
function initHeroParallax() {
   const bg = document.querySelector('.tmpl1__hero-bg');
   if (!bg) return;
   if (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
   ) {
      return;
   }

   let ticking = false;

   const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
         const shift = Math.min(window.scrollY * 0.25, 140);
         bg.style.translate = `0 ${shift}px`;
         ticking = false;
      });
   };

   window.addEventListener('scroll', onScroll, { passive: true });
   onScroll();
}

//* Лента дегустационного меню: перетаскивание мышью и золотой
//* прогресс-бар, отражающий позицию прокрутки
function initTasting() {
   const track = document.getElementById('tmpl1Track');
   const fill = document.getElementById('tmpl1Progress');
   if (!track) return;

   const updateProgress = () => {
      if (!fill) return;
      const max = track.scrollWidth - track.clientWidth;
      const ratio = max > 0 ? track.scrollLeft / max : 0;
      fill.style.width = 20 + ratio * 80 + '%';
   };

   let isDragging = false;
   let startX = 0;
   let startScroll = 0;

   track.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
   });

   track.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      track.scrollLeft = startScroll - (e.clientX - startX);
   });

   const stopDrag = () => {
      isDragging = false;
   };
   track.addEventListener('pointerup', stopDrag);
   track.addEventListener('pointercancel', stopDrag);

   track.addEventListener('scroll', updateProgress, { passive: true });
   window.addEventListener('resize', updateProgress);
   updateProgress();
}

//* Отзывы: слайдер — стрелки листают по одной карточке, точки прыгают
//* на позицию, у границ стрелки гаснут. Скроллится viewport, а не track
function initTestimonials() {
   const viewport = document.querySelector('.tmpl1-testy__viewport');
   if (!viewport) return;

   const track = viewport.querySelector('.tmpl1-testy__track');
   const cards = [...track.children];
   const dotsWrap = document.querySelector('[data-testy-dots]');
   const prev = document.querySelector('[data-testy-prev]');
   const next = document.querySelector('[data-testy-next]');

   let index = 0;
   let dots = [];

   const step = () => {
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      return cards[0].offsetWidth + gap;
   };
   const visibleCount = () =>
      Math.max(1, Math.round(viewport.clientWidth / step()));
   const maxIndex = () => Math.max(0, cards.length - visibleCount());

   function update() {
      dots.forEach((dot, i) => dot.classList.toggle('_active', i === index));
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index >= maxIndex();
   }

   function goTo(i) {
      index = Math.max(0, Math.min(i, maxIndex()));
      viewport.scrollTo({ left: index * step(), behavior: 'smooth' });
      update();
   }

   function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      dots = [];
      for (let i = 0; i <= maxIndex(); i++) {
         const dot = document.createElement('button');
         dot.type = 'button';
         dot.className = 'tmpl1-testy__dot';
         dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
         dot.addEventListener('click', () => goTo(i));
         dotsWrap.appendChild(dot);
         dots.push(dot);
      }
      index = Math.min(index, maxIndex());
      update();
   }

   prev.addEventListener('click', () => goTo(index - 1));
   next.addEventListener('click', () => goTo(index + 1));

   // Перетаскивание мышью: после отпускания слайдер доезжает до позиции
   let isDragging = false;
   let startX = 0;
   let startScroll = 0;

   viewport.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startScroll = viewport.scrollLeft;
      viewport.setPointerCapture(e.pointerId);
   });

   viewport.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      viewport.scrollLeft = startScroll - (e.clientX - startX);
   });

   const stopDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      index = Math.max(
         0,
         Math.min(Math.round(viewport.scrollLeft / step()), maxIndex()),
      );
      goTo(index);
   };
   viewport.addEventListener('pointerup', stopDrag);
   viewport.addEventListener('pointercancel', stopDrag);

   // Синхронизация индекса при скролле (например, трекпадом)
   viewport.addEventListener(
      'scroll',
      () => {
         index = Math.max(
            0,
            Math.min(Math.round(viewport.scrollLeft / step()), maxIndex()),
         );
         update();
      },
      { passive: true },
   );

   window.addEventListener('resize', () => {
      buildDots();
      goTo(index);
   });
   // Перестраиваем точки после полной загрузки (шрифты и картинки
   // могут изменить ширину слайдера)
   window.addEventListener('load', () => {
      buildDots();
      goTo(index);
   });
   buildDots();
   update();
}

select();
maskPhone('.tmpl1 .phone');
initHeader();
initHeroParallax();
initReserveForm();
initTasting();
initTestimonials();
initReveal();
