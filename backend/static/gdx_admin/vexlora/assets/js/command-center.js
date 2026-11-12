import { shellData } from "./generated/shell-data.js";
import { storageKeys } from "./config.js";
import { readJson, writeJson } from "./storage.js";
import { escapeHtml, getIconName, iconSvg, routeToHref } from "./ui.js";

let open=false, query='';
const registry=shellData.commandRegistry;
function normalize(v){return String(v??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
function searchCommands(q,limit=18){const nq=normalize(q);if(!nq)return registry.slice(0,limit);const terms=nq.split(/\s+/).filter(Boolean);return registry.map((c)=>{const title=normalize(c.title),group=normalize(c.group),keys=(c.keywords??[]).map(normalize),hay=normalize([c.title,c.description,c.group,c.kind,...(c.keywords??[])].join(' '));if(!terms.every((t)=>hay.includes(t)))return null;let score=0;for(const t of terms){if(title===t)score+=100;else if(title.startsWith(t))score+=60;else if(title.includes(t))score+=40;if(group.includes(t))score+=18;if(keys.some((k)=>k===t))score+=24;else if(keys.some((k)=>k.includes(t)))score+=12;}if(c.kind==='action')score+=3;return {...c,score};}).filter(Boolean).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title)).slice(0,limit);}
function ids(key){return readJson(key,[]).filter((v)=>typeof v==='string');}
function resolve(list){const map=new Map(registry.map((c)=>[c.id,c]));return list.map((id)=>map.get(id)).filter(Boolean);}
function markRecent(id){const list=ids(storageKeys.commandRecent);writeJson(storageKeys.commandRecent,[id,...list.filter((v)=>v!==id)].slice(0,6));}
function toggleFavorite(id){const list=ids(storageKeys.commandFavorites);writeJson(storageKeys.commandFavorites,list.includes(id)?list.filter((v)=>v!==id):[id,...list]);render();}
function row(c,fav){return `<div class="group flex items-start gap-2 rounded-lg px-2 py-1 hover:bg-accent"><a data-command-item="true" data-command-id="${escapeHtml(c.id)}" href="${routeToHref(c.href)}" class="flex min-w-0 flex-1 items-start gap-3 rounded-md px-2 py-2 outline-none focus:bg-accent"><span class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">${iconSvg(getIconName(c.icon))}</span><span class="min-w-0 flex-1"><span class="flex items-center gap-2"><span class="truncate text-sm font-semibold">${escapeHtml(c.title)}</span>${c.badge?`<span class="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">${escapeHtml(c.badge)}</span>`:''}</span><span class="mt-0.5 block truncate text-xs text-muted-foreground">${escapeHtml(c.description??'Open page')}</span><span class="mt-1 block text-[11px] font-medium text-muted-foreground">${escapeHtml(c.group)}</span></span></a><button type="button" data-command-favorite="${escapeHtml(c.id)}" aria-label="Toggle favorite" class="mt-2 inline-flex size-8 items-center justify-center rounded-md ${fav?'text-warning':'text-muted-foreground'} hover:bg-muted">${iconSvg('Star')}</button></div>`;}
function group(title,commands,favs){if(!commands.length)return '';return `<div><div class="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">${escapeHtml(title)}</div><div class="px-2">${commands.map((c)=>row(c,favs.includes(c.id))).join('')}</div></div>`;}
function render(){
  const dialog=document.querySelector('#command-center'); if(!dialog)return; dialog.hidden=!open;if(!open)return;
  const input=dialog.querySelector('[data-command-input]'); if(input && input.value!==query)input.value=query;
  const favIds=ids(storageKeys.commandFavorites), recentIds=ids(storageKeys.commandRecent); const favorites=resolve(favIds), recent=resolve(recentIds).filter((c)=>!favIds.includes(c.id));
  const body=dialog.querySelector('[data-command-results]');
  if(query.trim()){const results=searchCommands(query,shellData.commandLimits.search);body.innerHTML=results.length?group(`Results · ${results.length}`,results,favIds):`<div class="px-4 py-12 text-center text-sm text-muted-foreground">No pages, resources or actions matched “${escapeHtml(query)}”.</div>`;}
  else {body.innerHTML=`${group('Favorites',favorites,favIds)}${group('Recent',recent,favIds)}${group('Quick actions',shellData.quickActions.slice(0,3),favIds)}${group('Pages',shellData.pageCommands.slice(0,6),favIds)}`;}
  requestAnimationFrame(()=>input?.focus());
}
export function openCommandCenter(){open=true;render();}
export function closeCommandCenter(){open=false;query='';render();}
export function initCommandCenter(){
  document.addEventListener('click',(event)=>{
    if(event.target.closest('[data-command-open]'))openCommandCenter();
    if(event.target.closest('[data-command-close]')||event.target.id==='command-center-backdrop')closeCommandCenter();
    const fav=event.target.closest('[data-command-favorite]');if(fav){event.preventDefault();event.stopPropagation();toggleFavorite(fav.dataset.commandFavorite);}
    const item=event.target.closest('[data-command-item]');if(item)markRecent(item.dataset.commandId);
  });
  document.addEventListener('input',(event)=>{if(event.target.matches('[data-command-input]')){query=event.target.value;render();}});
  document.addEventListener('keydown',(event)=>{
    const editable=event.target instanceof HTMLInputElement||event.target instanceof HTMLTextAreaElement||event.target?.isContentEditable;
    if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();open?closeCommandCenter():openCommandCenter();return;}
    if(event.key==='Escape'&&open){event.preventDefault();closeCommandCenter();return;}
    if(event.altKey&&!event.ctrlKey&&!event.metaKey&&!editable){const map={c:'action:create-customer',p:'action:create-product',i:'action:create-invoice'};const id=map[event.key.toLowerCase()];const cmd=registry.find((c)=>c.id===id);if(cmd){event.preventDefault();markRecent(cmd.id);location.href=routeToHref(cmd.href);}}
    if(open&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){const items=[...document.querySelectorAll('#command-center [data-command-item="true"]')];if(!items.length)return;event.preventDefault();const current=items.indexOf(document.activeElement);let next=0;if(event.key==='ArrowDown')next=current<0?0:(current+1)%items.length;if(event.key==='ArrowUp')next=current<0?items.length-1:(current-1+items.length)%items.length;if(event.key==='Home')next=0;if(event.key==='End')next=items.length-1;items[next]?.focus();}
  });
}
