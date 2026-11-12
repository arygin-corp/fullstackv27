import { storageKeys } from "./config.js";
import { safeGet, safeSet } from "./storage.js";
export function getTheme(){ return safeGet(storageKeys.theme,"system"); }
export function applyTheme(theme) {
  const root = document.documentElement;
  const resolved = theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
  root.classList.toggle("dark", resolved === "dark");
  root.dataset.theme = theme;
  document.querySelectorAll("[data-theme-label]").forEach((el) => { el.textContent = resolved === "dark" ? "Dark" : "Light"; });
  document.querySelectorAll("[data-theme-icon]").forEach((el)=>{ el.dataset.themeIcon = resolved; });
  document.dispatchEvent(new CustomEvent("vexlora:theme", {detail:{theme,resolved}}));
}
export function setTheme(theme){ safeSet(storageKeys.theme,theme); applyTheme(theme); }
export function initTheme() {
  applyTheme(getTheme());
  const media=matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener?.("change",()=>{ if(getTheme()==="system") applyTheme("system"); });
}
