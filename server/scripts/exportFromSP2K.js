// Exports selected tables from SP2K_Fahmi to CSV files in ./exports
// Usage: node scripts/exportFromSP2K.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const SRC = process.env.SP2K_Fahmi;
if (!SRC) {
  console.error('SP2K_Fahmi not set in .env');
  process.exit(1);
}

const client = new Client({
  connectionString: SRC,
  ssl: { rejectUnauthorized: false },
});

function toCSV(rows) {
  if (!rows || rows.length === 0) return '';
  const columns = Object.keys(rows[0]);
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    if (v instanceof Date) return v.toISOString();
    if (typeof v === 'object') return JSON.stringify(v);
    const s = String(v);
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const header = columns.join(',');
  const lines = rows.map(r => columns.map(c => escape(r[c])).join(','));
  return header + '\n' + lines.join('\n');
}

async function fetchRows(table) {
  const candidates = [
    `SELECT * FROM "${table}"`,
    `SELECT * FROM ${table.toLowerCase()}`
  ];
  for (const q of candidates) {
    try {
      const res = await client.query(q);
      if (res.rows && res.rows.length > 0) return res.rows;
      // if empty table, still return empty array (so file created)
      if (res.rows) return res.rows;
    } catch (e) {
      // try next
    }
  }
  return null;
}

async function main() {
  console.log('Connecting to SP2K_Fahmi...');
  await client.connect();

  const tables = ['Commodity','Price','User','FieldReport','AggregationRun'];
  const outDir = path.join(__dirname, '..', 'exports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const t of tables) {
    try {
      console.log(`Fetching ${t}...`);
      const rows = await fetchRows(t);
      if (rows === null) {
        console.log(`Table ${t} not found (skipping).`);
        continue;
      }
      const csv = toCSV(rows);
      const outPath = path.join(outDir, `${t}.csv`);
      fs.writeFileSync(outPath, csv, 'utf8');
      console.log(`Wrote ${outPath} (${rows.length} rows)`);
    } catch (err) {
      console.error(`Failed ${t}:`, err.message || err);
    }
  }

  await client.end();
  console.log('Export completed.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
