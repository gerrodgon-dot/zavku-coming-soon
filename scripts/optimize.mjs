import {mkdir,copyFile} from 'node:fs/promises';
import sharp from 'sharp';
await mkdir('site/assets',{recursive:true});
for(const name of ['hero','footer']){
  await sharp(`assets/${name}-original.png`).webp({quality:90}).toFile(`site/assets/${name}.webp`);
  await sharp(`assets/${name}-original.png`).resize({width:960,withoutEnlargement:true}).webp({quality:85}).toFile(`site/assets/${name}-960.webp`);
}
await copyFile('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2','site/assets/inter-latin.woff2');
await copyFile('node_modules/@fontsource-variable/inter/LICENSE','site/assets/INTER-LICENSE.txt');
