//* ✅ - [ Hiding an element when scrolling ]
export function shadowScrollHeader() {
   const handleScroll = () => {
      const headerMain = document.querySelector('.page__header');
      const pageContainer = document.querySelector('.page__main-content');
      const pageContainerTop = pageContainer.getBoundingClientRect().top;

      if (headerMain) {
         if (pageContainerTop < -50) {
            headerMain.classList.add('with-shadow');
         } else if (pageContainerTop <= 0) {
            headerMain.classList.remove('with-shadow');
         }
      }
   };

   window.addEventListener('scroll', handleScroll);
   //🔹 Очистка слушателя событий при размонтировании компонента
   return () => {
      window.removeEventListener('scroll', handleScroll);
   };
}
