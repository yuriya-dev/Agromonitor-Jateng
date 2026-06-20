import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const STORAGE_DIR = path.resolve(__dirname, '../../storage');

async function main() {
  console.log('Fetching prices and commodities from database...');
  const prices = await prisma.price.findMany({
    include: {
      commodity: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  console.log(`Fetched ${prices.length} price records.`);

  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }

  const csvPath = path.join(STORAGE_DIR, 'data_harga_pangan.csv');

  // Header matching the expectations of storageData.ts and ML service
  let csvContent = 'provinsi,kabupaten_kota,komoditas,unit,tanggal_awal,harga_tanggal_awal\n';

  for (const p of prices) {
    // Format date as YYYY-MM-DD
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
  console.log(`Successfully wrote ${prices.length} rows to ${csvPath}`);
}

main()
  .catch((error) => {
    console.error('Export failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
