/**
 * Fail fast before start:prod if Nest build output is missing.
 * Common on ECS when only pulling code without running `npm run build`.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const required = ['dist/main.js', 'dist/app.module.js'];

const seen = new Set();
let ok = true;
for (const rel of required) {
  if (seen.has(rel)) continue;
  seen.add(rel);
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    console.error(`[teacher-api] Missing ${rel}. Run: cd backend/teacher-api && npm ci && npm run build`);
    ok = false;
  }
}
if (!ok) process.exit(1);
