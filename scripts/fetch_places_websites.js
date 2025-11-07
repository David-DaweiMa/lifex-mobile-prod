// Fetches Google Places websiteUri for given brand queries and exports CSV.
// Usage:
//   GOOGLE_MAPS_API_KEY=xxx node scripts/fetch_places_websites.js \
//     --brands "Woolworths|Countdown,New World,PAK'nSAVE,PB Tech,Noel Leeming,The Warehouse,Farmers,Chemist Warehouse,Z,BP,Mobil,Gull" \
//     --perBrandLimit 25 \
//     --out data/places_websites.csv
//
// Notes:
// - Requires Google Places API v1 enabled and a valid API key in env GOOGLE_MAPS_API_KEY
// - Uses Places:searchText then per-place details to retrieve websiteUri
// - Filters to New Zealand via regionCode and returns only entries with websiteUri

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

function parseBrands(brandsArg) {
  if (!brandsArg) return [];
  // Accept comma-separated, and within tokens allow pipe-separated aliases.
  // Example: "Woolworths|Countdown,New World,PAK'nSAVE"
  return brandsArg
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${body}`);
  }
  return res.json();
}

async function searchPlaces({ apiKey, textQuery, maxResultCount = 20 }) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  const body = {
    textQuery,
    maxResultCount,
    regionCode: 'NZ',
    // locationBias could be added later if needed
  };
  return fetchJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
    },
    body: JSON.stringify(body),
  });
}

async function fetchPlaceDetails({ apiKey, placeId }) {
  const fields = [
    'id',
    'displayName',
    'websiteUri',
    'googleMapsUri',
    'formattedAddress',
    'types',
  ].join(',');
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(
    placeId
  )}?fields=${encodeURIComponent(fields)}`;
  return fetchJson(url, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': apiKey,
    },
  });
}

function normalizeBrandToken(token) {
  // A token may contain pipe-separated aliases, pick the first as brand label.
  // e.g., "Woolworths|Countdown" -> "Woolworths"
  const parts = token.split('|').map((s) => s.trim()).filter(Boolean);
  return {
    label: parts[0] || token,
    query: token, // keep aliases in the search query to catch variations
  };
}

function csvEscape(value) {
  if (value == null) return '';
  const str = String(value);
  if (/[,"\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function main() {
  const args = parseArgs(process.argv);
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Missing env GOOGLE_MAPS_API_KEY');
    process.exit(1);
  }

  const outPath = args.out || path.join('data', 'places_websites.csv');
  const perBrandLimit = Number(args.perBrandLimit || 25);

  let brandTokens = parseBrands(args.brands);
  if (brandTokens.length === 0) {
    // Default NZ brands selection
    brandTokens = [
      "Woolworths|Countdown",
      "New World",
      "PAK'nSAVE",
      "PB Tech",
      "Noel Leeming",
      "The Warehouse",
      "Farmers",
      "Chemist Warehouse",
      "Unichem",
      "Life Pharmacy",
      "Z Energy|Z",
      "BP",
      "Mobil",
      "Gull",
      "Mitre 10",
      "Bunnings",
      "Liquorland",
      "Super Liquor",
      "Kmart",
      "Jaycar",
      "Supercheap Auto",
      "Briscoes",
      "Warehouse Stationery",
      "Rebel Sport",
      "Smiths City",
      "Mighty Ape",
    ];
  }

  // Ensure directory
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Write header if file doesn't exist
  if (!fs.existsSync(outPath)) {
    fs.writeFileSync(outPath, 'brand,name,place_id,websiteUri,googleMapsUri,formattedAddress\n', 'utf8');
  }

  const seenPlaceIds = new Set();
  // Load existing file to avoid duplicates if re-running
  try {
    const existing = fs.readFileSync(outPath, 'utf8').split('\n').slice(1);
    for (const line of existing) {
      const cols = line.split(',');
      if (cols.length >= 3) {
        const placeId = cols[2]?.trim();
        if (placeId) seenPlaceIds.add(placeId);
      }
    }
  } catch {}

  const rows = [];
  for (const token of brandTokens) {
    const { label, query } = normalizeBrandToken(token);
    console.log(`Searching brand: ${label} (query: "${query}")`);
    try {
      const search = await searchPlaces({
        apiKey,
        textQuery: `${query} New Zealand`,
        maxResultCount: perBrandLimit,
      });
      const places = search.places || [];
      console.log(` - Found ${places.length} candidates`);

      for (const p of places) {
        const placeId = p.id;
        if (!placeId) continue;
        if (seenPlaceIds.has(placeId)) continue;
        await delay(120); // gentle pacing
        try {
          const details = await fetchPlaceDetails({ apiKey, placeId });
          if (details.websiteUri) {
            seenPlaceIds.add(placeId);
            const row = [
              csvEscape(label),
              csvEscape(details.displayName?.text || ''),
              csvEscape(details.id || ''),
              csvEscape(details.websiteUri || ''),
              csvEscape(details.googleMapsUri || ''),
              csvEscape(details.formattedAddress || ''),
            ].join(',');
            rows.push(row);
            console.log(`   + ${details.displayName?.text || placeId} -> ${details.websiteUri}`);
          }
        } catch (e) {
          console.warn(`   ! details error for ${placeId}: ${e.message}`);
        }
      }
    } catch (e) {
      console.warn(` ! search error for brand "${label}": ${e.message}`);
    }
  }

  if (rows.length > 0) {
    fs.appendFileSync(outPath, rows.join('\n') + '\n', 'utf8');
  }

  console.log(`Done. Appended ${rows.length} rows to ${outPath}`);
}

if (require.main === module) {
  // Node 20 has global fetch; if not present, advise to use Node >=18.
  if (typeof fetch !== 'function') {
    console.error('Global fetch not found. Use Node.js v18+.');
    process.exit(1);
  }
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}


