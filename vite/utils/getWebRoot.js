//* vite/utils/getWebRoot.js
import path from 'node:path';
import { fileURLToPath } from 'node:url';
//* Функция для расчёта webRoot в build
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Вычисляет webRoot для HTML в build.
 * @param {string} filename - Абсолютный путь к файлу.
 * @param {boolean} isProd - true, если сборка в режиме production.
 * @returns {string} Путь до корня для подключения ресурсов.
 */
export function getWebRoot(filename, isProd) {
  if (!isProd) return '/'; // dev — всегда абсолютный путь в корень

  //* build — считаем глубину относительно папки pages
  const rel = path.relative(path.resolve(__dirname, '../../pages'), filename);
  const depth = rel.split(path.sep).length - 1;
  return depth === 0 ? './' : '../'.repeat(depth);
}
