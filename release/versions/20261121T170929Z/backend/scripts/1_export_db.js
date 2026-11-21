require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const {
	Pool
} = require('pg');

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- 1. CONFIGURATION & INTELLIGENCE ---
const TIMEOUT_MS = 120000; // 120 seconds for slow Denodo views
const MAX_RETRIES = 4; // Maximum retry attempts per group

function toSafeAdGroupFileName(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\W+/g, '_');
}

const FRIENDLY_METADATA_MAP = {
	"tbdp_accounting_calendar": "Official Corporate Accounting Data",
	"tbdp_customer_master": "Validated Global Customer Identity Data",
	"tbdp_vehicle_master_data": "Certified Manufacturing Vehicle Specifications",
	"tbdp_dealer_master": "Authorized North American Dealer Network List"
};

// --- 2. DATABASE CONNECTION ---
const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
	ssl: {
		rejectUnauthorized: false
	},
});

const STATIC_PATH = path.resolve(__dirname, '../assets/json/marketplace');
const PRODUCTS_PATH = path.join(STATIC_PATH, 'products');
const ORDERS_PATH = path.join(STATIC_PATH, 'orders');
const DOMAINS_PATH = path.join(STATIC_PATH, 'domains');
const ONETSDOMAINS_PATH = path.join(STATIC_PATH, 'onetsdomains');
const PLATFORM_PATH = path.join(STATIC_PATH, 'platforms');

/**
 * Ensures required directories exist
 */
function ensureDirs() {
	const dirs = ['products', 'domains', 'onetsdomains', 'platforms', 'orders', 'ad_groups', 'denodo', '@denodo_masterdata'];
	console.log(`[SYSTEM] Initializing directories...`);
	dirs.forEach(f => {
		const p = path.join(STATIC_PATH, f);
		if (!fs.existsSync(p)) {
			fs.mkdirSync(p, {
				recursive: true
			});
			console.log(`[SYSTEM] [SUCCESS] Created directory: ${f}`);
		} else {
			console.log(`[SYSTEM] [EXISTS] Directory verified: ${f}`);
		}
	});
}

/**
 * ROBUST FETCHER: Handles Denodo slowness with retries and long timeouts
 */
async function fetchWithRetry(group, attempt = 1) {
	const safeName = group.replace(/\W+/g, '_');
	const url = `https://api.data.toyota.com/view/endpoint/denodo/table/view?userrolename=${encodeURIComponent(group)}`;

	try {
		const res = await axios.get(url, {
			timeout: TIMEOUT_MS
		});
		const filePath = path.join(STATIC_PATH, `denodo/${safeName}.json`);
		fs.writeFileSync(filePath, JSON.stringify(res.data, null, 2));
		console.log(`SUCCESS (Saved to ${safeName}.json)`);
		return {
			success: true,
			data: res.data
		};
	} catch (err) {
		const isTimeout = err.code === 'ECONNABORTED' || err.message.includes('timeout');
		const status = err.response ? err.response.status : (isTimeout ? 'TIMEOUT' : 'ERROR');

		console.log(`FAILED (${status})`);

		if (attempt < MAX_RETRIES && (isTimeout || status >= 500)) {
			
			const waitTime = Math.min(60000, 2 ** (attempt - 1) * 15000); // 15s → 30s → 60s → 60s cap
			console.log(`[RETRY] Group "${group}" failed. Retrying in ${waitTime/1000}s (Attempt ${attempt}/${MAX_RETRIES})...`);
			await new Promise(r => setTimeout(r, waitTime));
			return fetchWithRetry(group, attempt + 1);
		}

		console.error(`[ERROR] Giving up on "${group}" after ${attempt} attempts. Message: ${err.message}`);
		return {
			success: false,
			status
		};
	}
}

function plainText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function exportProducts() {
  console.log(`\n--- STEP 1: EXPORTING BASE PRODUCTS (FROM DATABASE) ---`);

  try {
    console.log(`[DB] [READ] Loading latest products from marketplace_product...`);
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.sku,
        p.brief_desc,
        p.short_desc,
        p.intended_use,
        p.is_active,
        CASE
          WHEN tpl.pattern IS NULL OR btrim(tpl.pattern) = '' THEN ''
          ELSE (
            CASE
              WHEN lower(btrim(COALESCE(kind.name, ''))) = 'api'
                AND btrim(COALESCE(rt.query, '')) <> '' THEN
                CASE
                  WHEN position('?' IN built.url) > 0 THEN built.url || '&' || rt.query
                  ELSE built.url || '?' || rt.query
                END
              ELSE built.url
            END
          )
        END AS resource_url,
        p.original_name,
        p.usertype,
        p.access_type,
        p.environment,
        p.data_access_type,
        p.availability,
        p.frequency,
        p.hide_me,
        p.max,
        p.pi,
        p.sensitive_pi,
        p.status,
        p.updated_at,
        d.name AS domain_name,
        d.slug AS domain_slug,
        s1.name AS subdomain2_name,
        s1.slug AS subdomain2_slug,
        s2.name AS subdomain3_name,
        s2.slug AS subdomain3_slug,
        dt.name AS datatype_name,
        dt.value AS datatype_value,
        dt.slug AS datatype_slug,
        c.name AS classification_name,
        ag.value AS adgroup,
        plat.name AS platform_name,
        ots.name AS onetsdomain_name,
        ots.control_group AS controlgroup,
        steward.name AS owner,
        steward.email AS owneremail,
        poc.name AS poc,
        poc.email AS pocemail,
        org.name AS org_name,
        (
          SELECT i.image
          FROM marketplace_productimage i
          WHERE i.product_id = p.id
            AND COALESCE(i.image, '') <> ''
          ORDER BY i.id
          LIMIT 1
        ) AS image
      FROM marketplace_product p
      LEFT JOIN marketplace_domain d ON d.id = p.domain_id
      LEFT JOIN marketplace_subdomain_1 s1 ON s1.id = p.subdomain_2_id
      LEFT JOIN marketplace_subdomain_2 s2 ON s2.id = p.subdomain_3_id
      LEFT JOIN marketplace_datatype dt ON dt.id = p.datatype_id
      LEFT JOIN marketplace_classification c ON c.id = p.classification_id
      LEFT JOIN marketplace_adgroup ag ON ag.id = p.ad_group_id
      LEFT JOIN marketplace_platform plat ON plat.id = p.platform_id
      LEFT JOIN marketplace_onetsdomain ots ON ots.id = p.one_ts_domain_id
      LEFT JOIN marketplace_datasteward steward ON steward.id = p.data_steward_id
      LEFT JOIN marketplace_contact poc ON poc.id = p.poc_name_id
      LEFT JOIN marketplace_organization org ON org.id = p.org_id
      LEFT JOIN marketplace_catalog catalog ON catalog.id = p.resource_id
      LEFT JOIN marketplace_resourcetype rt ON rt.id = catalog.resourcetype_id
      LEFT JOIN marketplace_resourcekind kind ON kind.id = rt.type_id
      LEFT JOIN marketplace_resourceurltemplate tpl ON tpl.id = rt.url_id
      LEFT JOIN LATERAL (
        SELECT replace(
          replace(tpl.pattern, '<app_id>', COALESCE(rt.api_id::text, '')),
          '<collibra_id>',
          COALESCE(rt.collibra_id::text, '')
        ) AS url
      ) built ON true
      ORDER BY p.updated_at DESC NULLS LAST, p.id
    `);

    const products = result.rows.map(row => {
      const identifier = String(row.id);
      const description = plainText(row.brief_desc || row.short_desc);
      return {
        id: identifier,
        name: row.name || '',
        slug: row.slug || '',
        sku: row.sku || '',
        adgroup: row.adgroup || '',
        categories: row.domain_name || '',
        subdomain1: row.domain_name || '',
        subdomain1path: row.domain_slug || '',
        subdomain2: row.subdomain2_name || '',
        subdomain2path: row.subdomain2_slug || '',
        subdomain3: row.subdomain3_name || '',
        subdomain3path: row.subdomain3_slug || '',
        datatype: row.datatype_name || '',
        datatypepath: row.datatype_slug || row.datatype_value || '',
        classification: row.classification_name || '',
        owner: row.owner || '',
        owneremail: row.owneremail || '',
        poc: row.poc || '',
        pocemail: row.pocemail || '',
        platform: row.platform_name || '',
        onetsdomain: row.onetsdomain_name || '',
        controlgroup: row.controlgroup || '',
        orgtype: row.org_name || '',
        image: row.image || `../assets/img/products/P_${identifier}.jpg`,
        listdetail: description,
        short_desc: plainText(row.short_desc),
        brief_desc: plainText(row.brief_desc),
        intended_use: plainText(row.intended_use),
        isactive: row.is_active === true,
        resourceurl: row.resource_url || '',
        resourcename: row.original_name || '',
        usertype: row.usertype || '',
        access_type: row.access_type || '',
        env: row.environment || '',
        dataaccesstype: row.data_access_type || '',
        avail: row.availability || '',
        freq: row.frequency || '',
        hideme: row.hide_me || '',
        max: row.max || '',
        pii: row.pi || '',
        spi: row.sensitive_pi || '',
        status: row.status || '',
        updated_at: row.updated_at || null,
      };
    });

    const snapshotPath = path.join(PRODUCTS_PATH, 'in_memory.json');
    writeJson(snapshotPath, products);
    console.log(`[DB] [SUCCESS] Saved ${products.length} products to products/in_memory.json`);

    const filteredProducts = products
      .filter(product => product.name !== 'Data Access Request')
      .sort((left, right) => (left.id > right.id ? 1 : -1));
    const outputFilePath = path.join(PRODUCTS_PATH, 'products.json');
    writeJson(outputFilePath, filteredProducts);
    console.log(`[FILE] [SUCCESS] Saved ${filteredProducts.length} products to products.json`);

    return filteredProducts;
  } catch (err) {
    console.error(`[FILE] [FAILED] Product Export Error: ${err.message}`);
    return [];
  }
}

async function exportAdGroups(products) {
  console.log(`\n--- STEP 2: EXPORTING AD GROUPS (FROM PRODUCTS) ---`);
  try {
    if (!Array.isArray(products) || products.length === 0) {
      console.log(`[ADGROUPS] [SKIP] No products supplied, nothing to export.`);
      return [];
    }

    const adGroups = [...new Set(
      products
        .map((p) => (p?.adgroup ?? '').toString().trim())
        .filter((v) => v.length > 0)
    )].sort((a, b) => a.localeCompare(b));

    const filePath = path.join(STATIC_PATH, 'ad_groups', 'ad_groups.json');
    writeJson(filePath, adGroups);
    console.log(`[FILE] [SUCCESS] Saved ${adGroups.length} adgroups to ad_groups/ad_groups.json`);
    return adGroups;
  } catch (err) {
    console.error(`[ADGROUPS] [FAILED] Ad Group Export Error: ${err.message}`);
    return [];
  }
}

// --- STEP 3 (with fallback) ---
async function exportDomains(products) {
  console.log(`\n--- STEP 3: EXPORTING DOMAIN HIERARCHY ---`);

  try {
    // ✅ If products not passed, load from file
    if (!Array.isArray(products) || products.length === 0) {
      console.log(`[DOMAINS] Loading products from file...`);

      const filePath = path.join(PRODUCTS_PATH, 'products.json');

      if (!fs.existsSync(filePath)) {
        console.warn(`[DOMAINS] products.json not found at ${filePath}`);
        return [];
      }

      products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      if (!Array.isArray(products) || products.length === 0) {
        console.warn(`[DOMAINS] products.json is empty.`);
        return [];
      }
    }

    const rootMap = new Map();

    products.forEach(product => {
      const sub1 = product.subdomain1?.trim();
      const sub2 = product.subdomain2?.trim();
      const sub3 = product.subdomain3?.trim();

      if (!sub1) return;

      if (!rootMap.has(sub1)) {
        rootMap.set(sub1, {
          name: sub1,
          children: new Map()
        });
      }

      const level1 = rootMap.get(sub1);

      if (sub2) {
        if (!level1.children.has(sub2)) {
          level1.children.set(sub2, {
            name: sub2,
            children: new Map()
          });
        }

        const level2 = level1.children.get(sub2);

        if (sub3) {
          if (!level2.children.has(sub3)) {
            level2.children.set(sub3, {
              name: sub3,
              children: new Map()
            });
          }
        }
      }
    });

    const convert = (map) =>
      Array.from(map.values()).map(node => ({
        name: node.name,
        children: convert(node.children)
      }));

    const output = convert(rootMap);

    writeJson(path.join(DOMAINS_PATH, 'domains.json'), output);

    console.log(`[FILE] [SUCCESS] Saved ${output.length} domain roots`);

    return output;

  } catch (err) {
    console.error(`[FILE] [FAILED] Domain Export Error: ${err.message}`);
    return [];
  }
}

// --- STEP 4 (with fallback) ---
async function exportOneTSDomains(products) {
  console.log(`\n--- STEP 4: EXPORTING ONETSDOMAINS (FROM PRODUCTS JSON) ---`);

  try {
    // ✅ Fallback: load products from file if not provided
    if (!Array.isArray(products) || products.length === 0) {
      console.log(`[ONETSDOMAINS] Loading products from file...`);

      const filePath = path.join(PRODUCTS_PATH, 'products.json');

      if (!fs.existsSync(filePath)) {
        console.warn(`[ONETSDOMAINS] products.json not found.`);
        return [];
      }

      products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      if (!Array.isArray(products) || products.length === 0) {
        console.warn(`[ONETSDOMAINS] products.json is empty.`);
        return [];
      }
    }

    console.log(`[DATA] [PROCESS] Extracting onetsdomains from products...`);

    const domainSet = new Set();

    products.forEach(product => {
      const value = product.onetsdomain?.trim();

      if (value) {
        domainSet.add(value);
      }
    });

    const output = Array.from(domainSet)
      .sort((a, b) => a.localeCompare(b)) // ✅ cleaner sort
      .map((name, index) => ({
        id: String(index + 1),
        name
      }));

    writeJson(
      path.join(ONETSDOMAINS_PATH, 'onetsdomains.json'),
      output
    );

    console.log(
      `[FILE] [SUCCESS] Saved ${output.length} onetsdomains to onetsdomains.json`
    );

    return output;

  } catch (err) {
    console.error(`[FILE] [FAILED] OnetsDomain Export Error: ${err.message}`);
    return [];
  }
}

// --- STEP 5 (with fallback) ---
async function exportPlatforms(products) {
  console.log(`\n--- STEP 5: EXPORTING PLATFORMS (FROM PRODUCTS JSON) ---`);

  try {
    // ✅ Load from file if not passed
    if (!Array.isArray(products) || products.length === 0) {
      console.log(`[PLATFORMS] Loading products from file...`);

      const filePath = path.join(PRODUCTS_PATH, 'products.json');

      if (!fs.existsSync(filePath)) {
        console.warn(`[PLATFORMS] products.json not found.`);
        return [];
      }

      products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    console.log(`[DATA] [PROCESS] Extracting platforms per product...`);

    const output = products
      .filter(p => p.platform && p.platform.trim() !== '')
      .sort((a, b) => a.platform.localeCompare(b.platform))
      .map((product, index) => ({
        id: String(index + 1),
        name: product.platform.trim(),
        routeidentifier: product.routeidentifier?.toString().trim() || null
      }));

    writeJson(
      path.join(PLATFORM_PATH, 'platforms.json'),
      output
    );

    console.log(
      `[FILE] [SUCCESS] Saved ${output.length} platforms to platforms.json`
    );

    return output;

  } catch (err) {
    console.error(`[FILE] [FAILED] Platform Export Error: ${err.message}`);
    return [];
  }
}

function loadServiceNowRitmCatalog() {
	const filePath = path.join(STATIC_PATH, 'historical', 'all_orders.json');
	const catalog = new Map();
	if (!fs.existsSync(filePath)) return catalog;
	const orders = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const order of orders) {
		for (const ritm of order.ritms || []) {
			if (!ritm.ritm_number) continue;
			catalog.set(ritm.ritm_number, {
				request_number: order.request_number || '',
				ritm_id: ritm.ritm_id || ''
			});
		}
	}
	return catalog;
}

// orders_request.number was stored as a 5-character fragment. The task row
// still has the full RITM, and all_orders.json has the matching REQ number.
function restoreStoredOrderNumbers(requests, tasks) {
	const catalog = loadServiceNowRitmCatalog();
	const ritmsByRequest = new Map();
	for (const task of tasks) {
		const requestId = String(task.request_id);
		if (!ritmsByRequest.has(requestId)) ritmsByRequest.set(requestId, new Set());
		if (task.ritm) ritmsByRequest.get(requestId).add(task.ritm);
	}
	for (const request of requests) {
		const ritms = [...(ritmsByRequest.get(String(request.id)) || [])];
		if (ritms.length === 1) {
			const [ritm] = ritms;
			request.ritm_number = ritm;
			const info = catalog.get(ritm);
			if (info) {
				if (info.ritm_id && !request.ritm_id) request.ritm_id = info.ritm_id;
				if (info.request_number) request.number = info.request_number;
			}
		} else {
			const requestNumbers = new Set(
				ritms.map((ritm) => catalog.get(ritm)?.request_number).filter(Boolean)
			);
			if (requestNumbers.size === 1) request.number = [...requestNumbers][0];
		}
		if (/^RITM/i.test(String(request.number || ""))) {
			if (/^RITM\d{4,}$/.test(String(request.number)) && !/^RITM\d{4,}$/.test(String(request.ritm_number || ""))) {
				request.ritm_number = request.number;
			}
			request.number = "";
		}
	}
}

/**
 * 6. Export and Join Orders
 */
async function exportAndJoinOrders() {
	console.log(`\n--- STEP 6: EXPORTING AND CLEANING ORDERS ---`);
	try {
		console.log(`[DB] [QUERY] Fetching requests and tasks from database...`);
		const reqRes = await pool.query('SELECT * FROM orders_request ORDER BY opened_at DESC');
		const taskRes = await pool.query('SELECT * FROM orders_task');
		console.log(`[DB] [FETCHED] ${reqRes.rowCount} requests and ${taskRes.rowCount} tasks retrieved.`);
		restoreStoredOrderNumbers(reqRes.rows, taskRes.rows);

		fs.writeFileSync(path.join(ORDERS_PATH, 'requests.json'), JSON.stringify(reqRes.rows, null, 4));
		fs.writeFileSync(path.join(ORDERS_PATH, 'tasks.json'), JSON.stringify(taskRes.rows, null, 4));

		let validCount = 0;
		let dirtyCount = 0;
		const masterOrders = reqRes.rows.map(req => {
			const matchedTasks = taskRes.rows.filter(t => {
				const isMatch = String(t.request_id || t.requestId) === String(req.id) || String(t.ritm || t.ritm_number) === String(req.number);
				if (isMatch) {
					const state = (t.state || '').toLowerCase();
					const isDirty = state.includes('cancel') || state.includes('incomplete') || state.includes('skip');
					if (isDirty) {
						dirtyCount++;
						return false;
					}
					validCount++;
					return true;
				}
				return false;
			});
			return {
				request_info: {
					id: req.id,
					number: req.number,
					ritm_number: req.ritm_number || "",
					status: req.ritm_state || "Unknown",
					submitted_by: req.opened_by || req.submittedByName,
					opened_at: req.opened_at,
					variables: req.variables || []
				},
				tasks: matchedTasks.map(t => ({
					task_number: t.number,
					ritm: t.ritm || "",
					state: t.state,
					created_at: t.created || t.createdAt
				}))
			};
		});
		fs.writeFileSync(path.join(ORDERS_PATH, 'master_orders.json'), JSON.stringify(masterOrders, null, 4));
		console.log(`[CLEANING] [SUCCESS] Cleaned data saved: master_orders.json`);
		console.log(`[CLEANING] [STATS] Kept ${validCount} valid tasks | Excluded ${dirtyCount} cancelled/incomplete tasks.`);
		return masterOrders;
	} catch (err) {
		console.error(`[CLEANING] [FAILED] Order Process Error: ${err.message}`);
		return [];
	}
}

/**
 * 7. Build Enriched Intelligence
 */
async function buildEnrichedIntelligence(products, orders) {
    console.log(`\n--- STEP 7: BUILDING ENRICHED INTELLIGENCE CATALOG ---`);
    try {
        // Build usage statistics from orders
        const statsMap = {};
        orders.forEach(o => {
            const payload = JSON.stringify(o.request_info.variables).toLowerCase();
            products.forEach(p => {
                if (payload.includes((p.name || '').toLowerCase())) {
                    statsMap[p.id] = (statsMap[p.id] || 0) + 1;
                }
            });
        });

        // Get list of available denodo files
        const denodoPath = path.join(STATIC_PATH, 'denodo');
        const denodoFiles = fs.existsSync(denodoPath) ? fs.readdirSync(denodoPath) : [];
        console.log(`[AI] Found ${denodoFiles.length} individual denodo files`);

        const enriched = products.map(prod => {
            const rawAdgroup = prod.adgroup || prod.adgroups;
            
            // Generate safe filename from adgroup
            const safeAdgroup = rawAdgroup
                ? toSafeAdGroupFileName(rawAdgroup)
                : null;

            // Friendly name mapping
            const mapKeyCandidates = [
                prod.adgroup, 
                prod.technical_name, 
                prod.name
            ].filter(Boolean).map(v => v.toLowerCase().replace(/\W+/g, '_'));
            
            const friendlyName = mapKeyCandidates
                .map(k => FRIENDLY_METADATA_MAP[k])
                .find(Boolean) || `${prod.name} Data Resource`;

            // Try to load individual denodo file for this product's adgroup
            let denodoData = null;
            let matchedFile = null;
            
            if (safeAdgroup) {
                // Try exact match first: {adgroup}.json
                const exactFile = `${safeAdgroup}.json`;
                const exactPath = path.join(denodoPath, exactFile);
                
                if (fs.existsSync(exactPath)) {
                    try {
                        const fileContent = fs.readFileSync(exactPath, 'utf8');
                        denodoData = JSON.parse(fileContent);
                        matchedFile = exactFile;
                        console.log(`[AI] [MATCH] Product "${prod.name}" -> ${exactFile}`);
                    } catch (err) {
                        console.warn(`[AI] [ERROR] Failed to parse ${exactFile}: ${err.message}`);
                    }
                } else {
                    // Try to find partial match in available files
                    const partialMatch = denodoFiles.find(f => {
                        const fLower = f.toLowerCase().replace('.json', '');
                        return fLower.includes(safeAdgroup) || safeAdgroup.includes(fLower);
                    });
                    
                    if (partialMatch) {
                        try {
                            const partialPath = path.join(denodoPath, partialMatch);
                            const fileContent = fs.readFileSync(partialPath, 'utf8');
                            denodoData = JSON.parse(fileContent);
                            matchedFile = partialMatch;
                            console.log(`[AI] [PARTIAL] Product "${prod.name}" -> ${partialMatch}`);
                        } catch (err) {
                            console.warn(`[AI] [ERROR] Failed to parse ${partialMatch}: ${err.message}`);
                        }
                    }
                }
            }

            // Preserve relational Denodo metadata:
            // dbname -> elementname -> column_names
            const assetMap = new Map();

            const normalizeMetadataValue = value =>
                String(value ?? '').trim();

            const normalizeMetadataKey = value =>
                normalizeMetadataValue(value).toLowerCase();

            const addDenodoMetadataRow = row => {
                const dbname = normalizeMetadataValue(row?.dbname);
                const elementname = normalizeMetadataValue(row?.elementname);
                const columnName = normalizeMetadataValue(row?.column_name);
                const userrolename = normalizeMetadataValue(row?.userrolename);

                if (!dbname || !elementname) return;

                const assetKey =
                    `${normalizeMetadataKey(dbname)}::${normalizeMetadataKey(elementname)}`;

                if (!assetMap.has(assetKey)) {
                    assetMap.set(assetKey, {
                        dbname,
                        elementname,
                        userrolename: userrolename || null,
                        column_names: []
                    });
                }

                const asset = assetMap.get(assetKey);
                const columnKey = normalizeMetadataKey(columnName);

                if (
                    columnName &&
                    !asset.column_names.some(existing =>
                        normalizeMetadataKey(existing) === columnKey
                    )
                ) {
                    asset.column_names.push(columnName);
                }
            };

            const denodoRows =
                denodoData && Array.isArray(denodoData.elements)
                    ? denodoData.elements
                    : Array.isArray(denodoData)
                        ? denodoData
                        : [];

            denodoRows.forEach(addDenodoMetadataRow);

            const denodoAssets = Array.from(assetMap.values());

            // Compatibility-only flattened fields.
            // Exact matching must use denodo.assets.
            const dbNames = [
                ...new Set(denodoAssets.map(asset => asset.dbname))
            ];

            const elementNames = [
                ...new Set(denodoAssets.map(asset => asset.elementname))
            ];

            const uniqueColumnNames = [
                ...new Set(
                    denodoAssets.flatMap(asset => asset.column_names)
                )
            ];

            const count = statsMap[prod.id] || 0;
            const slaEstimate = count >= 50
                ? "Highly predictable; typically fulfilled in 2-3 business days."
                : count >= 10
                ? "Generally fulfilled within 3-5 business days."
                : "Estimate pending more historical data.";

            const tags = [
                ...(prod.name || '').toLowerCase().split(' '), 
                rawAdgroup ? rawAdgroup.toLowerCase() : 'portal'
            ].filter(t => t.length > 3);

            return {
                ...prod,
                denodo: {
                    // Canonical relational metadata used by the AI engine.
                    assets: denodoAssets,

                    // Compatibility-only flattened fields.
                    dbname: dbNames,
                    elementname: elementNames,
                    column_names: uniqueColumnNames,

                    total_assets: denodoAssets.length,
                    total_columns: uniqueColumnNames.length,
                    source_file: matchedFile,
                    raw_adgroup: rawAdgroup || null
                },
                intelligence: {
                    transparency_note: `Verified Source: ${friendlyName}`,
                    predicted_sla: slaEstimate,
                    search_optimization: {
                        tags: [...new Set(tags)],
                        is_recommended: count > 20
                    },
                    technical_details: {
                        matched_file: matchedFile || "N/A",
                        historical_count: count,
                    }
                }
            };
        });

        const finalPath = path.join(STATIC_PATH, 'products', 'products_enriched.json');
        fs.writeFileSync(finalPath, JSON.stringify(enriched, null, 4));
        console.log(`[AI] [SUCCESS] Enriched catalog exported with ${enriched.length} products.`);
        
        // Summary statistics
        const withMetadata = enriched.filter(product =>
            Array.isArray(product.denodo?.assets) &&
            product.denodo.assets.length > 0
        ).length;

        const withFile = enriched.filter(product =>
            Boolean(product.denodo?.source_file)
        ).length;

        const totalAssets = enriched.reduce(
            (sum, product) =>
                sum + (Array.isArray(product.denodo?.assets)
                    ? product.denodo.assets.length
                    : 0),
            0
        );

        console.log(`[AI] ${withMetadata} products have relational Denodo metadata.`);
        console.log(`[AI] ${withFile} products matched an individual Denodo file.`);
        console.log(`[AI] ${totalAssets} database/table assets were generated.`);

    } catch (err) {
        console.error(`[AI] [FAILED] Enrichment Error: ${err.message}`);
        console.error(err.stack);
    }
}

/**
 * MAIN EXECUTION
 */
async function run() {
	const startTime = Date.now();
	console.log(`==================================================`);
	console.log(`[START] [${new Date().toISOString()}] Pipeline Initiated`);
	console.log(`==================================================`);
	try {
		ensureDirs();
		const products = await exportProducts();
		if (products.length === 0) {
			console.error(`[QUIT] Stopping pipeline: No Products found.`);
			process.exit(1);
		}
		const ad_groups = await exportAdGroups(products);
		if (ad_groups.length === 0) {
			console.error(`[QUIT] Stopping pipeline: No AD Groups found.`);
			process.exit(1);
		}
		const domains = await exportDomains(products);
		if (domains.length === 0) {
			console.error(`[QUIT] Stopping pipeline: No Domains found.`);
			process.exit(1);
		}
		const onetsdomains = await exportOneTSDomains(products);
		if (onetsdomains.length === 0) {
			console.error(`[QUIT] Stopping pipeline: No One TS Domains found.`);
			process.exit(1);
		}
		const platforms = await exportPlatforms(products);
		if (platforms.length === 0) {
			console.error(`[QUIT] Stopping pipeline: No Platforms found.`);
			process.exit(1);
		}
		const orders = await exportAndJoinOrders();
		// await syncDenodo();
		if (process.env.SKIP_PRODUCT_ENRICHMENT === 'true') {
			console.log('[AI] Product enrichment deferred until Denodo sync completes.');
		} else {
			await buildEnrichedIntelligence(products, orders);
		}
		const duration = ((Date.now() - startTime) / 1000).toFixed(2);
		console.log(`\n==================================================`);
		console.log(`[FINISH] Pipeline Completed Successfully in ${duration}s`);
		console.log(`==================================================`);
		process.exit(0);
	} catch (err) {
		console.error(`\n[FATAL ERROR] Pipeline Crashed!`);
		console.error(err.stack);
		process.exit(1);
	}
}
if (require.main === module) {
	run();
}

module.exports = {
	buildEnrichedIntelligence,
	toSafeAdGroupFileName
};
