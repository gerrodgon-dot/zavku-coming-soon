import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';

// Preserve the existing service entry point and health checks without contact processing.
export function serviceHandler(req,res){
  const path=new URL(req.url,'http://localhost').pathname;
  const healthy=req.method==='GET'&&['/health','/api/health'].includes(path);
  res.writeHead(healthy?200:404,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(healthy?{ok:true}:{message:'Not found.'}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const server=createServer(serviceHandler);
  server.requestTimeout=15000;server.headersTimeout=10000;server.maxHeadersCount=30;
  server.listen(Number(process.env.PORT||8080),'0.0.0.0',()=>console.log('ZAVKU service listening'));
  process.on('SIGTERM',()=>server.close());
}
