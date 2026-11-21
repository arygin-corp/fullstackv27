(function () {
  const route = document.body?.dataset?.currentRoute || "";
  const pages = {
    "/dashboard/executive": "dashboard",
    "/ecommerce/products": "products",
    "/ecommerce/products/reviews": "reviews",
    "/ecommerce/orders": "requests",
    "/ecommerce/marketplace/vendors": "teams",
  };
  const kind = pages[route];
  if (!kind) return;
  const slot = document.querySelector("#content-inner");
  if (!slot) return;

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));

  const card = (label, value) => `<div class="rounded-xl border border-border bg-card p-4"><p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">${esc(label)}</p><p class="mt-2 text-2xl font-bold tracking-tight">${esc(value)}</p></div>`;
  const table = (headers, rows) => `<div class="overflow-x-auto rounded-xl border border-border bg-card"><table class="w-full min-w-[40rem] text-sm"><thead><tr class="border-b border-border text-start text-xs uppercase tracking-wider text-muted-foreground">${headers.map((header) => `<th class="px-4 py-3 text-start">${esc(header)}</th>`).join("")}</tr></thead><tbody class="divide-y divide-border">${rows}</tbody></table></div>`;
  const cells = (values) => `<tr>${values.map((value) => `<td class="px-4 py-3">${esc(value)}</td>`).join("")}</tr>`;
  const shell = (title, body) => `<div class="space-y-5"><div><p class="text-xs font-semibold uppercase tracking-wider text-primary">GDX live data</p><h1 class="mt-1 text-2xl font-bold tracking-tight">${esc(title)}</h1><p class="mt-1 text-sm text-muted-foreground">Loaded from the Data Marketplace backend. The rest of this template is still sample content.</p></div>${body}</div>`;

  slot.innerHTML = shell("Loading Data Marketplace records", `<p class="text-sm text-muted-foreground">Reading the live snapshot…</p>`);

  fetch("/api/theme-preview/snapshot/", { credentials: "same-origin", headers: { Accept: "application/json" } })
    .then((response) => {
      if (response.status === 401 || response.status === 403 || response.redirected) {
        throw new Error("Sign in at /login/ on this same host, then reload this page.");
      }
      if (!response.ok) throw new Error("The data snapshot did not load.");
      return response.json();
    })
    .then((data) => {
      const counts = data.counts || {};
      if (kind === "dashboard") {
        slot.innerHTML = shell("Executive Command Center", `
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            ${card("Products", counts.products)}
            ${card("Approved products", counts.products_approved)}
            ${card("Domains", counts.domains)}
            ${card("Teams", counts.teams)}
            ${card("Requests", counts.requests)}
            ${card("Pending requests", counts.requests_pending)}
            ${card("Approved requests", counts.requests_approved)}
            ${card("Rejected requests", counts.requests_rejected)}
            ${card("Reviews", counts.reviews)}
            ${card("Releases", `${counts.releases_published} published / ${counts.releases}`)}
          </div>
          <h2 class="text-lg font-semibold">Recent products</h2>
          ${table(["Product", "SKU", "Status", "Domain", "Team", "Created"], (data.products || []).slice(0, 8).map((item) => cells([item.name, item.sku, item.status, item.domain, item.team, item.created])).join(""))}
          <h2 class="text-lg font-semibold">Recent requests</h2>
          ${table(["Request", "RITM", "Approval", "Stage", "Opened"], (data.requests || []).slice(0, 8).map((item) => cells([item.number, item.ritm, item.approval, item.stage, item.opened])).join(""))}
          <h2 class="text-lg font-semibold">Recent releases</h2>
          ${table(["Version", "Title", "Status", "Released"], (data.releases || []).map((item) => cells([item.version, item.title, item.status, item.released])).join(""))}
        `);
      } else if (kind === "products") {
        slot.innerHTML = shell("Products", table(["Product", "SKU", "Status", "Domain", "Team", "Created"], (data.products || []).map((item) => cells([item.name, item.sku, item.status, item.domain, item.team, item.created])).join("")));
      } else if (kind === "teams") {
        slot.innerHTML = shell("Teams", table(["Team", "Products", "Created"], (data.teams || []).map((item) => cells([item.name, item.products, item.created])).join("")));
      } else if (kind === "requests") {
        slot.innerHTML = shell("Requests", `
          <div class="grid gap-3 sm:grid-cols-3">${card("Pending", counts.requests_pending)}${card("Approved", counts.requests_approved)}${card("Rejected", counts.requests_rejected)}</div>
          ${table(["Request", "RITM", "Approval", "Stage", "Opened"], (data.requests || []).map((item) => cells([item.number, item.ritm, item.approval, item.stage, item.opened])).join(""))}
        `);
      } else if (kind === "reviews") {
        slot.innerHTML = shell("Reviews", table(["Product", "Title", "Rating", "Status", "Created"], (data.reviews || []).map((item) => cells([item.product, item.title, item.rating, item.status, item.created])).join("")));
      }
    })
    .catch((error) => {
      slot.innerHTML = shell("Live data unavailable", `<p class="rounded-xl border border-border bg-card p-4 text-sm">${esc(error.message)}</p>`);
    });
})();
