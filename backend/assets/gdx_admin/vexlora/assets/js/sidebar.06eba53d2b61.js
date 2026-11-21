const scrollKey = nav => `vexlora.sidebar-scroll.${nav.id}`;
let mobileTrigger = null;

function activeItem(nav) {
  const item = nav.querySelector('[aria-current="page"]');
  if (!item) return null;
  if (nav.id !== 'sidebar-nav' || document.documentElement.dataset.sidebar !== 'mini') return item;
  let parent = item.closest('[data-nav-parent]');
  while (parent?.parentElement.closest('[data-nav-parent]')) parent = parent.parentElement.closest('[data-nav-parent]');
  return parent?.querySelector(':scope > a') || item;
}

export function revealActiveNavigation(nav, restore = false) {
  if (!nav?.clientHeight) return;
  if (restore) {
    try { nav.scrollTop = Number(sessionStorage.getItem(scrollKey(nav))) || 0; } catch { /* Optional state. */ }
  }
  const item = activeItem(nav);
  if (!item?.getClientRects().length) return;
  const viewport = nav.getBoundingClientRect(), bounds = item.getBoundingClientRect();
  if (bounds.top < viewport.top + 16) nav.scrollTop += bounds.top - viewport.top - 16;
  else if (bounds.bottom > viewport.bottom - 16) nav.scrollTop += bounds.bottom - viewport.bottom + 16;
}

export function openMobileSidebar() {
  const mobile = document.querySelector('#mobile-sidebar'), backdrop = document.querySelector('#mobile-sidebar-backdrop');
  if (!mobile) return;
  mobileTrigger = document.querySelector('[data-mobile-menu-open]') || document.activeElement;
  mobile.hidden = false;
  mobile.setAttribute('role', 'dialog');
  mobile.setAttribute('aria-modal', 'true');
  mobile.setAttribute('aria-label', 'Navigation');
  if (backdrop) backdrop.hidden = false;
  document.querySelector('[data-mobile-menu-open]')?.setAttribute('aria-expanded', 'true');
  document.body.classList.add('overflow-hidden');
  requestAnimationFrame(() => {
    revealActiveNavigation(document.querySelector('#mobile-sidebar-nav'), true);
    mobile.querySelector('[aria-current="page"], [data-mobile-menu-close]')?.focus({ preventScroll: true });
  });
}

export function closeMobileSidebar() {
  const mobile = document.querySelector('#mobile-sidebar'), backdrop = document.querySelector('#mobile-sidebar-backdrop');
  if (!mobile || mobile.hidden) return;
  mobile.hidden = true;
  if (backdrop) backdrop.hidden = true;
  document.querySelector('[data-mobile-menu-open]')?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('overflow-hidden');
  mobileTrigger?.focus({ preventScroll: true });
}

export function initSidebar() {
  const navs = [...document.querySelectorAll('#sidebar-nav, #mobile-sidebar-nav')];
  const save = nav => { try { sessionStorage.setItem(scrollKey(nav), String(nav.scrollTop)); } catch { /* Optional state. */ } };
  navs.forEach(nav => nav.addEventListener('scroll', () => save(nav), { passive: true }));
  const reveal = (restore = false) => {
    navs.forEach(nav => revealActiveNavigation(nav, restore));
    requestAnimationFrame(() => navs.forEach(nav => revealActiveNavigation(nav)));
  };
  reveal(true);
  document.fonts?.ready.then(() => reveal());
  document.addEventListener('vexlora:layout', () => reveal());
  document.addEventListener('vexlora:presentation', () => reveal());
  window.addEventListener('pageshow', () => reveal(true));
  window.addEventListener('pagehide', () => navs.forEach(save));
  window.addEventListener('resize', () => { if (innerWidth >= 1024) closeMobileSidebar(); reveal(); });
  document.addEventListener('click', event => {
    if (event.target.closest('[data-mobile-menu-open]')) openMobileSidebar();
    if (event.target.closest('[data-mobile-menu-close]') || event.target.id === 'mobile-sidebar-backdrop') closeMobileSidebar();
    const toggle = event.target.closest('[data-nav-expand]');
    if (toggle) {
      const panel = toggle.closest('[data-nav-parent]')?.querySelector('[data-nav-panel]');
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      if (panel) panel.hidden = open;
    }
  });
  document.addEventListener('keydown', event => {
    const mobile = document.querySelector('#mobile-sidebar');
    if (!mobile || mobile.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeMobileSidebar(); }
    if (event.key !== 'Tab') return;
    const items = [...mobile.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"]')].filter(el => el.getClientRects().length);
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
}
