import { initD2StatefulOperations } from "./d2-stateful-operations.js";
import { initD2AdminInteractions } from "./d2-admin-interactions.js";
import { setLocale } from "./locale.js";
import { getLayout, resetLayout, setLayout } from "./layout.js";
import { setPresentation } from "./presentation.js";
import { iconSvg } from "./ui.js";

function route(){ return document.body?.dataset?.currentRoute || ""; }
function buttonsByText(root, text){ return [...root.querySelectorAll("button")].filter((b)=>b.textContent.trim()===text); }
function buttonByText(root, text){ return buttonsByText(root,text)[0] || null; }
function closeDialog(dialog){
  if(!dialog) return;
  dialog.hidden=true;
  const trigger=document.querySelector(`[data-dialog-trigger="#${CSS.escape(dialog.id)}"]`);
  trigger?.setAttribute("aria-expanded","false");
  dialog.dispatchEvent(new CustomEvent("vexlora:layer-close"));
}
function parseMoney(text){ const n=Number(String(text||"").replace(/[^0-9.]/g,"")); return Number.isFinite(n)?n:0; }
function currency(n){ return `$${Number(n).toLocaleString("en-US")}`; }
function badgeClass(kind){
  if(kind==="default") return "inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium leading-4 bg-success/10 text-success";
  return "inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium leading-4 border border-border bg-background text-foreground";
}
function actionButton(text, ghost=false){
  const b=document.createElement("button");
  b.className=`inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-[background-color,color,border-color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 ${ghost?"hover:bg-accent hover:text-accent-foreground":"border border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground"} h-9 px-3`;
  b.textContent=text;
  return b;
}

function initBillingPaymentMethods(){
  if(route()!=="/billing/payment-methods") return;
  const root=document.querySelector("#main-content"); if(!root) return;
  const dialogTitle=[...root.querySelectorAll("h2")].find((h)=>h.textContent.trim()==="Add billing method");
  const dialog=dialogTitle?.closest("[data-dialog]");
  const grid=[...root.querySelectorAll(".grid")].find((g)=>g.querySelectorAll(":scope > .rounded-lg.border.border-border.bg-card").length>=2 && g.textContent.includes("Visa") && g.textContent.includes("Mastercard"));
  if(!dialog||!grid) return;
  const fields=[...dialog.querySelectorAll("input")];
  const cancel=buttonByText(dialog,"Cancel"), add=buttonsByText(dialog,"Add method").find((b)=>!b.hasAttribute("data-dialog-trigger"));
  const valid=()=>fields.length>=4 && fields[0].value.trim() && /^\d{4}$/.test(fields[1].value) && fields[2].value.trim() && fields[3].value.trim();
  const updateValid=()=>{ if(add) add.disabled=!valid(); };
  fields[1]?.addEventListener("input",()=>{ fields[1].value=fields[1].value.replace(/\D/g,"").slice(0,4); updateValid(); });
  fields.filter((_,i)=>i!==1).forEach((f)=>f.addEventListener("input",updateValid));
  cancel?.addEventListener("click",()=>closeDialog(dialog));

  function configureCard(card, isDefault){
    const badge=card.querySelector("span.inline-flex.rounded-full");
    if(badge){ badge.textContent=isDefault?"Default":"Backup"; badge.className=badgeClass(isDefault?"default":"backup"); }
    const actions=[...card.querySelectorAll("div")].find((d)=>d.classList.contains("flex")&&d.classList.contains("flex-wrap")&&d.classList.contains("gap-2")&&d.closest(".rounded-lg")===card);
    if(!actions) return;
    actions.replaceChildren();
    if(!isDefault){
      const make=actionButton("Make default");
      const remove=actionButton("Remove",true);
      make.addEventListener("click",()=>{
        [...grid.children].forEach((c)=>configureCard(c,c===card));
      });
      remove.addEventListener("click",()=>card.remove());
      actions.append(make,remove);
    }
  }
  [...grid.children].forEach((card,i)=>configureCard(card,i===0));

  add?.addEventListener("click",()=>{
    if(!valid()) return;
    const template=grid.children[1] || grid.children[0];
    const card=template.cloneNode(true);
    const info=[...card.querySelectorAll("p")];
    const strong=info.find((p)=>p.classList.contains("font-semibold"));
    const meta=info.find((p)=>p.classList.contains("text-muted-foreground"));
    if(strong) strong.textContent=`${fields[0].value.trim()} •••• ${fields[1].value}`;
    if(meta) meta.textContent=`${fields[3].value.trim()} · Expires ${fields[2].value.trim()}`;
    configureCard(card,false);
    grid.append(card);
    fields.forEach((f)=>{f.value="";}); updateValid(); closeDialog(dialog);
  });
  updateValid();
}

function initBillingExport(){
  if(route()!=="/billing/history") return;
  const btn=buttonByText(document,"Export"); if(!btn) return;
  btn.addEventListener("click",()=>{
    const rows=[...document.querySelectorAll("tbody tr")].map((tr)=>[...tr.querySelectorAll("td")].map((td)=>`"${td.textContent.trim().replaceAll('"','""')}"`).join(","));
    const header=[...document.querySelectorAll("thead th")].map((th)=>`"${th.textContent.trim().replaceAll('"','""')}"`).join(",");
    const blob=new Blob([[header,...rows].join("\n")],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a");
    a.href=url; a.download="billing-history.csv"; a.hidden=true; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),0);
    btn.dataset.exported="true";
  });
}

const basePlans={
  Starter:{monthly:29,annual:290}, Growth:{monthly:79,annual:790}, Scale:{monthly:149,annual:1490}
};
function initBillingPlans(){
  const r=route(); if(!["/billing/plans","/billing/upgrade","/billing/downgrade"].includes(r)) return;
  const root=document.querySelector("#main-content"); if(!root) return;
  const intent=r.split("/").at(-1)==="plans"?"plans":r.split("/").at(-1);
  const cadence=[...root.querySelectorAll("p")].find((p)=>p.textContent.trim()==="Billing cadence")?.closest("div.rounded-xl");
  const sw=cadence?.querySelector("[data-switch]");
  const cards=[...root.querySelectorAll("h3")].map((h)=>h.closest(".rounded-lg.border.border-border.bg-card")).filter(Boolean);
  let cycle=sw?.getAttribute("aria-checked")==="true"?"annual":"monthly";
  let selected=null;
  const planData=new WeakMap();
  cards.forEach((card)=>{
    const name=card.querySelector("h3")?.textContent.trim();
    const annualText=[...card.querySelectorAll("p")].find((p)=>p.textContent.includes("billed annually"));
    const annual=basePlans[name]?.annual || parseMoney(annualText?.textContent);
    const monthly=basePlans[name]?.monthly || Math.round(annual/10);
    planData.set(card,{name,monthly,annual,current:card.textContent.includes("Current")});
  });
  const clearExistingPanel=()=>root.querySelector('[data-d2-plan-selection="true"]')?.remove();
  function priceNodes(card){
    const ps=[...card.querySelectorAll("p")];
    return {price:ps.find((p)=>p.classList.contains("text-3xl")&&p.textContent.includes("/ month")), bill:ps.find((p)=>p.classList.contains("text-compact")&&(p.textContent.includes("billed annually")||p.textContent.includes("Billed monthly")))};
  }
  function updatePrices(){
    cards.forEach((card)=>{
      const d=planData.get(card); if(!d)return; const n=priceNodes(card); const equiv=cycle==="annual"?Math.round(d.annual/12):d.monthly;
      if(n.price) n.price.innerHTML=`${currency(equiv)}<span class="text-sm font-medium text-muted-foreground"> / month</span>`;
      if(n.bill) n.bill.textContent=cycle==="annual"?`${currency(d.annual)} billed annually`:"Billed monthly";
    });
    if(cadence){ const spans=[...cadence.querySelectorAll("span")].filter((s)=>["Monthly","Annual"].includes(s.textContent.trim())); spans.forEach((s)=>{const active=s.textContent.trim().toLowerCase()===cycle;s.className=active?"font-semibold":"text-muted-foreground";}); }
  }
  function resetButtons(){
    cards.forEach((card)=>{
      const d=planData.get(card); const b=[...card.querySelectorAll("button")].find((x)=>x.classList.contains("w-full")); if(!d||!b)return;
      b.disabled=d.current&&intent==="plans";
      if(selected===card){ b.textContent="Selected"; return; }
      if(intent==="upgrade") b.textContent="Choose upgrade";
      else if(intent==="downgrade") b.textContent="Choose plan";
      else b.textContent=d.current?"Current plan":"Select plan";
    });
  }
  function showSelection(card){
    selected=card; clearExistingPanel(); resetButtons();
    const panel=document.createElement("div"); panel.dataset.d2PlanSelection="true";
    panel.className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between";
    panel.innerHTML='<div><p class="text-sm font-semibold">Plan selection ready</p><p class="mt-1 text-sm text-muted-foreground">Review proration, effective date and provider confirmation before applying the subscription change.</p></div>';
    const clear=actionButton("Clear selection"); clear.classList.remove("h-9"); clear.classList.add("h-10");
    clear.addEventListener("click",()=>{selected=null;panel.remove();resetButtons();}); panel.append(clear);
    const grid=card.parentElement; grid?.after(panel);
  }
  cards.forEach((card)=>{const b=[...card.querySelectorAll("button")].find((x)=>x.classList.contains("w-full"));b?.addEventListener("click",()=>{if(!b.disabled)showSelection(card);});});
  sw?.addEventListener("vexlora:change",(e)=>{cycle=e.detail?.checked?"annual":"monthly";updatePrices();});
  updatePrices(); resetButtons();

  if(intent!=="plans") return;
  const title=[...root.querySelectorAll("h2")].find((h)=>h.textContent.trim()==="Add subscription plan"); const dialog=title?.closest("[data-dialog]"); if(!dialog)return;
  const fields=[...dialog.querySelectorAll("input,textarea")]; const create=buttonByText(dialog,"Create plan"), cancel=buttonByText(dialog,"Cancel");
  const valid=()=>fields[0]?.value.trim() && Number(fields[2]?.value)>0 && Number(fields[3]?.value)>0;
  const validUpdate=()=>{if(create)create.disabled=!valid();}; fields.forEach((f)=>f.addEventListener("input",validUpdate)); cancel?.addEventListener("click",()=>closeDialog(dialog));
  create?.addEventListener("click",()=>{
    if(!valid())return; const template=cards.find((c)=>!planData.get(c)?.current)||cards[0]; const card=template.cloneNode(true);
    const h=card.querySelector("h3"); if(h)h.textContent=fields[0].value.trim();
    const desc=[...card.querySelectorAll("p")].find((p)=>p.classList.contains("text-sm")&&p.classList.contains("leading-5")); if(desc)desc.textContent=fields[1]?.value.trim()||"Flexible plan for a defined customer segment.";
    const badges=[...card.querySelectorAll("span.inline-flex.rounded-full")]; if(badges[0]){badges[0].textContent="Available";badges[0].className=badgeClass("backup");}
    const lis=card.querySelectorAll("li"); [fields[4]?.value||"10 included",fields[5]?.value||"100 GB",fields[6]?.value||"250k / month"].forEach((v,i)=>{if(lis[i]){const svg=lis[i].querySelector("svg");lis[i].textContent="";if(svg)lis[i].append(svg);lis[i].append(v);}});
    const d={name:fields[0].value.trim(),monthly:Number(fields[2].value),annual:Number(fields[3].value),current:false}; planData.set(card,d); cards.push(card);
    const b=[...card.querySelectorAll("button")].find((x)=>x.classList.contains("w-full")); if(b){b.disabled=false;b.textContent="Select plan";b.addEventListener("click",()=>showSelection(card));}
    template.parentElement?.append(card); fields.forEach((f)=>{f.value="";}); validUpdate(); closeDialog(dialog); updatePrices();
  });
  validUpdate();
}

function initBillingCancellation(){
  if(route()!=="/billing/subscription") return;
  const title=[...document.querySelectorAll("h2")].find((h)=>["Cancel subscription?","Cancellation scheduled"].includes(h.textContent.trim())); const dialog=title?.closest("[data-dialog]"); if(!dialog)return;
  const schedule=buttonByText(dialog,"Schedule cancellation"); if(!schedule)return;
  schedule.addEventListener("click",()=>{
    title.textContent="Cancellation scheduled";
    const desc=title.parentElement?.querySelector("p"); if(desc)desc.textContent="The subscription will remain active until the end of the current billing period. Connect this action to your provider cancellation API before production use.";
    schedule.textContent="Done"; schedule.className=schedule.className.replace(/bg-destructive[^ ]*|text-destructive-foreground|hover:bg-destructive[^ ]*/g,"").trim();
  });
}

function initAccountSecurity(){
  const r=route(); if(!["/account/security/devices","/account/security/sessions"].includes(r)) return;
  const root=document.querySelector("#main-content"); if(!root)return;
  const activeLabel=[...root.querySelectorAll("p")].find((p)=>p.textContent.trim()==="Active"); const activeValue=activeLabel?.parentElement?.querySelector("h3");
  const listTitle=[...root.querySelectorAll("h3")].find((h)=>["Signed-in sessions","Recognized devices"].includes(h.textContent.trim())); const card=listTitle?.closest(".rounded-lg.border.border-border.bg-card"); const list=card?.querySelector(".space-y-3");
  if(!list)return;
  [...list.children].forEach((item)=>{
    const revoke=buttonByText(item,"Revoke");
    revoke?.addEventListener("click",()=>{item.remove();if(activeValue){const n=Math.max(0,Number(activeValue.textContent.trim())-1);activeValue.textContent=String(n);}});
  });
}


function setButtonVariant(button, active){
  if(!button) return;
  const base="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-[background-color,color,border-color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 h-10 px-4";
  button.className=active?`${base} bg-primary text-primary-foreground shadow-xs hover:bg-primary/90`:`${base} border border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`;
}
function setSelectValue(root,value){
  if(!root) return;
  const option=[...root.querySelectorAll('[data-select-option]')].find((o)=>(o.dataset.value||o.textContent.trim())===value);
  root.dataset.value=value;
  root.querySelectorAll('[data-select-option]').forEach((o)=>o.setAttribute('aria-selected',String(o===option)));
  const label=root.querySelector('[data-select-value]'); if(label&&option) label.textContent=option.dataset.label||option.textContent.trim();
}
function bindRouteSelect(root,onChange){
  if(!root||root.dataset.d2Bound==='true') return;
  root.dataset.d2Bound='true';
  const trigger=root.querySelector('[data-select-trigger]'), panel=root.querySelector('[data-select-panel]'); if(!trigger||!panel)return;
  trigger.addEventListener('click',()=>{panel.hidden=!panel.hidden;trigger.setAttribute('aria-expanded',String(!panel.hidden));});
  const close=()=>{panel.hidden=true;trigger.setAttribute('aria-expanded','false');};
  root.addEventListener('click',(e)=>{const option=e.target.closest('[data-select-option]');if(!option)return;const value=option.dataset.value||option.textContent.trim();setSelectValue(root,value);close();trigger.focus();onChange?.(value);});
  root.addEventListener('keydown',(e)=>{
    const options=[...panel.querySelectorAll('[data-select-option]')].filter(o=>!o.disabled);
    if(e.key==='Escape'){e.preventDefault();close();trigger.focus();return;}
    if(e.key==='Tab'){close();return;}
    if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key)||!options.length)return;
    e.preventDefault();panel.hidden=false;trigger.setAttribute('aria-expanded','true');
    const current=options.indexOf(document.activeElement);
    const next=e.key==='Home'?0:e.key==='End'?options.length-1:e.key==='ArrowDown'?(current+1)%options.length:(current-1+options.length)%options.length;
    options[next].focus();
  });
}
function fieldError(control,message){
  if(!control) return false;
  const wrap=control.closest('.grid.gap-2')||control.parentElement; let node=wrap?.querySelector('[data-d2-field-error]');
  if(message){control.setAttribute('aria-invalid','true');if(!node&&wrap){node=document.createElement('p');node.dataset.d2FieldError='true';node.className='text-compact leading-5 text-destructive';wrap.append(node);}if(node)node.textContent=message;return false;}
  control.setAttribute('aria-invalid','false');node?.remove();return true;
}
function validEmail(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||''));}

function initFoundationI18n(){
  if(route()!=="/foundation/i18n-rtl") return;
  const root=document.querySelector('#main-content');if(!root)return;
  const locales=[['English','en','en-US','USD','ltr'],['العربية','ar','ar-SA','SAR','rtl'],['Deutsch','de','de-DE','EUR','ltr'],['Français','fr','fr-FR','EUR','ltr']];
  const translations={en:['Number','Currency','Date'],ar:['الرقم','العملة','التاريخ'],de:['Zahl','Währung','Datum'],fr:['Nombre','Devise','Date']};
  const activeClasses={locale:null,direction:null};
  function sampleCards(){return [...root.querySelectorAll('.rounded-lg.border.border-border.bg-card')].filter((c)=>{const t=c.querySelector('h3')?.textContent.trim();return ['number','currency','date','Number','Currency','Date','الرقم','العملة','التاريخ','Zahl','Währung','Datum','Nombre','Devise'].includes(t);});}
  function updateSamples(code,intl,currency){
    const cards=sampleCards(); const labels=translations[code]; const values=[new Intl.NumberFormat(intl).format(9876543.21),new Intl.NumberFormat(intl,{style:'currency',currency}).format(12590.4),new Intl.DateTimeFormat(intl,{dateStyle:'medium',timeZone:'UTC'}).format(new Date('2026-08-17T00:00:00Z'))];
    cards.forEach((card,i)=>{const h=card.querySelector('h3');const v=card.querySelector('.text-lg.font-bold');if(h)h.textContent=labels[i];if(v)v.textContent=values[i];});
  }
  function updateDirectionButtons(dir){['LTR','RTL'].forEach((name)=>setButtonVariant(buttonByText(root,name),name.toLowerCase()===dir));const audit=[...root.querySelectorAll('p')].find((x)=>x.textContent.includes('Directions · Current:'));if(audit)audit.textContent=`Directions · Current: ${dir.toUpperCase()}`;}
  locales.forEach(([label,code,intl,currency,dir])=>{const b=buttonByText(root,label);b?.addEventListener('click',()=>{setLocale(code);locales.forEach(([l,c])=>setButtonVariant(buttonByText(root,l),c===code));updateDirectionButtons(dir);updateSamples(code,intl,currency);});});
  ['LTR','RTL'].forEach((name)=>buttonByText(root,name)?.addEventListener('click',()=>{const dir=name.toLowerCase();setPresentation({direction:dir});updateDirectionButtons(dir);}));
  updateSamples('en','en-US','USD'); updateDirectionButtons(document.documentElement.dir||'ltr');
}

function initFoundationLayoutEngine(){
  if(route()!=="/foundation/layout-engine") return;
  const root=document.querySelector('#main-content'); if(!root)return;
  const presets={
    'Vertical':{navigation:'vertical',sidebar:'standard',contentWidth:'full',header:'sticky'},
    'Compact':{navigation:'vertical',sidebar:'compact',contentWidth:'full',header:'sticky'},
    'Mini Sidebar':{navigation:'vertical',sidebar:'mini',contentWidth:'full',header:'sticky'},
    'Horizontal':{navigation:'horizontal',sidebar:'standard',contentWidth:'full',header:'sticky'},
    'Boxed':{navigation:'vertical',sidebar:'standard',contentWidth:'boxed',header:'sticky'},
    'Full Width':{navigation:'vertical',sidebar:'standard',contentWidth:'full',header:'fixed'},
  };
  const presetButtons=[...root.querySelectorAll('button.group')].filter((b)=>Object.keys(presets).some((name)=>b.textContent.trim().startsWith(name)));
  const selects=[...root.querySelectorAll('[data-select]')];
  const mapping=['navigation','sidebar','contentWidth','header'];
  function same(a,b){return mapping.every((key)=>a[key]===b[key]);}
  function sync(state=getLayout()){
    presetButtons.forEach((b)=>{
      const name=Object.keys(presets).find((n)=>b.textContent.trim().startsWith(n));
      const active=Boolean(name&&same(state,presets[name]));
      b.setAttribute('aria-pressed',String(active));
      b.classList.toggle('border-primary',active); b.classList.toggle('bg-primary/5',active);
      const dot=b.querySelector('.flex.size-6.shrink-0.items-center.justify-center.rounded-full');
      if(dot){dot.classList.toggle('border-primary',active);dot.classList.toggle('bg-primary',active);dot.classList.toggle('text-primary-foreground',active);dot.innerHTML=active?iconSvg('Check','size-3.5'):'';}
    });
    mapping.forEach((key,i)=>setSelectValue(selects[i],state[key]));
    const sidebarTrigger=selects[1]?.querySelector('[data-select-trigger]'); if(sidebarTrigger)sidebarTrigger.disabled=state.navigation==='horizontal';
  }
  presetButtons.forEach((b)=>b.addEventListener('click',()=>{
    const name=Object.keys(presets).find((n)=>b.textContent.trim().startsWith(n)); if(!name)return;
    const state=setLayout(presets[name]); sync(state);
  }));
  selects.forEach((sel,i)=>sel.addEventListener('vexlora:select',(event)=>{
    const key=mapping[i],value=event.detail?.value; if(!key||!value)return;
    const state=setLayout({[key]:value}); sync(state);
  }));
  buttonByText(root,'Reset layout')?.addEventListener('click',()=>sync(resetLayout()));
  sync(getLayout());
}

function initFoundationAdvancedForms(){
  if(route()!=="/foundation/advanced-forms") return;
  const root=document.querySelector('#main-content');if(!root)return;
  const panel=(name)=>root.querySelector(`[data-tab-panel="${name}"]`);

  // Profile form: preserve the source defaults, validation/reset and live bio count.
  const profile=panel('validated')?.querySelector('form');
  if(profile){
    const defaults={firstName:'Ariana',lastName:'Morgan',email:'ariana.morgan@example.com',phone:'+1 415 555 0184',bio:'Product operations lead focused on scalable workflows and customer experience.'};
    const bio=profile.querySelector('textarea'); const count=[...profile.querySelectorAll('p')].find((x)=>/\d+\/240 characters/.test(x.textContent));
    const role=profile.querySelectorAll('[data-select]')[0],dept=profile.querySelectorAll('[data-select]')[1]; const sw=profile.querySelector('[data-switch]'),check=profile.querySelector('[data-checkbox]');
    const applyDefaults=()=>{Object.entries(defaults).forEach(([n,v])=>{const c=profile.querySelector(`[name="${n}"]`);if(c)c.value=v;});setSelectValue(role,'admin');setSelectValue(dept,'product');if(sw){sw.dataset.state='checked';sw.setAttribute('aria-checked','true');sw.querySelector('[data-switch-thumb]')?.setAttribute('data-state','checked');}if(check){check.dataset.state='unchecked';check.setAttribute('aria-checked','false');const i=check.querySelector('[data-indicator]');if(i)i.hidden=true;}if(count)count.textContent=`${bio?.value.length||0}/240 characters`;profile.querySelectorAll('[data-d2-field-error]').forEach((n)=>n.remove());};
    bio?.addEventListener('input',()=>{if(count)count.textContent=`${bio.value.length}/240 characters`;});
    buttonByText(profile,'Reset')?.addEventListener('click',applyDefaults);
    profile.addEventListener('submit',(e)=>{e.preventDefault();const f=(n)=>profile.querySelector(`[name="${n}"]`);let ok=true;ok=fieldError(f('firstName'),f('firstName')?.value.trim().length>=2?'':'Enter at least 2 characters.')&&ok;ok=fieldError(f('lastName'),f('lastName')?.value.trim().length>=2?'':'Enter at least 2 characters.')&&ok;ok=fieldError(f('email'),validEmail(f('email')?.value)?'':'Enter a valid email address.')&&ok;ok=fieldError(f('phone'),f('phone')?.value.trim().length>=7?'':'Enter a valid phone number.')&&ok;ok=fieldError(bio,(bio?.value.trim().length||0)<=240?'':'Keep the bio under 240 characters.')&&ok;if(ok)profile.dataset.d2Submitted='true';});
    applyDefaults();
  }

  // Project wizard: the static converter captures step 0; restore the two later client-state steps and completion state.
  const wizard=panel('wizard')?.querySelector('form');
  if(wizard){
    const stepper=wizard.querySelector('ol'), initialSection=wizard.querySelector('section'), actions=wizard.querySelector('.border-t.border-border');
    const state={step:0,data:{name:'Customer Portal Revamp',code:'CPR-26',description:'Refresh customer onboarding, billing and self-service workflows.',owner:'Ariana Morgan',priority:'high',startDate:'2026-08-18',dueDate:'2026-10-30',visibility:'team',notifyTeam:true}};
    const inputClass='flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background';
    const field=(label,name,value,type='text')=>`<div class="grid gap-2"><label class="text-sm font-medium leading-5 text-foreground">${label}</label><input class="${inputClass}" name="${name}" type="${type}" value="${value}"></div>`;
    const sectionHtml=(step)=> step===1?`<section class="grid gap-5 rounded-lg border border-border bg-card p-5 shadow-xs"><div class="grid gap-1"><h3 class="text-base font-semibold text-card-foreground">Planning</h3><p class="text-sm leading-5 text-muted-foreground">Date and ownership controls use the same form contract as text inputs and selects.</p></div><div class="grid gap-5 md:grid-cols-2">${field('Owner','owner',state.data.owner)}<div class="grid gap-2"><label class="text-sm font-medium leading-5 text-foreground">Priority</label><select name="priority" class="${inputClass}"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>${field('Start date','startDate',state.data.startDate,'date')}${field('Due date','dueDate',state.data.dueDate,'date')}</div></section>`:`<section class="grid gap-5 rounded-lg border border-border bg-card p-5 shadow-xs"><div class="grid gap-1"><h3 class="text-base font-semibold text-card-foreground">Access & notifications</h3><p class="text-sm leading-5 text-muted-foreground">Conditional business settings stay inside the same validated payload.</p></div><div class="grid gap-2"><label class="text-sm font-medium leading-5 text-foreground">Visibility</label><select name="visibility" class="${inputClass}"><option value="private">Private</option><option value="team">Project team</option><option value="organization">Entire organization</option></select></div><div class="flex items-center justify-between gap-4 rounded-lg border border-border p-4"><div><p class="text-sm font-medium">Notify team</p><p class="text-compact leading-5 text-muted-foreground">Send a sample notification when the project is created.</p></div><button type="button" role="switch" data-d2-wizard-switch aria-checked="${state.data.notifyTeam}" class="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-muted data-[state=checked]:bg-primary" data-state="${state.data.notifyTeam?'checked':'unchecked'}"><span class="pointer-events-none block size-5 rounded-full bg-background shadow-sm transition-transform data-[state=checked]:translate-x-5" data-state="${state.data.notifyTeam?'checked':'unchecked'}"></span></button></div></section>`;
    function capture(){wizard.querySelectorAll('input,textarea,select').forEach((c)=>{if(c.name)state.data[c.name]=c.value;});const ws=wizard.querySelector('[data-d2-wizard-switch]');if(ws)state.data.notifyTeam=ws.getAttribute('aria-checked')==='true';}
    function updateStepper(complete=false){[...stepper?.querySelectorAll('li')||[]].forEach((li,i)=>{const dot=li.querySelector('span');if(!dot)return;const done=i<state.step||complete,cur=i===state.step&&!complete;dot.className=`flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${done||cur?'border-primary bg-primary text-primary-foreground':'border-border bg-muted text-muted-foreground'}`;dot.textContent=done?'✓':String(i+1);});}
    function render(){wizard.querySelector('[data-d2-wizard-complete]')?.remove();let sec=wizard.querySelector('section');if(state.step===0){if(sec!==initialSection){sec?.replaceWith(initialSection);}initialSection.hidden=false;Object.entries(state.data).forEach(([n,v])=>{const c=initialSection.querySelector(`[name="${n}"]`);if(c&&typeof v==='string')c.value=v;});}else{const tmp=document.createElement('div');tmp.innerHTML=sectionHtml(state.step);const next=tmp.firstElementChild;sec?.replaceWith(next);if(state.step===1)next.querySelector('[name="priority"]').value=state.data.priority;if(state.step===2)next.querySelector('[name="visibility"]').value=state.data.visibility;next.querySelector('[data-d2-wizard-switch]')?.addEventListener('click',(e)=>{const b=e.currentTarget;const checked=b.getAttribute('aria-checked')!=='true';b.setAttribute('aria-checked',String(checked));b.dataset.state=checked?'checked':'unchecked';b.querySelector('span').dataset.state=b.dataset.state;state.data.notifyTeam=checked;});}
      actions.hidden=false;const prev=buttonByText(actions,'Previous');prev.disabled=state.step===0;const primary=[...actions.querySelectorAll('button')].find((b)=>b!==prev);primary.textContent=state.step<2?'Continue':'Create project';primary.type=state.step<2?'button':'submit';updateStepper(false);}
    function validateStep(){capture();let ok=true;if(state.step===0){ok=fieldError(wizard.querySelector('[name="name"]'),state.data.name.trim().length>=3?'':'Project name is required.')&&ok;ok=fieldError(wizard.querySelector('[name="code"]'),state.data.code.trim().length>=2&&state.data.code.trim().length<=12?'':'Project code is required.')&&ok;ok=fieldError(wizard.querySelector('[name="description"]'),state.data.description.trim().length>=12?'':'Add a short project description.')&&ok;}else if(state.step===1){ok=fieldError(wizard.querySelector('[name="owner"]'),state.data.owner.trim().length>=2?'':'Choose an owner.')&&ok;ok=fieldError(wizard.querySelector('[name="startDate"]'),state.data.startDate?'':'Select a start date.')&&ok;ok=fieldError(wizard.querySelector('[name="dueDate"]'),state.data.dueDate?'':'Select a due date.')&&ok;}return ok;}
    buttonByText(actions,'Previous')?.addEventListener('click',()=>{capture();state.step=Math.max(0,state.step-1);render();});
    [...actions.querySelectorAll('button')].find((b)=>b!==buttonByText(actions,'Previous'))?.addEventListener('click',(e)=>{if(state.step<2){e.preventDefault();if(validateStep()){state.step++;render();}}});
    wizard.addEventListener('submit',(e)=>{e.preventDefault();capture();if(state.step!==2)return;wizard.querySelector('section')?.remove();actions.hidden=true;const box=document.createElement('div');box.dataset.d2WizardComplete='true';box.className='grid min-h-64 place-items-center rounded-lg border border-success/30 bg-success/5 p-6 text-center';box.innerHTML='<div class="grid max-w-md justify-items-center gap-3"><span class="grid size-12 place-items-center rounded-full bg-success/10 text-success">✓</span><h3 class="text-lg font-semibold">Project configured</h3><p class="text-sm leading-5 text-muted-foreground">The sample wizard validated all steps. Connect the final payload to your API when integrating Vexlora.</p><button type="button" class="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-semibold shadow-xs hover:bg-accent">Start again</button></div>';stepper?.after(box);box.querySelector('button')?.addEventListener('click',()=>{box.remove();state.step=0;Object.assign(state.data,{name:'Customer Portal Revamp',code:'CPR-26',description:'Refresh customer onboarding, billing and self-service workflows.',owner:'Ariana Morgan',priority:'high',startDate:'2026-08-18',dueDate:'2026-10-30',visibility:'team',notifyTeam:true});stepper?.after(initialSection);render();});updateStepper(true);});
    render();
  }

  // Repeater form: restore useFieldArray-like add/remove/reset behavior and source defaults.
  const repeater=panel('repeater')?.querySelector('form');
  if(repeater){
    const section=repeater.querySelector('section');const membersHeader=[...section.querySelectorAll('h4')].find((h)=>h.textContent.trim()==='Members')?.parentElement;const add=buttonByText(section,'Add member');const rowsContainer=membersHeader?.parentElement;
    const defaults=[['Ariana Morgan','ariana@example.com','lead'],['David Chen','david@example.com','member']];
    const rows=()=>[...rowsContainer?.children||[]].filter((x)=>x.classList.contains('lg:grid-cols-[1fr_1fr_12rem_auto]'));
    const template=rows()[0]?.cloneNode(true);
    let memberId=0;
    function configure(row,index,values=['','','member']){
      if(!row.dataset.memberScope){
        row.dataset.memberScope=String(++memberId);const ids=new Map();
        row.querySelectorAll('[id]').forEach(el=>{const old=el.id;el.id=old+'-member-'+memberId;ids.set(old,el.id);});
        row.querySelectorAll('[for],[aria-describedby],[aria-labelledby],[aria-controls]').forEach(el=>{
          for(const attr of ['for','aria-describedby','aria-labelledby','aria-controls'])if(el.hasAttribute(attr))el.setAttribute(attr,el.getAttribute(attr).split(/\s+/).map(id=>ids.get(id)||id).join(' '));
        });
      }
      const inputs=row.querySelectorAll('input');if(inputs[0]){inputs[0].name=`members.${index}.name`;inputs[0].value=values[0];}if(inputs[1]){inputs[1].name=`members.${index}.email`;inputs[1].value=values[1];}const sel=row.querySelector('[data-select]');setSelectValue(sel,values[2]);bindRouteSelect(sel);const rem=[...row.querySelectorAll('button')].find((b)=>b.querySelector('[data-icon="Trash2"]'))||[...row.querySelectorAll('button')].at(-1);if(rem){rem.disabled=rows().length<=1;rem.setAttribute('aria-label',`Remove member ${index+1}`);if(!rem.dataset.d2Remove){rem.dataset.d2Remove='true';rem.addEventListener('click',()=>{row.remove();refresh();});}}}
    function refresh(){rows().forEach((r,i)=>configure(r,i,[r.querySelectorAll('input')[0]?.value||'',r.querySelectorAll('input')[1]?.value||'',r.querySelector('[data-select]')?.dataset.value||'member']));rows().forEach((r)=>{const b=r.querySelector('[data-d2-remove]');if(b)b.disabled=rows().length<=1;});}
    function reset(){if(!template||!rowsContainer)return;rows().forEach((r)=>r.remove());defaults.forEach((v,i)=>{const r=template.cloneNode(true);rowsContainer.append(r);configure(r,i,v);});const team=repeater.querySelector('[name="teamName"]');if(team)team.value='Growth Operations';}
    add?.addEventListener('click',()=>{if(!template||!rowsContainer)return;const r=template.cloneNode(true);rowsContainer.append(r);configure(r,rows().length-1,['','','member']);refresh();});buttonByText(repeater,'Reset')?.addEventListener('click',reset);repeater.addEventListener('submit',(e)=>{e.preventDefault();repeater.dataset.d2Submitted='true';});reset();
  }

  // Conditional workflow: restore watched delivery/approval state and file selection UX.
  const conditional=panel('conditional')?.querySelector('form');
  if(conditional){
    const sections=conditional.querySelectorAll('section');const deliverySection=sections[0],attachSection=sections[1];const delivery=deliverySection.querySelector('[data-select]');const switcher=deliverySection.querySelector('[data-switch]');const scheduleWrap=deliverySection.querySelector('[name="scheduleDate"]')?.closest('.grid.gap-5.sm\\:grid-cols-2');const approvalWrap=deliverySection.querySelector('[name="approverEmail"]')?.closest('.grid.gap-2');const fileInput=attachSection?.querySelector('input[type="file"]'),drop=attachSection?.querySelector('button');let fileList=null;
    const sync=()=>{if(scheduleWrap)scheduleWrap.hidden=(delivery?.dataset.value||'scheduled')!=='scheduled';if(approvalWrap)approvalWrap.hidden=switcher?.getAttribute('aria-checked')!=='true';};
    setSelectValue(delivery,'scheduled');delivery?.addEventListener('vexlora:select',sync);switcher?.addEventListener('vexlora:change',sync);drop?.addEventListener('click',()=>fileInput?.click());
    fileInput?.addEventListener('change',()=>{fileList?.remove();fileList=document.createElement('ul');fileList.className='grid gap-2';[...fileInput.files].slice(0,5).forEach((f)=>{const li=document.createElement('li');li.className='flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm';li.innerHTML=`<span class="min-w-0 truncate font-medium"></span><span class="shrink-0 text-xs text-muted-foreground">${(f.size/1024).toFixed(1)} KB</span>`;li.querySelector('span').textContent=f.name;fileList.append(li);});attachSection?.append(fileList);});
    buttonByText(conditional,'Reset')?.addEventListener('click',()=>{setSelectValue(delivery,'scheduled');const d=deliverySection.querySelector('[name="scheduleDate"]'),t=deliverySection.querySelector('[name="scheduleTime"]'),a=deliverySection.querySelector('[name="approverEmail"]');if(d)d.value='2026-08-21';if(t)t.value='10:30';if(a)a.value='manager@example.com';if(switcher){switcher.dataset.state='checked';switcher.setAttribute('aria-checked','true');switcher.querySelector('[data-switch-thumb]')?.setAttribute('data-state','checked');}if(fileInput)fileInput.value='';fileList?.remove();fileList=null;sync();});
    conditional.addEventListener('submit',(e)=>{e.preventDefault();let ok=true;if((delivery?.dataset.value||'scheduled')==='scheduled'){const d=deliverySection.querySelector('[name="scheduleDate"]'),t=deliverySection.querySelector('[name="scheduleTime"]');ok=fieldError(d,d?.value?'':'Choose a delivery date.')&&ok;ok=fieldError(t,t?.value?'':'Choose a delivery time.')&&ok;}if(switcher?.getAttribute('aria-checked')==='true'){const a=deliverySection.querySelector('[name="approverEmail"]');ok=fieldError(a,validEmail(a?.value)?'':'Enter a valid approver email.')&&ok;}if(ok)conditional.dataset.d2Submitted='true';});sync();
  }
}

export function initPageInteractions(){
  initD2StatefulOperations();
  initD2AdminInteractions();
  initBillingPaymentMethods();
  initBillingExport();
  initBillingPlans();
  initBillingCancellation();
  initAccountSecurity();
  initFoundationI18n();
  initFoundationLayoutEngine();
  initFoundationAdvancedForms();
}
