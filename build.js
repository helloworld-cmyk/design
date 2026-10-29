"use strict";

/**
 * Build mọi màn hình từ manifest screens/<ten>/screen.json — chạy: node build.js
 * Partial dùng chung nằm ở components/, partial riêng màn ở screens/<ten>/partials/.
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
const SOURCE_DIRS = ["components", "screens", "css", "js"];

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

function cssTags(list) {
  return (list || [])
    .map((name) => '    <link rel="stylesheet" href="css/' + name + '.css" />')
    .join("\n");
}

function jsTags(list) {
  return (list || [])
    .map((name) => '<script src="js/' + name + '.js" defer></script>')
    .join("\n");
}

function buildScreen(name) {
  const dir = path.join(ROOT, "screens", name);
  const manifest = JSON.parse(
    fs.readFileSync(path.join(dir, "screen.json"), "utf8")
  );

  const body = manifest.partials
    .map((rel) => fs.readFileSync(path.join(ROOT, rel), "utf8").trimEnd())
    .join("\n");

  const html = ("<!DOCTYPE html>\n" + body + "\n")
    .replace(/\{\{title\}\}/g, () => manifest.title || "")
    .replace(/\{\{description\}\}/g, () => manifest.description || "")
    .replace(/\{\{css\}\}/g, () => cssTags(manifest.css))
    .replace(/\{\{js\}\}/g, () => jsTags(manifest.js));

  fs.writeFileSync(path.join(ROOT, manifest.output), html);
  return { output: manifest.output, lines: html.split("\n").length };
}

SOURCE_DIRS.forEach((dir) => checkTree(path.join(ROOT, dir)));
checkSource("assets/favicon.svg", fs.readFileSync(path.join(ROOT, "assets/favicon.svg"), "utf8"));
checkSource("build.js", fs.readFileSync(path.join(ROOT, "build.js"), "utf8"));

const screenNames = fs
  .readdirSync(path.join(ROOT, "screens"))
  .filter((name) => fs.statSync(path.join(ROOT, "screens", name)).isDirectory());

const results = screenNames.map(buildScreen);

console.log("Đã build " + results.length + " màn — mọi file nguồn đạt rule:");
results.forEach((r) => {
  console.log("  - " + r.output + " (" + r.lines + " dòng)");
});
