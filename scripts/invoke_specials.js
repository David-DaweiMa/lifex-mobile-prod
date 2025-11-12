const url = 'https://muuzilttuddlljumoiig.functions.supabase.co/specials-scrape';

const payload = {
  dryRun: true,
  sources: [
    { type: 'html', url: 'https://www.priceme.co.nz/specials', city: 'Auckland', retailer: 'PriceMe' },
    { type: 'html', url: 'https://www.harrisons.co.nz/specials', city: 'Auckland', retailer: 'Harrisons' }
  ]
};

(async () => {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const text = await resp.text();
  console.log(resp.status, text);
  if (!resp.ok) process.exit(1);
})();









