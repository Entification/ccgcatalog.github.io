// scripts/spa-404.cjs (CommonJS)
// Copies dist/index.html to dist/404.html so GitHub Pages serves your SPA on deep links.
const fs = require("fs");
const path = require("path");

const src = path.resolve("dist/index.html");
const dst = path.resolve("dist/404.html");

if (!fs.existsSync(src)) {
  console.error(
    'Error: dist/index.html not found. Did you run "npm run build" first?',
  );
  process.exit(1);
}

fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.copyFileSync(src, dst);
console.log("Copied", src, "→", dst);
