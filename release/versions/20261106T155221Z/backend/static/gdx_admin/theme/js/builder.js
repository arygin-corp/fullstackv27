(() => {
    "use strict";

    const TYPES = [
        {
            type: "text",
            label: "Short text",
            icon: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 7V4h22v3"></path><path d="M16 4v24"></path><path d="M11 28h10"></path></svg>`
        },
        {
            type: "textarea",
            label: "Long text",
            icon: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 7h22"></path><path d="M5 16h16"></path><path d="M5 25h20"></path></svg>`
        },
        {
            type: "email",
            label: "Email",
            icon: `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="7" width="24" height="18" rx="2"></rect><path d="m5 9 11 8 11-8"></path></svg>`
        },
        {
            type: "integer",
            label: "Number",
            icon: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12 4 9 28"></path><path d="M23 4 20 28"></path><path d="M5 12h23"></path><path d="M4 21h23"></path></svg>`
        },
        {
            type: "select",
            label: "Dropdown",
            icon: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m7 12 9 9 9-9"></path></svg>`
        },
        {
            type: "radio",
            label: "Radio group",
            icon: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m4 8 3 3 5-6"></path><path d="M16 8h12"></path><path d="m4 17 3 3 5-6"></path><path d="M16 17h12"></path><path d="m4 26 3 3 5-6"></path><path d="M16 26h12"></path></svg>`
        },
        {
            type: "checkbox",
            label: "Checkbox",
            icon: `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="5" width="22" height="22" rx="2"></rect><path d="m9 16 5 5L29 7"></path></svg>`
        },
        {
            type: "date",
            label: "Date",
            icon: `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="7" width="24" height="22" rx="2"></rect><path d="M10 3v8"></path><path d="M22 3v8"></path><path d="M4 14h24"></path></svg>`
        },
        {
            type: "static_text",
            label: "Section",
            icon: `<span class="heading-icon" aria-hidden="true">H<sub>2</sub></span>`
        }
    ];

    const OPS = ["equals", "not_equals", "contains", "gt", "is_empty"];
    const ACTIONS = ["show", "hide", "require", "optional", "enable", "disable", "set_value", "clear_value"];

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    const initialSchemaNode = $("#initial-schema");
    if (!initialSchemaNode) {
        console.error("Form Builder: #initial-schema was not found.");
        return;
    }

    let schema;
    try {
        schema = JSON.parse(initialSchemaNode.textContent);
    } catch (error) {
        console.error("Form Builder: initial schema is invalid JSON.", error);
        return;
    }

    schema.fields ??= [];
    schema.rules ??= [];

    let selected = schema.fields[0]?.key || null;
    let mode = "build";

    const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

    const keyify = (value) => String(value ?? "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^\d/, "field_$&")
        .replace(/^_|_$/g, "") || `field_${Date.now()}`;

    const uniqueKey = (label) => {
        const base = keyify(label);
        let candidate = base;
        let suffix = 2;
        while (schema.fields.some((field) => field.key === candidate)) {
            candidate = `${base}_${suffix}`;
            suffix += 1;
        }
        return candidate;
    };

    const optionMarkup = (field) => (field.options || [])
        .map((option) => `<option>${esc(option.label)}</option>`)
        .join("");

    function fieldInputHtml(field) {
        if (field.type === "textarea") {
            return `<textarea placeholder="${esc(field.placeholder)}" disabled></textarea>`;
        }

        if (field.type === "select") {
            return `<select disabled><option>${esc(field.placeholder || "Select...")}</option>${optionMarkup(field)}</select>`;
        }

        if (field.type === "radio") {
            return (field.options || []).map((option) => `
                <label class="choice-row">
                    <input type="radio" name="${esc(field.key)}" disabled>
                    <span>${esc(option.label)}</span>
                </label>
            `).join("");
        }

        if (field.type === "checkbox") {
            return `
                <label class="choice-row">
                    <input type="checkbox" disabled>
                    <span>${esc(field.help_text || field.label)}</span>
                </label>
            `;
        }

        if (field.type === "static_text") {
            return `<h2>${esc(field.label)}</h2>`;
        }

        const inputType = field.type === "integer" ? "number" : field.type;
        return `<input type="${esc(inputType)}" placeholder="${esc(field.placeholder)}" disabled>`;
    }

    function fieldHtml(field) {
        const required = field.required ? `<b class="danger" aria-label="required">*</b>` : "";
        const label = field.type === "static_text"
            ? ""
            : `<label>${esc(field.label)} ${required}</label>`;
        const help = field.help_text && field.type !== "checkbox"
            ? `<small>${esc(field.help_text)}</small>`
            : "";

        return `
            <article
                class="field-card ${selected === field.key ? "selected" : ""}"
                draggable="${mode === "build"}"
                data-key="${esc(field.key)}"
                tabindex="0"
            >
                ${mode === "build" ? `<span class="drag" aria-hidden="true">⠿</span>` : ""}
                ${label}
                ${fieldInputHtml(field)}
                ${help}
            </article>
        `;
    }

    function ruleHtml(rule, index) {
        const fields = schema.fields.map((field) =>
            `<option value="${esc(field.key)}">${esc(field.label)}</option>`
        ).join("");
        const condition = rule.conditions?.[0] || {};

        return `
            <div class="logic-card" data-rule="${index}">
                <span>If</span>
                <select data-r="source">${fields}</select>
                <select data-r="operator">
                    ${OPS.map((operator) => `<option value="${operator}">${operator}</option>`).join("")}
                </select>
                <input data-r="value" value="${esc(condition.value ?? "")}" aria-label="Condition value">
                <span>then</span>
                <select data-r="action">
                    ${ACTIONS.map((action) => `<option value="${action}">${action}</option>`).join("")}
                </select>
                <select data-r="target">${fields}</select>
                <button type="button" data-remove-rule="${index}" class="danger">Delete</button>
            </div>
        `;
    }

    function renderPalette() {
        const palette = $("#palette");
        if (!palette) return;

        palette.innerHTML = TYPES.map(({ type, label, icon }) => `
            <button
                type="button"
                class="palette-button"
                data-add="${type}"
                data-label="${esc(label)}"
                aria-label="Add ${esc(label)} field"
            >
                <span class="palette-icon">${icon}</span>
                <span class="palette-label">${esc(label)}</span>
            </button>
        `).join("");

        $$(".palette-button", palette).forEach((button) => {
            button.addEventListener("click", () => addField(button.dataset.add, button.dataset.label));
        });
    }

    function addField(type, label) {
        const key = uniqueKey(label);
        schema.fields.push({
            key,
            type,
            label,
            help_text: "",
            placeholder: "",
            required: false,
            hidden: false,
            disabled: false,
            read_only: false,
            default: null,
            order: schema.fields.length * 10,
            options: ["select", "radio"].includes(type)
                ? [{ label: "Option 1", value: "option_1", order: 0 }]
                : []
        });
        selected = key;
        mode = "build";
        setActiveModeButton();
        render();

        requestAnimationFrame(() => {
            const card = document.querySelector(`[data-key="${CSS.escape(key)}"]`);
            card?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    }

    function renderProperties() {
        const panel = $("#properties");
        if (!panel) return;

        const field = schema.fields.find((item) => item.key === selected);
        if (!field) {
            panel.innerHTML = `<h2>Properties</h2><p>Select a field.</p>`;
            return;
        }

        panel.innerHTML = `
            <h2>${esc(field.label)}</h2>
            <div class="row">
                <button type="button" id="duplicate">Duplicate</button>
                <button type="button" id="delete" class="danger">Delete</button>
            </div>

            <label for="property-label">Label</label>
            <input id="property-label" data-prop="label" value="${esc(field.label)}">

            <label for="property-key">Field key</label>
            <input id="property-key" data-prop="key" value="${esc(field.key)}">

            <label for="property-help">Help text</label>
            <textarea id="property-help" data-prop="help_text">${esc(field.help_text || "")}</textarea>

            <label for="property-placeholder">Placeholder</label>
            <input id="property-placeholder" data-prop="placeholder" value="${esc(field.placeholder || "")}">

            <label class="checkbox-row">
                <input type="checkbox" data-prop="required" ${field.required ? "checked" : ""}>
                <span>Required</span>
            </label>

            ${["select", "radio"].includes(field.type) ? `
                <label for="options">Options, one per line</label>
                <textarea id="options">${esc((field.options || []).map((option) => option.label).join("\n"))}</textarea>
            ` : ""}
        `;
    }

    function setActiveModeButton() {
        $$('[data-mode]').forEach((button) => {
            button.classList.toggle("active", button.dataset.mode === mode);
        });
    }

    function setPreviewControls() {
        const canvas = $("#canvas");
        if (!canvas) return;
        $$("input, textarea, select", canvas).forEach((control) => {
            if (["form-title", "form-description"].includes(control.id)) {
                control.disabled = mode !== "build";
            } else {
                control.disabled = mode !== "preview";
            }
        });
    }

    function render() {
        const counts = $("#counts");
        const canvas = $("#canvas");
        const logic = $("#logic");
        const json = $("#json");

        if (counts) counts.textContent = `${schema.fields.length} fields · ${schema.rules.length} logic rules`;

        canvas?.classList.toggle("hidden", !["build", "preview"].includes(mode));
        logic?.classList.toggle("hidden", mode !== "logic");
        json?.classList.toggle("hidden", mode !== "json");

        if (canvas) {
            canvas.innerHTML = `
                <div class="form-hero">
                    <input id="form-title" value="${esc(schema.title || "Untitled form")}" aria-label="Form title">
                    <textarea id="form-description" aria-label="Form description">${esc(schema.description || "")}</textarea>
                </div>
                <div class="form-fields">
                    ${schema.fields.length
                        ? schema.fields.map(fieldHtml).join("")
                        : `<p>Add a field from the library.</p>`}
                </div>
            `;
        }

        if (logic) {
            logic.innerHTML = `
                <button type="button" id="add-rule" class="primary">Add rule</button>
                ${schema.rules.map(ruleHtml).join("")}
            `;
        }

        if (json) {
            const pre = $("pre", json);
            if (pre) pre.textContent = JSON.stringify(schema, null, 2);
        }

        renderProperties();
        setPreviewControls();
        bindRenderedControls();
    }

    function bindRenderedControls() {
        const title = $("#form-title");
        const description = $("#form-description");

        if (title) title.addEventListener("input", (event) => { schema.title = event.target.value; });
        if (description) description.addEventListener("input", (event) => { schema.description = event.target.value; });

        $$(".field-card").forEach((card) => {
            const selectCard = () => {
                if (mode !== "build") return;
                selected = card.dataset.key;
                render();
            };

            card.addEventListener("click", selectCard);
            card.addEventListener("keydown", (event) => {
                if (["Enter", " "].includes(event.key)) {
                    event.preventDefault();
                    selectCard();
                }
            });

            card.addEventListener("dragstart", (event) => {
                if (mode !== "build") return event.preventDefault();
                event.dataTransfer.setData("text/plain", card.dataset.key);
                event.dataTransfer.effectAllowed = "move";
                card.classList.add("dragging");
            });
            card.addEventListener("dragend", () => card.classList.remove("dragging"));
            card.addEventListener("dragover", (event) => {
                if (mode === "build") event.preventDefault();
            });
            card.addEventListener("drop", (event) => {
                if (mode !== "build") return;
                event.preventDefault();
                const fromKey = event.dataTransfer.getData("text/plain");
                const toKey = card.dataset.key;
                const fromIndex = schema.fields.findIndex((field) => field.key === fromKey);
                const toIndex = schema.fields.findIndex((field) => field.key === toKey);
                if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
                const [moved] = schema.fields.splice(fromIndex, 1);
                schema.fields.splice(toIndex, 0, moved);
                schema.fields.forEach((field, index) => { field.order = index * 10; });
                render();
            });
        });

        $$('[data-prop]').forEach((control) => {
            control.addEventListener("change", (event) => {
                const field = schema.fields.find((item) => item.key === selected);
                if (!field) return;

                const property = event.target.dataset.prop;
                const oldKey = field.key;
                const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
                field[property] = property === "key" ? keyify(value) : value;

                if (oldKey !== field.key) {
                    schema.rules.forEach((rule) => {
                        (rule.conditions || []).forEach((condition) => {
                            if (condition.source === oldKey) condition.source = field.key;
                        });
                        if (rule.target === oldKey) rule.target = field.key;
                    });
                    selected = field.key;
                }
                render();
            });
        });

        $("#options")?.addEventListener("change", (event) => {
            const field = schema.fields.find((item) => item.key === selected);
            if (!field) return;
            field.options = event.target.value
                .split("\n")
                .map((label) => label.trim())
                .filter(Boolean)
                .map((label, index) => ({ label, value: keyify(label), order: index * 10 }));
            render();
        });

        $("#delete")?.addEventListener("click", () => {
            schema.fields = schema.fields.filter((field) => field.key !== selected);
            schema.rules = schema.rules.filter((rule) =>
                rule.target !== selected && !(rule.conditions || []).some((condition) => condition.source === selected)
            );
            selected = schema.fields[0]?.key || null;
            render();
        });

        $("#duplicate")?.addEventListener("click", () => {
            const source = schema.fields.find((field) => field.key === selected);
            if (!source) return;
            const copy = structuredClone(source);
            copy.label = `${source.label} copy`;
            copy.key = uniqueKey(copy.label);
            copy.order = schema.fields.length * 10;
            schema.fields.push(copy);
            selected = copy.key;
            render();
        });

        $("#add-rule")?.addEventListener("click", () => {
            const key = schema.fields[0]?.key;
            if (!key) return;
            schema.rules.push({
                name: `Rule ${schema.rules.length + 1}`,
                mode: "all",
                priority: schema.rules.length * 10,
                conditions: [{ source: key, operator: "equals", value: "" }],
                action: "show",
                target: key
            });
            render();
        });

        $$('[data-rule]').forEach((card) => {
            const index = Number(card.dataset.rule);
            const rule = schema.rules[index];
            const condition = rule?.conditions?.[0];
            if (!rule || !condition) return;

            const source = $('[data-r="source"]', card);
            const operator = $('[data-r="operator"]', card);
            const action = $('[data-r="action"]', card);
            const target = $('[data-r="target"]', card);
            if (source) source.value = condition.source;
            if (operator) operator.value = condition.operator;
            if (action) action.value = rule.action;
            if (target) target.value = rule.target;

            $$('[data-r]', card).forEach((control) => {
                control.addEventListener("change", (event) => {
                    const key = event.target.dataset.r;
                    if (["source", "operator", "value"].includes(key)) condition[key] = event.target.value;
                    else rule[key] = event.target.value;
                });
            });
        });

        $$('[data-remove-rule]').forEach((button) => {
            button.addEventListener("click", () => {
                schema.rules.splice(Number(button.dataset.removeRule), 1);
                render();
            });
        });
    }

    function csrfToken() {
        return document.cookie
            .split("; ")
            .find((item) => item.startsWith("csrftoken="))
            ?.split("=")[1] || "";
    }

    function setSaving(button, saving, normalText) {
        if (!button) return;
        button.disabled = saving;
        button.textContent = saving ? "Working..." : normalText;
    }

    async function saveSchema() {
        const button = $("#save");
        setSaving(button, true, "Save schema");
        try {
            const response = await fetch(window.FORM_BUILDER.schemaUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken()
                },
                body: JSON.stringify(schema)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(JSON.stringify(data.errors || data, null, 2));
            schema = data;
            selected = schema.fields.some((field) => field.key === selected)
                ? selected
                : schema.fields[0]?.key || null;
            window.alert("Schema saved.");
            render();
        } catch (error) {
            window.alert(error.message || "Unable to save the schema.");
        } finally {
            setSaving(button, false, "Save schema");
        }
    }

    async function publishSchema() {
        const button = $("#publish");
        setSaving(button, true, "Publish");
        try {
            const response = await fetch(window.FORM_BUILDER.publishUrl, {
                method: "POST",
                headers: { "X-CSRFToken": csrfToken() }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(JSON.stringify(data.errors || data, null, 2));
            schema.is_published = true;
            window.alert("Form published.");
            render();
        } catch (error) {
            window.alert(error.message || "Unable to publish the form.");
        } finally {
            setSaving(button, false, "Publish");
        }
    }

    function bindStaticControls() {
        $$('[data-mode]').forEach((button) => {
            button.addEventListener("click", () => {
                mode = button.dataset.mode;
                setActiveModeButton();
                render();
            });
        });
        $("#save")?.addEventListener("click", saveSchema);
        $("#publish")?.addEventListener("click", publishSchema);
    }

    renderPalette();
    bindStaticControls();
    setActiveModeButton();
    render();
})();
