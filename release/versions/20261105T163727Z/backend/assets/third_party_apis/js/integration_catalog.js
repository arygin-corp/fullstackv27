(() => {
  const root = document.querySelector('.catalog');
  if (!root) return;

  const grid = document.querySelector('#module-grid');
  const search = document.querySelector('#module-search');
  const statusFilter = document.querySelector('#status-filter');
  const sourceFilter = document.querySelector('#source-filter');
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#empty-state');
  const error = document.querySelector('#error-state');
  const dialog = document.querySelector('#module-dialog');
  const dialogContent = document.querySelector('#module-dialog-content');
  let modules = [];

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const label = (value) => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  function statusBadge(module) {
    if (!module.enabled) return '<span class="badge badge--disabled">Disabled</span>';
    const status = module.configuration.status;
    if (status === 'ready') return '<span class="badge badge--ready">Ready</span>';
    if (status === 'ready_optional_unset') return '<span class="badge badge--warning">Ready, optional unset</span>';
    if (status === 'missing_required') return '<span class="badge badge--error">Missing required config</span>';
    return '<span class="badge badge--error">Invalid overrides</span>';
  }

  function card(module) {
    return `<article class="module-card" data-key="${escapeHtml(module.module_key)}">
      <div class="module-card__top"><div><h2>${escapeHtml(module.name)}</h2><p class="source">${escapeHtml(module.source_name)}</p></div></div>
      <div class="badges"><span class="badge ${module.enabled ? 'badge--enabled' : 'badge--disabled'}">${module.enabled ? 'Enabled' : 'Disabled'}</span>${statusBadge(module)}</div>
      <p class="description">${escapeHtml(module.description)}</p>
      <dl class="facts">
        <dt>Endpoint</dt><dd>${escapeHtml(module.frontend.endpoint)}</dd>
        <dt>Method</dt><dd>${escapeHtml(module.frontend.method)}</dd>
        <dt>Provider</dt><dd>${escapeHtml(module.upstream.provider)}</dd>
        <dt>Auth</dt><dd>${escapeHtml(module.upstream.authentication)}</dd>
      </dl>
      <div class="card-actions"><button type="button" data-details="${escapeHtml(module.module_key)}">View details</button></div>
    </article>`;
  }

  function searchable(module) {
    return [module.module_key,module.name,module.description,module.source_name,module.frontend.endpoint,module.upstream.provider,module.upstream.authentication].join(' ').toLowerCase();
  }

  function matchesStatus(module, value) {
    if (value === 'all') return true;
    if (value === 'enabled') return module.enabled;
    if (value === 'disabled') return !module.enabled;
    return module.configuration.status === value;
  }

  function render() {
    const term = search.value.trim().toLowerCase();
    const filtered = modules.filter((module) =>
      (!term || searchable(module).includes(term)) &&
      matchesStatus(module, statusFilter.value) &&
      (sourceFilter.value === 'all' || module.source_name === sourceFilter.value)
    );
    grid.innerHTML = filtered.map(card).join('');
    count.textContent = `${filtered.length} of ${modules.length} modules`;
    empty.hidden = filtered.length !== 0;
  }

  function openDetails(key) {
    const module = modules.find((item) => item.module_key === key);
    if (!module) return;
    const settingRows = module.settings.map((item) => `<li><code>${escapeHtml(item.name)}</code>: ${escapeHtml(label(item.category))}, ${item.configured ? 'Configured' : 'Not configured'}${item.secret ? ', secret hidden' : ''}</li>`).join('') || '<li>No settings declared</li>';
    const cacheRows = module.cache.map((item) => `<li>${escapeHtml(item.name)}: ${escapeHtml(label(item.status))}</li>`).join('') || '<li>No inspectable global cache entries</li>';
    dialogContent.innerHTML = `<h2>${escapeHtml(module.name)}</h2><p>${escapeHtml(module.description)}</p>
      <section class="details-section"><h3>Frontend API</h3><p><strong>Endpoint:</strong> ${escapeHtml(module.frontend.endpoint)}</p><p><strong>Method:</strong> ${escapeHtml(module.frontend.method)}</p><p><strong>Authentication:</strong> ${escapeHtml(module.frontend.authentication)}</p></section>
      <section class="details-section"><h3>Upstream</h3><p><strong>Provider:</strong> ${escapeHtml(module.upstream.provider)}</p><p><strong>Method:</strong> ${escapeHtml(module.upstream.method)}</p><p><strong>Endpoint configured:</strong> ${module.upstream.endpoint_configured ? 'Yes' : 'No'}</p><p><strong>Authentication:</strong> ${escapeHtml(module.upstream.authentication)}</p></section>
      <section class="details-section"><h3>Configuration</h3><ul class="details-list">${settingRows}</ul></section>
      <section class="details-section"><h3>Cache</h3><ul class="details-list">${cacheRows}</ul></section>`;
    dialog.showModal();
  }

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-details]');
    if (button) openDetails(button.dataset.details);
  });
  [search, statusFilter, sourceFilter].forEach((control) => control.addEventListener('input', render));

  fetch(root.dataset.apiUrl, {headers: {'Accept': 'application/json'}, credentials: 'same-origin'})
    .then((response) => { if (!response.ok) throw new Error('Request failed'); return response.json(); })
    .then((payload) => {
      modules = Array.isArray(payload.results) ? payload.results : [];
      [...new Set(modules.map((item) => item.source_name).filter(Boolean))].sort().forEach((source) => {
        const option = document.createElement('option'); option.value = source; option.textContent = source; sourceFilter.appendChild(option);
      });
      render();
    })
    .catch(() => { error.hidden = false; count.textContent = '0 modules'; });
})();
