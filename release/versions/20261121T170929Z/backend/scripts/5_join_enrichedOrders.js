const fs = require('fs');
const path = require('path');

// ----------------------------
// Configuration
// ----------------------------
const BASE_DIR = path.resolve(__dirname, '../assets/json/marketplace/historical');
const ordersPath = path.join(BASE_DIR, 'orders.json');
const formDataPath = path.join(BASE_DIR, 'formData.json');
const outputPath = path.join(BASE_DIR, 'enriched_orders.json');

// ----------------------------
// Load JSON files
// ----------------------------
const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
const formData = JSON.parse(fs.readFileSync(formDataPath, 'utf8'));

// ----------------------------
// Build lookup map: ritm_number -> cleaned formData
// ----------------------------
const formDataMap = {};

for (const fd of formData) {
  if (!fd.ritm_number) continue;

  // ✅ Exclude unwanted fields (immutable)
  const {
    ritm_number,
    ritm_sys_id,
    ...cleanFormData
  } = fd;

  formDataMap[fd.ritm_number] = cleanFormData;
}

// ----------------------------
// Join formData into orders
// ----------------------------
const mergedOrders = orders.map(order => ({
  ...order,
  formData: formDataMap[order.number] || null
}));

// ----------------------------
// Write output
// ----------------------------
fs.writeFileSync(
  outputPath,
  JSON.stringify(mergedOrders, null, 2),
  'utf8'
);

console.log(`✅ Merge complete. Output written to ${outputPath}`);