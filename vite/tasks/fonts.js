import fs from 'fs';
import path from 'path';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2';

export function fonts(fontsDir) {
  if (!fs.existsSync(fontsDir)) return;

  const items = fs.readdirSync(fontsDir).filter((f) => f.endsWith('.ttf'));

  items.forEach((item) => {
    const ttfPath = path.join(fontsDir, item);
    const baseName = path.basename(item, '.ttf');

    // WOFF
    const ttfData = fs.readFileSync(ttfPath);
    const woffData = Buffer.from(ttf2woff(ttfData).buffer);
    fs.writeFileSync(path.join(fontsDir, `${baseName}.woff`), woffData);

    // WOFF2
    const woff2Data = ttf2woff2(ttfData);
    fs.writeFileSync(path.join(fontsDir, `${baseName}.woff2`), woff2Data);
  });
}
