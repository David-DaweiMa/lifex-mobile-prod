/* eslint-disable no-console */
// Generate first-batch scraping CSVs split by owner (edge/gha), sorted by priority P1->P2->P3.
// Reads: data/feeds_checklist.csv
// Writes: data/first_batch_edge.csv, data/first_batch_gha.csv
//
// CSV schema in feeds_checklist.csv:
//   category,name,city_scope,type,url,frequency,owner,status,notes
// - Lines starting with '#' are comments and ignored
// - Priority is encoded in notes like "priority=P1"
//
// Output schema:
//   category,name,city_scope,type,url,frequency,owner,priority,status,notes

const fs = require('fs');
const path = require('path');

const SRC = path.join('data', 'feeds_checklist.csv');
const OUT_EDGE = path.join('data', 'first_batch_edge.csv');
const OUT_GHA = path.join('data', 'first_batch_gha.csv');

function readCsvLines(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return text.split(/\r?\n/);
}

function parseLine(line) {
  // naive split by comma, as our data doesn't contain quoted commas
  const cols = line.split(',').map((s) => s.trim());
  if (cols.length < 5) return null;
  const [category, name, city_scope, type, url, frequency, owner, status, notes] = [
    cols[0],
    cols[1],
    cols[2] || '',
    cols[3] || '',
    cols[4] || '',
    cols[5] || '',
    cols[6] || '',
    cols[7] || '',
    cols.slice(8).join(',') || '', // notes may contain commas in future
  ];
  return { category, name, city_scope, type, url, frequency, owner, status, notes };
}

function extractPriority(notes) {
  if (!notes) return 'P2';
  const m = notes.match(/priority\s*=\s*(P[123])/i);
  if (m) return m[1].toUpperCase();
  return 'P2';
}

function sortByPriorityThenName(a, b) {
  const rank = { P1: 0, P2: 1, P3: 2 };
  const pa = rank[a.priority] ?? 1;
  const pb = rank[b.priority] ?? 1;
  if (pa !== pb) return pa - pb;
  return a.name.localeCompare(b.name);
}

function writeCsv(filePath, rows) {
  const header = 'category,name,city_scope,type,url,frequency,owner,priority,status,notes';
  const lines = [header].concat(
    rows.map((r) =>
      [
        r.category,
        r.name,
        r.city_scope,
        r.type,
        r.url,
        r.frequency,
        r.owner,
        r.priority,
        r.status || '',
        r.notes || '',
      ].join(',')
    )
  );
  fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf8');
}

function main() {
  const lines = readCsvLines(SRC);
  const items = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const row = parseLine(trimmed);
    if (!row) continue;
    const priority = extractPriority(row.notes);
    items.push({ ...row, priority });
  }
  const edge = items.filter((r) => r.owner === 'edge').sort(sortByPriorityThenName);
  const gha = items.filter((r) => r.owner === 'gha').sort(sortByPriorityThenName);

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  writeCsv(OUT_EDGE, edge);
  writeCsv(OUT_GHA, gha);
  console.log(
    `Generated ${edge.length} edge items -> ${OUT_EDGE}\n` +
      `Generated ${gha.length} gha items -> ${OUT_GHA}`
  );
}

if (require.main === module) {
  main();
}


