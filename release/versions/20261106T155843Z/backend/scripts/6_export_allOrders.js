require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const https = require('https');

const BATCH_SIZE = 20;
const BASE_DIR = path.resolve(__dirname, '../assets/json/marketplace/historical');
const REQUESTS_FILE = path.join(BASE_DIR, 'historical_request.json');
const ORDERS_FILE = path.join(BASE_DIR, 'all_historical_orders.json');

const SN_USER = process.env.ONETS_USERNAME;
const SN_PASS = process.env.ONETS_PASSWORD;
const SN_AUTH = `Basic ${Buffer.from(`${SN_USER}:${SN_PASS}`).toString('base64')}`;

const httpAgent = new https.Agent({ keepAlive: true });
const apiClient = axios.create({
  headers: { 'Authorization': SN_AUTH, 'Accept': 'application/json' },
  httpsAgent: httpAgent,
  timeout: 30000
});

const stats = {
  startTime: Date.now(),
  total: 0,
  completed: 0,
  failed: 0,
  failedItems: []
};

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function drawProgress(done, total, failed) {
  const width = 30;
  const ratio = total ? done / total : 0;
  const filled = Math.round(width * ratio);
  const bar = "█".repeat(filled) + "─".repeat(width - filled);
  const pct = (ratio * 100).toFixed(1).padStart(5, " ");
  process.stdout.write(`\r[${bar}] ${pct}%  (${done}/${total})  ❌${failed}`);
}

function initializeEnvironment() {
  console.log(`[SYSTEM] Initializing Full Data Sync...`);
  console.log(`[CONFIG] Concurrency: ${BATCH_SIZE} Workers`);
  console.log(`[CONFIG] Auth User: ${SN_USER ? "[loaded]" : "[missing]"}`);

  if (!fs.existsSync(BASE_DIR)) {
    console.log(`[SYSTEM] Creating missing directory: ${BASE_DIR}`);
    fs.mkdirSync(BASE_DIR, { recursive: true });
  }

  if (!SN_USER || !SN_PASS) {
    console.error(`[CRITICAL] Credentials missing in .env. Task aborted.`);
    process.exit(1);
  }
  console.log(`[SYSTEM] Environment Ready.`);
}

async function processRequest(reqNumber, workerId) {
  const prefix = `[WORKER-${workerId}] [${reqNumber}]`;
  try {
    const res = await apiClient.get("https://tmna.service-now.com/api/tmsu2/get_dar_data", {
      headers: { 'Request': reqNumber },
      auth: { username: SN_USER, password: SN_PASS }
    });

    const detail = (res.data.result && res.data.result[reqNumber]) ? res.data.result[reqNumber] : null;

    if (!detail) return { status: 'no_record', reqNumber };

    return { status: 'saved', reqNumber, detail };
  } catch (err) {
    console.error(`${prefix} ⚠️ API ERROR: ${err.message}`);
    if (err.response?.status === 401) {
      console.error(`${prefix} 🔒 Authentication failed - check ServiceNow credentials`);
    }
    return { status: 'failed', reqNumber, error: err.message };
  }
}

async function runSync() {
  stats.startTime = Date.now();
  initializeEnvironment();

  try {
    console.log(`--- STEP 1: FETCHING MASTER LIST ---`);
    const snRes = await apiClient.get(
      "https://tmna.service-now.com/api/now/table/sc_request?sysparm_fields=number&sysparm_limit=25000"
    );

    const requests = snRes.data.result || [];
    stats.total = requests.length;

    fs.writeFileSync(`${REQUESTS_FILE}.tmp`, JSON.stringify(requests, null, 4));
    fs.renameSync(`${REQUESTS_FILE}.tmp`, REQUESTS_FILE);

    console.log(`--- STEP 2: PROCESSING ALL REQUESTS ---`);

    const allOrders = [];
    let processed = 0;

    for (let i = 0; i < requests.length; i += BATCH_SIZE) {
      const chunk = requests.slice(i, i + BATCH_SIZE);

      const results = await Promise.all(
        chunk.map((req, index) => processRequest(req.number, index + 1))
      );

      for (const res of results) {
        processed++;

        if (res.status === "saved") {
          allOrders.push({
            request_number: res.reqNumber,
            ...res.detail
          });
          stats.completed++;
        } else if (res.status === "failed") {
          stats.failed++;
          stats.failedItems.push({ reqNumber: res.reqNumber, error: res.error });
        }

        drawProgress(processed, stats.total, stats.failed);
      }
    }

    process.stdout.write("\n");

    console.log(`--- STEP 3: SAVING ALL DATA ---`);
    fs.writeFileSync(`${ORDERS_FILE}.tmp`, JSON.stringify(allOrders, null, 4));
    fs.renameSync(`${ORDERS_FILE}.tmp`, ORDERS_FILE);

    const duration = Date.now() - stats.startTime;
    console.log(`\nSync complete!`);
    console.log(`Total requests processed: ${stats.total}`);
    console.log(`Successfully saved: ${stats.completed}`);
    console.log(`Failed requests: ${stats.failed}`);
    console.log(`Duration: ${formatDuration(duration)}\n`);
    console.log(`Data saved to: ${ORDERS_FILE}`);
  } catch (err) {
    console.error(`\n💥 Fatal error:`, err?.stack || err?.message || err);
    process.exit(1);
  }
}

runSync().catch(err => {
  console.error("\n💥 Fatal error:", err?.message || err);
  process.exit(1);
});