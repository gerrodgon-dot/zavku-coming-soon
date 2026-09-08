import {mkdir,cp,readFile,rm} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','privacy/index.html','terms/index.html']){
  const html=await readFile(`site/${file}`,'utf8');
  if(!html.includes('lang="en"')||!html.includes('<title>'))throw new Error(`Invalid public metadata: ${file}`);
}
// Remove the retired browser bundle from earlier builds.
await rm('dist/contact.js',{force:true});
await cp('site','dist',{recursive:true});
console.log('Built ZAVKU static website in dist/');
