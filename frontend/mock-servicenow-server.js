const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = Number(process.env.PORT || 4300);
const API_PORT = Number(process.env.API_PORT || 8000);
const DIST = path.resolve(__dirname, "dist/edmp-gdx-client-app/browser");
const PROXY_PREFIXES = ["/api/", "/marketplace/", "/media/", "/static/", "/view/", "/admin/", "/sa/", "/ai/"];
const SUGGESTED_AI = JSON.parse(fs.readFileSync(path.join(__dirname, "mock-suggested-ai.json"), "utf8"));
const MOCK_DENODO = JSON.parse(fs.readFileSync(path.join(__dirname, "mock-denodo.json"), "utf8"));

function productionTicket() {
  const stamp = Date.now().toString().slice(-7);
  return {
    result: {
      request_number: "REQ" + stamp,
      request_id: stamp,
      number: "RITM" + stamp,
      ritm_number: "RITM" + stamp,
      sys_id: stamp,
      submittedAt: new Date().toISOString(),
    },
  };
}

function requireBasicAuth(req, res) {
  const auth = req.header("Authorization") || "";
  if (!auth.startsWith("Basic ") || auth.trim() === "Basic") {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

function sendTicket(req, res) {
  if (!requireBasicAuth(req, res)) {
    return;
  }
  const ticket = productionTicket();
  console.log("Local production ServiceNow", req.method, req.path, ticket.result.request_number);
  setTimeout(() => res.status(200).json(ticket), 800);
}

app.post("/submitOrder", express.json({ limit: "20mb" }), sendTicket);
app.post("/api/sn_sc/servicecatalog/items/:item/add_to_cart", express.json({ limit: "20mb" }), sendTicket);
app.post("/api/sn_sc/servicecatalog/items/:item/order_now", express.json({ limit: "20mb" }), sendTicket);
app.post("/api/sn_sc/servicecatalog/cart/submit_dar_order", express.json({ limit: "20mb" }), sendTicket);
app.post("/api/now/attachment/upload", (req, res) => {
  if (!requireBasicAuth(req, res)) {
    return;
  }
  res.status(201).json({ result: { sys_id: Date.now().toString().slice(-7) } });
});

function gradeText(value) {
  const length = String(value || "").trim().length;
  if (length >= 80) return "A";
  if (length >= 40) return "B";
  if (length >= 15) return "C";
  return "D";
}

function suggestedAi(req, res) {
  const query = req.query || {};
  const database = query.databaseSchema || query["database-schema"] || query.query || "tdp_vehicle";
  const tables = query.tableNames || query.tablenames || "vehicle_sales";
  const verified = String(query.tier || "").toLowerCase() === "verified";
  const grades = verified
    ? [
        { grade: "A", modifier: "+", color_class: "success", match_percentage: 98 },
        { grade: "A", modifier: "", color_class: "success", match_percentage: 94 },
        { grade: "A", modifier: "-", color_class: "success", match_percentage: 91 },
        { grade: "B", modifier: "+", color_class: "primary", match_percentage: 88 },
        { grade: "B", modifier: "", color_class: "primary", match_percentage: 84 },
      ]
    : [
        { grade: "B", modifier: "", color_class: "primary", match_percentage: 86 },
        { grade: "B", modifier: "-", color_class: "primary", match_percentage: 81 },
        { grade: "C", modifier: "+", color_class: "warning", match_percentage: 76 },
        { grade: "C", modifier: "", color_class: "warning", match_percentage: 72 },
        { grade: "C", modifier: "-", color_class: "warning", match_percentage: 68 },
      ];
  const suggestions = SUGGESTED_AI.map((product, index) => {
    const score = grades[index] || grades[grades.length - 1];
    return {
      ...product,
      identifier: product.sku,
      product_name: product.name,
      product_datatype: product.datatype,
      product_classification: product.classification,
      product_ad_group: product.ad_group,
      adgroup: product.ad_group,
      product_image: product.image,
      db_name: database,
      tbl_name: tables,
      requested_db_name: database,
      business_justification: query.justification || "Supports reporting for the requested used vehicle data.",
      detailed_explanation: "<p>" + product.explanation + "</p>",
      badges: verified ? ["VERIFIED MATCH", "AI SUGGESTION"] : ["AI SUGGESTION"],
      verified,
      manual_verified: verified,
      grade: score.grade,
      modifier: score.modifier,
      full_grade: score.grade + score.modifier,
      color_class: score.color_class,
      match_percentage: score.match_percentage,
      domain: query.domain || product.domain,
      steward_name: "Not Assigned",
      contact_name: "Not Assigned",
    };
  });
  console.log("Local suggested AI", verified ? "verified" : "standard", suggestions.length);
  res.json({
    suggestions,
    product: suggestions,
    ranking_mode: "default",
    input_grading: {
      dbGrade: database ? "A" : "D",
      tableGrade: tables ? "B" : "D",
      descriptionGrade: gradeText(query.description),
      justificationGrade: gradeText(query.justification),
    },
  });
}

app.get("/api/integrations/denodo/table/view", (req, res) => {
  res.json(MOCK_DENODO);
});
app.get("/ai/suggest-products-by-role/", suggestedAi);
app.get("/ai/suggest-products-enhanced/", suggestedAi);
app.post("/ai/feedback/submit/", express.json({ limit: "2mb" }), (req, res) => {
  res.status(201).json({ status: "ok" });
});

function proxyToApi(req, res) {
  const headers = Object.assign({}, req.headers, { host: "127.0.0.1:" + API_PORT });
  const upstream = http.request(
    {
      hostname: "127.0.0.1",
      port: API_PORT,
      path: req.originalUrl,
      method: req.method,
      headers,
    },
    (upstreamResponse) => {
      res.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.headers);
      upstreamResponse.pipe(res);
    }
  );
  upstream.on("error", () => {
    if (!res.headersSent) {
      res.status(502).json({ error: "Local API is not running on port " + API_PORT });
    }
  });
  req.pipe(upstream);
}

app.use((req, res, next) => {
  if (PROXY_PREFIXES.some((prefix) => req.path.startsWith(prefix))) {
    return proxyToApi(req, res);
  }
  return next();
});

if (!fs.existsSync(path.join(DIST, "index.html"))) {
  console.error("Production build not found at " + DIST);
  console.error("Run npm run start-mock from the frontend folder so the production build is created first.");
  process.exit(1);
}

app.use(express.static(DIST, { index: false, fallthrough: true }));
app.get("*", (req, res) => {
  res.sendFile(path.join(DIST, "index.html"));
});

const server = app.listen(PORT, () => {
  console.log("Production preview: http://localhost:" + PORT);
  console.log("Marketplace API is proxied to http://127.0.0.1:" + API_PORT);
  console.log("ServiceNow requests are answered on this machine and are not sent to production.");
});

server.on("error", (error) => {
  if (error && error.code === "EADDRINUSE") {
    console.log("Production preview is already running at http://localhost:" + PORT);
    process.exit(0);
  }
  throw error;
});
