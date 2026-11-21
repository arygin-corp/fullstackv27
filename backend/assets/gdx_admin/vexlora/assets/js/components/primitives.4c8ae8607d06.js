import { iconSvg } from "../ui.js";

function focusables(root){
  return [...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>el.getClientRects().length && getComputedStyle(el).visibility!=="hidden" && el.getAttribute('aria-hidden')!=="true");
}
function setExpanded(trigger, open){ trigger?.setAttribute("aria-expanded",String(open)); }
function closeLayer(layer){
  if(!layer || layer.hidden) return;
  layer.hidden=true;
  layer.dispatchEvent(new CustomEvent("vexlora:layer-close"));
  const triggerId=layer.dataset.triggerId;
  if(triggerId) { const trigger=document.getElementById(triggerId);setExpanded(trigger,false);trigger?.focus(); }
}
function openLayer(layer, trigger){
  if(!layer) return;
  if(trigger && !trigger.id) trigger.id=`vexlora-trigger-${Math.random().toString(36).slice(2)}`;
  if(trigger) layer.dataset.triggerId=trigger.id;
  setExpanded(trigger,true);
  layer.hidden=false;
  requestAnimationFrame(()=>focusables(layer)[0]?.focus());
}
function trapKeydown(event, layer){
  if(event.key==="Escape"){ event.preventDefault(); closeLayer(layer); return; }
  if(event.key!=="Tab") return;
  const nodes=focusables(layer); if(!nodes.length){event.preventDefault();return;}
  const first=nodes[0], last=nodes.at(-1);
  if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
}

function initAccordions(){
  document.querySelectorAll("[data-accordion]").forEach(root=>{
    root.addEventListener("click",event=>{
      const trigger=event.target.closest("[data-accordion-trigger]"); if(!trigger||!root.contains(trigger))return;
      const item=trigger.closest("[data-accordion-item]"); const panel=item?.querySelector("[data-accordion-panel]"); if(!panel)return;
      const next=panel.hidden; const single=root.dataset.accordion!=="multiple";
      if(single && next) root.querySelectorAll("[data-accordion-panel]").forEach(other=>{if(other!==panel){other.hidden=true;setExpanded(other.closest('[data-accordion-item]')?.querySelector('[data-accordion-trigger]'),false);}});
      panel.hidden=!next; setExpanded(trigger,next); trigger.querySelector("[data-accordion-chevron]")?.classList.toggle("rotate-180",next);
    });
    const defaults=String(root.dataset.defaultValue||"").split("|").filter(Boolean);
    root.querySelectorAll("[data-accordion-item]").forEach((item,index)=>{
      const trigger=item.querySelector("[data-accordion-trigger]"), panel=item.querySelector("[data-accordion-panel]"); if(!trigger||!panel)return;
      const value=item.dataset.value||""; const open=defaults.includes(value) || (!defaults.length && root.dataset.accordion==="multiple" && panel.hidden===false);
      panel.hidden=!open; setExpanded(trigger,open);
    });
  });
}
function initTabs(){
  document.querySelectorAll("[data-tabs]").forEach(root=>{
    const activate=(value,focus=false)=>{
      const triggers=[...root.querySelectorAll("[data-tab-trigger]")];
      triggers.forEach(t=>{const active=t.dataset.tabTrigger===value;t.setAttribute("aria-selected",String(active));t.dataset.state=active?"active":"inactive";t.tabIndex=active?0:-1;if(active&&focus)t.focus();});
      root.querySelectorAll("[data-tab-panel]").forEach(p=>{const active=p.dataset.tabPanel===value;p.hidden=!active;p.dataset.state=active?"active":"inactive";});
    };
    root.addEventListener("click",e=>{const t=e.target.closest("[data-tab-trigger]");if(t&&root.contains(t))activate(t.dataset.tabTrigger);});
    root.addEventListener("keydown",e=>{const t=e.target.closest("[data-tab-trigger]");if(!t)return;const ts=[...root.querySelectorAll("[data-tab-trigger]")];let i=ts.indexOf(t);if(e.key==="ArrowRight"||e.key==="ArrowDown")i=(i+1)%ts.length;else if(e.key==="ArrowLeft"||e.key==="ArrowUp")i=(i-1+ts.length)%ts.length;else return;e.preventDefault();activate(ts[i].dataset.tabTrigger,true);});
    const initial=root.dataset.defaultValue || root.querySelector('[data-tab-trigger][data-state="active"]')?.dataset.tabTrigger || root.querySelector("[data-tab-trigger]")?.dataset.tabTrigger; if(initial)activate(initial);
  });
}
function initDialogs(){
  document.addEventListener("click",event=>{
    const trigger=event.target.closest("[data-dialog-trigger]"); if(trigger){const layer=document.querySelector(trigger.dataset.dialogTrigger);openLayer(layer,trigger);return;}
    const close=event.target.closest("[data-dialog-close]"); if(close){closeLayer(close.closest("[data-dialog]"));return;}
    const overlay=event.target.closest("[data-dialog-overlay]"); if(overlay && event.target===overlay)closeLayer(overlay.closest("[data-dialog]"));
  });
  document.querySelectorAll("[data-dialog]").forEach(layer=>layer.addEventListener("keydown",e=>trapKeydown(e,layer)));
}
function initSheets(){
  document.addEventListener("click",event=>{
    const trigger=event.target.closest("[data-sheet-trigger]"); if(trigger){openLayer(document.querySelector(trigger.dataset.sheetTrigger),trigger);return;}
    const close=event.target.closest("[data-sheet-close]"); if(close)closeLayer(close.closest("[data-sheet]"));
    const overlay=event.target.closest("[data-sheet-overlay]"); if(overlay && event.target===overlay)closeLayer(overlay.closest("[data-sheet]"));
  });
  document.querySelectorAll("[data-sheet]").forEach(layer=>layer.addEventListener("keydown",e=>trapKeydown(e,layer)));
}
function initPopovers(){
  document.addEventListener("click",event=>{
    const trigger=event.target.closest("[data-popover-trigger]");
    document.querySelectorAll("[data-popover-panel]").forEach(p=>{if(!trigger || p.id!==trigger.dataset.popoverTrigger.replace(/^#/,""))p.hidden=true;});
    if(trigger){const panel=document.querySelector(trigger.dataset.popoverTrigger);if(panel){panel.hidden=!panel.hidden;setExpanded(trigger,!panel.hidden);}}
  });
}
function initTooltips(){
  let tip=null;
  const hide=()=>{tip?.remove();tip=null;};
  const show=(target)=>{hide();const text=target.dataset.tooltip;if(!text)return;tip=document.createElement("div");tip.setAttribute("role","tooltip");tip.className="fixed z-[100] rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md pointer-events-none";tip.textContent=text;document.body.append(tip);const r=target.getBoundingClientRect(),tr=tip.getBoundingClientRect();tip.style.left=`${Math.max(8,Math.min(innerWidth-tr.width-8,r.left+r.width/2-tr.width/2))}px`;tip.style.top=`${Math.max(8,r.top-tr.height-8)}px`;};
  document.addEventListener("pointerover",e=>{const t=e.target.closest("[data-tooltip]");if(t)show(t);}); document.addEventListener("pointerout",e=>{if(e.target.closest("[data-tooltip]"))hide();}); document.addEventListener("focusin",e=>{const t=e.target.closest("[data-tooltip]");if(t)show(t);}); document.addEventListener("focusout",hide);
}
function initSwitches(){
  document.querySelectorAll("[data-switch]").forEach(btn=>{
    const update=(checked)=>{btn.dataset.state=checked?"checked":"unchecked";btn.setAttribute("aria-checked",String(checked));btn.querySelector("[data-switch-thumb]")?.setAttribute("data-state",checked?"checked":"unchecked");};
    update(btn.dataset.state==="checked"||btn.getAttribute("aria-checked")==="true");
    btn.addEventListener("click",()=>{if(btn.disabled)return;update(btn.getAttribute("aria-checked")!=="true");btn.dispatchEvent(new CustomEvent("vexlora:change",{detail:{checked:btn.getAttribute("aria-checked")==="true"}}));});
  });
}
function initCustomSelects(){
  document.querySelectorAll("[data-select]").forEach(root=>{
    const trigger=root.querySelector("[data-select-trigger]"),panel=root.querySelector("[data-select-panel]"),value=root.querySelector("[data-select-value]"); if(!trigger||!panel)return;
    const close=()=>{panel.hidden=true;setExpanded(trigger,false);};
    trigger.addEventListener("click",()=>{panel.hidden=!panel.hidden;setExpanded(trigger,!panel.hidden);if(!panel.hidden)panel.querySelector('[data-select-option][aria-selected="true"]')?.focus();});
    root.addEventListener("click",e=>{const option=e.target.closest("[data-select-option]");if(!option)return;root.querySelectorAll("[data-select-option]").forEach(o=>o.setAttribute("aria-selected","false"));option.setAttribute("aria-selected","true");root.dataset.value=option.dataset.value||option.textContent.trim();if(value)value.textContent=option.dataset.label||option.textContent.trim();close();root.dispatchEvent(new CustomEvent("vexlora:select",{detail:{value:root.dataset.value}}));});
    document.addEventListener("click",e=>{if(!root.contains(e.target))close();});
    root.addEventListener('keydown',event=>{
      const options=[...panel.querySelectorAll('[data-select-option]')].filter(option=>!option.disabled);
      if(event.key==='Escape'){if(!panel.hidden){event.preventDefault();close();trigger.focus();}return;}
      if(event.key==='Tab'){close();return;}
      if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key)||!options.length)return;
      event.preventDefault();
      const opening=panel.hidden;panel.hidden=false;setExpanded(trigger,true);
      let index=options.indexOf(document.activeElement);
      if(event.key==='Home')index=0;
      else if(event.key==='End')index=options.length-1;
      else if(opening){index=options.findIndex(option=>option.getAttribute('aria-selected')==='true');if(index<0)index=0;}
      else index=(index+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;
      options[index]?.focus();
    });
    const selected=root.querySelector('[data-select-option][aria-selected="true"]') || [...root.querySelectorAll("[data-select-option]")].find((o)=>(o.dataset.value||o.textContent.trim())===root.dataset.value);
    if(selected){root.dataset.value=selected.dataset.value||selected.textContent.trim();if(value)value.textContent=selected.dataset.label||selected.textContent.trim();}
    else if(value&&!value.textContent.trim()){value.textContent=value.getAttribute('placeholder')||root.dataset.placeholder||'Select an option';}
  });
}
function initChecks(){
  document.querySelectorAll("[data-checkbox]").forEach(btn=>{
    const update=(checked)=>{btn.dataset.state=checked?"checked":"unchecked";btn.setAttribute("aria-checked",String(checked));const indicator=btn.querySelector("[data-indicator]");if(indicator)indicator.hidden=!checked;};
    update(btn.dataset.state==="checked"||btn.getAttribute("aria-checked")==="true");
    btn.addEventListener("click",()=>{if(btn.disabled)return;update(btn.getAttribute("aria-checked")!=="true");});
  });
  document.querySelectorAll("[data-radio-group]").forEach(root=>{
    const update=(value)=>{root.dataset.value=value||"";root.querySelectorAll("[data-radio-option]").forEach(btn=>{const checked=btn.dataset.value===value;btn.setAttribute("aria-checked",String(checked));btn.dataset.state=checked?"checked":"unchecked";});};
    update(root.dataset.value||root.querySelector("[data-radio-option]")?.dataset.value||"");
    root.addEventListener("click",e=>{const btn=e.target.closest("[data-radio-option]");if(btn&&root.contains(btn)&&!btn.disabled)update(btn.dataset.value||"");});
  });
}
function initCommands(){
  document.querySelectorAll("[data-command]").forEach(root=>{
    const input=root.querySelector("[data-command-input]"); if(!input)return;
    const apply=()=>{const q=input.value.trim().toLowerCase();root.querySelectorAll("[data-command-item]").forEach(item=>{item.hidden=Boolean(q&&!item.textContent.toLowerCase().includes(q));});const visible=root.querySelectorAll("[data-command-item]:not([hidden])").length;root.querySelector("[data-command-empty]")?.toggleAttribute("hidden",visible>0);};
    input.addEventListener("input",apply); apply();
  });
}
function initProgress(){
  document.querySelectorAll("[data-progress]").forEach(root=>{const value=Math.max(0,Math.min(100,Number(root.dataset.value||0)));root.setAttribute("aria-valuenow",String(value));const bar=root.querySelector("[data-progress-indicator]");if(bar)bar.style.transform=`translateX(${document.documentElement.dir==='rtl'?(100-value):(value-100)}%)`;});
}
export function initPrimitives(){ initAccordions();initTabs();initDialogs();initSheets();initPopovers();initTooltips();initSwitches();initCustomSelects();initChecks();initCommands();initProgress(); }

