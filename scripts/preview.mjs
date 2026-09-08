import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {createContactHandler} from '../server/contact.mjs';
const root=resolve('dist');
const api=createContactHandler({origin:'http://127.0.0.1:4387'});
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain'};
createServer(async(req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname.startsWith('/api/'))return api(req,res);
  const file=resolve(root,'.'+decodeURIComponent(pathname)+(pathname.endsWith('/')?'index.html':''));
  if(!file.startsWith(root+sep)){res.writeHead(403);return res.end();}
  try{const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end('Not found');}
}).listen(4387,'127.0.0.1',()=>console.log('ZAVKU preview: http://127.0.0.1:4387'));
