import path from 'path';
import fs from 'fs';
import { globSync } from 'glob';
import sharp from 'sharp';

export function convertImagesToWebp({
  inputDir = 'public/img',
  quality = 80,
  extensions = ['jpg', 'jpeg', 'png'],
  reloadDelay = 500, // задержка перед перезагрузкой
} = {}) {
  const extSet = new Set(extensions.map((e) => `.${e}`));
  let changedFiles = new Set();
  let reloadTimer = null;

  async function processFile(file) {
    const outPath = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');

    // Проверка свежести
    if (fs.existsSync(outPath)) {
      const srcTime = fs.statSync(file).mtimeMs;
      const webpTime = fs.statSync(outPath).mtimeMs;
      if (webpTime >= srcTime) {
        console.log(`⏩ Пропуск: ${path.basename(file)} (WebP актуален)`);
        return;
      }
    }

    await sharp(file).webp({ quality }).toFile(outPath);
    console.log(`✅ ${path.basename(file)} → ${path.basename(outPath)}`);
  }

  async function processAll() {
    const patterns = extensions.map((ext) => `${inputDir}/**/*.${ext}`);
    const files = patterns.flatMap((pattern) => globSync(pattern));
    if (!files.length) {
      console.log('⚠️ Нет изображений для конвертации');
      return;
    }
    for (const file of files) {
      try {
        await processFile(file);
      } catch (err) {
        console.error(`❌ Ошибка при конвертации ${file}:`, err.message);
      }
    }
  }

  async function processChangedFiles() {
    if (!changedFiles.size) return;
    console.log(
      `🔄 Конвертация ${changedFiles.size} изменённых изображений...`
    );
    for (const file of changedFiles) {
      try {
        await processFile(file);
      } catch (err) {
        console.error(`❌ Ошибка при конвертации ${file}:`, err.message);
      }
    }
    changedFiles.clear();
  }

  return {
    name: 'convert-images-to-webp',
    async buildStart() {
      console.log('🔄 Конвертация всех изображений в WebP...');
      await processAll();
    },
    configureServer(server) {
      console.log('👀 Наблюдение за изображениями для WebP');

      const scheduleBatch = () => {
        clearTimeout(reloadTimer);
        reloadTimer = setTimeout(async () => {
          await processChangedFiles();
          server.ws.send({ type: 'full-reload' });
          console.log('♻️ Страница перезагружена после пакетной конвертации');
        }, reloadDelay);
      };

      const handleChange = (file) => {
        if (extSet.has(path.extname(file).toLowerCase())) {
          changedFiles.add(file);
          scheduleBatch();
        }
      };

      server.watcher.on('add', handleChange);
      server.watcher.on('change', handleChange);
    },
  };
}
