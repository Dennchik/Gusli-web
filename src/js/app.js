//* ============================================================================
//* Точка входа логики страницы: калькулятор, квиз, бриф-форма, reveal-анимации.
//* Сами функции лежат в layouts/layouts.js и построены на делегировании
//* событий — слушатели навешаны на документ и переживают любые перерисовки
//* ============================================================================
import {
   initCalculator,
   initQuiz,
   initBriefForm,
   initFooterForm,
   initRevealAnimations,
} from './layouts/layouts.js';

initCalculator();
initQuiz();
initBriefForm();
initFooterForm();
initRevealAnimations();
