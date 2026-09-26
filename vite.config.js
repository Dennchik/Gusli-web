//! ✅ vite.config.js
// noinspection JSValidateTypes

import { viteConvertPugInHtml } from '@mish.dev/vite-convert-pug-in-html';
//* ✅ Plugins
import autoprefixer from 'autoprefixer';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcssMediaMinMax from 'postcss-media-minmax';
import sortMediaQueries from 'postcss-sort-media-queries';
import { defineConfig } from 'vite';
//* ✅ config
import { app } from './vite/config/app.js';
//* ✅ Path
import { paths } from './vite/config/path.js';
//* ✅ Tasks
import { getPugConfig } from './vite/config/pug-config.js';
import { compileScss } from './vite/tasks/compileScss.js';
import { fonts } from './vite/tasks/fonts.js';
import { fontStyle } from './vite/tasks/fontsStyle.js';
import { moveHtmlFiles } from './vite/tasks/moveHtmlFiles.js';
import { convertImagesToWebp } from './vite/tasks/webp.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

//* ✅ Вызываем fontStyle ДО конфигурации
fonts(paths.fonts.src);

export default defineConfig(({ command }) => {
   const isProd = command === 'build';
   const isDev = command === 'dev';

   //* ✅ Вызываем compileScss() только для продакшн сборки
   if (isProd) {
      compileScss();
   }
   return {
      base: './',

      plugins: [
         fontStyle(),
         convertImagesToWebp(app.webp),
         viteConvertPugInHtml(getPugConfig(isProd)),

         // 🔹 ключевой плагин для переименования HTML
         moveHtmlFiles(), // 👈 ключевой плагин для переименования HTML
         // 🔹 Добавляем анализатор только в продакшн-сборке
      ],
      server: {
         open: true,
      },

      css: {
         devSourcemap: !isProd,
         postcss: {
            plugins: [
               ...(isProd
                  ? [
                       // 1. Конвертируем modern media query синтаксис (width >=
                       // 768px)
                       postcssMediaMinMax(app.postcssMediaMinMax),

                       // 2. Сортируем и объединяем media queries
                       sortMediaQueries(app.postcssSortMediaQueries),

                       // 3. Добавляем vendors префиксы
                       autoprefixer(app.autoprefixer),
                    ]
                  : []),
            ],
         },
         preprocessorOptions: { scss: {} },
      },

      resolve: {
         alias: { '@': resolve(__dirname, 'src') },
      },

      build: {
         outDir: 'build',
         emptyOutDir: true,
         sourcemap: isDev,
         cssCodeSplit: true, // 👈 теперь стили делятся по Chunks

         chunkSizeWarningLimit: 264,
         modulePreload: {
            polyfill: true,
         },
         minify: 'esbuild',
         commonjsOptions: {
            transformMixedEsModules: true,
         },

         rollupOptions: {
            input: {
               main: resolve(__dirname, 'src/js/main.js'),
               // app: resolve(__dirname, 'src/js/app.js'),
            },
            output: {
               entryFileNames: 'assets/[name].js',
               assetFileNames: 'assets/[name].[ext]',
               chunkFileNames: 'assets/vendors/[name].js',

               manualChunks(id) {
                  if (id.includes('node_modules')) {
                     if (id.includes('lodash') || id.includes('date-fns')) {
                        return 'utils';
                     }
                     if (id.includes('chart.js') || id.includes('d3')) {
                        return 'charts';
                     }
                     if (id.includes('animejs') || id.includes('gsap')) {
                        return 'anime-vendors';
                     }
                     if (id.includes('swiper')) {
                        return 'swiper-vendors';
                     }
                     return 'vendor';
                  }
               },
            },
         },
         optimizeDeps: {
            include: ['lodash', 'axios'],
            exclude: [],
         },
      },

      preview: {
         port: 4173,
         host: true,
      },
   };
});
