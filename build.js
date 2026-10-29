"use strict";

/**
 * Build mọi màn hình từ manifest <nhóm>/screens/<ten>/screen.json — node build.js
 * Nhóm vai trò: public | khach-hang | tai-xe | admin; dùng chung ở shared/.
 * Partial dùng chung ở shared/components/, riêng nhóm ở <nhóm>/components/,
 * partial riêng màn ở <nhóm>/screens/<ten>/partials/.
 * Trước khi build, script kiểm tra DESIGN RULES:
 *   - mỗi file nguồn tối đa 300 dòng
 *   - mỗi dòng tối đa 100 ký tự
 * File output (sinh ra) và shared/assets/ được miễn check.
 * Vi phạm sẽ dừng build và báo đúng file/dòng lỗi.
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const MAX_LINES = 300;
const MAX_COLS = 100;
const SOURCE_DIRS = ["shared", "khach-hang", "tai-xe", "admin"];
const SCREEN_GROUPS = ["shared", "khach-hang", "tai-xe", "admin"];
const EXEMPT_DIR = "shared/assets";

function checkSource(relPath, text) {
  const lines = text.split("\n");
  if (lines.length > MAX_LINES) {
    throw new Error(
      relPath + ": " + lines.length + " dòng (giới hạn " + MAX_LINES + ")"
    );
  }
  lines.forEach((line, index) => {
    if (line.length > MAX_COLS) {
      throw new Error(
        relPath + ":" + (index + 1) + ": " +
        line.length + " ký tự (giới hạn " + MAX_COLS + ")"
      );
    }
  });
}

function checkTree(dir, outputs) {
  for (const name of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, name);
    const rel = path.relative(ROOT, fullPath);
    if (rel === EXEMPT_DIR || outputs.has(rel)) continue;
    if (fs.statSync(fullPath).isDirectory()) {
      checkTree(fullPath, outputs);
    } else if (/\.(css|js|html|svg)$/.test(name)) {
      checkSource(rel, fs.readFileSync(fullPath, "utf8"));
    }
  }
}

function cssTags(base, list) {
  return (list || [])
    .map((name) => '    <link rel="stylesheet" href="' + base + name + '.css" />')
    .join("\n");
}

function jsTags(base, list) {
  return (list || [])
    .map((name) => '<script src="' + base + name + '.js" defer></script>')
    .join("\n");
}

function loadScreens() {
  const items = [];
  for (const group of SCREEN_GROUPS) {
    const root = path.join(ROOT, group, "screens");
    if (!fs.existsSync(root)) continue;
    for (const name of fs.readdirSync(root)) {
      const dir = path.join(root, name);
      if (!fs.statSync(dir).isDirectory()) continue;
      const manifest = JSON.parse(
        fs.readFileSync(path.join(dir, "screen.json"), "utf8")
      );
      items.push({ dir, manifest });
    }
  }
  return items.sort((a, b) => a.manifest.output.localeCompare(b.manifest.output));
}

function buildScreen(manifest) {
  const base = manifest.base || "";

  const body = manifest.partials
    .map((rel) => fs.readFileSync(path.join(ROOT, rel), "utf8").trimEnd())
    .join("\n");

  const home = (manifest.home || "#").replace(/\{\{base\}\}/g, base);
  const navPrefix = (manifest.navPrefix || "").replace(/\{\{base\}\}/g, base);
  const linkLoginHref = (manifest.linkLoginHref || "")
    .replace(/\{\{base\}\}/g, base)
    .replace(/\{\{home\}\}/g, home);
  const profileHref = (manifest.profileHref || "ho-so.html")
    .replace(/\{\{base\}\}/g, base)
    .replace(/\{\{home\}\}/g, home);

  const html = ("<!DOCTYPE html>\n" + body + "\n")
    .replace(/\{\{title\}\}/g, () => manifest.title || "")
    .replace(/\{\{description\}\}/g, () => manifest.description || "")
    .replace(/\{\{base\}\}/g, () => base)
    .replace(/\{\{home\}\}/g, () => home)
    .replace(/\{\{navPrefix\}\}/g, () => navPrefix)
    .replace(/\{\{linkLoginHref\}\}/g, () => linkLoginHref)
    .replace(/\{\{profileHref\}\}/g, () => profileHref)
    .replace(/\{\{linkLoginLabel\}\}/g, () => manifest.linkLoginLabel || "Đăng nhập")
    .replace(/\{\{css\}\}/g, () => cssTags(base, manifest.css))
    .replace(/\{\{js\}\}/g, () => jsTags(base, manifest.js));

  const outPath = path.join(ROOT, manifest.output);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  return { output: manifest.output, lines: html.split("\n").length };
}

const screens = loadScreens();
const outputs = new Set(screens.map((s) => s.manifest.output));

SOURCE_DIRS.forEach((dir) => checkTree(path.join(ROOT, dir), outputs));
const FAVICON = "shared/assets/favicon.svg";
checkSource(FAVICON, fs.readFileSync(path.join(ROOT, FAVICON), "utf8"));
checkSource("build.js", fs.readFileSync(path.join(ROOT, "build.js"), "utf8"));

const results = screens.map((s) => buildScreen(s.manifest));

console.log("Đã build " + results.length + " màn — mọi file nguồn đạt rule:");
results.forEach((r) => {
  console.log("  - " + r.output + " (" + r.lines + " dòng)");
});