const form=/** @type {HTMLFormElement|null} */(document.querySelector('#contact-form'));
const status=document.querySelector('#form-status');
if(form&&status){
  const fields=['name','company','email','message'];
  const button=/** @type {HTMLButtonElement} */(form.querySelector('button[type=submit]'));
  function errorFor(key,message){
    const input=/** @type {HTMLInputElement} */(form.elements.namedItem(key));
    input.setAttribute('aria-invalid',message?'true':'false');
    document.querySelector(`#${key}-error`).textContent=message;
  }
  for(const key of fields)/** @type {HTMLInputElement} */(form.elements.namedItem(key)).addEventListener('input',()=>errorFor(key,''));
  fetch('/api/contact/status').then(r=>r.ok?r.json():null).then(data=>{if(data?.available)status.textContent='';}).catch(()=>{});
  form.addEventListener('submit',async(event)=>{
    event.preventDefault();if(button.disabled)return;
    const data=Object.fromEntries(new FormData(form));let first='';
    for(const key of fields){
      const value=String(data[key]||'').trim();data[key]=value;
      let error=value?'':'This field is required.';
      if(key==='email'&&value&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))error='Please enter a valid business email.';
      errorFor(key,error);if(error&&!first)first=key;
    }
    if(first){status.textContent='Please check the highlighted fields.';status.setAttribute('data-state','error');/** @type {HTMLElement} */(form.elements.namedItem(first)).focus();return;}
    button.disabled=true;button.textContent='Sending…';status.textContent='Sending your message…';status.removeAttribute('data-state');
    try{
      const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(20000)});
      const result=await response.json();
      status.textContent=result.message||'Your message could not be sent. Please try again later.';
      status.setAttribute('data-state',response.ok?'success':'error');
      if(result.errors){for(const key of fields)if(result.errors[key])errorFor(key,result.errors[key]);const invalid=form.querySelector('[aria-invalid="true"]');/** @type {HTMLElement|null} */(invalid)?.focus();}
      if(response.ok)form.reset();
    }catch{status.textContent='We could not confirm delivery. Please check your connection before trying again.';status.setAttribute('data-state','error');}
    finally{button.disabled=false;button.innerHTML='Send message <span aria-hidden="true">→</span>';}
  });
}
