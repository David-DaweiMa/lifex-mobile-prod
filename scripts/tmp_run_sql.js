const fs = require('fs');
const { Client } = require('pg');

(async () => {
  const sql = fs.readFileSync('supabase/migrations/20251106_specials_scrape_cache.sql', 'utf8');
  const client = new Client({ connectionString: process.env.DB_URL, ssl: false });
  await client.connect();
  try {
    await client.query(sql);
    console.log('SQL executed.');
  } finally {
    await client.end();
  }
})().catch(err => { console.error(err); process.exit(1); });


