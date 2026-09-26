import '../scss/main.scss';
import BurgerMenu from './assets/burger-menu.js';
import { modalLayout } from './assets/modal-layout.js';
import { shadowScrollHeader } from './layouts/layouts.js';
import AnchorScroller from './modules/AnchorScroller.js';
import DynamicAdaptive from './modules/DynamicAdaptive.js';
import { maskPhone } from './utils/mask-phone.js';
import loaded from './utils/preloader.js';

// import { returnToSavedPosition } from './assets/returnToSavedPosition.js';
function onDomReady() {
   DynamicAdaptive();
   shadowScrollHeader();
   maskPhone('.phone');
   modalLayout();
   // returnToSavedPosition();
   // cookiesAccept('.cookies-accept', '.cookies-accept__button');
}
document.addEventListener('DOMContentLoaded', onDomReady);
const burgerMenu = new BurgerMenu();
document.querySelectorAll('a[href]').forEach((link) => {
   link.addEventListener('click', () => {
      if (burgerMenu) {
         burgerMenu.close();
      }
   });
});

loaded('.preloader');
//* ----------------- [ Блок часто задаваемые вопросы ] ------------------------
document.addEventListener('DOMContentLoaded', () => {
   const faqItems = document.querySelectorAll('[data-question]');

   faqItems.forEach((item) => {
      const trigger = item.querySelector('[data-trigger]');

      trigger.addEventListener('click', () => {
         // 1. Если хотим, чтобы открывался только один за раз - раскомментируй
         // код ниже:

         faqItems.forEach((otherItem) => {
            if (otherItem !== item) {
               otherItem.classList.remove('is-active');
            }
         });

         // 2. Переключаем класс на текущем элементе
         item.classList.toggle('is-active');
      });
   });
});
//* ----------------------------------------------------------------------------
//* AnchorScroller — всегда (и на мобилке, и на ПК)
//* Здесь передаём smoother, чтобы он использовал правильный scrollTo с
//* offset'ом
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
