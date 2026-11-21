import { escapeHtml, iconSvg } from "./ui.js";

function route(){ return document.body?.dataset.currentRoute || document.documentElement.dataset.currentRoute || ""; }
function byTitle(text){
  const title=[...document.querySelectorAll('#main-content h3')].find(el=>el.textContent.trim()===text);
  return title?.closest('.rounded-lg.border.border-border.bg-card') || title?.parentElement?.parentElement?.parentElement || null;
}
function selectRoots(root){ return [...(root?.querySelectorAll('[data-select]')||[])]; }
function selectValue(root){ return root?.dataset.value || root?.querySelector('[data-select-option][aria-selected="true"]')?.dataset.value || ''; }
function setSelect(root,value){
  if(!root)return;
  let selected=null;
  root.querySelectorAll('[data-select-option]').forEach(option=>{
    const match=(option.dataset.value||option.textContent.trim())===value;
    option.setAttribute('aria-selected',String(match));
    if(match) selected=option;
  });
  root.dataset.value=value;
  const valueEl=root.querySelector('[data-select-value]');
  if(valueEl && selected) valueEl.textContent=selected.dataset.label||selected.textContent.trim();
}
function onSelect(root,callback){ root?.addEventListener('vexlora:select',event=>callback(event.detail?.value ?? selectValue(root))); }
function buttonByText(root,text){ return [...(root?.querySelectorAll('button')||[])].find(button=>button.textContent.replace(/\s+/g,' ').trim().includes(text)); }

const payoutBlueprints={
  'hosted-bank':{label:'Provider-hosted bank onboarding',category:'Bank account',recommended:true,fields:['Recipient / connected-account identity','Bank country','Settlement currency','Provider onboarding/session return URL'],handling:'Provider-hosted or embedded form collects account/routing/IBAN details; The admin stores only provider IDs, masked details and status.'},
  'manual-bank':{label:'Manual bank fallback',category:'Bank account',recommended:false,fields:['Account holder name','Bank country','Currency','IBAN or routing + account number','SWIFT/BIC when required'],handling:'Only use with buyer-owned encrypted server storage/tokenization and country-specific validation. Sample fields must never persist sensitive values in browser storage.'},
  paypal:{label:'PayPal destination / partner onboarding',category:'PayPal',recommended:true,fields:['PayPal email or merchant identifier','Partner/merchant onboarding status','Currency','Payout capability'],handling:'Marketplace sellers should use provider onboarding/OAuth where supported; simple Payouts use a provider-supported recipient identifier such as email.'},
  'debit-card':{label:'Eligible payout debit card',category:'Card payout',recommended:true,fields:['Provider-hosted card collection','Token / external-account ID','Country','Currency','Instant-payout eligibility'],handling:'Never place raw card-number/CVV fields in the admin payout form. Collect through provider-hosted/tokenized UI and retain only the resulting token/reference.'},
  'virtual-bank':{label:'Wise / Payoneer / Revolut receiving account',category:'Bank account',recommended:true,fields:['Receiving-account country','Routing/IBAN details','Account holder','Supported receiving currency'],handling:'Treat the virtual receiving account as bank-transfer coordinates when the payout program/provider supports it; do not invent a separate wallet rail unless there is a real API integration.'}
};
const fieldInputClass='flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50';
function checkCircle(){return '<svg aria-hidden="true" class="mt-0.5 size-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';}
function blueprintExtra(id){
  if(id==='manual-bank'){
    const f=(label,placeholder)=>`<div class="grid gap-2"><label class="text-sm font-medium leading-none">${label}</label><input class="${fieldInputClass}" placeholder="${placeholder}"></div>`;
    return `<div data-d2-payment-blueprint-extra class="grid gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4"><p class="text-sm font-semibold">Manual bank form blueprint</p><div class="grid gap-3 sm:grid-cols-2">${f('Account holder','Legal account holder')}${f('Bank name','Bank / institution')}${f('IBAN or routing number','Server-tokenized value')}${f('Account number','Server-tokenized value')}</div>${f('SWIFT / BIC (when required)','Country/rail dependent')}<p class="text-compact leading-5 text-muted-foreground">These inputs are a visual blueprint only. A production implementation must submit directly to the buyer's secure server/provider adapter and must not persist raw values in localStorage/sessionStorage/static source.</p></div>`;
  }
  if(id==='debit-card') return `<div data-d2-payment-blueprint-extra class="rounded-xl border border-primary/20 bg-primary/[0.03] p-4 text-sm"><div class="flex gap-3"><span class="mt-0.5 size-4 shrink-0 text-primary">${iconSvg('Check','size-4')}</span><div><p class="font-semibold">No raw card-number/CVV fields here</p><p class="mt-1 text-compact leading-5 text-muted-foreground">Open the provider's hosted/tokenized card collection and return only an external-account/payment-method token plus masked last four digits.</p></div></div></div>`;
  return '';
}
function initPaymentAccounts(){
  if(route()!=='/payments/accounts')return;
  const card=byTitle('Add / change payout destination'); if(!card)return;
  const content=card.querySelector(':scope > div:last-child')||card;
  const selects=selectRoots(card), [recipientSel,methodSel,countrySel,currencySel]=selects;
  const onboarding=buttonByText(card,'Create sample onboarding session');
  const contract=[...card.querySelectorAll('.rounded-xl.border.border-border.p-4')].find(el=>el.textContent.includes('Provider-hosted bank onboarding'));
  if(!contract||!onboarding)return;
  const clearPreview=()=>card.querySelector('[data-d2-payment-onboarding-result]')?.remove();
  const render=()=>{
    const id=selectValue(methodSel)||'hosted-bank', b=payoutBlueprints[id]||payoutBlueprints['hosted-bank'];
    const recipient=selectValue(recipientSel)||'Marketplace seller', country=selectValue(countrySel)||'United States', currency=selectValue(currencySel)||'USD';
    contract.innerHTML=`<div class="flex flex-wrap items-start justify-between gap-3"><div><p class="text-sm font-semibold">${escapeHtml(b.label)}</p><p class="mt-1 text-compact text-muted-foreground">${escapeHtml(b.category)} · ${escapeHtml(recipient)} · ${escapeHtml(country)} · ${escapeHtml(currency)}</p></div><span class="inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium leading-4 ${b.recommended?'bg-success/10 text-success':'bg-warning/15 text-warning-foreground dark:text-warning'}">${b.recommended?'Recommended':'Fallback only'}</span></div><div class="mt-4 grid gap-2">${b.fields.map(field=>`<div class="flex gap-2 text-sm">${checkCircle()}<span>${escapeHtml(field)}</span></div>`).join('')}</div><p class="mt-4 text-compact leading-5 text-muted-foreground">${escapeHtml(b.handling)}</p>`;
    card.querySelector('[data-d2-payment-blueprint-extra]')?.remove();
    const extra=blueprintExtra(id); if(extra) contract.insertAdjacentHTML('afterend',extra);
  };
  [recipientSel,countrySel,currencySel].forEach(sel=>onSelect(sel,render));
  onSelect(methodSel,()=>{clearPreview();render();});
  onboarding.addEventListener('click',()=>{
    clearPreview();
    onboarding.insertAdjacentHTML('afterend','<div data-d2-payment-onboarding-result class="rounded-lg border border-success/30 bg-success/5 p-3 text-sm"><p class="font-semibold text-success">Sample onboarding contract ready</p><p class="mt-1 text-compact text-muted-foreground">No provider call was made. Production backend would create the provider onboarding/tokenization session and return a short-lived client URL/token.</p></div>');
  });
  render();
}

function initPaymentLinkBuilder(){
  if(!['/payments/checkout','/payments/domain-flows','/payments/payout-routing','/payments/routing'].includes(route()))return;
  document.querySelectorAll('#main-content h3').forEach(title=>{
    if(title.textContent.trim()!=='Payment-link builder')return;
    const card=title.closest('.rounded-lg.border.border-border.bg-card'); if(!card)return;
    const selects=selectRoots(card), sourceSel=selects[0], currencySel=selects[1];
    const reference=card.querySelector('#payment-link-reference'), amount=card.querySelector('#payment-link-amount');
    const regenerate=buttonByText(card,'Regenerate');
    const previewLine=[...card.querySelectorAll('p')].find(p=>p.textContent.trim().startsWith('Preview ·'));
    const code=card.querySelector('code.mt-1.block'); let version=1;
    const render=()=>{
      const source=selectValue(sourceSel)||'CRM invoice', currency=selectValue(currencySel)||'USD';
      const ref=reference?.value??'', money=amount?.value??'';
      const slug=`${source}-${ref}-${version}`.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      if(previewLine)previewLine.textContent=`Preview · ${currency} ${money}`;
      if(code)code.textContent=`pay.example.test/sample/${slug}`;
    };
    onSelect(sourceSel,render);onSelect(currencySel,render);reference?.addEventListener('input',render);amount?.addEventListener('input',render);
    regenerate?.addEventListener('click',()=>{version+=1;render();});
    render();
  });
}

const providerBlueprints={
  Stripe:{auth:'Publishable key + secret key',account:'Account / connected-account context',webhook:'Endpoint + signing secret',required:['Business country','Settlement currency','API keys','Webhook signing secret'],capabilities:['Payments','Payment methods','Refunds','Disputes','Subscriptions','Payout events']},
  PayPal:{auth:'Client ID + client secret',account:'REST app / merchant context',webhook:'Webhook URL + webhook ID',required:['Sandbox/live app','Client ID','Client secret','Webhook URL'],capabilities:['Orders','Checkout','Cards / PayPal','Refunds','Subscriptions','Payout events']},
  Adyen:{auth:'API credential / API key',account:'Merchant account / store',webhook:'Standard + payment-method webhooks',required:['Merchant account','API credential','Store/business line','Webhook config'],capabilities:['Global methods','Local methods','Routing','Refunds','Disputes','Transfers']},
  'Checkout.com':{auth:'Secret key / OAuth',account:'Entity / sub-entity context',webhook:'Webhook endpoint + signature verification',required:['Platform/entity account','Secret credential reference','Webhook endpoint','Enabled markets'],capabilities:['Payments','Payment instruments','Sub-entities','Payout schedules','Refunds','Provider events']},
  Worldpay:{auth:'Server credential / API key',account:'Merchant account / environment context',webhook:'Webhook endpoint + signature verification',required:['Merchant account','Server credential reference','Return URLs','Webhook endpoint'],capabilities:['Hosted checkout','Cards','Wallets','Local methods','Refunds','Provider events']},
  Razorpay:{auth:'Key ID + key secret',account:'Merchant account',webhook:'Webhook URL + webhook secret',required:['Key ID','Key secret','Webhook secret','Enabled local methods'],capabilities:['Cards','UPI','Netbanking','Refunds','Payment links','Provider events']},
  Mollie:{auth:'API key / OAuth access',account:'Profile / organization context',webhook:'Webhook URL',required:['Test/live API key or OAuth','Profile','Webhook URL','Enabled EU methods'],capabilities:['Cards','iDEAL','Bancontact','Refunds','Local methods','Provider events']},
  'Custom Gateway':{auth:'Buyer-defined server credential',account:'Buyer-defined merchant identifier',webhook:'Typed webhook adapter',required:['Base URL','Public/client identifier','Server secret','Webhook verification'],capabilities:['Typed adapter','Custom methods','Custom countries/currencies','Buyer-owned lifecycle']}
};
function initPaymentProviders(){
  if(route()!=='/payments/providers')return;
  const addCard=byTitle('Add provider connection'), contractCard=byTitle('Provider connection contract'); if(!addCard||!contractCard)return;
  const [providerSel,environmentSel]=selectRoots(addCard), test=buttonByText(addCard,'Test sample configuration');
  const renderContract=()=>{
    const provider=selectValue(providerSel)||'Stripe', b=providerBlueprints[provider]||providerBlueprints['Custom Gateway'];
    const header=contractCard.querySelector(':scope > div:first-child'); if(header){const desc=header.querySelector('p');if(desc)desc.textContent=`${b.auth} · ${b.account}`;}
    const content=contractCard.querySelector(':scope > div:last-child'); if(content) content.innerHTML=`<div><p class="text-sm font-semibold">Required configuration</p><div class="mt-3 grid gap-2">${b.required.map(item=>`<div class="flex gap-2 text-sm"><span class="mt-0.5 size-4 shrink-0 text-primary">${iconSvg('Settings','size-4')}</span><span>${escapeHtml(item)}</span></div>`).join('')}</div></div><div><p class="text-sm font-semibold">Typical capabilities</p><div class="mt-3 flex flex-wrap gap-2">${b.capabilities.map(item=>`<span class="inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium leading-4 border border-border bg-background text-foreground">${escapeHtml(item)}</span>`).join('')}</div><p class="mt-4 text-compact leading-5 text-muted-foreground">Webhook contract · ${escapeHtml(b.webhook)}</p></div>`;
  };
  const clearTest=()=>addCard.querySelector('[data-d2-provider-test]')?.remove();
  onSelect(providerSel,()=>{clearTest();renderContract();});onSelect(environmentSel,clearTest);
  test?.addEventListener('click',()=>{clearTest();const provider=selectValue(providerSel)||'Stripe', env=selectValue(environmentSel)||'Sandbox / test';test.insertAdjacentHTML('afterend',`<div data-d2-provider-test class="flex gap-3 rounded-lg border border-success/30 bg-success/5 p-3 text-sm"><span class="mt-0.5 size-4 shrink-0 text-success">${iconSvg('Check','size-4')}</span><div><p class="font-semibold">Sample validation passed</p><p class="mt-1 text-compact text-muted-foreground">${escapeHtml(provider)} · ${escapeHtml(env)}. No external API was called and no usable secret was entered or persisted.</p></div></div>`);});
  renderContract();
}

function initPaymentTransactions(){
  if(route()!=='/payments/transactions')return;
  const card=byTitle('Central payment register'); if(!card)return;
  const input=card.querySelector('input[placeholder^="Search payment"]'), [sourceSel,stateSel]=selectRoots(card), rows=[...card.querySelectorAll('tbody tr')];
  const apply=()=>{const q=(input?.value||'').toLowerCase(), source=selectValue(sourceSel)||'all', state=selectValue(stateSel)||'all';rows.forEach(row=>{const cells=row.querySelectorAll('td');const src=cells[1]?.querySelector('p.font-semibold')?.textContent.trim()||'';const status=cells[7]?.textContent.trim()||'';const matchQ=!q||row.textContent.toLowerCase().includes(q);row.hidden=!(matchQ&&(source==='all'||src===source)&&(state==='all'||status===state));});};
  input?.addEventListener('input',apply);onSelect(sourceSel,apply);onSelect(stateSel,apply);apply();
}

function draftCard(item){return `<div class="rounded-xl border border-dashed border-primary/40 p-4"><div class="flex items-start justify-between gap-3"><div><p class="font-semibold">${escapeHtml(item.name)}</p><p class="mt-1 text-compact text-muted-foreground">${escapeHtml(item.type)} · ${escapeHtml(item.provider)}</p></div><span class="inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium leading-4 bg-warning/15 text-warning-foreground dark:text-warning">Draft</span></div><p class="mt-3 text-xs">${escapeHtml(item.country)} · ${escapeHtml(item.currency)} · Recurring: ${escapeHtml(item.recurring)}</p></div>`;}
function initPaymentMethods(){
  if(route()!=='/payments/methods')return;
  const catalog=byTitle('Method catalog'), add=byTitle('Add payment method'); if(!catalog||!add)return;
  const catalogSel=selectRoots(catalog)[0], catalogGrid=catalog.querySelector(':scope > div:last-child');
  const methodCards=[...(catalogGrid?.children||[])];
  const applyFilter=()=>{const filter=selectValue(catalogSel)||'all';methodCards.forEach(card=>{const muted=[...card.querySelectorAll('p')].find(p=>p.classList.contains('text-muted-foreground')&&p.textContent.includes('·'));const type=(muted?.textContent.split('·')[0]||'').trim();card.hidden=filter!=='all'&&type!==filter;});};
  onSelect(catalogSel,applyFilter);applyFilter();
  const name=add.querySelector('#method-name'), market=add.querySelector('#market'), currency=add.querySelector('#currency'), sels=selectRoots(add), [typeSel,providerSel,recurringSel]=sels, addBtn=buttonByText(add,'Add sample method');
  currency?.addEventListener('input',()=>{const pos=currency.selectionStart;currency.value=currency.value.toUpperCase();try{currency.setSelectionRange(pos,pos)}catch{}});
  let savedCard=null,savedGrid=null;
  const ensureSaved=()=>{if(savedCard)return;const section=add.closest('section');section?.insertAdjacentHTML('afterend','<div data-d2-payment-saved-drafts class="rounded-lg border border-border bg-card text-card-foreground shadow-xs"><div class="flex flex-col gap-1.5 p-5 sm:p-6"><h3 class="text-base font-semibold leading-6 tracking-tight">Local sample drafts</h3><p class="text-sm leading-5 text-muted-foreground">Session-only previews for a buyer-defined payment-method catalog.</p></div><div data-d2-payment-saved-grid class="px-5 pb-5 sm:px-6 sm:pb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3"></div></div>');savedCard=document.querySelector('[data-d2-payment-saved-drafts]');savedGrid=savedCard?.querySelector('[data-d2-payment-saved-grid]');};
  addBtn?.addEventListener('click',()=>{const item={name:name?.value.trim()||'',type:selectValue(typeSel)||'Card / wallet',provider:selectValue(providerSel)||'Custom Gateway',country:market?.value||'Global / buyer-defined',currency:(currency?.value||'USD').toUpperCase(),recurring:selectValue(recurringSel)||'No'};if(!item.name)return;ensureSaved();savedGrid?.insertAdjacentHTML('afterbegin',draftCard(item));if(name)name.value='';if(market)market.value='Global / buyer-defined';if(currency)currency.value='USD';setSelect(typeSel,'Card / wallet');setSelect(providerSel,'Custom Gateway');setSelect(recurringSel,'No');});
}

export function initD2PaymentsInteractions(){
  initPaymentAccounts();
  initPaymentLinkBuilder();
  initPaymentProviders();
  initPaymentTransactions();
  initPaymentMethods();
}
