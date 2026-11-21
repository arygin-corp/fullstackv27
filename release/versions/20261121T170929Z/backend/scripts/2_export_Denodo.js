require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const axios = require('axios');
// ❌ DB not needed anymore
// const { Pool } = require('pg');

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------
const TIMEOUT_MS = 120000;
const MAX_RETRIES = 4;

function toSafeAdGroupFileName(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\W+/g, '_');
}

// --------------------------------------------------
// PATHS
// --------------------------------------------------
const STATIC_PATH = path.resolve(__dirname, '../assets/json/marketplace');

// --------------------------------------------------
// DIRECTORY INITIALIZATION
// --------------------------------------------------
function ensureDirs() {
  const dirs = [
    'products',
    'domains',
    'onetsdomains',
    'platforms',
    'orders',
    'ad_groups',
    'denodo',
    '@denodo_masterdata',
  ];

  console.log(`[SYSTEM] Initializing directories...`);
  dirs.forEach(dir => {
    const p = path.join(STATIC_PATH, dir);
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p, { recursive: true });
      console.log(`[SYSTEM] [CREATED] ${dir}`);
    } else {
      console.log(`[SYSTEM] [OK] ${dir}`);
    }
  });
}

// --------------------------------------------------
// SINGLE-ATTEMPT FETCH (PASS 1)
// --------------------------------------------------
async function fetchOnce(group) {
  const safeName = toSafeAdGroupFileName(group);
  const url = `https://api.data.toyota.com/view/endpoint/denodo/table/view?userrolename=${encodeURIComponent(group)}`;

  try {
    const res = await axios.get(url, { timeout: TIMEOUT_MS });

    fs.writeFileSync(
      path.join(STATIC_PATH, `denodo/${safeName}.json`),
      JSON.stringify(res.data, null, 2)
    );

    console.log(`SUCCESS`);
    return { success: true, safeName, data: res.data };
  } catch (err) {
    const msg = (err?.message || '').toLowerCase();
    const isTimeout = err?.code === 'ECONNABORTED' || msg.includes('timeout');
    const status = err?.response ? err.response.status : (isTimeout ? 'TIMEOUT' : 'ERROR');

    console.log(`FAILED (${status})`);
    return { success: false, safeName, status, message: err?.message };
  }
}

// --------------------------------------------------
// RETRY FETCH
// --------------------------------------------------
async function fetchWithRetry(group, attempt = 1) {
  const safeName = toSafeAdGroupFileName(group);
  const url = `https://api.data.toyota.com/view/endpoint/denodo/table/view?userrolename=${encodeURIComponent(group)}`;

  try {
    const res = await axios.get(url, { timeout: TIMEOUT_MS });

    fs.writeFileSync(
      path.join(STATIC_PATH, `denodo/${safeName}.json`),
      JSON.stringify(res.data, null, 2)
    );

    console.log(`SUCCESS`);
    return { success: true, safeName, data: res.data };
  } catch (err) {
    const msg = (err?.message || '').toLowerCase();
    const isTimeout = err?.code === 'ECONNABORTED' || msg.includes('timeout');
    const status = err?.response ? err.response.status : (isTimeout ? 'TIMEOUT' : 'ERROR');

    console.log(`FAILED (${status})`);

    const retryable = isTimeout || (typeof status === 'number' && status >= 500);

    if (attempt < MAX_RETRIES && retryable) {
      const waitTime = Math.min(60000, 2 ** (attempt - 1) * 15000);
      console.log(
        `[RETRY] ${group} retrying in ${waitTime / 1000}s (Attempt ${attempt}/${MAX_RETRIES})`
      );
      await new Promise(r => setTimeout(r, waitTime));
      return fetchWithRetry(group, attempt + 1);
    }

    console.error(
      `[ERROR] Giving up on "${group}" after ${attempt} attempts: ${err?.message}`
    );

    return { success: false, safeName, status, message: err?.message };
  }
}

// --------------------------------------------------
// SYNC DENODO (UPDATED)
// --------------------------------------------------
async function syncDenodo() {
  console.log(`\n--- STEP 2: DENODO SYNC (FROM JSON FILE) ---`);

  // ✅ LOAD FROM FILE INSTEAD OF DB
  const filePath = path.join(STATIC_PATH, 'ad_groups', 'ad_groups.json');

  if (!fs.existsSync(filePath)) {
    console.log(`[DENODO] ad_groups.json not found.`);
    return;
  }

  const groups = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (!Array.isArray(groups) || groups.length === 0) {
    console.log(`[DENODO] No ad groups found in JSON.`);
    return;
  }

  console.log(`[DENODO] Loaded ${groups.length} ad groups`);

  const masterData = {};
  const failed = [];

  // ---------------- PASS 1 ----------------
  console.log(`[DENODO] PASS 1 — single attempt`);

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    process.stdout.write(`[PASS 1] [${i + 1}/${groups.length}] ${group} ... `);

    const result = await fetchOnce(group);
    if (result.success) {
      masterData[result.safeName] = result.data;
    } else {
      failed.push({ group, ...result });
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  // ---------------- PASS 2 ----------------
  if (failed.length) {
    console.log(`\n[DENODO] ${failed.length} failures — retrying...`);
    await new Promise(r => setTimeout(r, 60000));

    const stillFailed = [];

    for (let i = 0; i < failed.length; i++) {
      const { group } = failed[i];
      process.stdout.write(`[PASS 2] [${i + 1}/${failed.length}] ${group} ... `);

      const result = await fetchWithRetry(group);
      if (result.success) {
        masterData[result.safeName] = result.data;
      } else {
        stillFailed.push({ group, ...result });
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    if (stillFailed.length) {
      fs.writeFileSync(
        path.join(STATIC_PATH, '@denodo_masterdata/@failed-denodo.json'),
        JSON.stringify(stillFailed, null, 2)
      );
      console.warn(`[DENODO] ${stillFailed.length} groups failed after retries`);
    }
  }

  // ✅ SAVE MASTER FILE
  fs.writeFileSync(
    path.join(STATIC_PATH, '@denodo_masterdata/@master-denodo.json'),
    JSON.stringify(masterData, null, 4)
  );

  console.log(`[DENODO] Sync complete`);
}

// --------------------------------------------------
// MAIN
// --------------------------------------------------
async function run() {
  const start = Date.now();
  try {
    console.log(`\n=========== PIPELINE START ===========`);
    ensureDirs();
    await syncDenodo();
    console.log(
      `=========== DONE (${((Date.now() - start) / 1000).toFixed(2)}s) ===========`
    );
    process.exit(0);
  } catch (err) {
    console.error(`[FATAL]`, err);
    process.exit(1);
  }
}

run();


// require('dotenv').config();
// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');
// const { Pool } = require('pg');

// // --------------------------------------------------
// // CONFIGURATION
// // --------------------------------------------------
// const TIMEOUT_MS = 120000; // 120s per Denodo request
// const MAX_RETRIES = 4;

// // --------------------------------------------------
// // DATABASE CONNECTION
// // --------------------------------------------------
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
//   ssl: { rejectUnauthorized: false },
// });

// // --------------------------------------------------
// // PATHS
// // --------------------------------------------------
// const STATIC_PATH = path.resolve(__dirname, '../assets/json/marketplace');

// // --------------------------------------------------
// // DIRECTORY INITIALIZATION
// // --------------------------------------------------
// function ensureDirs() {
//   const dirs = [
//     'products',
//     'domains',
//     'onetsdomains',
//     'platforms',
//     'orders',
//     'ad_groups',
//     'denodo',
//     '@denodo_masterdata',
//   ];

//   console.log(`[SYSTEM] Initializing directories...`);
//   dirs.forEach(dir => {
//     const p = path.join(STATIC_PATH, dir);
//     if (!fs.existsSync(p)) {
//       fs.mkdirSync(p, { recursive: true });
//       console.log(`[SYSTEM] [CREATED] ${dir}`);
//     } else {
//       console.log(`[SYSTEM] [OK] ${dir}`);
//     }
//   });
// }

// // --------------------------------------------------
// // SINGLE-ATTEMPT FETCH (PASS 1)
// // --------------------------------------------------
// async function fetchOnce(group) {
//   const safeName = group.replace(/\W+/g, '_');
//   const url = `https://api.data.toyota.com/view/endpoint/denodo/table/view?userrolename=${encodeURIComponent(group)}`;

//   try {
//     const res = await axios.get(url, { timeout: TIMEOUT_MS });

//     fs.writeFileSync(
//       path.join(STATIC_PATH, `denodo/${safeName}.json`),
//       JSON.stringify(res.data, null, 2)
//     );

//     console.log(`SUCCESS`);
//     return { success: true, safeName, data: res.data };
//   } catch (err) {
//     const msg = (err?.message || '').toLowerCase();
//     const isTimeout = err?.code === 'ECONNABORTED' || msg.includes('timeout');
//     const status = err?.response ? err.response.status : (isTimeout ? 'TIMEOUT' : 'ERROR');

//     console.log(`FAILED (${status})`);
//     return { success: false, safeName, status, message: err?.message };
//   }
// }

// // --------------------------------------------------
// // ROBUST FETCH WITH RETRIES (PASS 2)
// // --------------------------------------------------
// async function fetchWithRetry(group, attempt = 1) {
//   const safeName = group.replace(/\W+/g, '_');
//   const url = `https://api.data.toyota.com/view/endpoint/denodo/table/view?userrolename=${encodeURIComponent(group)}`;

//   try {
//     const res = await axios.get(url, { timeout: TIMEOUT_MS });

//     fs.writeFileSync(
//       path.join(STATIC_PATH, `denodo/${safeName}.json`),
//       JSON.stringify(res.data, null, 2)
//     );

//     console.log(`SUCCESS`);
//     return { success: true, safeName, data: res.data };
//   } catch (err) {
//     const msg = (err?.message || '').toLowerCase();
//     const isTimeout = err?.code === 'ECONNABORTED' || msg.includes('timeout');
//     const status = err?.response ? err.response.status : (isTimeout ? 'TIMEOUT' : 'ERROR');

//     console.log(`FAILED (${status})`);

//     const retryable = isTimeout || (typeof status === 'number' && status >= 500);

//     if (attempt < MAX_RETRIES && retryable) {
//       const waitTime = Math.min(60000, 2 ** (attempt - 1) * 15000);
//       console.log(
//         `[RETRY] ${group} retrying in ${waitTime / 1000}s (Attempt ${attempt}/${MAX_RETRIES})`
//       );
//       await new Promise(r => setTimeout(r, waitTime));
//       return fetchWithRetry(group, attempt + 1);
//     }

//     console.error(
//       `[ERROR] Giving up on "${group}" after ${attempt} attempts: ${err?.message}`
//     );

//     return { success: false, safeName, status, message: err?.message };
//   }
// }

// // --------------------------------------------------
// // SYNC DENODO (TWO PASS)
// // --------------------------------------------------
// async function syncDenodo() {
//   console.log(`\n--- STEP 2: DENODO SYNC (TWO-PASS STRATEGY) ---`);

//   const adRes = await pool.query(
//     'SELECT DISTINCT adgroup FROM product WHERE is_active = true'
//   );

//   const groups = adRes.rows.map(r => r.adgroup).filter(Boolean);
//   if (!groups.length) {
//     console.log(`[DENODO] No active ad groups.`);
//     return;
//   }

//   const masterData = {};
//   const failed = [];

//   // ---------------- PASS 1 ----------------
//   console.log(`[DENODO] PASS 1 — single attempt (${groups.length} groups)`);

//   for (let i = 0; i < groups.length; i++) {
//     const group = groups[i];
//     process.stdout.write(`[PASS 1] [${i + 1}/${groups.length}] ${group} ... `);

//     const result = await fetchOnce(group);
//     if (result.success) {
//       masterData[result.safeName] = result.data;
//     } else {
//       failed.push({ group, ...result });
//     }

//     await new Promise(r => setTimeout(r, 1000));
//   }

//   // ---------------- PASS 2 ----------------
//   if (failed.length) {
//     console.log(`\n[DENODO] ${failed.length} failures — waiting 60s before retry...`);
//     await new Promise(r => setTimeout(r, 60000));

//     console.log(`[DENODO] PASS 2 — retry failures w/ backoff`);

//     const stillFailed = [];

//     for (let i = 0; i < failed.length; i++) {
//       const { group } = failed[i];
//       process.stdout.write(`[PASS 2] [${i + 1}/${failed.length}] ${group} ... `);

//       const result = await fetchWithRetry(group);
//       if (result.success) {
//         masterData[result.safeName] = result.data;
//       } else {
//         stillFailed.push({ group, ...result });
//       }

//       await new Promise(r => setTimeout(r, 1000));
//     }

//     if (stillFailed.length) {
//       fs.writeFileSync(
//         path.join(STATIC_PATH, '@denodo_masterdata/@failed-denodo.json'),
//         JSON.stringify(stillFailed, null, 2)
//       );
//       console.warn(`[DENODO] ${stillFailed.length} groups failed after PASS 2`);
//     }
//   }

//   fs.writeFileSync(
//     path.join(STATIC_PATH, '@denodo_masterdata/@master-denodo.json'),
//     JSON.stringify(masterData, null, 4)
//   );

//   console.log(`[DENODO] Sync complete`);
// }

// // --------------------------------------------------
// // MAIN
// // --------------------------------------------------
// async function run() {
//   const start = Date.now();
//   try {
//     console.log(`\n=========== PIPELINE START ===========`);
//     ensureDirs();
//     await syncDenodo();
//     console.log(
//       `=========== DONE (${((Date.now() - start) / 1000).toFixed(2)}s) ===========`
//     );
//     process.exit(0);
//   } catch (err) {
//     console.error(`[FATAL]`, err);
//     process.exit(1);
//   }
// }

// run();