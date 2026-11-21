'use strict';
const fs = require('fs');
const path = require('path');
const { buildEnrichedIntelligence } = require('./1_export_db');

const STATIC_PATH = path.resolve(__dirname, '../assets/json/marketplace');
const PRODUCTS_FILE = path.join(STATIC_PATH, 'products', 'products.json');
const ORDERS_FILE = path.join(STATIC_PATH, 'orders', 'master_orders.json');
const DENODO_DIR = path.join(STATIC_PATH, 'denodo');

function readJson(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function run() {
  console.log('\n--- STEP 2B: BUILDING PRODUCTS_ENRICHED WITH FRESH DENODO METADATA ---');
  const products = readJson(PRODUCTS_FILE, []);
  const orders = readJson(ORDERS_FILE, []);
  const denodoFiles = fs.existsSync(DENODO_DIR)
    ? fs.readdirSync(DENODO_DIR).filter(file => file.endsWith('.json'))
    : [];

  if (!Array.isArray(products) || products.length === 0) {
    throw new Error(`No base products found at ${PRODUCTS_FILE}`);
  }
  if (denodoFiles.length === 0) {
    throw new Error(`No Denodo metadata files found at ${DENODO_DIR}`);
  }

  console.log(`[BUILD] Base products: ${products.length}`);
  console.log(`[BUILD] Fresh Denodo files: ${denodoFiles.length}`);
  console.log(`[BUILD] Historical order records: ${Array.isArray(orders) ? orders.length : 0}`);
  await buildEnrichedIntelligence(products, Array.isArray(orders) ? orders : []);
}

run().catch(error => {
  console.error('[FATAL] Product enrichment failed.');
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
