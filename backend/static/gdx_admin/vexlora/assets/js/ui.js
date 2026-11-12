import { iconPaths } from "./generated/icon-paths.js";
export function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
}

export function getIconName(iconValue) {
  if (!iconValue) return "Circle";
  if (typeof iconValue === "string") return iconValue;
  return iconValue.icon || "Circle";
}

const paths = iconPaths;

export function iconSvg(name, className = "size-4") {
  const aliases = { BarChart3: "ChartColumn", FilePlus2: "FilePlusCorner" };
  const body = paths[aliases[name] || name] || paths.Circle;
  return `<svg aria-hidden="true" class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

export function routeToHref(route) {
  const rawBase = document.documentElement.dataset.basePath || ".";
  const base = rawBase === "/" ? "" : rawBase.replace(/\/+$/g, "");
  const prefix = base ? `${base}/` : "/";
  if (!route || route === "/") return `${prefix}index.html`;
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(route)) return route;
  const hashIndex=route.indexOf('#');
  const hash=hashIndex<0?'':route.slice(hashIndex);
  const routeWithoutHash=hashIndex<0?route:route.slice(0,hashIndex);
  const queryIndex=routeWithoutHash.indexOf('?');
  const pathname=queryIndex<0?routeWithoutHash:routeWithoutHash.slice(0,queryIndex);
  const query=queryIndex<0?'':routeWithoutHash.slice(queryIndex+1);
  const normalized = pathname.replace(/^\/+|\/+$/g, "");
  return `${prefix}pages/${normalized}/index.html${query ? `?${query}` : ""}${hash}`;
}

export function currentRoute() {
  return document.body?.dataset.currentRoute || document.documentElement.dataset.currentRoute || "/dashboard/executive";
}

export function humanizeSegment(segment) {
  try { segment = decodeURIComponent(segment); } catch {}
  return segment.replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
