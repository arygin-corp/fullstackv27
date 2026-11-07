/**
 * run_pipeline.js
 * Runs scripts sequentially:
 * 1) export_db.js
 * 2) export_requestData.js
 * 3) export_formData.js
 * 4) join_combineData.js
 */

const path = require("path");
const { spawn } = require("child_process");

const scripts = [
  { name: "STEP 1 - Export base catalog and AD groups", file: "1_export_db.js", env: { SKIP_PRODUCT_ENRICHMENT: "true" } },
  { name: "STEP 2 - Fetch fresh Denodo metadata", file: "2_export_Denodo.js" },
  { name: "STEP 3 - Build products_enriched.json", file: "2b_build_products_enriched.js" },
  { name: "STEP 4 - Export approved request data", file: "3_export_requestData.js" },
  { name: "STEP 5 - Export historical form data", file: "4_export_formData.js" },
  { name: "STEP 6 - Join enriched historical orders", file: "5_join_enrichedOrders.js" },
];

function runNodeScript(scriptPath, stepName, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    console.log("\n==================================================");
    console.log(`🚀 ${stepName}`);
    console.log(`▶ node ${scriptPath}`);
    console.log("==================================================\n");

    const child = spawn(process.execPath, [scriptPath], {
      stdio: "inherit", // stream logs live
      env: { ...process.env, ...extraEnv },
    });

    child.on("error", reject);

    child.on("exit", (code) => {
      if (code === 0) {
        console.log(`\n✅ ${stepName} completed successfully.\n`);
        resolve();
      } else {
        reject(new Error(`❌ ${stepName} failed with exit code ${code}`));
      }
    });
  });
}

async function main() {
  const start = Date.now();

  try {
    for (const s of scripts) {
      // If your scripts are NOT in the same folder as run_pipeline.js,
      // change this to the correct relative path:
      const scriptPath = path.resolve(__dirname, s.file);

      // Optional: pass per-step env overrides here if needed:
      // e.g. export_formData uses INPUT_FILE/OUTPUT_FILE/CONCURRENCY etc.
      const perStepEnv = s.env || {};

      await runNodeScript(scriptPath, s.name, perStepEnv);
    }

    const durationSec = ((Date.now() - start) / 1000).toFixed(2);
    console.log("==================================================");
    console.log(`🎉 PIPELINE COMPLETE in ${durationSec}s`);
    console.log("==================================================\n");
    process.exit(0);
  } catch (err) {
    console.error("\n==================================================");
    console.error("💥 PIPELINE FAILED");
    console.error(err?.stack || err?.message || err);
    console.error("==================================================\n");
    process.exit(1);
  }
}

main();