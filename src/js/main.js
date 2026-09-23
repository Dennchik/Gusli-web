import '../scss/main.scss';
import { shadowScrollHeader } from './layouts/layouts.js';
import AnchorScroller from './modules/AnchorScroller.js';
import BurgerMenu from './assets/burger-menu.js';
import loaded from './utils/preloader.js';
import DynamicAdaptive from './modules/DynamicAdaptive.js';
// import { maskPhone } from './utils/mask-phone.js';
// import { returnToSavedPosition } from './assets/returnToSavedPosition.js';
function onDomReady() {
   DynamicAdaptive();
   shadowScrollHeader();
   // maskPhone('.phone');
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
//* ----------------------------------------------------------------------------
loaded('.preloader');
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
