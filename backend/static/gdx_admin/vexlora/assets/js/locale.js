import { storageKeys } from "./config.js";
import { safeGet, safeSet } from "./storage.js";
import { shellData } from "./generated/shell-data.js";
import { setPresentation } from "./presentation.js";
export const locales = Object.freeze(Object.fromEntries(shellData.localeOptions.map((item)=>[item.code,item])));
export function applyLocale(code) {
  const locale=locales[code] || locales.en; const root=document.documentElement;
  root.lang=code; root.dataset.locale=code;
  document.querySelectorAll("[data-locale-label]").forEach((el)=>{el.textContent=locale.nativeLabel;});
  document.querySelectorAll("[data-locale-check]").forEach((el)=>{el.hidden=el.dataset.localeCheck!==code;});
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=shellData.translations[code]?.[el.dataset.i18n]||shellData.translations.en[el.dataset.i18n]||el.textContent;});
  if(document.body?.dataset.currentRoute==='/settings/localization'){
    const intl=locale.intlLocale,currency=locale.currency;
    const values={number:new Intl.NumberFormat(intl).format(1284500.75),currency:new Intl.NumberFormat(intl,{style:'currency',currency,maximumFractionDigits:2}).format(28450.5),date:new Intl.DateTimeFormat(intl,{timeZone:locale.timeZone,month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date('2026-08-17T15:00:00Z'))};
    document.querySelectorAll('h3[data-i18n]').forEach(heading=>{
      const key=heading.dataset.i18n,value=heading.closest('.rounded-lg')?.querySelector('p.text-xl.font-bold');
      if(values[key]&&value){value.textContent=values[key];if(heading.nextElementSibling)heading.nextElementSibling.textContent=key==='number'?new Intl.NumberFormat(intl,{style:'percent',maximumFractionDigits:1}).format(.684):key==='currency'?currency:locale.nativeLabel;}
    });
    const info=document.querySelector('h3[data-i18n="currentLocale"]')?.closest('.rounded-lg');
    info?.querySelectorAll('div').forEach(row=>{if(row.children.length!==2)return;const label=row.firstElementChild.textContent.trim(),badge=row.lastElementChild;if(label==='Locale')badge.textContent=intl;else if(label===(shellData.translations[code]?.direction||'Direction'))badge.textContent=locale.direction.toUpperCase();else if(label===(shellData.translations[code]?.currency||'Currency'))badge.textContent=currency;else if(label==='Time zone')badge.textContent=locale.timeZone;});
  }
  document.dispatchEvent(new CustomEvent("vexlora:locale", {detail: locale}));
}
export function setLocale(code) {
  if(!locales[code]) return;
  safeSet(storageKeys.locale,code); applyLocale(code); setPresentation({direction:locales[code].direction});
}
export function initLocale() { applyLocale(safeGet(storageKeys.locale,"en")); }
