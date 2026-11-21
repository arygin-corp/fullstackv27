const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const fs = require('fs');
const axios = require('axios');
const https = require('https');


/* =========================
   CONFIGURATION
========================= */

const BATCH_SIZE = 20;

const BASE_DIR = path.resolve(__dirname, '../assets/json/marketplace/historical');
const REQUESTS_FILE = path.join(BASE_DIR, 'historical_request.json');
const ORDERS_FILE = path.join(BASE_DIR, 'orders.json');

const SN_USER = process.env.ONETS_USERNAME;
const SN_PASS = process.env.ONETS_PASSWORD;

if (!SN_USER || !SN_PASS) {
    console.error('[CRITICAL] Missing ServiceNow credentials');
    console.error('Required env vars: ONETS_USERNAME, ONETS_PASSWORD');
    process.exit(1);
}

const SN_AUTH = `Basic ${Buffer.from(`${SN_USER}:${SN_PASS}`).toString('base64')}`;

const httpAgent = new https.Agent({ keepAlive: true });

const apiClient = axios.create({
    httpsAgent: httpAgent,
    timeout: 30000,
    headers: {
        Authorization: SN_AUTH,
        Accept: 'application/json'
    }
});

const SUCCESS_PHRASES = [
    'access provisioned',
    'approved',
    'access granted',
    'permission granted',
    'completed provisioning',
    'access has been provided'
];

/* =========================
   STATS & UTILITIES
========================= */

const stats = {
    startTime: Date.now(),
    total: 0,
    completed: 0,
    saved: 0,
    skipped: 0,
    failed: 0,
    no_record: 0,
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
    const bar = '█'.repeat(filled) + '─'.repeat(width - filled);
    const pct = (ratio * 100).toFixed(1).padStart(5);
    process.stdout.write(`\r[${bar}] ${pct}% (${done}/${total}) Failed:${failed}`);
}

/* =========================
   ENV INITIALIZATION
========================= */

function initializeEnvironment() {
    console.log('[SYSTEM] Initializing environment...');

    if (!fs.existsSync(BASE_DIR)) {
        fs.mkdirSync(BASE_DIR, { recursive: true });
    }

    console.log('[SYSTEM] Ready.');
}

/* =========================
   AUDIT LOGGER
========================= */

function logRequestAudit(detail, prefix) {
    const fields = {
        RITM: detail.number,
        Request: detail.request,
        Requester: detail.opened_by,
        State: detail.ritm_state,
        Stage: detail.stage,
        'Approval Stage': detail.approval_stage
    };

    const msg = Object.entries(fields)
        .map(([k, v]) => `${k}=[${v || 'N/A'}]`)
        .join(' | ');

    console.log(`${prefix} ${msg}`);
}

/* =========================
   REQUEST PROCESSING
========================= */

async function processRequest(reqNumber, workerId) {
    const prefix = `[WORKER-${workerId}] [${reqNumber}]`;

    try {
        const res = await apiClient.get(
            'https://tmna.service-now.com/api/tmsu2/get_dar_data',
            {
                headers: { Request: reqNumber }
            }
        );

        const detail = res.data?.result?.[reqNumber];

        if (!detail) {
            return { status: 'no_record', reqNumber };
        }

        logRequestAudit(detail, prefix);

        const comments = String(detail.ritm_comments || '').toLowerCase();
        const rState = String(detail.ritm_state || '').toLowerCase().trim();
        const appStage = String(detail.approval_stage || '').toLowerCase().trim();
        const stage = String(detail.stage || '').toLowerCase().trim();

        const matchedPhrase = SUCCESS_PHRASES.find(p => comments.includes(p));

        if (
            rState === 'closed complete' &&
            appStage === 'approved' &&
            stage === 'completed' &&
            matchedPhrase
        ) {
            return { status: 'saved', reqNumber, detail, match: matchedPhrase };
        }

        return { status: 'skipped', reqNumber };

    } catch (err) {
        console.error(`${prefix} API ERROR: ${err.message}`);
        return { status: 'failed', reqNumber, error: err.message };
    }
}

/* =========================
   MAIN RUNNER
========================= */

async function runSync() {
    initializeEnvironment();

    const snRes = await apiClient.get(
        'https://tmna.service-now.com/api/now/table/sc_request',
        {
            params: {
                sysparm_fields: 'number',
                sysparm_limit: 50000,
                sysparm_query: 'opened_by=00e741ae1bae0c5029207550cd4bcbec'
            }
        }
    );

    const requests = snRes.data.result || [];
    stats.total = requests.length;

    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2));

    console.log(`Processing ${stats.total} requests...\n`);

    const provisionedOrders = [];
    let processed = 0;

    for (let i = 0; i < requests.length; i += BATCH_SIZE) {
        const chunk = requests.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
            chunk.map((req, idx) => processRequest(req.number, idx + 1))
        );

        for (const res of results) {
            processed++;

            switch (res.status) {
                case 'saved':
                    stats.saved++;
                    stats.completed++;
                    provisionedOrders.push({
                        request_number: res.reqNumber,
                        match: res.match,
                        ...res.detail
                    });
                    break;
                case 'skipped':
                    stats.skipped++;
                    break;
                case 'no_record':
                    stats.no_record++;
                    break;
                case 'failed':
                    stats.failed++;
                    stats.failedItems.push(res);
                    break;
            }

            drawProgress(processed, stats.total, stats.failed);
        }
    }

    fs.writeFileSync(ORDERS_FILE, JSON.stringify(provisionedOrders, null, 2));

    console.log('\n\nDONE.');
    console.log(`Saved: ${stats.saved}`);
    console.log(`Skipped: ${stats.skipped}`);
    console.log(`Failed: ${stats.failed}`);
}

runSync().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});