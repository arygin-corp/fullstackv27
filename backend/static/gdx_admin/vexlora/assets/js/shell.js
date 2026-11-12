import { navigationGroups, searchableNavigation, shellData } from "./generated/shell-data.js";
import { currentRoute, escapeHtml, getIconName, humanizeSegment, iconSvg, routeToHref } from "./ui.js";
import { getLayout, setLayout } from "./layout.js";
import { getTheme, setTheme } from "./theme.js";
import { closeMobileSidebar } from "./sidebar.js";

function matches(pathname, href){ return pathname===href || pathname.startsWith(`${href}/`); }
function allHrefs(items){ return (items??[]).flatMap((item)=>[...(item.href?[item.href]:[]),...allHrefs(item.children)]); }
function bestHref(pathname){ return navigationGroups.flatMap((group)=>allHrefs(group.items)).filter((href)=>matches(pathname,href)).sort((a,b)=>b.length-a.length)[0] ?? null; }
function isActive(item, activeHref){ return Boolean(activeHref && (item.href===activeHref || (item.children??[]).some((child)=>isActive(child,activeHref)))); }
function firstHref(item){ if(item.href) return item.href; for(const child of item.children??[]){const h=firstHref(child);if(h)return h;} return null; }
function navId(parts){ return parts.join("-").replace(/[^a-z0-9]+/gi,"-").toLowerCase(); }
function badge(text){ return text ? `<span class="ms-auto rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">${escapeHtml(text)}</span>`:""; }

function renderNested(items, activeHref, level, path){
  return `<div class="mt-1 flex flex-col gap-1 ${level===1?'ms-5 ps-3':'ms-3 ps-3'} border-s border-sidebar-border">${(items??[]).map((item,index)=>renderSidebarItem(item,activeHref,level,[...path,index])).join("")}</div>`;
}
function renderSidebarItem(item, activeHref, level=0, path=[]){
  const active=isActive(item,activeHref); const children=item.children??[]; const hasChildren=children.length>0; const icon=getIconName(item.icon); const id=navId([item.title,...path]);
  if(hasChildren){
    const href=firstHref(item); const open=active;
    return `<div class="nav-parent" data-nav-parent="${escapeHtml(id)}">
      <a href="${routeToHref(href)}" data-route="${escapeHtml(href)}" data-mini-menu-trigger="${escapeHtml(id)}" aria-expanded="${open}" class="group flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-start text-sm font-medium outline-none transition-colors ${active?'bg-sidebar-accent text-sidebar-accent-foreground':'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}">
        ${level===0?iconSvg(icon,"size-4 shrink-0"):''}<span class="sidebar-label min-w-0 flex-1 truncate">${escapeHtml(item.title)}</span>${iconSvg('ChevronDown',`sidebar-label size-4 shrink-0 text-muted-foreground ${open?'rotate-180':''}`)}
      </a>
      <div class="sidebar-nested sidebar-label" data-nav-panel="${escapeHtml(id)}" ${open?'':'hidden'}>${renderNested(children,activeHref,level+1,[...path,item.title])}</div>
      <div hidden data-mini-flyout="${escapeHtml(id)}" class="fixed z-[80] w-72 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-xl">${renderFlyout(children)}</div>
    </div>`;
  }
  if(!item.href) return '';
  const child=level>0;
  return `<a href="${routeToHref(item.href)}" data-route="${escapeHtml(item.href)}" class="group flex items-center text-sm outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${child?'min-h-9 gap-2 rounded-md px-2.5 py-2':'h-10 gap-3 rounded-lg px-3 font-medium'} ${active?'bg-sidebar-accent font-semibold text-sidebar-accent-foreground':child?'text-muted-foreground':'text-sidebar-foreground'}" ${active?'aria-current="page"':''}>${child?'<span class="size-1.5 shrink-0 rounded-full bg-current opacity-60"></span>':iconSvg(icon,"size-4 shrink-0")}<span class="sidebar-label min-w-0 flex-1 truncate">${escapeHtml(item.title)}</span>${badge(item.badge)}</a>`;
}
function renderFlyout(items, level=0){
  return (items??[]).map((item)=>{
    if(item.children?.length) return `<div class="px-2 py-1.5"><div class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">${escapeHtml(item.title)}</div><div class="mt-1">${renderFlyout(item.children,level+1)}</div></div>`;
    if(!item.href) return '';
    return `<a href="${routeToHref(item.href)}" data-route="${escapeHtml(item.href)}" class="block rounded-lg px-3 py-2 hover:bg-accent"><span class="block text-sm font-medium">${escapeHtml(item.title)}</span>${item.description?`<span class="mt-0.5 block text-xs leading-4 text-muted-foreground">${escapeHtml(item.description)}</span>`:''}</a>`;
  }).join('');
}
function renderSidebarNav(scope){
  const activeHref=bestHref(currentRoute());
  return `<nav aria-label="Primary navigation" class="flex flex-col gap-5 px-3 py-4">${navigationGroups.map((group)=>`<div class="flex flex-col gap-1.5"><p class="sidebar-group-label px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">${escapeHtml(group.label)}</p><div class="flex flex-col gap-1">${group.items.map((item,index)=>renderSidebarItem(item,activeHref,0,[scope,group.label,index])).join('')}</div></div>`).join('')}</nav>`;
}

function renderHorizontalItems(items, depth=0){
  return items.map((item)=>{
    if(item.children?.length) return `<div class="py-1"><div class="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">${escapeHtml(item.title)}</div>${renderHorizontalItems(item.children,depth+1)}</div>`;
    if(!item.href)return '';
    return `<a href="${routeToHref(item.href)}" data-route="${escapeHtml(item.href)}" class="flex flex-col items-start gap-0.5 rounded-lg px-3 py-2 hover:bg-accent"><span class="font-medium">${escapeHtml(item.title)}</span>${item.description?`<span class="text-xs text-muted-foreground">${escapeHtml(item.description)}</span>`:''}</a>`;
  }).join('');
}
function renderHorizontalNav(){
  const activeHref=bestHref(currentRoute());
  return navigationGroups.flatMap((group)=>group.items.map((item,index)=>{
    const active=isActive(item,activeHref); const children=item.children??[]; const icon=getIconName(item.icon);
    if(children.length){
      return `<div class="relative shrink-0" data-dropdown><button type="button" data-dropdown-trigger class="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium ${active?'bg-accent text-accent-foreground':'hover:bg-accent'}">${iconSvg(icon)}${escapeHtml(item.title)}${iconSvg('ChevronDown','size-3.5')}</button><div hidden data-dropdown-panel class="absolute start-0 top-11 z-[70] max-h-[70vh] w-72 overflow-y-auto rounded-xl border border-border bg-popover p-2 shadow-xl"><div class="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">${escapeHtml(group.label)}</div>${renderHorizontalItems(children)}</div></div>`;
    }
    if(!item.href) return '';
    return `<a href="${routeToHref(item.href)}" data-route="${escapeHtml(item.href)}" class="inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium ${active?'bg-accent text-accent-foreground':'hover:bg-accent'}">${iconSvg(icon)}${escapeHtml(item.title)}</a>`;
  })).join('');
}

function renderQuickCreate(){
  const items=shellData.quickActions.filter((c)=>c.id.startsWith('action:create-'));
  return `<div class="relative hidden xl:block" data-dropdown><button type="button" data-dropdown-trigger class="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm">${iconSvg('Plus')}Quick create</button><div hidden data-dropdown-panel class="absolute end-0 top-11 z-[70] w-60 rounded-xl border border-border bg-popover p-2 shadow-xl"><div class="px-3 py-2 text-xs font-semibold text-muted-foreground">Create</div>${items.map((c)=>`<a href="${routeToHref(c.href)}" data-route="${escapeHtml(c.href)}" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent">${iconSvg(getIconName(c.icon))}<span class="min-w-0 flex-1 truncate">${escapeHtml(c.title)}</span>${c.shortcut?`<span class="text-xs text-muted-foreground">${escapeHtml(c.shortcut)}</span>`:''}</a>`).join('')}</div></div>`;
}
function renderAppLauncher(){
  return `<div class="relative hidden md:block" data-dropdown><button aria-label="Open app launcher" type="button" data-dropdown-trigger class="inline-flex size-10 items-center justify-center rounded-lg hover:bg-accent">${iconSvg('Grid3X3')}</button><div hidden data-dropdown-panel class="absolute end-0 top-11 z-[70] w-80 rounded-xl border border-border bg-popover p-2 shadow-xl"><div class="px-2 py-2 text-sm font-semibold">Workspace apps</div><div class="grid grid-cols-2 gap-1">${shellData.shellApps.map((app)=>`<a href="${routeToHref(app.href)}" data-route="${escapeHtml(app.href)}" class="flex min-w-0 items-start gap-2.5 rounded-lg p-2.5 hover:bg-accent"><span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">${iconSvg(getIconName(app.icon))}</span><span class="min-w-0"><span class="block truncate text-sm font-semibold">${escapeHtml(app.title)}</span><span class="block text-xs leading-5 text-muted-foreground">${escapeHtml(app.description)}</span></span></a>`).join('')}</div></div></div>`;
}
function renderLanguageMenu(){
  return `<div class="relative hidden sm:block" data-dropdown><button type="button" data-dropdown-trigger aria-label="Language" class="inline-flex size-10 items-center justify-center rounded-lg hover:bg-accent">${iconSvg('Languages')}</button><div hidden data-dropdown-panel class="absolute end-0 top-11 z-[70] w-52 rounded-xl border border-border bg-popover p-2 shadow-xl"><div class="px-3 py-2 text-xs font-semibold text-muted-foreground">Language preview</div>${shellData.localeOptions.map((item)=>`<button type="button" data-locale-option="${item.code}" class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start hover:bg-accent"><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">${escapeHtml(item.nativeLabel)}</span><span class="block text-xs text-muted-foreground">${escapeHtml(item.label)} · ${item.direction.toUpperCase()}</span></span><span data-locale-check="${item.code}" hidden class="text-primary">${iconSvg('Check')}</span></button>`).join('')}</div></div>`;
}
function renderProfile(){
  const p=shellData.profile; const initials=`${p.firstName?.[0]??''}${p.lastName?.[0]??''}`.toUpperCase()||'AM';
  return `<div class="relative" data-dropdown><button type="button" data-dropdown-trigger aria-label="Open user menu" class="flex h-10 items-center gap-2 rounded-lg px-1.5 text-start hover:bg-accent sm:pe-2.5"><span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">${escapeHtml(initials)}</span><span class="hidden min-w-0 sm:block"><span class="block max-w-32 truncate text-sm font-semibold">${escapeHtml(p.displayName)}</span><span class="block max-w-32 truncate text-xs text-muted-foreground">${escapeHtml(p.jobTitle)}</span></span></button><div hidden data-dropdown-panel class="absolute end-0 top-11 z-[70] w-64 rounded-xl border border-border bg-popover p-2 shadow-xl"><div class="px-3 py-2"><span class="block text-sm font-semibold">${escapeHtml(p.displayName)}</span><span class="block truncate text-xs text-muted-foreground">${escapeHtml(p.email)}</span></div><div class="my-1 h-px bg-border"></div><a href="${routeToHref('/settings/account')}" data-route="/settings/account" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent">${iconSvg('UserRound')}My profile</a>${shellData.profileMenu.map((item)=>`<a href="${routeToHref(item.href)}" data-route="${escapeHtml(item.href)}" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent">${iconSvg(getIconName(item.icon))}${escapeHtml(item.title)}</a>`).join('')}<div class="my-1 h-px bg-border"></div><a href="${routeToHref('/auth/login')}" data-route="/auth/login" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-accent">${iconSvg('LogOut')}Sign out</a></div></div>`;
}
function renderBreadcrumbs(){
  const pathname=currentRoute();
  if(/^\/dashboard\/[^/]+\/?$/.test(pathname)) return '';
  const current=searchableNavigation.find((item)=>item.href===pathname);
  const fallback=shellData.routeGroups.find(([prefix])=>pathname===prefix || pathname.startsWith(`${prefix}/`))?.[1];
  const last=pathname.split('/').filter(Boolean).at(-1)||'Overview'; const group=current?.group??fallback; const title=current?.title??shellData.routeTitles[pathname]??humanizeSegment(last);
  if(!group)return '';
  return `<nav aria-label="Breadcrumb" class="min-w-0 text-xs text-muted-foreground"><ol class="flex min-w-0 items-center gap-2"><li class="hidden sm:inline-flex"><a class="hover:text-foreground" href="${routeToHref(shellData.product.homeHref)}">${escapeHtml(shellData.product.name)}</a></li><li class="hidden sm:block">/</li><li class="hidden sm:inline-flex">${escapeHtml(group)}</li><li class="hidden sm:block">/</li><li class="truncate font-medium text-foreground">${escapeHtml(title)}</li></ol></nav>`;
}

export function renderShell(){
  const sidebar=document.querySelector('#sidebar-nav'); if(sidebar) sidebar.innerHTML=renderSidebarNav('desktop');
  const mobile=document.querySelector('#mobile-sidebar-nav'); if(mobile) mobile.innerHTML=renderSidebarNav('mobile');
  document.querySelectorAll('#sidebar-nav a[data-route], #mobile-sidebar-nav a[data-route]').forEach(link=>{const label=link.querySelector('.sidebar-label')?.textContent.trim();if(label)link.setAttribute('aria-label',label);});
  const horizontal=document.querySelector('#horizontal-navigation'); if(horizontal) horizontal.innerHTML=renderHorizontalNav();
  const actions=document.querySelector('#topbar-actions'); if(actions) actions.innerHTML=`<button type="button" data-ai-open class="inline-flex h-9 items-center gap-2 rounded-lg bg-primary/10 px-3 text-sm font-semibold text-primary">${iconSvg('Sparkles')}<span class="hidden sm:inline">Ask AI</span></button>${renderQuickCreate()}${renderAppLauncher()}${renderLanguageMenu()}<button type="button" data-fullscreen-toggle aria-label="Enter fullscreen" class="hidden size-10 items-center justify-center rounded-lg hover:bg-accent xl:inline-flex">${iconSvg('Expand')}</button><div id="notification-slot"></div><button type="button" data-theme-toggle aria-label="Toggle theme" class="inline-flex size-10 items-center justify-center rounded-lg hover:bg-accent">${iconSvg(getTheme()==='dark'?'Sun':'Moon')}</button><button type="button" data-customizer-open aria-label="Open theme customizer" class="hidden size-10 items-center justify-center rounded-lg hover:bg-accent md:inline-flex">${iconSvg('Palette')}</button>${renderProfile()}`;
  const crumbs=document.querySelector('#shell-breadcrumbs'); if(crumbs){crumbs.innerHTML=renderBreadcrumbs(); crumbs.hidden=!crumbs.innerHTML; const row=document.querySelector('#shell-breadcrumb-row'); if(row) row.hidden=!crumbs.innerHTML;}
  const brandNames=document.querySelectorAll('[data-brand-name]'); brandNames.forEach((el)=>el.textContent=shellData.product.name);
  const brandMarks=document.querySelectorAll('[data-brand-mark]'); brandMarks.forEach((el)=>el.textContent=shellData.product.mark);
}

export function initShellInteractions(){
  document.addEventListener('click',(event)=>{
    const theme=event.target.closest('[data-theme-toggle]'); if(theme){ const dark=document.documentElement.classList.contains('dark'); setTheme(dark?'light':'dark'); theme.innerHTML=iconSvg(dark?'Moon':'Sun'); }
    const side=event.target.closest('[data-sidebar-toggle]'); if(side){ const current=getLayout(); setLayout({sidebar:current.sidebar==='mini'?'standard':'mini'}); side.innerHTML=iconSvg(current.sidebar==='mini'?'PanelLeftClose':'PanelLeftOpen'); }
    const locale=event.target.closest('[data-locale-option]'); if(locale){ document.dispatchEvent(new CustomEvent('vexlora:set-locale',{detail:locale.dataset.localeOption})); }
    if(event.target.closest('#mobile-sidebar-nav a[data-route]')) closeMobileSidebar();
    const miniTrigger=event.target.closest('[data-mini-menu-trigger]');
    if(miniTrigger && document.documentElement.dataset.sidebar==='mini' && document.documentElement.dataset.navigation==='vertical'){
      event.preventDefault(); const id=miniTrigger.dataset.miniMenuTrigger; const fly=document.querySelector(`[data-mini-flyout="${CSS.escape(id)}"]`); if(fly){document.querySelectorAll('[data-mini-flyout]').forEach((x)=>{if(x!==fly)x.hidden=true}); const r=miniTrigger.getBoundingClientRect(); fly.style.top=`${Math.max(8,r.top)}px`; if(document.documentElement.dir==='rtl'){fly.style.left='auto';fly.style.right=`${Math.max(8,innerWidth-r.left+8)}px`;}else{fly.style.right='auto';fly.style.left=`${r.right+8}px`;} fly.hidden=!fly.hidden;miniTrigger.setAttribute('aria-expanded',String(!fly.hidden));if(!fly.hidden){fly.style.top=`${Math.max(8,Math.min(r.top,innerHeight-fly.getBoundingClientRect().height-8))}px`;fly.querySelector('a')?.focus({preventScroll:true});}}
    }
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){document.querySelectorAll('[data-mini-flyout]:not([hidden])').forEach(fly=>{fly.hidden=true;const trigger=fly.closest('[data-nav-parent]')?.querySelector('[data-mini-menu-trigger]');trigger?.setAttribute('aria-expanded','false');trigger?.focus();});}});
  document.addEventListener('click',(event)=>{ if(!event.target.closest('[data-mini-menu-trigger]')&&!event.target.closest('[data-mini-flyout]')) document.querySelectorAll('[data-mini-flyout]').forEach((x)=>x.hidden=true); });
}
