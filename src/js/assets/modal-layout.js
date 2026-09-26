//* --------------------------------[jScript]-----------------------------------
export function modalLayout() {
   const modal = document.querySelector('.modal');
   if (!modal) return;

   let opener = null;

   const open = () => {
      opener = document.activeElement;
      modal.inert = false;
      modal.classList.add('_show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
   };

   const close = () => {
      if (!modal.classList.contains('_show')) return;

      // Возвращаем фокус открывшему элементу ДО скрытия: если фокус останется
      // внутри .modal, браузер блокирует aria-hidden с warning про descendants
      if (modal.contains(document.activeElement)) {
         const target =
            opener && document.contains(opener) ? opener : document.body;
         target.focus();
      }

      modal.classList.remove('_show');
      modal.setAttribute('aria-hidden', 'true');
      modal.inert = true;
      document.body.classList.remove('no-scroll');
   };

   document.addEventListener('click', (e) => {
      if (e.target.closest('[data-modal-open]')) {
         e.preventDefault();
         open();
         return;
      }
      if (e.target.closest('[data-modal-close]')) {
         close();
         return;
      }
      if (
         modal.classList.contains('_show') &&
         !e.target.closest('.modal-container')
      ) {
         close();
      }
   });

   document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
   });

   // Закрытая модалка исключена из tab-порядка и недоступна ассистивным
   // технологиям, даже если стили скрытия изменятся
   modal.inert = true;
}
