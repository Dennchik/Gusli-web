import fs from 'fs';
import path from 'path';
import { paths } from '../config/path.js';
import { fonts } from './fonts.js';

// 🔹 Функция генерации SCSS с @include font-face
function generateFontsScss() {
   const fontsDir = paths.fontsSrc;
   const targetFile = paths.fontsScss;

   let content = '@use "variables.scss" as *;\r\n@use "mixins.scss" as *;\r\n';

   if (fs.existsSync(fontsDir)) {
      const items = fs.readdirSync(fontsDir);
      let c_fontName = '';
      items.forEach((item) => {
         const fontName = item.split('.')[0];
         if (c_fontName !== fontName) {
            content += `@include font-face("${fontName}", "${fontName}", 400, "normal");\r\n`;
         }
         c_fontName = fontName;
      });
   }

   fs.mkdirSync(path.dirname(targetFile), { recursive: true });
   fs.writeFileSync(targetFile, content);
   console.log(`✅ _fonts.scss сгенерирован: ${targetFile}`);
}

// 🔹 Плагин для Vite
export function fontStyle() {
   return {
      name: 'fonts-style-plugin',
      buildStart() {
         // при старте конвертируем шрифты и генерируем SCSS
         fonts(paths.fontsSrc);
         generateFontsScss();
      },
      configureServer(server) {
         const fontsPath = paths.fontsSrc;
         if (!fs.existsSync(fontsPath)) return;

         fs.watch(fontsPath, { persistent: true }, (_eventType, filename) => {
            if (!filename) return;
            const ext = path.extname(filename).toLowerCase();
            if (ext !== '.ttf') return; // реагируем только на TTF

            console.log('⚡ Шрифты изменились, пересоздаём _fonts.scss...');
            fonts(fontsPath);
            generateFontsScss();
            server.ws.send({ type: 'full-reload' });
         });
      },
   };
}
