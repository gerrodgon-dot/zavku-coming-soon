import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {serviceHandler} from '../server/contact.mjs';

test('existing health checks remain available while retired contact routes reject requests',async t=>{
 const server=createServer(serviceHandler);
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);}));
 const address=server.address();assert.ok(address&&typeof address!=='string');
 const origin=`http://127.0.0.1:${address.port}`;
 for(const path of ['/health','/api/health'])assert.equal((await fetch(origin+path)).status,200);
 for(const path of ['/contact','/api/contact','/contact/status','/api/contact/status']){
  for(const method of ['GET','POST'])assert.equal((await fetch(origin+path,{method})).status,404);
 }
});
