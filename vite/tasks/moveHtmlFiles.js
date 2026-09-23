// vite/tasks/moveHtmlFiles.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function moveHtmlFiles() {
   return {
      name: 'move-html-files',
      apply: 'build',
      closeBundle() {
         const buildDir = path.resolve(__dirname, '../../build');

         // ✅ защита: папки может не быть на промежуточных билдах
         if (!fs.existsSync(buildDir)) {
            this.warn(
               `[move-html-files] Папка ${buildDir} не найдена, пропускаем`
            );
            return;
         }

         function walk(dir) {
            // ✅ защита: папку могли удалить в процессе
            if (!fs.existsSync(dir)) return;

            for (const file of fs.readdirSync(dir)) {
               const fullPath = path.join(dir, file);
               const stat = fs.statSync(fullPath);

               if (stat.isDirectory()) {
                  walk(fullPath);
               } else if (file === 'index.html' && dir !== buildDir) {
                  const parentDirName = path.basename(dir);
                  const parentDirRelative = path.relative(buildDir, dir);

                  let html = fs.readFileSync(fullPath, 'utf8');

                  const depth = parentDirRelative.split(path.sep).length;
                  const newPrefix = depth > 1 ? '../' : './';

                  html = html.replace(
                     /(\shref|\ssrc)=["'](\.\.\/)+/g,
                     `$1="${newPrefix}`
                  );

                  const newPath = path.join(
                     buildDir,
                     path.dirname(parentDirRelative),
                     `${parentDirName}.html`
                  );

                  fs.writeFileSync(newPath, html, 'utf8');
                  fs.rmSync(dir, { recursive: true, force: true });
               }
            }
         }

         walk(buildDir);
      },
   };
}
