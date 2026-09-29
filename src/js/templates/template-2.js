//* ✅ - [ Автономная демо-страница студии: template-2 ]
//* Не использует глобальные компоненты проекта: сама импортирует свои стили
import '../../scss/templates/templates-2.scss';

//* Шапка: плотный фон после скролла + мобильный бургер
function initHeader() {
   const header = document.getElementById('tmpl2-header');
   if (!header) return;

   const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
   };
   window.addEventListener('scroll', onScroll, { passive: true });
   onScroll();

   const burger = header.querySelector('.tmpl2-burger');
   const nav = header.querySelector('.tmpl2-header__nav');
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

//* Появление блоков при скролле: [data-anim] получает .in.
//* При prefers-reduced-motion показываем всё сразу
function initReveal() {
   const items = document.querySelectorAll('.tmpl2 [data-anim]');
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

initHeader();
initReveal();
