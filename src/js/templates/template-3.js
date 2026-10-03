//* ✅ - [ Автономная демо-страница IT-студии: template-3 ]
//* Не использует глобальные компоненты проекта: сама импортирует свои стили
import '../../scss/templates/templates-3.scss';
import '../../scss/templates/assets/page-loader.scss';
import '../../scss/templates/assets/convas-2d.scss';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { createParticleBackground } from '../animation/convas-2d.js';
import { initThemeToggle } from '../assets/initThemeToggle.js';
import { select } from '../assets/select.js';
import AnchorScroller from '../modules/AnchorScroller.js';
import { maskPhone } from '../utils/mask-phone.js';
import loaded from '../utils/preloader.js';

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

   // Связываем кнопки и состояние темы с Canvas
   initThemeToggle((isDark) => {
      bg.setTheme(isDark ? 'cyan' : 'white');
   });
} else {
   initThemeToggle();
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

//* ─────────────────────────────────────────────────────────────────
//* Портфолио: фильтр карточек по категориям с плавной анимацией.
//* Несовпадающие карточки гаснут на месте, затем прячутся из сетки,
//* оставшиеся плавно сдвигаются на освободившиеся места (FLIP)
//* ─────────────────────────────────────────────────────────────────
function initPortfolio() {
   const tabs = [...document.querySelectorAll('.tmpl3-portfolio__tab')];
   const cards = [...document.querySelectorAll('.tmpl3-portfolio__card')];
   if (!tabs.length || !cards.length) return;

   const match = (card, filter) =>
      filter === 'all' || card.dataset.category === filter;

   let hideTimer = null;

   tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
         // Активная вкладка
         tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
         const filter = tab.dataset.filter;

         // Отменяем отложенное скрытие от предыдущего клика
         clearTimeout(hideTimer);

         // 1. Несовпадающие видимые карточки плавно гаснут на месте
         cards.forEach((card) => {
            card.classList.toggle(
               'is-fading',
               !match(card, filter) && !card.classList.contains('is-hidden')
            );
         });

         // 2. Через 320 мс (конец исчезновения): прячем погасших,
         //    проявляем совпадающих, оставшиеся сдвигаем (FLIP)
         hideTimer = setTimeout(() => {
            // Позиции выживших карточек ДО перестроения сетки
            const first = new Map();
            cards.forEach((card) => {
               if (
                  !card.classList.contains('is-hidden') &&
                  !card.classList.contains('is-fading')
               ) {
                  first.set(card, card.getBoundingClientRect());
               }
            });

            cards.forEach((card) => {
               const show = match(card, filter);
               const wasHidden = card.classList.contains('is-hidden');
               card.classList.toggle('is-hidden', !show);

               // Появившиеся из скрытых проявляются с нуля
               if (show && wasHidden) card.classList.add('is-fading');
               if (show) card.classList.remove('is-fading');
            });

            // FLIP: инвертируем сдвиг и проигрываем переход к нулю
            requestAnimationFrame(() => {
               cards.forEach((card) => {
                  if (card.classList.contains('is-hidden')) return;
                  const f = first.get(card);
                  if (!f) return;

                  const last = card.getBoundingClientRect();
                  const dx = f.left - last.left;
                  const dy = f.top - last.top;
                  if (!dx && !dy) return;

                  card.style.transition = 'none';
                  card.style.transform = `translate(${dx}px, ${dy}px)`;
                  requestAnimationFrame(() => {
                     card.style.transition = 'transform 0.4s ease';
                     card.style.transform = '';
                  });
               });
            });
         }, 320);
      });
   });
}

//* Логотипы компаний: слайдер с автоплеем, перетаскиванием мышью,
//* свайпом и доснапом до ближайшей карточки после отпускания
function initCompanies() {
   const viewport = document.querySelector('.tmpl3-companies__viewport');
   if (!viewport) return;

   const track = viewport.querySelector('.tmpl3-companies__track');
   const cards = [...track.children];
   const SET = 6; // логотипов в одном наборе (набор продублирован в разметке)

   const step = () => {
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      return cards[0].offsetWidth + gap;
   };

   let isDragging = false;
   let startX = 0;
   let startScroll = 0;
   let timer = null;

   // Бесшовный цикл: прокрутили дальше первого набора — мгновенно
   // откатываемся на его длину (второй набор выглядит идентично)
   function normalize() {
      if (viewport.scrollLeft >= SET * step()) {
         viewport.classList.add('no-smooth');
         viewport.scrollLeft -= SET * step();
         requestAnimationFrame(() => viewport.classList.remove('no-smooth'));
      }
   }

   // Один тик автоплея: карточка вперёд; перед концом набора — откат
   function tick() {
      const max = viewport.scrollWidth - viewport.clientWidth;
      if (viewport.scrollLeft + step() * 1.5 >= max) {
         normalize();
      }
      viewport.scrollBy({ left: step(), behavior: 'smooth' });
   }

   // ── Автоплей ──
   timer = setInterval(tick, 3000);

   // ── Пауза при наведении ──
   viewport.addEventListener('mouseenter', () => clearInterval(timer));
   viewport.addEventListener('mouseleave', () => {
      clearInterval(timer);
      timer = setInterval(tick, 3000);
   });

   // ── Перетаскивание мышью и свайп ──
   viewport.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startScroll = viewport.scrollLeft;
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(e.pointerId);
   });

   viewport.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      viewport.scrollLeft = startScroll - (e.clientX - startX);
      normalize();
   });

   const stopDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      viewport.classList.remove('is-dragging');

      // Доснап до ближайшей карточки
      viewport.scrollTo({
         left: Math.round(viewport.scrollLeft / step()) * step(),
         behavior: 'smooth',
      });
   };
   viewport.addEventListener('pointerup', stopDrag);
   viewport.addEventListener('pointercancel', stopDrag);
}

//* ─────────────────────────────────────────────────────────────────
//* Контактная форма: валидация обязательных полей, счётчик символов,
//* синхронизация скрытых полей селектов, демо-отправка
//* ─────────────────────────────────────────────────────────────────
function initContactForm() {
   const form = document.getElementById('tmpl3-contact-form');
   if (!form) return;

   const textarea = form.querySelector('textarea[name="details"]');
   const counter = form.querySelector('[data-counter]');
   const ok = form.querySelector('.tmpl3-contact__ok');

   // Счётчик символов деталей проекта
   textarea.addEventListener('input', () => {
      counter.textContent = `${textarea.value.length} / 2000`;
   });

   // Ошибочная подсветка снимается при вводе
   form.addEventListener('input', (e) => {
      if (e.target.matches('input, textarea')) {
         e.target.classList.remove('is-invalid');
      }
   });

   form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Синхронизируем скрытые поля кастомных селектов
      form.querySelectorAll('[data-select]').forEach((group) => {
         const input = group.querySelector('input[type="hidden"]');
         const btn = group.querySelector('.select__button');
         if (input && btn) input.value = btn.value || btn.textContent.trim();
      });

      const d = new FormData(form);
      const name = String(d.get('name') || '').trim();
      const email = String(d.get('email') || '').trim();
      const details = String(d.get('details') || '').trim();
      const agree = form.querySelector('[name="agree"]').checked;

      // Подсветка невалидных полей красной рамкой
      form.querySelector('[name="name"]').classList.toggle('is-invalid', !name);
      form
         .querySelector('[name="email"]')
         .classList.toggle('is-invalid', !email.includes('@'));
      form
         .querySelector('[name="details"]')
         .classList.toggle('is-invalid', !details);
      form
         .querySelector('[name="agree"]')
         .classList.toggle('is-invalid', !agree);

      if (!name || !email.includes('@') || !details || !agree) return;

      // Демо-отправка: бэкенда нет — показываем подтверждение
      form.reset();
      counter.textContent = '0 / 2000';
      ok.hidden = false;
   });
}

select();
maskPhone('.tmpl3 .phone');
initContactForm();

//* Рассылка в футере: валидация email, короткое подтверждение на кнопке
function initFooterNews() {
   const form = document.querySelector('.tmpl3-footer__form');
   if (!form) return;

   const input = form.querySelector('input[type="email"]');
   const send = form.querySelector('.tmpl3-footer__send');

   form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = String(input.value || '').trim();
      if (!email.includes('@')) {
         input.classList.add('is-invalid');
         input.focus();
         return;
      }

      // Демо-подписка: бэкенда нет — галочка на кнопке и очистка поля
      input.classList.remove('is-invalid');
      input.value = '';
      send.classList.add('is-done');
      setTimeout(() => send.classList.remove('is-done'), 1800);
   });
}

initFooterNews();

//* ── Инициализация ──
initHeader();
initHeroSlider();
initPortfolio();
initCompanies();
initReveal();
