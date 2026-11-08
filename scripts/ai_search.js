"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const marketplace = path.join(root, "backend/assets/json/marketplace");
const outputFile = path.join(marketplace, "ai_search", "ai_search.json");

const TYPO_THRESHOLD = 0.68;

const ORDER_FILES = [
  path.join(marketplace, "historical", "enriched_orders.json"),
  path.join(marketplace, "historical", "orders.json"),
  path.join(marketplace, "historical", "all_historical_orders.json"),
  path.join(marketplace, "orders", "master_orders.json")
];

const FORM_FILE = path.join(marketplace, "historical", "formData.json");

const SUCCESS_PHRASES = [
  "access provisioned",
  "approved",
  "access granted",
  "permission granted",
  "completed provisioning",
  "access has been provided"
];

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return value == null ? [] : [value];
}

function text(value) {
  return String(value == null ? "" : value).trim();
}

function normalize(value) {
  return text(value).toLowerCase().replace(/[\s-]+/g, "_");
}

function unique(values) {
  const seen = new Set();
  const result = [];
  values.forEach(value => {
    const cleaned = text(value);
    const key = normalize(cleaned);
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(cleaned);
  });
  return result.sort((left, right) => left.localeCompare(right));
}

function splitNames(value) {
  if (Array.isArray(value)) return value.flatMap(splitNames);
  const raw = text(value);
  if (!raw) return [];
  return raw.split(/[,;\n|]+/).map(part => part.trim()).filter(Boolean);
}

function levenshtein(left, right) {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let row = 0; row < rows; row += 1) grid[row][0] = row;
  for (let col = 0; col < cols; col += 1) grid[0][col] = col;
  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = left[row - 1] === right[col - 1] ? 0 : 1;
      grid[row][col] = Math.min(
        grid[row - 1][col] + 1,
        grid[row][col - 1] + 1,
        grid[row - 1][col - 1] + cost
      );
    }
  }
  return grid[left.length][right.length];
}

function similarity(left, right) {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

function correctName(entered, vocabulary) {
  const typed = text(entered);
  if (!typed) return null;
  let best = null;
  vocabulary.forEach(candidate => {
    const score = similarity(typed, candidate);
    if (score < TYPO_THRESHOLD) return;
    if (!best || score > best.score) {
      best = { entered: typed, corrected: candidate, score: Number(score.toFixed(3)) };
    }
  });
  return best;
}

function safeAdGroupFile(value) {
  return normalize(value).replace(/\W+/g, "_");
}

function isDuplicateDenodoFile(fileName) {
  const stem = fileName.replace(/\.json$/i, "");
  const suffix = stem.split(".").pop();
  return stem.includes(".") && suffix.length > 8;
}

function loadDenodo() {
  const directory = path.join(marketplace, "denodo");
  const byAdGroup = new Map();
  if (!fs.existsSync(directory)) return byAdGroup;

  fs.readdirSync(directory).filter(name => name.endsWith(".json") && !isDuplicateDenodoFile(name)).forEach(name => {
    let payload;
    try {
      payload = JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
    } catch (error) {
      console.warn(`Skipped unreadable Denodo file ${name}`);
      return;
    }
    const rows = Array.isArray(payload && payload.elements) ? payload.elements : [];
    rows.forEach(row => {
      const adgroup = text(row.userrolename);
      const database = text(row.dbname);
      const table = text(row.elementname);
      const column = text(row.column_name);
      if (!adgroup || !database || !table) return;
      const record = byAdGroup.get(adgroup) || { databases: [], tables: [], columns: [], assets: new Map() };
      const assetKey = `${normalize(database)}::${normalize(table)}`;
      const asset = record.assets.get(assetKey) || { database, table, columns: [] };
      if (column && !asset.columns.some(existing => normalize(existing) === normalize(column))) {
        asset.columns.push(column);
      }
      record.assets.set(assetKey, asset);
      byAdGroup.set(adgroup, record);
    });
  });

  byAdGroup.forEach(record => {
    record.databases = unique([...record.assets.values()].map(asset => asset.database));
    record.tables = unique([...record.assets.values()].map(asset => asset.table));
    record.columns = unique([...record.assets.values()].flatMap(asset => asset.columns));
  });
  const resolved = new Map();
  byAdGroup.forEach((record, adgroup) => {
    resolved.set(adgroup, record);
    resolved.set(normalize(adgroup), record);
    resolved.set(safeAdGroupFile(adgroup), record);
  });
  return resolved;
}

function variableMap(order) {
  const sources = [
    order && order.formData,
    order && order.variables,
    order && order.request_info && order.request_info.variables,
    order && order.form_data
  ];
  const values = {};
  sources.forEach(source => {
    if (!source) return;
    if (Array.isArray(source)) {
      source.forEach(item => {
        if (item && item.name) values[item.name] = item.value;
      });
      return;
    }
    if (typeof source === "string") {
      const parsed = parsedVariables(source);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        Object.keys(parsed).forEach(key => {
          if (values[key] == null) values[key] = parsed[key];
        });
      }
      values._tokens = unique((values._tokens || []).concat(variableTokens(source)));
      return;
    }
    if (typeof source === "object") {
      Object.keys(source).forEach(key => {
        if (values[key] == null) values[key] = source[key];
      });
    }
  });
  return values;
}

function parsedVariables(value) {
  const trimmed = text(value);
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    return null;
  }
}

function variableTokens(value) {
  return text(value)
    .split(/[,{}"']+/)
    .map(part => part.trim())
    .filter(part => part && part !== "-- None --" && part.length >= 3);
}

function commentsText(order) {
  const comments = order && (order.ritm_comments || (order.request_info && order.request_info.comments));
  if (Array.isArray(comments)) return comments.map(item => text(item && (item.comment || item.value || item))).join(" ").toLowerCase();
  return text(comments).toLowerCase();
}

function field(order, names) {
  for (const name of names) {
    if (order && order[name] != null && text(order[name])) return order[name];
    const info = order && order.request_info;
    if (info && info[name] != null && text(info[name])) return info[name];
  }
  return "";
}

function isApproved(order) {
  const state = normalize(field(order, ["ritm_state", "status"]));
  const approval = normalize(field(order, ["approval_stage", "approvalStage", "approval"]));
  const stage = normalize(field(order, ["stage"]));
  const comments = commentsText(order);
  const phrase = SUCCESS_PHRASES.some(item => comments.includes(item));
  const closed = state === "closed_complete";
  const approved = approval === "approved";
  const completed = stage === "completed";
  const rejected = approval === "rejected" || state === "closed_incomplete" || state === "closed_skipped";
  if (rejected) return false;
  if (approved || completed) return true;
  if (closed && !approval && !stage) return true;
  return closed && phrase;
}

function loadOrders() {
  const orders = [];
  const seen = new Set();
  ORDER_FILES.forEach(filePath => {
    const rows = asArray(readJson(filePath, []));
    rows.forEach(row => {
      const key = text(row.number || row.request_number || row.ritm_number || (row.request_info && row.request_info.number));
      if (key && seen.has(key)) return;
      if (key) seen.add(key);
      orders.push(row);
    });
  });

  const forms = asArray(readJson(FORM_FILE, []));
  const formsByNumber = new Map();
  forms.forEach(form => {
    const key = text(form.ritm_number || form.number);
    if (key) formsByNumber.set(key, form);
  });
  return orders.map(order => {
    const key = text(order.number || order.ritm_number || (order.request_info && order.request_info.number));
    const form = formsByNumber.get(key);
    return form ? { ...order, formData: order.formData || form.variables || form } : order;
  });
}

function indexProducts(products) {
  const byId = new Map();
  const byAdGroup = new Map();
  const byName = new Map();
  products.forEach(product => {
    if (product && product.id != null) byId.set(String(product.id), product);
    const adgroup = text(product.adgroup);
    if (adgroup) {
      const list = byAdGroup.get(normalize(adgroup)) || [];
      list.push(product);
      byAdGroup.set(normalize(adgroup), list);
    }
    if (product.slug) byName.set(normalize(product.slug), product);
    if (product.name) byName.set(normalize(product.name), product);
    if (product.sku) byName.set(normalize(product.sku), product);
  });
  return { byId, byAdGroup, byName };
}

function matchingProducts(order, variables, index) {
  const productId = text(order.product_id || (order.request_info && order.request_info.product_id) || variables.product_id);
  if (productId && index.byId.has(productId)) return [index.byId.get(productId)];

  const adgroup = text(variables.v_dar_ad_group || variables.adgroup || order.adgroup);
  if (adgroup && index.byAdGroup.has(normalize(adgroup))) return index.byAdGroup.get(normalize(adgroup));

  const name = text(variables.product_name || variables.v_dar_product || order.product_name);
  const found = [];
  if (name && index.byName.has(normalize(name))) found.push(index.byName.get(normalize(name)));
  asArray(variables._tokens).forEach(token => {
    const key = normalize(token);
    if (index.byAdGroup.has(key)) found.push(...index.byAdGroup.get(key));
    if (index.byName.has(key)) found.push(index.byName.get(key));
  });
  const seen = new Set();
  return found.filter(product => {
    const key = String(product.id || product.slug || product.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function metadataFor(product, denodo) {
  const adgroup = text(product.adgroup);
  return denodo.get(adgroup) || denodo.get(normalize(adgroup)) || denodo.get(safeAdGroupFile(adgroup)) || null;
}

function namedFromOrder(variables, metadata) {
  const enteredDatabase = text(variables.v_dar_databaseName || variables.v_dar_post_database_schema || variables.dbname);
  const enteredTables = splitNames(variables.v_dar_post_table_names || variables.elementname || variables.table_names);
  const databases = metadata ? metadata.databases : [];
  const tables = metadata ? metadata.tables : [];
  const corrections = [];
  let database = "";
  let correctedTables = [];

  if (enteredDatabase) {
    const match = correctName(enteredDatabase, databases);
    database = match ? match.corrected : enteredDatabase;
    if (match && normalize(match.entered) !== normalize(match.corrected)) corrections.push({ field: "database", ...match });
  }
  if (enteredTables.length) {
    correctedTables = enteredTables.map(table => {
      const match = correctName(table, tables);
      if (match && normalize(match.entered) !== normalize(match.corrected)) corrections.push({ field: "table", ...match });
      return match ? match.corrected : table;
    });
  }

  if (!database || correctedTables.length === 0) {
    asArray(variables._tokens).forEach(token => {
      if (!/^[A-Za-z0-9_.-]+$/.test(token)) return;
      if (!database) {
        const match = correctName(token, databases);
        if (match) {
          database = match.corrected;
          if (normalize(match.entered) !== normalize(match.corrected)) corrections.push({ field: "database", ...match });
        }
      }
      const tableMatch = correctName(token, tables);
      if (tableMatch) {
        correctedTables.push(tableMatch.corrected);
        if (normalize(tableMatch.entered) !== normalize(tableMatch.corrected)) corrections.push({ field: "table", ...tableMatch });
      }
    });
  }

  return {
    database,
    tables: unique(correctedTables),
    databaseAsEntered: enteredDatabase,
    tablesAsEntered: enteredTables,
    corrections
  };
}

function build() {
  const products = asArray(readJson(path.join(marketplace, "products", "products.json"), []));
  const denodo = loadDenodo();
  const orders = loadOrders();
  const index = indexProducts(products);
  const grouped = new Map();
  let attachedOrders = 0;
  let corrections = 0;

  products.forEach(product => {
    const metadata = metadataFor(product, denodo);
    const key = String(product.id || product.slug || product.name);
    grouped.set(key, {
      id: product.id || "",
      name: product.name || "",
      slug: product.slug || "",
      sku: product.sku || "",
      adgroup: text(product.adgroup),
      pi: text(product.pi || product.pii),
      spi: text(product.spi || product.sensitive_pi),
      databases: metadata ? metadata.databases : [],
      tables: metadata ? metadata.tables : [],
      columns: metadata ? metadata.columns : [],
      orders: []
    });
  });

  orders.forEach(order => {
    if (!isApproved(order)) return;
    const variables = variableMap(order);
    const matches = matchingProducts(order, variables, index);
    if (!matches.length) return;

    matches.forEach(product => {
      const key = String(product.id || product.slug || product.name);
      const current = grouped.get(key);
      if (!current) return;
      const metadata = metadataFor(product, denodo);
      const named = namedFromOrder(variables, metadata);
      corrections += named.corrections.length;
      attachedOrders += 1;
      current.orders.push({
        number: text(order.number || order.request_number || order.ritm_number || (order.request_info && order.request_info.number)),
        database: named.database,
        tables: named.tables,
        database_as_entered: named.databaseAsEntered || named.database,
        tables_as_entered: named.tablesAsEntered.length ? named.tablesAsEntered : named.tables,
        corrections: named.corrections
      });
    });
  });

  const productRows = [...grouped.values()].sort((left, right) => text(left.name).localeCompare(text(right.name)));
  return {
    generated_at: new Date().toISOString(),
    typo_threshold: TYPO_THRESHOLD,
    source: {
      products: products.length,
      denodo_adgroups: new Set(denodo.values()).size,
      orders_read: orders.length,
      approved_orders_attached: attachedOrders,
      typo_corrections: corrections
    },
    vocabulary: {
      databases: unique(productRows.flatMap(product => product.databases)),
      tables: unique(productRows.flatMap(product => product.tables)),
      columns: unique(productRows.flatMap(product => product.columns))
    },
    products: productRows
  };
}

function main() {
  const catalog = build();
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(catalog, null, 2) + "\n");
  console.log(`Wrote ${catalog.products.length} products to ${outputFile}`);
  console.log(`Orders read: ${catalog.source.orders_read}`);
  console.log(`Approved orders attached: ${catalog.source.approved_orders_attached}`);
  console.log(`Typo corrections: ${catalog.source.typo_corrections}`);
  const withOrders = catalog.products.filter(product => product.orders.length).length;
  console.log(`Products with an attached order: ${withOrders}`);
}

module.exports = {
  build,
  correctName,
  similarity,
  isApproved,
  TYPO_THRESHOLD
};

if (require.main === module) {
  main();
}
