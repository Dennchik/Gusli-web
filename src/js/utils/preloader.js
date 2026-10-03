//* --------------------------- [  Preloader ] ---------------------------------
export default function loaded(item) {
   window.onload = function () {
      //    document.querySelector(item).classList.add('preloader-remove');
      //    document.documentElement.classList.add('loaded');
      const preloader = document.querySelector(item);
      preloader.classList.add('preloader-remove');

      preloader.addEventListener(
         'transitionend',
         () => {
            preloader.style.display = 'none';
            // Полностью убираем из потока, после анимации
         },
         { once: true }
      );
   };
}
