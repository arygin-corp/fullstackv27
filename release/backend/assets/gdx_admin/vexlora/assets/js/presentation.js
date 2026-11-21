import { defaultPresentation, storageKeys } from "./config.js";
import { readJson, writeJson } from "./storage.js";

const accents = new Set(["violet", "indigo", "rose"]);
function normalize(value) {
  const next = { ...defaultPresentation, ...(value || {}) };
  if (!accents.has(next.accent)) next.accent = defaultPresentation.accent;
  return next;
}
export function getPresentation() { return normalize(readJson(storageKeys.presentation, defaultPresentation)); }
export function applyPresentation(state) {
  const root = document.documentElement;
  root.dataset.accent = state.accent;
  root.dataset.radius = state.radius;
  root.dataset.font = state.font;
  root.dataset.density = state.density;
  root.dir = state.direction;
  document.dispatchEvent(new CustomEvent("vexlora:presentation", { detail: state }));
}
export function setPresentation(patch) {
  const next = normalize({ ...getPresentation(), ...patch });
  writeJson(storageKeys.presentation, next);
  applyPresentation(next);
  return next;
}
export function resetPresentation() {
  writeJson(storageKeys.presentation, defaultPresentation);
  applyPresentation(defaultPresentation);
  return { ...defaultPresentation };
}
export function initPresentation() { applyPresentation(getPresentation()); }
