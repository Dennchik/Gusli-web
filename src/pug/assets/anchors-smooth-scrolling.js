// Экспорт функции, чтобы использовать её в других модулях
export function anchorsSmoothScrolling() {
   // Ожидаем полной загрузки DOM
   document.addEventListener('DOMContentLoaded', function () {
      // Отключаем авто-прокрутку браузера к якорю при переходе по ссылке вида page.html#anchor
      if ('scrollRestoration' in history) {
         history.scrollRestoration = 'manual';
      }

      // Находим все ссылки с классом .anchor-link (к ним будет применена плавная прокрутка)
      const anchorLinks = document.querySelectorAll('.anchor-link');

      // Для каждой такой ссылки:
      anchorLinks.forEach((link) => {
         link.addEventListener('click', function (e) {
            // Получаем href, на который указывает ссылка
            const href = this.getAttribute('href');
            if (!href) return; // если нет href — ничего не делаем

            // Проверяем, является ли ссылка якорем на текущей странице (например, #about)
            const isSamePageAnchor = href.startsWith('#');

            // Проверяем, ведет ли ссылка на другую страницу + якорь (например, page.html#block)
            const isAnchorWithPage = href.includes('#') && !isSamePageAnchor;

            // Если это переход на другую страницу с якорем
            if (isAnchorWithPage) {
               const anchorId = href.split('#')[1]; // извлекаем id якоря после #
               if (anchorId) {
                  localStorage.setItem('scrollToAnchor', anchorId); // сохраняем его в localStorage
               }
               // Не отменяем стандартное поведение — браузер должен перейти на другую страницу
               return;
            }

            // Если это переход по якорю на текущей странице
            e.preventDefault(); // отменяем стандартное поведение браузера

            // Извлекаем id якоря без #
            const targetId = href.substring(1);

            // Находим элемент с таким id
            const targetElement = document.getElementById(targetId);
            if (!targetElement) return; // если такого нет — выходим

            // Вычисляем отступ (высоту фиксированной шапки)
            const screenWidth = window.innerWidth;
            const offset = screenWidth <= 1024 ? 60 : 98;

            // Вычисляем позицию элемента на странице
            const targetPosition =
               targetElement.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = targetPosition - offset; // вычитаем отступ

            // Прокручиваем страницу до нужной позиции
            window.scrollTo({
               top: offsetPosition,
               behavior: 'smooth', // плавно
            });
         });
      });

      // Если был переход с другой страницы с якорем
      const savedAnchorId = localStorage.getItem('scrollToAnchor'); // получаем сохранённый id из localStorage
      if (savedAnchorId) {
         // Функция прокрутки к элементу с учётом отступа
         const scrollToAnchorWithOffset = () => {
            const targetElement = document.getElementById(savedAnchorId);
            if (targetElement) {
               const screenWidth = window.innerWidth;
               const offset = screenWidth <= 1024 ? 64 : 80;

               const targetPosition =
                  targetElement.getBoundingClientRect().top + window.scrollY;
               const offsetPosition = targetPosition - offset;

               // Прокручиваем к элементу с учётом отступа
               window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
               });

               // Удаляем сохранённый якорь, чтобы он не сработал снова
               localStorage.removeItem('scrollToAnchor');
            }
         };

         // Запускаем прокрутку через небольшой таймер (чтобы DOM успел полностью построиться)
         setTimeout(scrollToAnchorWithOffset);
      }
   });
}
