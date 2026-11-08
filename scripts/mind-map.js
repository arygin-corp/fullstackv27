"use strict";

const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "frontend/src/assets/docs/protected/Mind_Map.json");
const searchRoots = [
  path.join(root, "frontend/src/assets/docs/protected"),
  path.join(root, "frontend/src/assets/docs"),
  path.join(root, "backend/media")
];

function walk(dir, found, depth) {
  if (depth > 4 || !fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, found, depth + 1);
    else if (/\.pdf$/i.test(name) && /mind[\s_-]*map/i.test(name)) {
      found.push({ full, mtime: stat.mtimeMs, name });
    }
  }
}

function latestPdf() {
  const found = [];
  searchRoots.forEach(dir => walk(dir, found, 0));
  found.sort((a, b) => b.mtime - a.mtime);
  if (!found.length) {
    console.error("No mind map PDF was found.");
    process.exit(1);
  }
  return found[0];
}

function sourceUrl(file) {
  const assets = path.join(root, "frontend/src/assets") + path.sep;
  if (file.startsWith(assets)) return "assets/" + file.slice(assets.length).split(path.sep).join("/");
  return file;
}

function textItems(pdf) {
  const script = `
import json, sys
from pypdf import PdfReader
reader = PdfReader(sys.argv[1])
page = reader.pages[0]
box = page.mediabox
items = []
def visit(text, cm, tm, font, size):
    label = " ".join(str(text or "").split())
    if label:
        items.append({"text": label, "x": float(tm[4]), "y": float(tm[5]), "w": max(float(size or 8) * len(label) * 0.45, 8), "h": float(size or 8), "confidence": 1})
page.extract_text(visitor_text=visit)
json.dump({"width": float(box.width), "height": float(box.height), "items": items}, sys.stdout)
`;
  const result = spawnSync("python3", ["-c", script, pdf], { encoding: "utf8" });
  if (result.status !== 0) {
    console.error(result.stderr || "Could not read the PDF.");
    process.exit(result.status || 1);
  }
  return JSON.parse(result.stdout || "{\"items\":[]}");
}

function ocrItems(pdf) {
  const png = path.join(os.tmpdir(), "mind-map-page.png");
  const rendered = spawnSync("sips", ["-s", "format", "png", "--resampleWidth", "6400", pdf, "--out", png], { encoding: "utf8" });
  if (rendered.status !== 0) return [];
  const helper = path.join(__dirname, "mind-map-ocr.swift");
  const result = spawnSync("swift", [helper, png], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) return [];
  const rows = JSON.parse(result.stdout || "[]");
  return rows
    .filter(row => Number(row.confidence) >= 0.8 && String(row.text || "").trim().length > 2)
    .map(row => ({
      text: String(row.text).trim(),
      x: Number(row.x) * 6400,
      y: Number(row.y) * 4700,
      w: Number(row.w) * 6400,
      h: Number(row.h) * 4700,
      confidence: Number(row.confidence)
    }));
}

function kind(label, depth) {
  if (/^tbdp[-_]/i.test(label) || /^[a-z0-9]+(?:-[a-z0-9]+){2,}$/i.test(label)) return "group";
  if (depth <= 1) return "pillar";
  if (depth === 2) return "domain";
  return "topic";
}

function buildTree(items) {
  const rootItem = items.find(item => /security domains/i.test(item.text));
  const center = rootItem ? rootItem.x + rootItem.w / 2 : items.reduce((sum, item) => sum + item.x, 0) / items.length;
  const nodes = items
    .filter(item => item !== rootItem)
    .map(item => ({ ...item, cx: item.x + item.w / 2, cy: item.y + item.h / 2, children: [] }));
  nodes.sort((a, b) => Math.abs(a.cx - center) - Math.abs(b.cx - center));
  const placed = [];
  nodes.forEach(node => {
    const side = node.cx < center ? -1 : 1;
    let parent = null;
    let best = Infinity;
    placed.forEach(candidate => {
      const candidateSide = candidate.cx < center ? -1 : 1;
      if (candidateSide !== side) return;
      if (Math.abs(candidate.cx - center) >= Math.abs(node.cx - center) - 1) return;
      const score = Math.abs(candidate.cy - node.cy) * 4 + Math.abs(candidate.cx - node.cx);
      if (score < best) {
        best = score;
        parent = candidate;
      }
    });
    if (parent) parent.children.push(node);
    placed.push(node);
  });
  function shape(node, depth) {
    const value = { label: node.text, kind: kind(node.text, depth) };
    if (node.children.length) value.children = node.children.map(child => shape(child, depth + 1));
    return value;
  }
  const roots = nodes.filter(node => !placed.some(parent => parent.children.includes(node)));
  const left = roots.filter(node => node.cx < center).map(node => shape(node, 1));
  const right = roots.filter(node => node.cx >= center).map(node => shape(node, 1));
  return { left, right };
}

function countGroups(nodes) {
  return nodes.reduce((sum, node) => sum + (node.kind === "group" ? 1 : 0) + countGroups(node.children || []), 0);
}

const pdf = latestPdf();
console.log(`Latest mind map PDF: ${pdf.full}`);
let extracted = textItems(pdf.full);
let items = extracted.items || [];
if (items.length < 4) {
  console.log("The PDF has no text layer. Reading the page with OCR.");
  items = ocrItems(pdf.full);
}
const usable = items.filter(item => /[A-Za-z]{3,}/.test(item.text));
const groups = usable.filter(item => /^tbdp[-_]/i.test(item.text));
const hasRoot = usable.some(item => /security domains/i.test(item.text));
if (groups.length < 5 && !hasRoot) {
  console.error("The PDF did not contain enough readable labels to build the mind map. Mind_Map.json was left unchanged.");
  process.exit(1);
}
const tree = buildTree(usable);
const file = {
  title: "Security Domains",
  sourceUrl: sourceUrl(pdf.full),
  generatedAt: new Date().toISOString(),
  left: tree.left,
  right: tree.right
};
fs.writeFileSync(output, JSON.stringify(file, null, 2));
console.log(`Wrote ${sourceUrl(output)} from ${file.sourceUrl} (${countGroups([...file.left, ...file.right])} groups).`);
