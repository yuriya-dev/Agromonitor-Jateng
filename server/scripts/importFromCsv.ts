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
  const [day, month, year] = value.split('/').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function mapUnit(unit: string): string {
  const u = unit.toLowerCase();
  if (u === 'kg') return 'KG';
  if (u === 'lt' || u === 'liter') return 'LITER';
  return unit.toUpperCase();
}

function parseCsvLine(line: string): string[] {
  // Simple csv parser that handles quotes if present, but since our files are simple comma-separated, it split-trims.
  return line.split(',').map((entry) => entry.trim());
}

async function main() {
  console.log('Starting CSV import into database...');
  console.log(`Target Storage Directory: ${STORAGE_DIR}`);
  
  if (!fs.existsSync(STORAGE_DIR)) {
    console.error(`Storage directory not found at: ${STORAGE_DIR}`);
    process.exit(1);
  }

  const csvFiles = fs.readdirSync(STORAGE_DIR).filter((file) => file.endsWith('.csv'));
  console.log(`Found ${csvFiles.length} CSV files to process.`);

  // 1. First pass: scan all commodities to upsert them
  const commodityMap = new Map<string, { slug: string; name: string; unit: string }>();

  for (const file of csvFiles) {
    const filePath = path.join(STORAGE_DIR, file);
    console.log(`Scanning commodities from: ${file}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = parseCsvLine(line);
      if (parts.length < 6) continue;
      
      const [_, __, komoditas, unit] = parts;
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

  // 2. Second pass: insert price data in batches
  for (const file of csvFiles) {
    const filePath = path.join(STORAGE_DIR, file);
    console.log(`Importing price data from: ${file}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const priceRecords = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = parseCsvLine(line);
      if (parts.length < 6) continue;
      
      const [provinsi, kabupaten_kota, komoditas, unit, tanggal_awal, harga_tanggal_awal] = parts;
      const priceVal = parseFloat(harga_tanggal_awal);
      
      if (isNaN(priceVal) || priceVal <= 0) continue; // skip zero/invalid prices
      
      const slug = slugify(komoditas);
      const commodityId = dbCommodities[slug];
      
      if (!commodityId) {
        console.warn(`Warning: Commodity ID not found for slug ${slug}, skipping row.`);
        continue;
      }
      
      priceRecords.push({
        commodityId,
        price: priceVal,
        date: parseDate(tanggal_awal),
        market: kabupaten_kota,
        status: 'VALID',
        source: 'SP2K'
      });
    }

    console.log(`Prepared ${priceRecords.length} price records for ${file}. Inserting in batches...`);
    
    const batchSize = 5000;
    for (let j = 0; j < priceRecords.length; j += batchSize) {
      const batch = priceRecords.slice(j, j + batchSize);
      await prisma.price.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`  - Inserted batch ${j / batchSize + 1} (${batch.length} rows)`);
    }
  }

  console.log('CSV Import completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
