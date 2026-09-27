/**
 * AnchorScroller
 *
 * Перехватывает клики по якорным ссылкам (.anchor-link),
 * выполняет плавный скролл с учётом высоты фиксированного header'а.
 *
 * На десктопе (с ScrollSmoother) использует smoother.scrollTo(target, true,
 * `top ${offset}px`) Это КЛЮЧЕВОЙ момент для учёта отступов.
 *
 * На мобильных / без smoother — использует window.scrollTo с расчётом offset.
 */

export default class AnchorScroller {
   constructor(params = {}) {
      this.headerSelector = params.headerSelector ?? '.offset-header';
      this.selector = params.selector ?? '.anchor-link';
      this.smoother = params.smoother ?? null;
      this.onCloseSidebar = params.onCloseSidebar ?? null;
      this.onCloseButton = params.onCloseButton ?? null;

      //* Можно передать селектор сайдбара, если нужно
      this.sidebarSelector =
         params.sidebarSelector ?? '.sidebar, .mobile-menu, [data-sidebar]';

      this.init();
   }

   getOffset() {
      const header = document.querySelector(this.headerSelector);
      //* fallback 80px если header не найден
      return header ? header.offsetHeight : 80;
   }

   findSidebar() {
      return document.querySelector(this.sidebarSelector);
   }

   scrollToTarget(target, offset) {
      if (!target) return;

      if (this.smoother && typeof this.smoother.scrollTo === 'function') {
         /* === ГЛАВНЫЙ ФИКС ДЛЯ ПК ===
         Третий параметр — позиция выравнивания. "Значение top ${offset}px"
         означает: верх таргета должен оказаться на offset пикселей от верха
         вьюпорта. Это учитывает фиксированный header. */
         this.smoother.scrollTo(target, true, `top ${offset}px`);

         /* Альтернатива (если нужно точно числовое значение):
         const scrollPos = this.smoother.offset(target, `top ${offset}px`);
         const maxScroll = ScrollTrigger.maxScroll(window);
         нужно импортировать если не глобально
         this.smoother.scrollTo(Math.min(scrollPos, maxScroll), false); */
      } else {
         //* Нативный скролл (мобильные)
         const rect = target.getBoundingClientRect();
         const targetTop = rect.top + window.pageYOffset;
         const scrollToY = targetTop - offset;

         window.scrollTo({
            top: Math.max(0, scrollToY),
            behavior: 'smooth',
         });
      }
   }

   init() {
      //* Слушаем клики на все якорные ссылки по селектору
      const links = document.querySelectorAll(this.selector);

      links.forEach((link) => {
         link.addEventListener(
            'click',
            (e) => {
               const href = link.getAttribute('href');
               if (!href || !href.startsWith('#')) return;

               const targetId = href.substring(1);
               if (!targetId) return;

               const target = document.getElementById(targetId);
               if (!target) {
                  //* Если секции нет — всё равно закрываем сайдбар
                  this.closeSidebars();
                  return;
               }

               e.preventDefault();

               const offset = this.getOffset();

               //* Выполняем скролл с учётом отступа
               this.scrollToTarget(target, offset);

               //* Закрываем сайдбар/меню (если переданы callbacks)
               this.closeSidebars();

               /* Опционально: можно dispatch событие, чтобы GraphitiNavigator знал
               (но в вашем коде активация уже происходит в GraphitiNavigator
               через document click) */
            },
            { passive: false },
         );
      });

      /*  Дополнительно: можно слушать все ссылки [href^="#"] глобально, если
      нужно Но лучше не дублировать, т.к. GraphitiNavigator уже ловит для
      активации.
      */
   }

   closeSidebars() {
      const sidebar = this.findSidebar();
      //* Дополнительно: если есть кнопка закрытия, можно триггерить
      const closeBtn = document.querySelector(
         '.sidebar-close, .burger-button, [data-close-sidebar]',
      );
      if (this.onCloseSidebar && sidebar) {
         this.onCloseSidebar(sidebar);
      }

      if (this.onCloseButton && closeBtn) {
         this.onCloseButton(closeBtn);
      }

      // if (closeBtn) {
      //   closeBtn.click();
      // }
   }
}
