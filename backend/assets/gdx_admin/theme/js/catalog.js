(() => {
    "use strict";

    const root = document.querySelector("[data-integration-catalog]");
    if (!root) return;

    const $ = selector => document.querySelector(selector);
    const q = selector => root.querySelector(selector);

    const el = {
        grid: q("[data-module-grid]"),
        search: q("[data-module-search]"),
        source: q("[data-source-filter]"),
        status: q("[data-status-filter]"),
        count: q("[data-result-count]"),
        metric: q("[data-catalog-metric]"),
        pager: q("[data-pager]"),
        pageSize: q("[data-page-size]"),
        loading: q("[data-loading]"),
        empty: q("[data-empty]"),
        error: q("[data-error]"),
        settings: $("[data-settings-panel]"),
        settingsBackdrop: $("[data-settings-backdrop]"),
        settingsTitle: $("[data-settings-title]"),
        settingsSource: $("[data-settings-source]"),
        settingsBody: $("[data-settings-body]"),
        edit: $("[data-edit-panel]"),
        editBackdrop: $("[data-edit-backdrop]"),
        editTitle: $("[data-edit-title]"),
        editKey: $("[data-edit-key]"),
        editBody: $("[data-edit-body]"),
        editForm: $("[data-edit-form]"),
        editMsg: $("[data-edit-message]"),
        test: $("[data-test-modal]"),
        testTitle: $("[data-test-title]"),
        testSummary: $("[data-test-summary]"),
        testResults: $("[data-test-results]"),
        runTest: $("[data-run-test]"),
        view: $("[data-view-modal]"),
        viewTitle: $("[data-view-title]"),
        viewBody: $("[data-view-body]"),
    };

    let rows = [];
    let staff = false;
    let editing = null;
    let testing = null;
    const pageSizes = [8, 16, 24, 36, 48];
    let page = 1;
    let pageSize = 8;
    let activeLayout = "grid-4";

    try {
        activeLayout = localStorage.getItem("integrationCatalogLayout") || "grid-4";
    } catch (_error) {
        // Local storage might be unavailable. Use the default layout.
    }

    const esc = value => String(value ?? "").replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;",
        })[character],
    );

    const label = value => String(value ?? "Unknown")
        .replaceAll("_", " ")
        .replace(/\b\w/g, character => character.toUpperCase());

    const hasValue = value => value !== null && value !== undefined && value !== "";

    const valueOr = (value, fallback = "Not specified") => (
        hasValue(value) ? String(value) : fallback
    );

    const fmt = value => {
        if (!value) return "Never";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Never";
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    };

    const icon = module => {
        const metadata = moduleMeta(module);
        if (!metadata.iconUrl) {
            return `<span class="integration-module-icon" aria-hidden="true"></span>`;
        }
        return `
            <span class="integration-module-icon">
                <img
                    src="${esc(metadata.iconUrl)}"
                    alt=""
                    width="48"
                    height="48"
                    loading="lazy"
                >
            </span>
        `;
    };

    const csrf = () => {
        const cookie = document.cookie
            .split(";")
            .map(value => value.trim())
            .find(value => value.startsWith("csrftoken="));
        return cookie
            ? decodeURIComponent(cookie.split("=").slice(1).join("="))
            : "";
    };

    function find(moduleKey) {
        return rows.find(module => module.module_key === moduleKey);
    }

    // Normalize API and registered-module metadata once. Every UI surface uses
    // this object so cards, the settings drawer, and the view modal stay aligned.
    function moduleMeta(module = {}) {
        const frontend = module.frontend || {};
        const upstream = module.upstream || {};
        const configuration = module.configuration || {};
        const tags = Array.isArray(module.tags) ? module.tags.filter(Boolean) : [];
        const capabilities = Array.isArray(module.capabilities)
            ? module.capabilities.filter(Boolean)
            : [];
        const environments = Array.isArray(module.environments)
            ? module.environments.filter(Boolean)
            : [];
        const settings = Array.isArray(module.settings) ? module.settings : [];

        return {
            moduleKey: valueOr(module.module_key, "unknown-module"),
            name: valueOr(module.name, module.module_key || "Unnamed integration"),
            source: valueOr(module.source_name, "Unknown source"),
            description: valueOr(module.description, "No description available."),
            iconUrl: valueOr(module.icon_url, ""),
            enabled: Boolean(module.enabled),
            tags,
            documentationUrl: valueOr(module.documentation_url, ""),
            owner: valueOr(module.owner),
            supportGroup: valueOr(module.support_group),
            version: valueOr(module.version),
            healthCheck: valueOr(module.health_check),
            lastFailure: fmt(module.last_failure_at),
            capabilities,
            environments,
            settings,
            pages: Array.isArray(module.pages) ? module.pages.filter(page => page && page.url) : [],
            configuration: {
                status: valueOr(configuration.status, "Unknown"),
            },
            frontend: {
                endpoint: valueOr(frontend.endpoint, "Not available"),
                method: valueOr(frontend.method),
                authentication: valueOr(frontend.authentication),
            },
            upstream: {
                provider: valueOr(upstream.provider, module.source_name || "Not specified"),
                method: valueOr(upstream.method),
                authentication: valueOr(upstream.authentication),
                endpointConfigured: Boolean(upstream.endpoint_configured),
                endpointStatus: upstream.endpoint_configured
                    ? "Configured"
                    : "Not configured",
            },
            lastSync: fmt(module.last_success_at),
        };
    }

    function tagsMarkup(tags) {
        if (!tags.length) return "";
        return `<div class="integration-tags">${tags
            .map(tag => `<span>${esc(tag)}</span>`)
            .join("")}</div>`;
    }

    function factsMarkup(items) {
        return `<dl class="drawer-facts">${items.map(([term, detail, isCode = false]) => `
            <dt>${esc(term)}</dt>
            <dd>${isCode ? `<code>${esc(detail)}</code>` : esc(detail)}</dd>
        `).join("")}</dl>`;
    }

    function documentationMarkup(meta, sectionClass = "drawer-section") {
        if (!meta.documentationUrl) return "";
        return `
            <section class="${sectionClass}">
                <h3>Documentation</h3>
                <a class="integration-button" href="${esc(meta.documentationUrl)}"
                   target="_blank" rel="noopener noreferrer">Open Documentation</a>
            </section>
        `;
    }

    function pagesMarkup(meta) {
        if (!meta.pages.length) return "";
        return `
            <nav class="integration-pages" aria-label="${esc(meta.name)} pages">
                ${meta.pages.map(page => `<a href="${esc(page.url)}">${esc(page.label)}</a>`).join("")}
            </nav>
        `;
    }

    function card(module) {
        const meta = moduleMeta(module);

        return `
            <article class="integration-card">
                <header class="integration-card__header">
                    ${icon(module)}
                    <div>
                        <h2>${esc(meta.name)}</h2>
                        <p>${esc(meta.source)}</p>
                    </div>
                </header>

                <div class="integration-badges">
                    <span class="integration-badge integration-badge--${meta.enabled ? "enabled" : "disabled"}">
                        ${meta.enabled ? "Enabled" : "Disabled"}
                    </span>
                </div>

                <p class="integration-card__description">${esc(meta.description)}</p>
                ${tagsMarkup(meta.tags)}

                <dl class="integration-meta">
                    <dt>Endpoint</dt>
                    <dd><code>${esc(meta.frontend.endpoint)}</code></dd>
                    <dt>Method</dt>
                    <dd>${esc(meta.frontend.method)}</dd>
                    <dt>Auth Type</dt>
                    <dd>${esc(meta.frontend.authentication)}</dd>
                    <dt>Last Sync</dt>
                    <dd>${esc(meta.lastSync)}</dd>
                </dl>
                ${pagesMarkup(meta)}

                <footer class="integration-card__actions">
                    <button type="button" class="integration-button integration-button--primary" data-settings="${esc(meta.moduleKey)}">
                        ⚙ Settings
                    </button>
                    <button type="button" class="integration-button" data-test="${esc(meta.moduleKey)}">
                        ✓ Test
                    </button>
                    <button type="button" class="integration-button" data-view="${esc(meta.moduleKey)}">
                        View
                    </button>
                    ${staff ? `
                        <button
                            type="button"
                            class="integration-button integration-button--icon"
                            data-edit="${esc(meta.moduleKey)}"
                            aria-label="Edit ${esc(meta.name)}"
                        >•••</button>
                    ` : ""}
                </footer>
            </article>
        `;
    }

    function draw() {
        const searchText = el.search.value.toLowerCase();
        let filtered = rows.filter(module => (
            (!searchText || JSON.stringify(module).toLowerCase().includes(searchText))
            && (el.source.value === "all" || module.source_name === el.source.value)
            && (
                el.status.value === "all"
                || (el.status.value === "enabled" ? module.enabled : !module.enabled)
            )
        ));

        filtered.sort((a, b) => valueOr(a.name, "").localeCompare(valueOr(b.name, "")));

        const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
        if (page > pages) page = pages;
        const start = (page - 1) * pageSize;
        const visible = filtered.slice(start, start + pageSize);
        el.grid.innerHTML = visible.map(card).join("");
        el.count.textContent = filtered.length
            ? `${start + 1}–${start + visible.length} of ${filtered.length}`
            : "0 modules";
        renderPager(pages);
        el.loading.hidden = true;
        el.empty.hidden = Boolean(filtered.length);
    }

    function renderPager(pages) {
        if (!el.pager) return;
        el.pager.hidden = pages < 2;
        if (pages < 2) {
            el.pager.innerHTML = "";
            return;
        }
        const numbers = [];
        for (let number = 1; number <= pages; number += 1) {
            numbers.push(`
                <button type="button" data-page="${number}" class="${number === page ? "is-active" : ""}" aria-label="Page ${number}" ${number === page ? "aria-current=\"page\"" : ""}>${number}</button>
            `);
        }
        el.pager.innerHTML = `
            <button type="button" data-page-prev ${page === 1 ? "disabled" : ""}>Previous</button>
            ${numbers.join("")}
            <button type="button" data-page-next ${page === pages ? "disabled" : ""}>Next</button>
        `;
    }

    function settingRows(module) {
        const settings = moduleMeta(module).settings;
        if (!settings.length) {
            return '<p class="empty-copy">No module settings declared.</p>';
        }

        return settings.map(setting => `
            <div class="setting-row">
                <div>
                    <strong>${esc(valueOr(setting.name, "Unnamed setting"))}</strong>
                    <small>
                        ${esc(label(setting.category))}${setting.secret ? " · Secret" : ""}
                    </small>
                </div>
                <span class="status-pill status-pill--${setting.configured ? "passed" : "failed"}">
                    ${setting.configured ? "Configured" : "Missing"}
                </span>
            </div>
        `).join("");
    }

    function openDrawer(panel, backdrop) {
        if (!panel) return;
        if (backdrop) backdrop.hidden = false;
        panel.classList.add("is-open");
        panel.setAttribute("aria-hidden", "false");
        panel.focus();
    }

    function closeDrawer(panel, backdrop) {
        panel?.classList.remove("is-open");
        panel?.setAttribute("aria-hidden", "true");
        if (backdrop) backdrop.hidden = true;
    }

    function openSettings(moduleKey) {
        const module = find(moduleKey);
        if (!module) return;
        const meta = moduleMeta(module);

        el.settingsTitle.textContent = meta.name;
        el.settingsSource.textContent = meta.source;
        el.settingsBody.innerHTML = `
            <div class="drawer-identity">
                ${icon(module)}
                <div>
                    <strong>${esc(meta.name)}</strong>
                    <p>${esc(meta.description)}</p>
                </div>
            </div>

            <div class="result-card-grid">
                <article>
                    <span>Status</span>
                    <strong>${meta.enabled ? "Enabled" : "Disabled"}</strong>
                </article>
                <article>
                    <span>Configuration</span>
                    <strong>${esc(label(meta.configuration.status))}</strong>
                </article>
                <article>
                    <span>Last Sync</span>
                    <strong>${esc(meta.lastSync)}</strong>
                </article>
            </div>

            <section class="drawer-section">
                <h3>Module Information</h3>
                ${factsMarkup([
                    ["Owner", meta.owner],
                    ["Support", meta.supportGroup],
                    ["Version", meta.version],
                    ["Health Check", meta.healthCheck],
                    ["Last Success", meta.lastSync],
                    ["Last Failure", meta.lastFailure],
                ])}
            </section>

            ${meta.environments.length ? `
                <section class="drawer-section">
                    <h3>Environments</h3>
                    ${tagsMarkup(meta.environments)}
                </section>
            ` : ""}

            <section class="drawer-section">
                <h3>Frontend API</h3>
                ${factsMarkup([
                    ["Endpoint", meta.frontend.endpoint, true],
                    ["Method", meta.frontend.method],
                    ["Authentication", meta.frontend.authentication],
                ])}
            </section>

            <section class="drawer-section">
                <h3>Upstream Integration</h3>
                ${factsMarkup([
                    ["Provider", meta.upstream.provider],
                    ["Method", meta.upstream.method],
                    ["Authentication", meta.upstream.authentication],
                    ["Endpoint", meta.upstream.endpointStatus],
                ])}
            </section>

            ${meta.capabilities.length ? `
                <section class="drawer-section">
                    <h3>Capabilities</h3>
                    ${tagsMarkup(meta.capabilities)}
                </section>
            ` : ""}

            ${documentationMarkup(meta)}

            <section class="drawer-section">
                <h3>Configuration</h3>
                <div class="settings-list">${settingRows(module)}</div>
            </section>
        `;

        openDrawer(el.settings, el.settingsBackdrop);
    }

    function view(moduleKey) {
        const module = find(moduleKey);
        if (!module) return;
        const meta = moduleMeta(module);

        el.viewTitle.textContent = meta.name;
        el.viewBody.innerHTML = `
            <div class="drawer-identity">
                ${icon(module)}
                <div>
                    <strong>${esc(meta.name)}</strong>
                    <p>${esc(meta.source)}</p>
                </div>
            </div>
            <p class="modal-lead">${esc(meta.description)}</p>
            ${tagsMarkup(meta.tags)}
            ${pagesMarkup(meta)}

            <section class="modal-section">
                <h3>Module Information</h3>
                ${factsMarkup([
                    ["Owner", meta.owner],
                    ["Support", meta.supportGroup],
                    ["Version", meta.version],
                    ["Health Check", meta.healthCheck],
                    ["Last Success", meta.lastSync],
                    ["Last Failure", meta.lastFailure],
                ])}
            </section>

            ${meta.capabilities.length ? `
                <section class="modal-section">
                    <h3>Capabilities</h3>
                    ${tagsMarkup(meta.capabilities)}
                </section>
            ` : ""}

            ${meta.environments.length ? `
                <section class="modal-section">
                    <h3>Environments</h3>
                    ${tagsMarkup(meta.environments)}
                </section>
            ` : ""}

            ${documentationMarkup(meta, "modal-section")}

            <div class="view-grid">
                <article>
                    <h3>Frontend API</h3>
                    ${factsMarkup([
                        ["Endpoint", meta.frontend.endpoint, true],
                        ["Method", meta.frontend.method],
                        ["Authentication", meta.frontend.authentication],
                    ])}
                </article>
                <article>
                    <h3>Upstream Integration</h3>
                    ${factsMarkup([
                        ["Provider", meta.upstream.provider],
                        ["Method", meta.upstream.method],
                        ["Authentication", meta.upstream.authentication],
                        ["Endpoint configured", meta.upstream.endpointConfigured ? "Yes" : "No"],
                    ])}
                </article>
            </div>
            <section class="modal-section">
                <h3>Configuration requirements</h3>
                <div class="settings-list">${settingRows(module)}</div>
            </section>
        `;
        el.view.showModal();
    }

    function editMarkup(module) {
        const editable = module.editable || module;
        return `
            <section class="edit-icon-row">
                ${icon(module)}
                <div>
                    <label class="upload-button">
                        Upload new icon
                        <input type="file" data-icon accept="image/png,image/jpeg,image/webp">
                    </label>
                    <p>PNG, JPEG, or WebP up to 2 MB. Display size is 48×48.</p>
                </div>
            </section>
            <div class="edit-fields">
                <label>
                    Name
                    <input name="name" maxlength="200" value="${esc(editable.name || module.name)}" required>
                </label>
                <label>
                    Description
                    <textarea name="description" rows="4">${esc(editable.description || module.description)}</textarea>
                </label>
                <label>
                    Source name
                    <input name="source_name" maxlength="200" value="${esc(editable.source_name || module.source_name)}">
                </label>
                <label class="edit-check">
                    <input name="enabled" type="checkbox" ${(editable.enabled ?? module.enabled) ? "checked" : ""}>
                    Enabled
                </label>
                <label>
                    Operational overrides
                    <textarea name="config" rows="9" spellcheck="false">${esc(JSON.stringify(editable.config || {}, null, 2))}</textarea>
                </label>
            </div>
        `;
    }

    async function openEdit(moduleKey) {
        const module = find(moduleKey);
        if (!module || !staff || !el.edit) return;

        editing = module;
        el.editTitle.textContent = `Edit ${moduleMeta(module).name}`;
        el.editKey.textContent = module.module_key;
        el.editBody.innerHTML = '<div class="integration-state">Loading editor...</div>';
        openDrawer(el.edit, el.editBackdrop);

        try {
            if (module.manage_url) {
                const response = await fetch(module.manage_url, {
                    credentials: "same-origin",
                    headers: {Accept: "application/json"},
                });
                if (!response.ok) throw Error(response.status);
                editing = await response.json();
            }
            el.editBody.innerHTML = editMarkup(editing);
            el.editMsg.textContent = "";
        } catch (error) {
            console.error(error);
            el.editMsg.textContent = "Unable to load editable module data.";
        }
    }

    function resultCards(run) {
        const checks = run.checks || [];
        const count = status => checks.filter(check => check.status === status).length;
        return `
            <div class="test-summary-grid">
                <article><span>Overall</span><strong>${esc(label(run.status))}</strong></article>
                <article><span>Passed</span><strong>${count("passed")}</strong></article>
                <article><span>Failed</span><strong>${count("failed")}</strong></article>
                <article><span>Warnings</span><strong>${count("warning")}</strong></article>
            </div>
        `;
    }

    function renderChecks(run) {
        const groups = {};
        (run.checks || []).forEach(check => (groups[check.category] ??= []).push(check));
        el.testSummary.innerHTML = resultCards(run);
        el.testResults.innerHTML = Object.entries(groups).map(([category, items]) => `
            <section class="test-category">
                <h3>${esc(category)}</h3>
                ${items.map(check => `
                    <article class="test-check test-check--${esc(check.status)}">
                        <div>
                            <strong>${esc(check.name)}</strong>
                            <p>${esc(check.message)}</p>
                            ${check.remediation ? `
                                <div class="test-remediation">
                                    <b>How to fix:</b> ${esc(check.remediation)}
                                </div>
                            ` : ""}
                        </div>
                        <span>${esc(String(check.status).toUpperCase())}</span>
                    </article>
                `).join("")}
            </section>
        `).join("");
    }

    function openTest(moduleKey) {
        testing = find(moduleKey);
        if (!testing) return;
        el.testTitle.textContent = `${moduleMeta(testing).name} Readiness Test`;
        el.testSummary.innerHTML = `
            <div class="test-summary-grid">
                <article><span>Overall</span><strong>Not Run</strong></article>
                <article><span>Passed</span><strong>0</strong></article>
                <article><span>Failed</span><strong>0</strong></article>
                <article><span>Warnings</span><strong>0</strong></article>
            </div>
        `;
        el.testResults.innerHTML = '<div class="integration-state">Select Run Test to execute production-readiness checks.</div>';
        el.test.showModal();
    }

    async function runTest() {
        if (!testing?.test_run_url) return;
        el.runTest.disabled = true;
        el.runTest.textContent = "Running...";

        try {
            const response = await fetch(testing.test_run_url, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "X-CSRFToken": csrf(),
                },
            });
            const data = await response.json();
            if (!response.ok) throw Error(response.status);
            renderChecks(data);
        } catch (error) {
            console.error(error);
            el.testResults.innerHTML = '<div class="integration-state integration-state--error">The readiness test could not be completed.</div>';
        } finally {
            el.runTest.disabled = false;
            el.runTest.textContent = "Run Test";
        }
    }

    async function saveEdit(event) {
        event.preventDefault();
        if (!editing?.manage_url) return;

        const formData = new FormData(el.editForm);
        let config;
        try {
            config = JSON.parse(formData.get("config") || "{}");
        } catch (_error) {
            el.editMsg.textContent = "Operational overrides must be valid JSON.";
            return;
        }

        el.editMsg.textContent = "Saving...";
        try {
            const response = await fetch(editing.manage_url, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "X-CSRFToken": csrf(),
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name: formData.get("name"),
                    description: formData.get("description"),
                    source_name: formData.get("source_name"),
                    enabled: formData.get("enabled") === "on",
                    config,
                }),
            });
            if (!response.ok) throw Error(response.status);

            const file = el.editForm.querySelector("[data-icon]")?.files?.[0];
            if (file && editing.icon_upload_url) {
                const iconData = new FormData();
                iconData.append("icon", file);
                const upload = await fetch(editing.icon_upload_url, {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {"X-CSRFToken": csrf()},
                    body: iconData,
                });
                if (!upload.ok) throw Error(upload.status);
            }

            await load();
            closeDrawer(el.edit, el.editBackdrop);
            editing = null;
        } catch (error) {
            console.error(error);
            el.editMsg.textContent = "Unable to save changes.";
        }
    }

    function applyLayout(layout) {
        const supported = new Set(["grid-4", "grid-3", "list"]);
        const selected = supported.has(layout) ? layout : "grid-4";
        activeLayout = selected;
        el.grid.dataset.layout = selected;
        try {
            localStorage.setItem("integrationCatalogLayout", selected);
        } catch (_error) {
            // Layout still applies for the current page session.
        }
        root.querySelectorAll("[data-layout-choice]").forEach(button => {
            const selectedButton = button.dataset.layoutChoice === selected;
            button.classList.toggle("is-active", selectedButton);
            button.setAttribute("aria-pressed", selectedButton ? "true" : "false");
        });
    }

    function bindLayoutControls() {
        const switcher = root.querySelector("[data-layout-switch]");
        if (switcher) {
            switcher.addEventListener("click", event => {
                const button = event.target.closest("[data-layout-choice]");
                if (button) applyLayout(button.dataset.layoutChoice);
            });
        }
        applyLayout(activeLayout);
    }

    el.grid.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;
        if (button.dataset.settings) openSettings(button.dataset.settings);
        else if (button.dataset.test) openTest(button.dataset.test);
        else if (button.dataset.view) view(button.dataset.view);
        else if (button.dataset.edit) openEdit(button.dataset.edit);
    });

    document.querySelectorAll("[data-settings-close]").forEach(button => (
        button.addEventListener("click", () => closeDrawer(el.settings, el.settingsBackdrop))
    ));
    document.querySelectorAll("[data-view-close]").forEach(button => (
        button.addEventListener("click", () => el.view.close())
    ));
    document.querySelectorAll("[data-test-close]").forEach(button => (
        button.addEventListener("click", () => el.test.close())
    ));

    $("[data-edit-close]")?.addEventListener("click", () => closeDrawer(el.edit, el.editBackdrop));
    $("[data-edit-cancel]")?.addEventListener("click", () => closeDrawer(el.edit, el.editBackdrop));
    el.settingsBackdrop?.addEventListener("click", () => closeDrawer(el.settings, el.settingsBackdrop));
    el.editBackdrop?.addEventListener("click", () => closeDrawer(el.edit, el.editBackdrop));
    el.editForm?.addEventListener("submit", saveEdit);
    el.runTest?.addEventListener("click", runTest);
    [el.search, el.source, el.status].forEach(control => control.addEventListener("input", () => {
        page = 1;
        draw();
    }));
    if (el.pageSize) {
        el.pageSize.value = String(pageSize);
        el.pageSize.addEventListener("change", () => {
            const next = Number(el.pageSize.value);
            pageSize = pageSizes.includes(next) ? next : 8;
            page = 1;
            draw();
        });
    }
    el.pager?.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button || button.disabled) return;
        if (button.dataset.pagePrev !== undefined) page -= 1;
        else if (button.dataset.pageNext !== undefined) page += 1;
        else if (button.dataset.page) page = Number(button.dataset.page);
        draw();
        root.scrollIntoView({block: "start"});
    });

    async function load() {
        const response = await fetch(root.dataset.apiUrl, {
            credentials: "same-origin",
            headers: {Accept: "application/json"},
        });
        if (!response.ok) throw Error(response.status);

        const payload = await response.json();
        rows = payload.results || [];
        staff = Boolean(payload.is_staff);
        if (el.metric) {
            const enabled = rows.filter(module => module.enabled).length;
            el.metric.textContent = `${enabled}/${rows.length}`;
        }

        el.source.innerHTML = '<option value="all">All Sources</option>';
        [...new Set(rows.map(module => module.source_name).filter(Boolean))]
            .sort()
            .forEach(source => el.source.add(new Option(source, source)));
        draw();
    }

    bindLayoutControls();
    load().catch(error => {
        console.error(error);
        el.loading.hidden = true;
        el.error.hidden = false;
    });

    function getPath(object, path) {
        return String(path || "")
            .split(".")
            .reduce(
                (value, key) => (
                    value === null ||
                    value === undefined
                        ? undefined
                        : value[key]
                ),
                object,
            );
    }

    function isEmptyValue(value) {
        return (
            value === null ||
            value === undefined ||
            value === ""
        );
    }

    function formatCardValue(value, format) {
        switch (format) {
        case "datetime":
            return esc(fmt(value));

        case "boolean":
            return value ? "Yes" : "No";

        case "number": {
            const number = Number(value);

            return Number.isFinite(number)
                ? String(number)
                : "0";
        }

        case "status":
            return esc(label(value));

        case "code":
            return `<code>${esc(value)}</code>`;

        default:
            return esc(value);
        }
    }

    function cardFacts(module) {
        const fields =
            module.presentation?.card?.fields || [];

        const facts = fields
            .map(field => {
                const value = getPath(
                    module,
                    field.source,
                );

                if (
                    field.hide_if_empty !== false &&
                    isEmptyValue(value)
                ) {
                    return "";
                }

                return `
                    <dt>${esc(field.label)}</dt>
                    <dd>
                        ${formatCardValue(
                            value,
                            field.format,
                        )}
                    </dd>
                `;
            })
            .filter(Boolean)
            .join("");

        if (!facts) {
            return "";
        }

        return `
            <dl class="integration-meta">
                ${facts}
            </dl>
        `;
    }
})();
