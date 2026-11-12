import { defaultLayout, storageKeys } from "./config.js";
import { readJson, writeJson } from "./storage.js";
import { getPresentation } from "./presentation.js";
import { iconSvg } from "./ui.js";
function normalize(value) { return { ...defaultLayout, ...(value || {}) }; }
export function getLayout() { return normalize(readJson(storageKeys.layout, defaultLayout)); }
export function applyLayout(layout) {
  const root=document.documentElement;
  root.dataset.navigation=layout.navigation;
  root.dataset.sidebar=layout.sidebar;
  root.dataset.contentWidth=layout.contentWidth;
  root.dataset.header=layout.header;
  const toggle=document.querySelector('[data-sidebar-toggle]');
  if(toggle){toggle.setAttribute('aria-label',layout.sidebar==='mini'?'Use standard sidebar':'Use mini sidebar');toggle.innerHTML=iconSvg(layout.sidebar==='mini'?'PanelLeftOpen':'PanelLeftClose');}
  const sidebar=document.querySelector("#desktop-sidebar"); if(sidebar) sidebar.hidden = layout.navigation === "horizontal";
  const horizontal=document.querySelector("#horizontal-navigation"); if(horizontal) horizontal.hidden = layout.navigation !== "horizontal";
  const topbar=document.querySelector("#app-topbar");
  if(topbar){
    topbar.classList.toggle("sticky",layout.header==="sticky"); topbar.classList.toggle("top-0",layout.header==="sticky");
    topbar.classList.toggle("fixed",layout.header==="fixed"); topbar.classList.toggle("inset-x-0",layout.header==="fixed"); topbar.classList.toggle("top-0",layout.header==="fixed" || layout.header==="sticky");
  }
  const spacer=document.querySelector("#fixed-header-spacer");
  if(spacer){
    const density=getPresentation().density;
    const primary=document.body?.dataset.primaryDashboard === "true";
    const vertical=layout.navigation === "vertical";
    const heights = vertical ? (primary ? {compact:56,comfortable:64,spacious:72} : {compact:80,comfortable:96,spacious:112}) : (primary ? {compact:96,comfortable:112,spacious:128} : {compact:128,comfortable:144,spacious:160});
    spacer.style.height = layout.header === "fixed" ? `${heights[density] ?? 96}px` : "0px";
  }
  document.dispatchEvent(new CustomEvent("vexlora:layout", { detail: layout }));
}
export function setLayout(patch) {
  const next=normalize({ ...getLayout(), ...patch });
  writeJson(storageKeys.layout,next); applyLayout(next); return next;
}
export function resetLayout() { writeJson(storageKeys.layout, defaultLayout); applyLayout(defaultLayout); return {...defaultLayout}; }
export function initLayout() { applyLayout(getLayout()); }
