import { resolve } from 'path';

export const pathSrc = 'src';
export const pathDest = 'build';

export const paths = {
   fontsSrc: resolve('public/fonts'),
   fontsScss: resolve('src/scss/core/_fonts.scss'),

   fonts: {
      src: resolve('public/fonts'),
      dest: resolve('src/scss/core/_fonts.scss'),
   },

   scss: {
      src: pathSrc + 'scss',
      dest: 'public/css',
   },

   webp: {
      src: 'public/img',
   },
};
