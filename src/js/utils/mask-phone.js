import IMask from 'imask';

export function maskPhone(selector) {
   const elements = document.querySelectorAll(selector);
   if (!elements.length) return; // Убедитесь, что элементы существуют

   elements.forEach((element) => {
      let mask = null;

      // Функция для инициализации маски
      function initializeMask() {
         mask = IMask(element, {
            mask: '+7 (000) 000-00-00',
            lazy: true, // Показывать маску только при фокусе
         });
         mask.updateValue(); // Сразу обновляем значение маски
      }

      // При фокусе на поле ввода, показываем маску
      element.addEventListener('focus', function () {
         if (!mask) {
            initializeMask(); // Инициализируем маску только при первом фокусе
         }
         if (element.value === '') {
            element.value = '+7 '; // Устанавливаем начальное значение
         }
         mask.updateValue(); // Обновляем значение маски
      });

      // При потере фокуса, если поле пустое, очищаем его
      element.addEventListener('blur', function () {
         if (element.value.trim() === '+7') {
            element.value = ''; // Очищаем поле
            if (mask) {
               mask.updateValue(''); // Очищаем маску
            }
         }
      });
   });
}
