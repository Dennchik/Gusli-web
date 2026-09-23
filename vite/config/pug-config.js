import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getWebRoot } from '../utils/getWebRoot.js';
//* ✅ data - данные
import data from '../../src/data/data.json' with { type: 'json' };
//* ✅
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getPugConfig(isProd) {
  return {
    minify: true,
    extension: '.pug',

    locals: {
      linkTo: (slug, currentFilename = '') => {
        const cleanSlug = slug.replace(/^\.?\//, '').replace(/\.html$/i, '');

        if (isProd) {
          // ⚠️ Если filename пустой или не содержит путь - считаем это главной страницей
          if (!currentFilename || !currentFilename.includes('pages/')) {
            return `./${cleanSlug}.html`;
          }

          // ⚠️ Извлекаем относительный путь от папки pages/
          const relativePath = currentFilename
            .replace(/\\/g, '/')
            .replace(/^.*pages\//, '')
            .replace(/\.pug$/, '');

          // ⚠️ Главная страница
          if (
            !relativePath ||
            relativePath === 'index' ||
            relativePath.endsWith('/index')
          ) {
            return `./${cleanSlug}.html`;
          }

          // ⚠️ Страница в подкаталоге
          if (relativePath.includes('/')) {
            return `../${cleanSlug}.html`;
          }

          // Страница в корне pages/
          return `./${cleanSlug}.html`;
        }

        // ⚠️ Development
        return `/${cleanSlug}/`;
      },

      getWebRoot: (filename) => getWebRoot(filename, isProd),
      ...data,
    },

    pugOptions: {
      pretty: !isProd,
      basedir: path.resolve(__dirname, '../../'), // корень проекта
    },
  };
}
