import {mkdir,cp,readFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','privacy/index.html','terms/index.html']){
  const html=await readFile(`site/${file}`,'utf8');
  if(!html.includes('lang="en"')||!html.includes('<title>'))throw new Error(`Invalid public metadata: ${file}`);
}
await cp('site','dist',{recursive:true});
console.log('Built ZAVKU static website in dist/');
