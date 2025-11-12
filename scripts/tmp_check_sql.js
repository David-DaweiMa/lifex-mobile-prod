const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DB_URL, ssl: false });
  await client.connect();
  try {
    const r = await client.query("select to_regclass('catalog.special_scrape_cache') as tbl, exists(select 1 from pg_proc where proname='admin_upsert_special_scrape_cache_batch') as rpc;");
    console.log(r.rows[0]);
  } finally {
    await client.end();
  }
})().catch(err => { console.error(err); process.exit(1); });


