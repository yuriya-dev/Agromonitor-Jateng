import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const STORAGE_DIR = path.resolve(__dirname, '../../storage');

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseDate(value: string): Date {
  const trimmed = value.trim();
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-').map(Number);
    if (parts[0] > 1000) {
      return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    } else {
      return new Date(Date.UTC(parts[2], parts[1] - 1, parts[0]));
    }
  }
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/').map(Number);
    if (parts[2] > 1000) {
      return new Date(Date.UTC(parts[2], parts[1] - 1, parts[0]));
    } else {
      return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    }
  }
  return new Date(trimmed);
}

function mapUnit(unit: string): string {
  const u = (unit || '').toLowerCase().trim();
  if (u === 'kg' || u === 'kilogram') return 'KG';
  if (u === 'lt' || u === 'liter') return 'LITER';
  return unit ? unit.toUpperCase().trim() : 'KG';
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function exportToMainCsv() {
  console.log('Syncing database to storage/data_harga_pangan.csv...');
  const prices = await prisma.price.findMany({
    include: { commodity: true },
    orderBy: { date: 'asc' },
  });

  const csvPath = path.join(STORAGE_DIR, 'data_harga_pangan.csv');
  let csvContent = 'provinsi,kabupaten_kota,komoditas,unit,tanggal_awal,harga_tanggal_awal\n';

  for (const p of prices) {
    const dateStr = p.date.toISOString().split('T')[0];
    const row = [
      'Jawa Tengah',
      p.market,
      p.commodity.name,
      p.commodity.unit,
      dateStr,
      p.price,
    ];
    csvContent += row.map((val) => {
      const s = String(val);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    }).join(',') + '\n';
  }

  fs.writeFileSync(csvPath, csvContent, 'utf8');
  console.log(`Successfully synced ${prices.length} rows to ${csvPath}`);
}

async function main() {
  console.log('Starting CSV import into database...');
  console.log(`Target Storage Directory: ${STORAGE_DIR}`);
  
  if (!fs.existsSync(STORAGE_DIR)) {
    console.error(`Storage directory not found at: ${STORAGE_DIR}`);
    process.exit(1);
  }

  const targetFileArg = process.argv[2];
  let csvFiles: string[] = [];

  if (targetFileArg) {
    const filename = path.basename(targetFileArg);
    if (fs.existsSync(path.join(STORAGE_DIR, filename))) {
      csvFiles = [filename];
    } else {
      console.error(`Specified file ${filename} not found in ${STORAGE_DIR}`);
      process.exit(1);
    }
  } else {
    if (fs.existsSync(path.join(STORAGE_DIR, 'data_harga_pangan_new.csv'))) {
      csvFiles = ['data_harga_pangan_new.csv'];
    } else {
      csvFiles = fs.readdirSync(STORAGE_DIR).filter((file) => file.endsWith('.csv') && file !== 'data_harga_pangan.csv');
    }
  }

  console.log(`CSV files to process: ${csvFiles.join(', ')}`);

  // 1. Scan commodities
  const commodityMap = new Map<string, { slug: string; name: string; unit: string }>();

  for (const file of csvFiles) {
    const filePath = path.join(STORAGE_DIR, file);
    console.log(`Scanning commodities from: ${file}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    if (lines.length <= 1) continue;

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
    const idxKomoditas = headers.findIndex((h) => h === 'komoditas');
    const idxUnit = headers.findIndex((h) => h === 'unit');

    if (idxKomoditas === -1) {
      console.warn(`File ${file} is missing 'komoditas' column.`);
      continue;
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = parseCsvLine(line);
      if (parts.length <= idxKomoditas) continue;
      
      const komoditas = parts[idxKomoditas];
      const unit = idxUnit !== -1 ? parts[idxUnit] : 'kg';
      if (!komoditas) continue;

      const slug = slugify(komoditas);
      
      if (!commodityMap.has(slug)) {
        commodityMap.set(slug, {
          slug,
          name: komoditas,
          unit: mapUnit(unit)
        });
      }
    }
  }

  console.log(`Found ${commodityMap.size} unique commodities. Upserting into database...`);
  const dbCommodities: Record<string, string> = {}; // slug -> id
  
  for (const c of commodityMap.values()) {
    const record = await prisma.commodity.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        name: c.name,
        unit: c.unit,
        description: `Harga rata-rata ${c.name} tingkat konsumen di Jawa Tengah`
      },
      update: {
        name: c.name,
        unit: c.unit
      }
    });
    dbCommodities[c.slug] = record.id;
  }
  console.log('Commodities upserted successfully.');

  // 2. Clear existing prices before importing new dataset
  console.log('Clearing existing Price records in database...');
  await prisma.price.deleteMany({});
  console.log('Existing Price records cleared.');

  // 3. Import price data in batches
  for (const file of csvFiles) {
    const filePath = path.join(STORAGE_DIR, file);
    console.log(`Importing price data from: ${file}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    if (lines.length <= 1) continue;

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
    const idxTanggal = headers.findIndex((h) => h === 'tanggal' || h === 'tanggal_awal');
    const idxHarga = headers.findIndex((h) => h === 'harga' || h === 'harga_tanggal_awal');
    const idxKomoditas = headers.findIndex((h) => h === 'komoditas');
    const idxKabupaten = headers.findIndex((h) => h === 'kabupaten_kota' || h === 'kabupatenkota');

    if (idxTanggal === -1 || idxHarga === -1 || idxKomoditas === -1) {
      console.error(`Required columns missing in ${file}`);
      continue;
    }

    let priceRecords: Array<{
      commodityId: string;
      price: number;
      date: Date;
      market: string;
      status: string;
      source: string;
    }> = [];

    const batchSize = 10000;
    let totalInserted = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = parseCsvLine(line);
      if (parts.length <= Math.max(idxTanggal, idxHarga, idxKomoditas)) continue;
      
      const tanggalVal = parts[idxTanggal];
      const hargaVal = parts[idxHarga];
      const komoditas = parts[idxKomoditas];
      const kabupatenKota = idxKabupaten !== -1 ? parts[idxKabupaten] : 'Jawa Tengah';

      const priceVal = parseFloat(hargaVal);
      if (isNaN(priceVal) || priceVal <= 0) continue;
      
      const slug = slugify(komoditas);
      const commodityId = dbCommodities[slug];
      if (!commodityId) continue;
      
      priceRecords.push({
        commodityId,
        price: priceVal,
        date: parseDate(tanggalVal),
        market: kabupatenKota || 'Jawa Tengah',
        status: 'VALID',
        source: 'SP2K'
      });

      if (priceRecords.length >= batchSize) {
        await prisma.price.createMany({
          data: priceRecords,
        });
        totalInserted += priceRecords.length;
        console.log(`  - Inserted ${totalInserted} rows so far...`);
        priceRecords = [];
      }
    }

    if (priceRecords.length > 0) {
      await prisma.price.createMany({
        data: priceRecords,
      });
      totalInserted += priceRecords.length;
      console.log(`  - Inserted final batch. Total inserted for ${file}: ${totalInserted} rows.`);
    }
  }

  console.log('CSV Import completed successfully!');

  // Sync back to main data_harga_pangan.csv
  await exportToMainCsv();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
