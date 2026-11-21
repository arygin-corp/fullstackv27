import { shellData } from "./generated/shell-data.js";
import { escapeHtml, iconSvg, routeToHref } from "./ui.js";
let notifications=shellData.notifications.map((item)=>({...item}));
const tone={crm:'bg-info/10 text-info',payments:'bg-success/10 text-success',security:'bg-destructive/10 text-destructive',commerce:'bg-primary/10 text-primary',operations:'bg-warning/15 text-warning-foreground',ai:'bg-primary/10 text-primary',system:'bg-muted text-muted-foreground'};
const categoryIcon={crm:'UserRound',payments:'Circle',security:'Settings',commerce:'Circle',operations:'Circle',ai:'Sparkles',system:'Settings'};
function unread(){return notifications.filter((n)=>n.unread).length;}
function render(){
  const slot=document.querySelector('#notification-slot'); if(!slot)return; const count=unread(); const preview=notifications.slice(0,5);
  slot.innerHTML=`<div class="relative" data-dropdown><button type="button" data-dropdown-trigger aria-label="${count} unread notifications" class="relative inline-flex size-10 items-center justify-center rounded-lg hover:bg-accent">${iconSvg('Bell')}${count?'<span class="absolute end-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-card"></span>':''}</button><div hidden data-dropdown-panel class="absolute end-0 top-11 z-[70] w-80 rounded-xl border border-border bg-popover p-0 shadow-xl sm:w-96"><div class="flex items-center justify-between px-4 py-3"><div><p class="text-sm font-semibold">Realtime notifications</p><p class="text-xs text-muted-foreground">${count} unread · sample stream connected</p></div><button type="button" data-notifications-read-all class="min-h-9 rounded-lg px-2 text-xs font-semibold text-primary hover:bg-primary/10">Mark all read</button></div><div class="h-px bg-border"></div><div class="max-h-96 overflow-y-auto p-1.5">${preview.map((n)=>`<a href="${routeToHref(n.href)}" data-notification-id="${escapeHtml(n.id)}" class="flex w-full items-start gap-3 rounded-lg p-2.5 text-start hover:bg-accent"><span class="flex size-9 shrink-0 items-center justify-center rounded-lg ${tone[n.category]||tone.system}">${iconSvg(categoryIcon[n.category]||'Circle')}</span><span class="min-w-0 flex-1"><span class="flex items-center gap-2"><span class="truncate text-sm font-semibold">${escapeHtml(n.title)}</span>${n.unread?'<span class="size-1.5 shrink-0 rounded-full bg-primary"></span>':''}</span><span class="mt-0.5 block text-xs leading-4 text-muted-foreground">${escapeHtml(n.description)}</span><span class="mt-1 block text-xs font-medium text-muted-foreground">${escapeHtml(n.source)} · ${escapeHtml(n.time)}</span></span></a>`).join('')}</div><div class="h-px bg-border"></div><div class="p-2"><a href="${routeToHref('/apps/notifications')}" class="block rounded-lg px-3 py-2 text-center text-sm font-medium hover:bg-accent">View notification center</a></div></div></div>`;
}
export function initNotifications(){
  render();
  document.addEventListener('click',(event)=>{
    if(event.target.closest('[data-notifications-read-all]')){notifications=notifications.map((n)=>({...n,unread:false}));render();}
    const row=event.target.closest('[data-notification-id]'); if(row){const id=row.dataset.notificationId;notifications=notifications.map((n)=>n.id===id?{...n,unread:false}:n);}
  });
}
