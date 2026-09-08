import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createContactHandler} from '../server/contact.mjs';
const good={name:'Test person',company:'Test business',email:'test@example.com',message:'Test inquiry',website:''};
async function fixture(t,options={}){
  const server=createServer(createContactHandler(options));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);}));
  const address=server.address();assert.ok(address&&typeof address!=='string');
  return async(data=good,extra={})=>fetch(`http://127.0.0.1:${address.port}/api/contact`,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://zavku.com',...extra},body:JSON.stringify(data)});
}
test('required fields and invalid email are rejected server-side',async t=>{const post=await fixture(t);const response=await post({...good,name:' ',email:'not-an-email'});assert.equal(response.status,422);assert.deepEqual(Object.keys((await response.json()).errors),['name','email']);});
test('missing delivery config never reports success',async t=>{const post=await fixture(t,{deliver:null});assert.equal((await post()).status,409);});
test('success follows transport acceptance and sends only validated fields',async t=>{let sent;const post=await fixture(t,{deliver:async(data)=>{sent=data;}});assert.equal((await post({...good,name:' Test person ',to:'other@example.com'})).status,200);assert.equal(sent.name,'Test person');assert.equal(sent.to,undefined);});
test('delivery failures expose no internal error or credentials',async t=>{const post=await fixture(t,{deliver:async()=>{throw new Error('secret smtp password');}});const response=await post();assert.equal(response.status,502);assert.ok(!(await response.text()).includes('secret'));});
test('cross-origin requests and header injection fail',async t=>{const post=await fixture(t);assert.equal((await post(good,{Origin:'https://untrusted.example'})).status,403);assert.equal((await post({...good,name:'Test\r\nBcc: victim@example.com'})).status,422);});
test('rate limit applies even when caller spoofs forwarded-for',async t=>{const post=await fixture(t);for(let i=0;i<5;i++)assert.equal((await post(good,{'X-Forwarded-For':`192.0.2.${i}`})).status,409);const response=await post();assert.equal(response.status,429);assert.ok(response.headers.has('retry-after'));});
test('honeypot and oversized messages fail',async t=>{const post=await fixture(t);assert.equal((await post({...good,website:'spam'})).status,400);assert.equal((await post({...good,message:'x'.repeat(6000)})).status,422);assert.equal((await post({...good,message:'x'.repeat(25000)})).status,413);});
