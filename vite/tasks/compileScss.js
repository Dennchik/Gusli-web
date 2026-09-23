import { execSync } from 'child_process';
import fs from 'fs';
import { globSync } from 'glob';
import { basename, resolve } from 'path';

export function compileScss() {
   const inputDir = resolve('src/scss');
   const outputDir = resolve('public/css');

   // ✅ очищаем папку css перед компиляцией
   if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir);
      files.forEach((file) => fs.unlinkSync(resolve(outputDir, file)));
   } else {
      fs.mkdirSync(outputDir, { recursive: true });
   }

   const scssFiles = globSync(`${inputDir}/*.scss`);

   scssFiles.forEach((file) => {
      const fileName = basename(file, '.scss');
      const outputFile = resolve(outputDir, `${fileName}.css`);

      try {
         execSync(`sass "${file}":"${outputFile}" --no-source-map`, {
            stdio: 'inherit',
         });
         console.log(`✅ Скомпилирован: ${fileName}.scss → ${fileName}.css`);
      } catch (error) {
         console.error(`❌ Ошибка компиляции ${fileName}.scss:`, error.message);
      }
   });
}
