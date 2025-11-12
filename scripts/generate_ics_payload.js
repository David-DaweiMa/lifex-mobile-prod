/* eslint-disable no-console */
// Reads data/feeds_checklist.csv and prints JSON array of ICS feed URLs (owner=edge).
// Usage:
//   node scripts/generate_ics_payload.js > tmp/ics_feeds.json
// Options:
//   --max N   Limit number of URLs
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const n = argv[i + 1];
      if (!n || n.startsWith('--')) {
        args[k] = true;
      } else {
        args[k] = n;
        i++;
      }
    }
  }
  return args;
}

function readCsv(fp) {
  const text = fs.readFileSync(fp, 'utf8');
  return text.split(/\r?\n/);
}

function parseRow(line) {
  const cols = line.split(',').map(s => s.trim());
  if (cols.length < 5) return null;
  const [category, name, city_scope, type, url, frequency, owner, status, notes] = [
    cols[0], cols[1], cols[2] || '', cols[3] || '', cols[4] || '',
    cols[5] || '', cols[6] || '', cols[7] || '', cols.slice(8).join(',') || ''
  ];
  return { category, name, city_scope, type, url, frequency, owner, status, notes };
}

function main() {
  const args = parseArgs(process.argv);
  const max = args.max ? Number(args.max) : Infinity;
  const src = path.join('data', 'feeds_checklist.csv');
  const lines = readCsv(src);
  const urls = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const r = parseRow(line);
    if (!r) continue;
    if (r.category !== 'Events') continue;
    if (r.type.toUpperCase() !== 'ICS') continue;
    if (!r.url) continue;
    if (r.owner && r.owner !== 'edge') continue;
    urls.push(r.url);
    if (urls.length >= max) break;
  }
  process.stdout.write(JSON.stringify(urls, null, 2));
}

if (require.main === module) main();





