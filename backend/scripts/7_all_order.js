const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const fs = require("fs");
const axios = require("axios");
const https = require("https");

const PAGE_SIZE = 1000;
const BASE_DIR = path.resolve(__dirname, "../assets/json/marketplace/historical");
const OUTPUT_FILE = path.join(BASE_DIR, "all_orders.json");
const SN_TABLE_API = "https://tmna.service-now.com/api/now/table";
const DMP_PROD_USER = "00e741ae1bae0c5029207550cd4bcbec";

const SN_USER = process.env.ONETS_USERNAME;
const SN_PASS = process.env.ONETS_PASSWORD;

if (!SN_USER || !SN_PASS) {
  console.error("[CRITICAL] Missing ServiceNow credentials");
  console.error("Required env vars: ONETS_USERNAME, ONETS_PASSWORD");
  process.exit(1);
}

const apiClient = axios.create({
  headers: {
    Authorization: `Basic ${Buffer.from(`${SN_USER}:${SN_PASS}`).toString("base64")}`,
    Accept: "application/json",
  },
  httpsAgent: new https.Agent({ keepAlive: true }),
  timeout: 60000,
});

function refValue(field) {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field.value || "";
}

function refLabel(field) {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field.display_value || field.value || "";
}

function drawProgress(percent, label) {
  const bounded = Math.max(0, Math.min(100, percent));
  const width = 30;
  const filled = Math.round(width * (bounded / 100));
  const bar = "█".repeat(filled) + "─".repeat(width - filled);
  const pct = bounded.toFixed(1).padStart(5, " ");
  process.stdout.write(`\r[${bar}] ${pct}%  ${label}`);
}

async function fetchTable(table, fields, query, onPage) {
  const rows = [];
  let offset = 0;

  while (true) {
    const response = await apiClient.get(`${SN_TABLE_API}/${table}`, {
      params: {
        sysparm_query: query,
        sysparm_fields: fields.join(","),
        sysparm_limit: PAGE_SIZE,
        sysparm_offset: offset,
        sysparm_display_value: "all",
        sysparm_exclude_reference_link: "true",
      },
    });
    const batch = response.data?.result || [];
    rows.push(...batch);
    const total = Number(response.headers["x-total-count"] || rows.length);
    if (onPage) onPage(rows.length, total);
    if (batch.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return rows;
}

const TASK_FIELDS = [
  "sys_id",
  "number",
  "request",
  "request_item",
  "state",
  "assignment_group",
  "assigned_to",
  "opened_at",
  "due_date",
  "short_description",
  "sys_updated_on",
];

async function fetchTasksForOrders(requestIds, ritmIds, onChunk) {
  const rows = [];
  const seen = new Set();
  const groups = [
    ["request", requestIds],
    ["request_item", ritmIds],
  ];
  const chunks = groups.reduce((count, [, ids]) => {
    return count + Math.ceil([...new Set(ids.filter(Boolean))].length / 100);
  }, 0);
  let completed = 0;

  for (const [field, ids] of groups) {
    const unique = [...new Set(ids.filter(Boolean))];
    for (let index = 0; index < unique.length; index += 100) {
      const chunk = unique.slice(index, index + 100);
      const batch = await fetchTable("sc_task", TASK_FIELDS, `${field}IN${chunk.join(",")}`);
      for (const task of batch) {
        const id = refValue(task.sys_id);
        if (!id || seen.has(id)) continue;
        seen.add(id);
        rows.push(task);
      }
      completed += 1;
      if (onChunk) onChunk(completed, chunks || 1, rows.length);
    }
  }

  return rows;
}

function taskRecord(task, ritm) {
  return {
    task_id: refValue(task.sys_id),
    task_number: refLabel(task.number),
    ritm_id: ritm ? refValue(ritm.sys_id) : refValue(task.request_item),
    ritm_number: ritm ? refLabel(ritm.number) : "",
    state: refLabel(task.state),
    assignment_group: refLabel(task.assignment_group),
    assigned_to: refLabel(task.assigned_to),
    created: refLabel(task.opened_at),
    due: refLabel(task.due_date),
    short_description: refLabel(task.short_description),
    updated_at: refLabel(task.sys_updated_on),
  };
}

function attachTasks(requests, ritms, tasks) {
  const ritmById = new Map();
  const ritmsByRequest = new Map();

  for (const ritm of ritms) {
    const ritmId = refValue(ritm.sys_id);
    const requestId = refValue(ritm.request);
    if (ritmId) ritmById.set(ritmId, ritm);
    if (!requestId) continue;
    if (!ritmsByRequest.has(requestId)) ritmsByRequest.set(requestId, []);
    ritmsByRequest.get(requestId).push(ritm);
  }

  const tasksByRequest = new Map();
  for (const task of tasks) {
    const ritm = ritmById.get(refValue(task.request_item));
    const requestId = refValue(task.request) || (ritm ? refValue(ritm.request) : "");
    if (!requestId) continue;
    if (!tasksByRequest.has(requestId)) tasksByRequest.set(requestId, []);
    tasksByRequest.get(requestId).push(taskRecord(task, ritm));
  }

  return requests.map((request) => {
    const requestId = refValue(request.sys_id);
    const requestRitms = ritmsByRequest.get(requestId) || [];
    return {
      request_id: requestId,
      request_number: refLabel(request.number),
      state: refLabel(request.request_state),
      stage: refLabel(request.stage),
      opened_at: refLabel(request.opened_at),
      closed_at: refLabel(request.closed_at),
      opened_by: refLabel(request.opened_by),
      requested_for: refLabel(request.requested_for),
      short_description: refLabel(request.short_description),
      updated_at: refLabel(request.sys_updated_on),
      ritms: requestRitms.map((ritm) => ({
        ritm_id: refValue(ritm.sys_id),
        ritm_number: refLabel(ritm.number),
        state: refLabel(ritm.state),
        stage: refLabel(ritm.stage),
        ritm_state: refLabel(ritm.state),
        approval_stage: refLabel(ritm.approval),
      })),
      tasks: tasksByRequest.get(requestId) || [],
    };
  });
}

async function run() {
  if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
  }

  console.log("STEP 7 - Export ServiceNow orders with tasks");
  console.log("[SYSTEM] Fetching Data Marketplace orders opened by DMP Prod");
  const openedBy = `opened_by=${DMP_PROD_USER}`;
  const phase = (start, weight, done, total, label) => {
    const portion = total ? Math.min(done / total, 1) : 0;
    drawProgress(start + weight * portion, label);
  };
  const requests = await fetchTable("sc_request", [
    "sys_id",
    "number",
    "request_state",
    "stage",
    "opened_at",
    "closed_at",
    "opened_by",
    "requested_for",
    "short_description",
    "sys_updated_on",
  ], openedBy, (done, total) => phase(0, 25, done, total, `Requests ${done}/${total}`));
  const requestIds = new Set(requests.map((request) => refValue(request.sys_id)));
  const ritms = (await fetchTable("sc_req_item", [
    "sys_id",
    "number",
    "request",
    "state",
    "stage",
    "approval",
  ], `request.${openedBy}`, (done, total) => phase(25, 25, done, total, `Requested items ${done}/${total}`)))
    .filter((ritm) => requestIds.has(refValue(ritm.request)));
  const tasks = await fetchTasksForOrders(
    [...requestIds],
    ritms.map((ritm) => refValue(ritm.sys_id)),
    (done, total, count) => phase(50, 45, done, total, `Tasks ${count} (${done}/${total} batches)`)
  );
  drawProgress(100, "Saving orders");

  const orders = attachTasks(requests, ritms, tasks);
  const withTasks = orders.filter((order) => order.tasks.length > 0).length;

  fs.writeFileSync(`${OUTPUT_FILE}.tmp`, JSON.stringify(orders, null, 2));
  fs.renameSync(`${OUTPUT_FILE}.tmp`, OUTPUT_FILE);
  drawProgress(100, "Complete");
  process.stdout.write("\n");

  console.log(`[DONE] Requests: ${orders.length}`);
  console.log(`[DONE] Requests with tasks: ${withTasks}`);
  console.log(`[DONE] Tasks: ${tasks.length}`);
  console.log(`[DONE] Saved: ${OUTPUT_FILE}`);
}

run().catch((error) => {
  console.error("[CRITICAL]", error.response?.status || "", error.message);
  process.exit(1);
});
