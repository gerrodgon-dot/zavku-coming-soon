import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {isIP} from 'node:net';
import nodemailer from 'nodemailer';

const emailPattern=/^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/;
export function validateContact(data){
  const errors={};const clean={};
  for(const [key,max] of Object.entries({name:100,company:160,email:254,message:5000})){
    const value=typeof data?.[key]==='string'?data[key].trim():'';
    if(!value)errors[key]='This field is required.';
    else if(value.length>max)errors[key]=`Please use ${max} characters or fewer.`;
    else if(key!=='message'&&Array.from(value).some(c=>c.charCodeAt(0)<32))errors[key]='Please enter a valid value.';
    clean[key]=value;
  }
  if(clean.email&&!emailPattern.test(clean.email))errors.email='Please enter a valid business email.';
  return {errors,clean};
}

function mailDelivery(env){
  const destination=env.CONTACT_TO||'contact@zavku.com';
  if(!env.SMTP_HOST||!env.SMTP_USER||!env.SMTP_PASSWORD||!emailPattern.test(destination)||!emailPattern.test(env.CONTACT_FROM||'')||env.CONTACT_DELIVERY_ENABLED!=='true')return null;
  const transport=nodemailer.createTransport({host:env.SMTP_HOST,port:Number(env.SMTP_PORT||465),secure:env.SMTP_PORT!=='587',requireTLS:true,auth:{user:env.SMTP_USER,pass:env.SMTP_PASSWORD},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:12000,disableFileAccess:true,disableUrlAccess:true});
  return async(data)=>{
    const info=await transport.sendMail({from:env.CONTACT_FROM,to:destination,replyTo:data.email,subject:`ZAVKU Website Inquiry — ${data.company}`,text:`Name: ${data.name}\nCompany: ${data.company}\nBusiness email: ${data.email}\n\n${data.message}`});
    if(!info.accepted?.length)throw new Error('Delivery not accepted');
  };
}

/** @param {{origin?:string, deliver?:((data:any)=>Promise<void>)|null, trustIngress?:boolean, now?:()=>number}} options */
export function createContactHandler(options={}){
  const origin=options.origin||'https://zavku.com';
  const deliver=options.deliver===undefined?mailDelivery(process.env):options.deliver;
  const now=options.now||Date.now;const clients=new Map();let globalStart=now();let globalCount=0;
  return async(req,res)=>{
    const send=(status,data,extra={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...extra});res.end(JSON.stringify(data));};
    const path=new URL(req.url,'http://localhost').pathname;
    if(req.method==='GET'&&['/health','/api/health'].includes(path))return send(200,{ok:true});
    if(req.method==='GET'&&['/contact/status','/api/contact/status'].includes(path))return send(200,{available:!!deliver});
    if(!['/contact','/api/contact'].includes(path))return send(404,{message:'Not found.'});
    if(req.method!=='POST')return send(405,{message:'Method not allowed.'},{Allow:'POST'});
    if(req.headers.origin!==origin)return send(403,{message:'Please submit the form from the ZAVKU website.'});
    if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return send(415,{message:'Please submit the website form.'});
    const stamp=now();
    if(stamp-globalStart>=60000){globalStart=stamp;globalCount=0;}
    if(++globalCount>60)return send(429,{message:'Too many requests. Please try again later.'},{'Retry-After':'60'});
    // App Platform overwrites this header at its trusted ingress. Never trust X-Forwarded-For.
    const ingress=req.headers['do-connecting-ip'];
    const address=options.trustIngress&&typeof ingress==='string'&&isIP(ingress)?ingress:(req.socket.remoteAddress||'unknown');
    const key=createHash('sha256').update(address).digest('hex');
    for(const [k,v] of clients)if(stamp-v.start>=600000)clients.delete(k);
    const entry=clients.get(key)||{start:stamp,count:0};entry.count++;clients.set(key,entry);
    if(entry.count>5)return send(429,{message:'Too many requests. Please try again in 10 minutes.'},{'Retry-After':String(Math.ceil((entry.start+600000-stamp)/1000))});
    if(Number(req.headers['content-length']||0)>24000)return send(413,{message:'Your message is too long.'});
    let body='';let size=0;
    try{
      for await(const chunk of req){size+=chunk.length;if(size>24000){send(413,{message:'Your message is too long.'});req.destroy();return;}body+=chunk.toString('utf8');}
      const data=JSON.parse(body);
      if(!data||typeof data!=='object'||Array.isArray(data))return send(400,{message:'Please check the form and try again.'});
      const {errors,clean}=validateContact(data);
      if(Object.keys(errors).length)return send(422,{message:'Please check the highlighted fields.',errors});
      if(data.website)return send(400,{message:'Please check the form and try again.'});
      if(!deliver)return send(409,{message:'Message delivery is currently unavailable. Your message has not been sent. Please check back soon.'});
      try{await deliver(clean);}catch{return send(502,{message:'Your message could not be sent. Please try again later.'});}
      return send(200,{message:'Thank you. Your message has been sent to ZAVKU.'});
    }catch{return send(400,{message:'Please check the form and try again.'});}
  };
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const server=createServer(createContactHandler({origin:process.env.SITE_ORIGIN||'https://zavku.com',trustIngress:process.env.TRUST_DO_INGRESS==='true'}));
  server.requestTimeout=15000;server.headersTimeout=10000;server.maxHeadersCount=30;
  server.listen(Number(process.env.PORT||8080),'0.0.0.0',()=>console.log('ZAVKU contact service listening'));
  process.on('SIGTERM',()=>server.close());
}
