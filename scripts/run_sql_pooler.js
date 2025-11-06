const fs = require('fs');
const { Client } = require('pg');

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/run_sql_pooler.js <sql-file>');
    process.exit(1);
  }
  const url = process.env.DB_URL;
  if (!url) {
    console.error('Missing DB_URL env var (pooler URL)');
    process.exit(1);
  }
  const sql = fs.readFileSync(file, 'utf8');
  const client = new (require('pg').Client)({ connectionString: url, ssl: false });
  await client.connect();
  try {
    await client.query(sql);
    console.log('Executed:', file);
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


