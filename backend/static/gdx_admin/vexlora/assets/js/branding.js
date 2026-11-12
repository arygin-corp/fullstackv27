import { productConfig, storageKeys } from './config.js';
import { readJson, writeJson } from './storage.js';
import { iconSvg } from './ui.js';

const assets = ['logoSrc', 'compactLogoSrc', 'darkLogoSrc', 'authLogoSrc', 'faviconSrc'];
const appRoot = new URL('../../', import.meta.url);
export const defaultBranding = Object.freeze({
  appName: productConfig.name, shortName: productConfig.brand.mark, browserTitle: productConfig.adminName,
  logoSrc: productConfig.brand.logoSrc, compactLogoSrc: null, darkLogoSrc: null, authLogoSrc: null,
  faviconSrc: `brand/${productConfig.storagePrefix}-mark.svg`
});
function assetUrl(value) {
  if (!value || typeof value !== 'string') return null;
  if (/^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(value)) return value;
  if (/^(?:https?:\/\/)/i.test(value)) return value;
  if (/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('//')) return null;
  return new URL(value.replace(/^\/+/, ''), appRoot).href;
}
function normalize(value) {
  const next = { ...defaultBranding };
  if (!value || typeof value !== 'object') return next;
  for (const key of ['appName', 'shortName', 'browserTitle']) {
    if (typeof value[key] === 'string' && value[key].trim()) next[key] = value[key].trim();
  }
  next.shortName = next.shortName.toUpperCase().slice(0, 4);
  for (const key of assets) if (Object.hasOwn(value, key)) next[key] = assetUrl(value[key]) ? value[key] : null;
  return next;
}
let branding = normalize(readJson(storageKeys.branding, defaultBranding));
export const getBranding = () => ({ ...branding });

function paintMark(node, state) {
  const mini = node.dataset.brandVariant === 'compact' || (node.closest('#desktop-sidebar') && document.documentElement.dataset.sidebar === 'mini');
  const auth = node.dataset.brandSurface === 'auth';
  const dark = document.documentElement.classList.contains('dark');
  const src = mini ? state.compactLogoSrc || state.logoSrc : (auth && state.authLogoSrc) || (dark && state.darkLogoSrc) || state.logoSrc;
  if (src) {
    const img = document.createElement('img');
    img.src = assetUrl(src); img.alt = `${state.appName} logo`; img.width = 36; img.height = 36;
    node.replaceChildren(img);
  } else node.textContent = state.shortName;
}
function applyBranding() {
  document.title = branding.browserTitle;
  document.querySelectorAll('[data-brand-name]').forEach(node => node.textContent = branding.appName);
  document.querySelectorAll('[data-brand-mark]').forEach(node => paintMark(node, branding));
  let link = document.querySelector('link[data-admin-favicon]');
  const src = assetUrl(branding.faviconSrc);
  if (!src) link?.remove();
  else {
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; link.dataset.adminFavicon = 'true'; document.head.append(link); }
    link.href = src;
    link.removeAttribute('type');
  }
}
export function setBranding(value) {
  const next = normalize(value);
  if (!writeJson(storageKeys.branding, next)) return false;
  branding = next; applyBranding();
  document.dispatchEvent(new CustomEvent('vexlora:branding', { detail: getBranding() }));
  return true;
}
export function initBranding() {
  applyBranding();
  document.addEventListener('vexlora:theme', applyBranding);
  document.addEventListener('vexlora:layout', applyBranding);
  window.addEventListener('storage', event => {
    if (event.key === storageKeys.branding || event.key === null) { branding = normalize(readJson(storageKeys.branding, defaultBranding)); applyBranding(); }
  });
}

export function initBrandingSettings() {
  if (document.body.dataset.currentRoute !== '/settings/branding') return;
  const root = document.querySelector('#main-content');
  const fields = { appName: root.querySelector('#brand-app-name'), shortName: root.querySelector('#brand-short-name'), browserTitle: root.querySelector('#brand-browser-title') };
  const findButton = (scope, label) => [...scope.querySelectorAll('button')].find(b => b.textContent.trim() === label);
  const save = findButton(root, 'Save branding'), reset = findButton(root, 'Reset branding');
  let draft = getBranding();
  const status = document.createElement('p');
  status.className = 'text-sm font-medium text-success'; status.setAttribute('role', 'status'); status.hidden = true;
  save.before(status);
  const controls = [];
  const changed = () => { status.hidden = true; root.dataset.d2BrandingSaved = 'false'; validate(); updateFaviconPreview(); };
  const validate = () => {
    let valid = true;
    for (const [key, input] of Object.entries(fields)) {
      const ok = Boolean(input.value.trim()); input.setAttribute('aria-invalid', String(!ok)); valid &&= ok;
      const id = `${input.id}-error`; let error = document.getElementById(id);
      if (!ok && !error) { error = document.createElement('p'); error.id = id; error.className = 'text-compact font-medium text-destructive'; input.parentElement.append(error); }
      if (error) { error.textContent = `${key === 'appName' ? 'Application name' : key === 'shortName' ? 'Short brand mark' : 'Browser title'} is required.`; error.hidden = ok; }
    }
    save.disabled = !valid; return valid;
  };
  function updateFaviconPreview() {
    const label = [...root.querySelectorAll('p')].find(p => p.textContent.trim() === 'Favicon preview');
    if (!label) return;
    const row = label.parentElement.parentElement;
    row.hidden = !draft.faviconSrc;
    const img = row.querySelector('img'); if (img && draft.faviconSrc) img.src = assetUrl(draft.faviconSrc);
    const title = label.nextElementSibling; if (title) title.textContent = `Browser title: ${draft.browserTitle}`;
  }
  function fill() {
    for (const [key, input] of Object.entries(fields)) input.value = draft[key];
    controls.forEach(control => control.render()); validate(); updateFaviconPreview();
  }
  for (const [key, input] of Object.entries(fields)) input.addEventListener('input', () => {
    if (key === 'shortName') input.value = input.value.toUpperCase().slice(0, 4);
    draft[key] = input.value; changed();
  });
  const labels = ['Main logo', 'Compact sidebar logo', 'Dark logo', 'Auth logo', 'Favicon'];
  labels.forEach((label, index) => {
    const heading = [...root.querySelectorAll('h3')].find(h => h.textContent.trim() === label);
    const card = heading?.parentElement.parentElement; if (!card) return;
    const key = assets[index], preview = card.querySelector('.aspect-square');
    const remove = findButton(card, 'Remove asset'), input = card.querySelector('input[type="file"]');
    card.dataset.brandAsset = key;
    const render = () => {
      if (draft[key]) {
        const img = document.createElement('img'); img.alt = `${label} preview`; img.src = assetUrl(draft[key]); img.className = 'absolute inset-0 h-full w-full object-contain p-3'; preview.replaceChildren(img);
      } else preview.innerHTML = iconSvg('Image', 'size-8 text-muted-foreground');
      remove.disabled = !draft[key];
    };
    const update = value => { draft[key] = value; render(); changed(); };
    remove.addEventListener('click', () => { if (input) input.value = ''; update(null); });
    card.querySelectorAll('[data-dialog] button').forEach(choice => {
      const image = choice.querySelector('img'); if (!image) return;
      choice.addEventListener('click', () => {
        const url = new URL(image.src); const value = url.href.startsWith(appRoot.href) ? url.href.slice(appRoot.href.length) : url.href;
        update(value);
        const dialog = choice.closest('[data-dialog]'); dialog.hidden = true;
        dialog.dispatchEvent(new CustomEvent('vexlora:layer-close'));
        card.querySelector('[data-dialog-trigger]')?.setAttribute('aria-expanded', 'false');
        card.querySelector('[data-dialog-trigger]')?.focus();
      });
    });
    if (input) {
      const browse = findButton(card, 'Drop files here or browse') || [...card.querySelectorAll('button')].find(b => b.textContent.includes('Drop files here or browse'));
      const message = document.createElement('p'); message.className = 'text-compact text-destructive'; message.setAttribute('role', 'alert'); message.hidden = true; input.after(message);
      const upload = async files => {
        const file = files[0]; if (!file) return;
        const max = index === 4 ? 1024 * 1024 : 2 * 1024 * 1024;
        if (files.length > 1 || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > max) {
          message.textContent = `Choose one PNG, JPG or WebP image up to ${index === 4 ? 1 : 2} MB.`; message.hidden = false; return;
        }
        const reader = new FileReader();
        reader.addEventListener('load', async () => {
          try { const image = new Image(); image.src = reader.result; await image.decode(); message.hidden = true; update(reader.result); }
          catch { message.textContent = 'This image could not be opened.'; message.hidden = false; }
        });
        reader.readAsDataURL(file);
      };
      browse?.addEventListener('click', () => input.click());
      input.addEventListener('change', () => upload([...input.files]));
      browse?.addEventListener('dragover', event => event.preventDefault());
      browse?.addEventListener('drop', event => { event.preventDefault(); upload([...event.dataTransfer.files]); });
    }
    controls.push({ render });
  });
  const liveHeading = [...root.querySelectorAll('h3')].find(h => h.textContent.trim() === 'Live brand preview');
  const liveCard = liveHeading?.parentElement.parentElement;
  liveCard?.querySelectorAll('.bg-sidebar').forEach((box, index) => {
    const mark = box.querySelector('span.text-xs.font-bold'); if (mark) {
      mark.dataset.brandMark = '';
      mark.className = 'flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-xs font-bold tracking-tight text-primary-foreground shadow-xs';
      if (index === 1) mark.dataset.brandVariant = 'compact';
    }
    const name = box.querySelector('p.font-bold'); if (name) name.dataset.brandName = '';
    const tagline = name?.nextElementSibling; if (tagline) tagline.textContent = productConfig.tagline;
  });
  save.addEventListener('click', () => {
    if (!validate()) return;
    const ok = setBranding(draft);
    status.hidden = false; status.classList.toggle('text-destructive', !ok); status.classList.toggle('text-success', ok);
    status.textContent = ok ? 'Branding changes saved.' : 'Branding could not be saved. Choose smaller images or enable browser storage.';
    root.dataset.d2BrandingSaved = String(ok);
  });
  reset.addEventListener('click', () => { if (setBranding(defaultBranding)) { draft = getBranding(); fill(); status.hidden = true; } });
  fill(); applyBranding();
}
