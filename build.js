"use strict";

/**
 * Build index.html từ partials/ — chạy: node build.js
 * Trước khi build, script kiểm tra DESIGN RULES:
 *   - mỗi file nguồn tối đa 300 dòng
 *   - mỗi dòng tối đa 100 ký tự
 * Vi phạm sẽ dừng build và báo đúng file/dòng lỗi.
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const MAX_LINES = 300;
const MAX_COLS = 100;

const PARTIALS = [
  "head.html",
  "sprite.html",
  "art.html",
  "header.html",
  "hero.html",
  "fleet.html",
  "routes.html",
  "steps.html",
  "features.html",
  "testimonials.html",
  "driver.html",
  "faq.html",
  "cta.html",
  "footer.html",
];

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

function checkTree(dir) {
  for (const name of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, name);
    if (fs.statSync(fullPath).isDirectory()) {
      checkTree(fullPath);
    } else if (/\.(css|js|html|svg)$/.test(name)) {
      checkSource(path.relative(ROOT, fullPath), fs.readFileSync(fullPath, "utf8"));
    }
  }
}

checkTree(path.join(ROOT, "partials"));
checkTree(path.join(ROOT, "css"));
checkTree(path.join(ROOT, "js"));
checkSource("favicon.svg", fs.readFileSync(path.join(ROOT, "favicon.svg"), "utf8"));
checkSource("build.js", fs.readFileSync(path.join(ROOT, "build.js"), "utf8"));

const body = PARTIALS.map((name) => {
  const file = path.join(ROOT, "partials", name);
  return fs.readFileSync(file, "utf8").trimEnd();
}).join("\n");

const html = "<!DOCTYPE html>\n" + body + "\n";
fs.writeFileSync(path.join(ROOT, "index.html"), html);

console.log(
  "Đã build index.html (" + html.split("\n").length + " dòng) từ " +
    PARTIALS.length + " partials — mọi file nguồn đạt rule."
);
