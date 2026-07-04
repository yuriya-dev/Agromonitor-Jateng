import { Client } from 'pg';
import { PrismaClient } from '@prisma/client';
import { syncDbToCsv } from './storageData';

const prisma = new PrismaClient();

export async function syncKemendagData() {
  // Use the connection URL for the external database from the env
  const connectionString = process.env.SP2KP_KEMENDAG_URL || 'postgresql://postgres.jgzkecfbrsfpfqzdtrky:sp2kp_kemendag@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  console.log('[KEMENDAG SYNC] Connecting to Kemendag database...');
  await client.connect();

  try {
    console.log('[KEMENDAG SYNC] Running query on Kemendag database...');
    const query = `
      SELECT
          f.tanggal,
          f.harga,
          k.komoditas,
          k.unit,
          w.provinsi,
          w.kabupaten_kota
      FROM
          fact_harga_harian f
      LEFT JOIN
          dim_komoditas k ON f.komoditas_key = k.komoditas_key
      LEFT JOIN
          dim_wilayah w ON f.wilayah_key = w.wilayah_key
      WHERE
          w.provinsi = 'Jawa Tengah' OR w.provinsi = 'JAWA TENGAH'
      ORDER BY
          f.tanggal DESC
      LIMIT 10000
    `;
    
    const result = await client.query(query);
    console.log(`[KEMENDAG SYNC] Query completed. Found ${result.rows.length} rows for Jawa Tengah.`);

    // Fetch all unique dates from other sources (CSV, Field Reports, etc.)
    const nonKemendagPrices = await prisma.price.findMany({
      where: {
        source: {
          not: 'Kemendag'
        }
      },
      select: {
        date: true
      },
      distinct: ['date']
    });

    const csvDatesSet = new Set(
      nonKemendagPrices.map(p => p.date.toISOString().split('T')[0])
    );

    console.log(`[KEMENDAG SYNC] Found ${csvDatesSet.size} dates already covered by primary CSV/reports data. These will be skipped.`);

    let inserted = 0;
    let skipped = 0;

    for (const row of result.rows) {
      const { tanggal, harga, komoditas, unit, kabupaten_kota } = row;
      if (!tanggal || !harga || !komoditas) continue;

      // 1. Format date (start of day, UTC) to prevent timezone mismatches
      const parsedDate = new Date(tanggal);
      const date = new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()));
      const dateStr = date.toISOString().split('T')[0];

      // Skip this row if the date is already covered by CSV / other primary data
      if (csvDatesSet.has(dateStr)) {
        skipped++;
        continue;
      }

      // Clean commodity name to form slug
      const slug = komoditas.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      // 2. Find or create commodity
      let commodity = await prisma.commodity.findUnique({
        where: { slug }
      });

      if (!commodity) {
        commodity = await prisma.commodity.create({
          data: {
            slug,
            name: komoditas,
            unit: unit || 'kg',
            description: 'Imported from Kemendag SP2KP'
          }
        });
      }

      const market = kabupaten_kota || 'Rata-rata Jawa Tengah';

      // 3. Check if price already exists for this commodity, date and market (e.g. from a prior Kemendag sync)
      const existing = await prisma.price.findFirst({
        where: {
          commodityId: commodity.id,
          date,
          market
        }
      });

      if (existing) {
        skipped++;
        continue;
      }

      // 4. Create new Price record
      await prisma.price.create({
        data: {
          commodityId: commodity.id,
          price: Number(harga),
          date,
          market,
          status: 'VALID',
          source: 'Kemendag'
        }
      });
      inserted++;
    }

    console.log(`[KEMENDAG SYNC] Completed. Created: ${inserted}, Skipped: ${skipped}`);
    
    if (inserted > 0) {
      // Sync DB with local CSV so the charts instantly show the new data
      await syncDbToCsv();
    }

    return { success: true, inserted, skipped };
  } catch (error: any) {
    console.error('[KEMENDAG SYNC] Sync failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}
