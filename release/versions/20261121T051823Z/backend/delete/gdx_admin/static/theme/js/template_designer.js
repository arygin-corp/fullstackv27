document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("templateBuilderForm");
  const canvas = document.getElementById("builderCanvas");
  const schemaField = document.getElementById("builderSchema");
  const palette = document.getElementById("builderBlocks");
  const preview = document.getElementById("templatePreview");
  if (!form || !canvas || !schemaField || !palette || !preview) return;

  let blocks = [];
  try { blocks = JSON.parse(schemaField.value || "[]"); } catch (error) { blocks = []; }
  if (!Array.isArray(blocks)) blocks = [];

  const defaults = {
    heading: { text: "Notification heading", level: "h2", align: "left" },
    text: { text: "Add notification content.", align: "left" },
    button: { label: "View details", url: "#", style: "primary" },
    image: { src: "", alt: "", link: "" },
    divider: { spacing: "16" },
    variables: { key: "recipient_name", fallback: "Recipient" }
  };

  function normalize(block, index) {
    return { id: block.id || `block-${Date.now()}-${index}`, type: block.type || "text", order: index, config: block.config || { ...defaults[block.type] } };
  }
  function sync() { blocks = blocks.map(normalize); schemaField.value = JSON.stringify(blocks); updateChecks(); }
  function control(labelText, value, key, multiline) {
    const label = document.createElement("label"); label.className = "form-label w-100 small text-capitalize"; label.textContent = labelText.replaceAll("_", " ");
    const input = document.createElement(multiline ? "textarea" : "input"); input.className = "form-control form-control-sm mt-1"; input.value = value ?? ""; input.dataset.configKey = key;
    label.appendChild(input); return label;
  }
  function previewBlock(block) {
    const cfg = block.config || {};
    if (block.type === "heading") { const h = document.createElement(cfg.level || "h2"); h.textContent = cfg.text || ""; h.style.textAlign = cfg.align || "left"; return h; }
    if (block.type === "text") { const p = document.createElement("p"); p.textContent = cfg.text || ""; p.style.textAlign = cfg.align || "left"; return p; }
    if (block.type === "button") { const a = document.createElement("a"); a.className = "btn btn-primary"; a.href = cfg.url || "#"; a.textContent = cfg.label || "View details"; return a; }
    if (block.type === "image") { const wrap = document.createElement("div"); if (cfg.src) { const img = document.createElement("img"); img.src = cfg.src; img.alt = cfg.alt || ""; img.className = "img-fluid rounded"; wrap.appendChild(img); } else { wrap.className = "border rounded text-muted text-center p-4"; wrap.textContent = "Image URL not set"; } return wrap; }
    if (block.type === "divider") { return document.createElement("hr"); }
    const code = document.createElement("code"); code.textContent = `{{ ${cfg.key || "variable"} | default:${cfg.fallback || ""} }}`; return code;
  }
  function renderPreview() { preview.innerHTML = ""; if (!blocks.length) { preview.innerHTML = '<p class="text-muted text-center py-5">Preview appears after a block is added.</p>'; return; } blocks.forEach(block => preview.appendChild(previewBlock(block))); }
  function render() {
    canvas.innerHTML = "";
    if (!blocks.length) { canvas.innerHTML = `<div class="text-center text-muted py-5">${canvas.dataset.emptyText}</div>`; sync(); renderPreview(); return; }
    blocks.forEach((raw, index) => {
      const block = normalize(raw, index); blocks[index] = block;
      const card = document.createElement("section"); card.className = "card border shadow-none mb-3"; card.draggable = true;
      card.innerHTML = `<div class="card-header py-2 d-flex align-items-center gap-2"><i class="ti ti-grip-vertical text-muted"></i><strong class="text-capitalize">${block.type}</strong><span class="ms-auto"></span><button type="button" class="btn btn-sm btn-light" data-copy aria-label="Duplicate"><i class="ti ti-copy"></i></button><button type="button" class="btn btn-sm btn-light" data-up aria-label="Move up"><i class="ti ti-chevron-up"></i></button><button type="button" class="btn btn-sm btn-light" data-down aria-label="Move down"><i class="ti ti-chevron-down"></i></button><button type="button" class="btn btn-sm btn-outline-danger" data-remove aria-label="Remove"><i class="ti ti-trash"></i></button></div><div class="card-body"></div>`;
      const body = card.querySelector(".card-body");
      Object.entries(block.config || {}).forEach(([key, value]) => body.appendChild(control(key, value, key, key === "text")));
      body.querySelectorAll("[data-config-key]").forEach(input => input.addEventListener("input", () => { block.config[input.dataset.configKey] = input.value; sync(); renderPreview(); }));
      card.querySelector("[data-remove]").onclick = () => { blocks.splice(index, 1); render(); };
      card.querySelector("[data-copy]").onclick = () => { blocks.splice(index + 1, 0, { ...block, id: `block-${Date.now()}`, config: { ...block.config } }); render(); };
      card.querySelector("[data-up]").onclick = () => { if (index > 0) { [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]]; render(); } };
      card.querySelector("[data-down]").onclick = () => { if (index < blocks.length - 1) { [blocks[index + 1], blocks[index]] = [blocks[index], blocks[index + 1]]; render(); } };
      card.ondragstart = event => event.dataTransfer.setData("application/x-builder-index", String(index));
      card.ondragover = event => event.preventDefault();
      card.ondrop = event => { event.preventDefault(); const from = Number(event.dataTransfer.getData("application/x-builder-index")); if (Number.isInteger(from) && from !== index) { const moved = blocks.splice(from, 1)[0]; blocks.splice(index, 0, moved); render(); } };
      canvas.appendChild(card);
    }); sync(); renderPreview();
  }
  function add(type) { blocks.push(normalize({ type, config: { ...(defaults[type] || {}) } }, blocks.length)); render(); }
  function updateChecks() {
    let schemaValid = true; try { JSON.parse(schemaField.value || "[]"); } catch (error) { schemaValid = false; }
    const contentNames = ["email_html", "email_text", "sms_body", "push_body", "in_app_body", "teams_body", "digest_content"];
    const hasContent = contentNames.some(name => { const el = form.querySelector(`[name="${name}"]`); return el && el.value.trim(); });
    const states = { metadata: form.checkValidity(), content: hasContent, blocks: blocks.length > 0, schema: schemaValid };
    Object.entries(states).forEach(([key, ok]) => { const row = document.querySelector(`[data-check="${key}"]`); if (!row) return; row.querySelector("i").className = ok ? "ti ti-circle-check text-success me-2" : "ti ti-circle text-muted me-2"; });
  }
  palette.querySelectorAll("[data-block]").forEach(button => { button.onclick = () => add(button.dataset.block); button.ondragstart = event => event.dataTransfer.setData("text/plain", button.dataset.block); });
  canvas.ondragover = event => event.preventDefault(); canvas.ondrop = event => { const type = event.dataTransfer.getData("text/plain"); if (defaults[type]) { event.preventDefault(); add(type); } };
  document.querySelectorAll("[data-preview-width]").forEach(button => button.onclick = () => { document.querySelectorAll("[data-preview-width]").forEach(item => item.classList.remove("active")); button.classList.add("active"); canvas.style.maxWidth = button.dataset.previewWidth; preview.style.maxWidth = button.dataset.previewWidth; });
  document.querySelector("[data-refresh-preview]")?.addEventListener("click", renderPreview);
  form.addEventListener("input", updateChecks);
  form.addEventListener("submit", event => { sync(); if (!form.checkValidity() || !blocks.length) { event.preventDefault(); form.classList.add("was-validated"); updateChecks(); } });
  render();
});
