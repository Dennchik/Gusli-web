/**
 * ⚠️ Заглушка ТОЛЬКО для PhpStorm/WebStorm.
 *
 * Проект собирается через Vite (см. vite.config.js) — webpack здесь не
 * используется и не устанавливается. Этот файл нужен лишь для того, чтобы IDE
 * узнала про алиас `@` и перестала ругаться «Cannot resolve directory '@'»
 * на пути вида `@/pug/sections/home/section-hero` в .pug-файлах.
 *
 * Подключение: Settings → Languages & Frameworks → JavaScript → Webpack →
 * «Manually» → указать этот файл.
 *
 * Алиасы держим синхронно с `resolve.alias` в vite.config.js.
 */
const path = require('node:path');

module.exports = {
   resolve: {
      alias: {
         '@': path.resolve(__dirname, 'src'),
      },
   },
};
