export default class BurgerMenu {
   constructor() {
      this.mobileMenu = document.querySelector('.mobile-menu');
      this.buttons = document.querySelectorAll('.burger-button');
      this.resizeTimer = null;

      if (!this.mobileMenu) {
         return;
      }

      this.init();
   }

   init() {
      this.buttons.forEach((button) => {
         button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle(); // Убираем параметр button
         });
      });

      document.addEventListener('click', (e) => this.handleOutsideClick(e));
      document.addEventListener('keydown', (e) => this.handleEscapeKey(e));
      window.addEventListener('resize', () => this.handleResize());

      console.log('BurgerMenu initialized');
   }

   // Изменяем toggle - теперь переключает все кнопки
   toggle() {
      // Переключаем класс _open у ВСЕХ кнопок
      this.buttons.forEach((btn) => {
         btn.classList.toggle('_open');
      });

      // Переключаем меню
      this.mobileMenu.classList.toggle('_show');
      document.body.classList.toggle('menu-open');
   }

   close() {
      // Удаляем класс _open у ВСЕХ кнопок
      this.buttons.forEach((btn) => btn.classList.remove('_open'));
      this.mobileMenu.classList.remove('_show');
      document.body.classList.remove('menu-open');
   }

   handleOutsideClick(e) {
      if (this.mobileMenu.classList.contains('_show')) {
         const isInside =
            this.mobileMenu.contains(e.target) ||
            [...this.buttons].some((btn) => btn.contains(e.target));

         if (!isInside) this.close();
      }
   }

   handleEscapeKey(e) {
      if (e.key === 'Escape' && this.mobileMenu.classList.contains('_show')) {
         this.close();
      }
   }

   handleResize() {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
         if (this.mobileMenu.classList.contains('_show')) {
            this.close();
         }
      }, 200);
   }
}
