export function safeGet(key, fallback = null) {
  try { const value = localStorage.getItem(key); return value === null ? fallback : value; } catch { return fallback; }
}
export function safeSet(key, value) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}
export function readJson(key, fallback) {
  const raw = safeGet(key); if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}
export function writeJson(key, value) { return safeSet(key, JSON.stringify(value)); }
