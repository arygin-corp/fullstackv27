const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const fs = require("fs");
const axios = require("axios");
const https = require("https");

// ----------------------------
// Configuration
// ----------------------------
const BASE_DIR = path.resolve(__dirname, "../assets/json/marketplace/historical");
const INPUT_FILE = process.env.INPUT_FILE || path.join(BASE_DIR, "orders.json");
const OUTPUT_FILE = process.env.OUTPUT_FILE || path.join(BASE_DIR, "formData.json");

const CONCURRENCY = Number(process.env.CONCURRENCY || 20);
const SYSID_CHUNK_SIZE = Number(process.env.SYSID_CHUNK_SIZE || 200);

const RETRIES = Number(process.env.RETRIES || 3);
const BASE_DELAY_MS = Number(process.env.BASE_DELAY_MS || 400);
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 30000);

// Optional: if true, verifies RITM sys_id exists before fetching variables
const DEBUG_RITM_CHECK = (process.env.DEBUG_RITM_CHECK || "false").toLowerCase() === "true";

// ----------------------------
// Allowlist: ONLY keep these variable internal names
// ----------------------------
const ALLOWED_VAR_ORDER = [
  "v_dar_objectid_reqfor",
  "v_dar_platform",
  "v_dar_dataDomainSelect",
  "v_dar_databaseName",
  "v_dar_post_database_schema",
  "v_dar_post_table_names",
  "v_dar_ad_group",
  "v_dar_DataReqDescription",
  "v_dar_businessJustification",
  "v_dar_organization",
  "companyName",
];

const ALLOWED_VAR_NAMES = new Set(ALLOWED_VAR_ORDER);

// ----------------------------
// ServiceNow Setup
// ----------------------------
const SN_USER = process.env.ONETS_USERNAME;
const SN_PASS = process.env.ONETS_PASSWORD;
console.log("ONETS_USERNAME:", process.env.ONETS_USERNAME ? "set" : "not set");
console.log("ONETS_PASSWORD:", process.env.ONETS_PASSWORD ? "set" : "not set");

const SN_INSTANCE_TABLE_API = "https://tmna.service-now.com/api/now/table";
const SN_AUTH = `Basic ${Buffer.from(`${SN_USER}:${SN_PASS}`).toString("base64")}`;

const httpAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });

const apiClient = axios.create({ baseURL: SN_INSTANCE_TABLE_API,
  headers: {
    Authorization: SN_AUTH,
    Accept: "application/json",
  },
  httpsAgent: httpAgent,
  timeout: REQUEST_TIMEOUT_MS,
});

// ----------------------------
// Stats / Progress
// ----------------------------
const stats = {
  total: 0,
  completed: 0,
  failed: 0,
  failedItems: [],
  startTime: Date.now(),
};

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`;
}

function drawProgress(current, total, failed = 0) {
  const width = 40;
  const percent = total ? current / total : 0;
  const filled = Math.floor(width * percent);
  const empty = width - filled;

  const bar = "█".repeat(filled) + "░".repeat(empty);
  const percentage = Math.round(percent * 100);
  const status = failed > 0 ? ` | ${failed} failed` : "";

  process.stdout.write(`\r[${bar}] ${percentage}% (${current}/${total})${status}`);
}

// ----------------------------
// Utility helpers
// ----------------------------
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(ms) {
  // + up to 25% jitter
  const delta = ms * 0.25 * Math.random();
  return Math.floor(ms + delta);
}

function isRetryableError(err) {
  const status = err?.response?.status;
  const code = err?.code;

  if (code === "ECONNABORTED") return true; // timeout
  if ([429, 500, 502, 503, 504].includes(status)) return true;

  return false;
}

async function withRetry(fn, { retries = RETRIES, baseDelayMs = BASE_DELAY_MS } = {}) {
  let lastErr;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;

      const retryable = isRetryableError(err);
      if (!retryable || attempt === retries) break;

      const delay = jitter(baseDelayMs * Math.pow(2, attempt));
      await sleep(delay);
    }
  }

  throw lastErr;
}

// Normalize reference fields (string sys_id vs {value, display_value})
function getRefId(field) {
  if (!field) return null;
  if (typeof field === "string") return field;
  if (typeof field === "object" && field.value) return field.value;
  return null;
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function safeJsonParseFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected JSON array in ${filePath}, got ${typeof parsed}`);
  }
  return parsed;
}

// ----------------------------
// Generic chunked sys_idIN fetch
// ----------------------------
async function fetchBySysIdChunks(table, ids, fields = ["sys_id"], chunkSize = SYSID_CHUNK_SIZE) {
  const uniqueIds = [...new Set(ids)].filter(Boolean);
  if (uniqueIds.length === 0) return [];

  const chunks = chunkArray(uniqueIds, chunkSize);
  const all = [];

  for (const chunk of chunks) {
    const res = await withRetry(() =>
      apiClient.get(`/${table}`, {
        params: {
          sysparm_query: `sys_idIN${chunk.join(",")}`,
          sysparm_fields: fields.join(","),
          sysparm_display_value: "false",
          sysparm_exclude_reference_link: "true",
          sysparm_limit: chunk.length,
        },
      })
    );

    const results = res.data?.result || [];
    all.push(...results);
  }

  return all;
}

// ----------------------------
// ServiceNow table-specific helpers
// ----------------------------
async function getRitmRecord(ritmSysId) {
  const res = await withRetry(() =>
    apiClient.get(`/sc_req_item/${ritmSysId}`, {
      params: {
        sysparm_fields: "sys_id,number,request,cat_item",
        sysparm_display_value: "true",
        sysparm_exclude_reference_link: "true",
      },
    })
  );
  return res.data?.result || null;
}

async function getMtomOptionIdsForRitm(ritmSysId) {
  const res = await withRetry(() =>
    apiClient.get(`/sc_item_option_mtom`, {
      params: {
        sysparm_query: `request_item=${ritmSysId}`,
        sysparm_fields: "sc_item_option",
        sysparm_display_value: "false",
        sysparm_exclude_reference_link: "true",
        sysparm_limit: 500,
      },
    })
  );

  const rows = res.data?.result || [];
  return rows.map((r) => getRefId(r.sc_item_option)).filter(Boolean);
}

async function getItemOptions(optionIds) {
  // sc_item_option holds: value + item_option_new ref
  return fetchBySysIdChunks("sc_item_option", optionIds, ["sys_id", "value", "item_option_new"]);
}

// Cache variable definitions across many RITMs to reduce API calls
const defCache = new Map(); // def sys_id -> {sys_id,name,question_text}

async function getVariableDefinitions(defIds) {
  const unique = [...new Set(defIds)].filter(Boolean);
  if (unique.length === 0) return [];

  const missing = unique.filter((id) => !defCache.has(id));
  if (missing.length > 0) {
    const fetched = await fetchBySysIdChunks(
      "item_option_new",
      missing,
      ["sys_id", "name", "question_text"]
    );
    for (const d of fetched) defCache.set(d.sys_id, d);
  }

  return unique.map((id) => defCache.get(id)).filter(Boolean);
}

// ----------------------------
// Main function: fetch ONLY the allowlisted variables for a RITM
// Returns variables as [{name, question, value}]
// ----------------------------
async function fetchVariableDetails(ritmSysId, ritmNumber) {
  try {
    if (DEBUG_RITM_CHECK) {
      try {
        const ritm = await getRitmRecord(ritmSysId);
        if (!ritm) {
          return {
            success: false,
            error: "RITM lookup returned no record (sys_id may not exist on this instance).",
            ritmSysId,
            ritmNumber,
          };
        }
        if (ritmNumber && ritm.number && ritm.number !== ritmNumber) {
          console.warn(
            `[WARN] RITM sys_id ${ritmSysId} returned number ${ritm.number} (expected ${ritmNumber}).`
          );
        }
      } catch (e) {
        const status = e?.response?.status;
        return {
          success: false,
          error: `RITM lookup failed: HTTP ${status || "?"} (${e.message})`,
          ritmSysId,
          ritmNumber,
        };
      }
    }

    // 1) MTOM -> option sys_ids
    const optionIds = await getMtomOptionIdsForRitm(ritmSysId);
    if (!optionIds.length) return { success: true, variables: [] };

    // 2) sc_item_option -> values + def ids
    const optionRecords = await getItemOptions(optionIds);
    if (!optionRecords.length) return { success: true, variables: [] };

    const defIds = optionRecords.map((o) => getRefId(o.item_option_new)).filter(Boolean);
    if (!defIds.length) return { success: true, variables: [] };

    // 3) item_option_new -> definitions
    const defRecords = await getVariableDefinitions(defIds);
    const defsMap = new Map(defRecords.map((d) => [d.sys_id, d]));

    // 4) Build output + filter by allowed internal name
    // Deduplicate by internal name (not defId) to avoid duplicates
    const byName = new Map();

    for (const o of optionRecords) {
      const defId = getRefId(o.item_option_new);
      if (!defId) continue;

      const def = defsMap.get(defId);
      const name = def?.name;
      if (!name) continue;

      if (!ALLOWED_VAR_NAMES.has(name)) continue;

      // Keep first seen; if you prefer last seen, replace `if (!byName.has(name))`
      if (!byName.has(name)) {
        byName.set(name, {
          name,
          question: def?.question_text || "Unknown",
          value: o.value ?? null,
        });
      }
    }

    // 5) Return in the same order as your allowlist
    const variables = ALLOWED_VAR_ORDER.filter((n) => byName.has(n)).map((n) => byName.get(n));

    return { success: true, variables };
  } catch (error) {
    const status = error?.response?.status;
    const body = error?.response?.data;

    const details =
      body && typeof body === "object" ? JSON.stringify(body).slice(0, 1200) : String(body || "");

    const msg = status ? `HTTP ${status}${details ? ` - ${details}` : ""}` : error.message;

    return {
      success: false,
      error: msg,
      ritmNumber,
      ritmSysId,
    };
  }
}

// ----------------------------
// Concurrency pool (async map w/ limit)
// ----------------------------
async function asyncPool(limit, array, iteratorFn) {
  const ret = [];
  const executing = [];

  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);

    if (limit <= array.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.all(ret);
}

// ----------------------------
// Order processing
// ----------------------------
async function processOrder(order) {
  const ritmSysId = order?.id;
  const ritmNumber = order?.number;

  const result = await fetchVariableDetails(ritmSysId, ritmNumber);

  if (result.success) {
    stats.completed++;
    return {
      ritm_number: ritmNumber,
      ritm_sys_id: ritmSysId,
      variables: result.variables,
    };
  } else {
    stats.failed++;
    stats.failedItems.push({
      number: result.ritmNumber || ritmNumber,
      sysId: result.ritmSysId || ritmSysId,
      error: result.error,
    });

    return {
      ritm_number: ritmNumber,
      ritm_sys_id: ritmSysId,
      variables: [],
      _error: result.error,
    };
  }
}

// ----------------------------
// Run
// ----------------------------
async function runEnrichment() {
  const rawData = safeJsonParseFile(INPUT_FILE);
  stats.total = rawData.length;

  console.log(`\n🚀 Starting enrichment of ${stats.total} orders...`);
  console.log(
    `⚡ Concurrency: ${CONCURRENCY} | sys_id chunk size: ${SYSID_CHUNK_SIZE} | retries: ${RETRIES}`
  );
  console.log(`🧾 Allowlist fields: ${ALLOWED_VAR_ORDER.join(", ")}`);
  console.log(`🧪 DEBUG_RITM_CHECK: ${DEBUG_RITM_CHECK}\n`);

  let processed = 0;

  const enriched = await asyncPool(CONCURRENCY, rawData, async (order) => {
    const out = await processOrder(order);
    processed++;
    drawProgress(processed, stats.total, stats.failed);
    return out;
  });

  process.stdout.write("\n\n");

  // Atomic write
  const tmpFile = `${OUTPUT_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(enriched, null, 2));
  fs.renameSync(tmpFile, OUTPUT_FILE);

  printSummary(OUTPUT_FILE);
}

function printSummary(outFile) {
  const duration = Date.now() - stats.startTime;
  const avgTime = stats.total ? Math.round(duration / stats.total) : 0;

  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║           ENRICHMENT COMPLETE - SUMMARY REPORT         ║");
  console.log("╠════════════════════════════════════════════════════════╣");
  console.log(`║  Total Orders:        ${String(stats.total).padEnd(35)} ║`);
  console.log(`║  ✅ Successful:        ${String(stats.completed).padEnd(35)} ║`);
  console.log(`║  ❌ Failed:            ${String(stats.failed).padEnd(35)} ║`);
  console.log(`║  Concurrency:          ${String(CONCURRENCY).padEnd(35)} ║`);
  console.log(`║  Duration:             ${String(formatDuration(duration)).padEnd(35)} ║`);
  console.log(`║  Avg Time/Order:       ${String(`${avgTime}ms`).padEnd(35)} ║`);
  console.log(`║  Output File:          ${String(outFile).padEnd(34)} ║`);
  console.log("╚════════════════════════════════════════════════════════╝");

  if (stats.failedItems.length > 0) {
    console.log("\n📋 FAILED ITEMS:");
    console.log("─".repeat(90));
    stats.failedItems.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.number || "Unknown"} (${item.sysId || "Unknown"})`);
      console.log(`     Error: ${item.error}`);
    });
    console.log("─".repeat(90));
  } else {
    console.log("\n✨ All API calls completed successfully!");
  }

  console.log(`\n💾 Results saved to: ${outFile}\n`);
}

runEnrichment().catch((err) => {
  console.error("\n💥 Fatal error:", err?.message || err);
  process.exit(1);
});