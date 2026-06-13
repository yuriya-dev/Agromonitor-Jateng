import { PrismaClient } from '@prisma/client';
import { Client } from 'pg';
import 'dotenv/config';

const prisma = new PrismaClient();
const source = new Client({
  connectionString: process.env.SP2K_Fahmi,
  ssl: { rejectUnauthorized: false },
});

function normalizeJson(value: unknown) {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

async function fetchRows(table: string) {
  const candidates = [`select * from "${table}"`, `select * from ${table.toLowerCase()}`];
  for (const query of candidates) {
    try {
      const result = await source.query(query);
      return result.rows;
    } catch {
      continue;
    }
  }
  return [] as any[];
}

async function importCommodities() {
  const rows = await fetchRows('Commodity');
  if (!rows.length) {
    console.log('No Commodity table found in source or table is empty.');
    return;
  }

  for (const row of rows) {
    await prisma.commodity.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        slug: row.slug,
        name: row.name,
        unit: row.unit,
        description: row.description ?? null,
        createdAt: row.createdAt ?? row.created_at ?? new Date(),
        updatedAt: row.updatedAt ?? row.updated_at ?? new Date(),
      },
      update: {
        slug: row.slug,
        name: row.name,
        unit: row.unit,
        description: row.description ?? null,
        updatedAt: row.updatedAt ?? row.updated_at ?? new Date(),
      },
    });
  }

  console.log(`Imported ${rows.length} commodities`);
}

async function importPrices() {
  const rows = await fetchRows('Price');
  if (!rows.length) {
    console.log('No Price table found in source or table is empty.');
    return;
  }

  const data = rows.map((row) => ({
    id: row.id,
    commodityId: row.commodityId ?? row.commodity_id,
    price: row.price,
    date: row.date ?? row.report_date,
    market: row.market,
    status: row.status,
    source: row.source,
    createdAt: row.createdAt ?? row.created_at ?? new Date(),
  }));

  await prisma.price.createMany({ data, skipDuplicates: true });
  console.log(`Imported ${data.length} price records`);
}

async function importUsers() {
  const rows = await fetchRows('User');
  if (!rows.length) {
    console.log('No User table found in source or table is empty.');
    return;
  }

  for (const row of rows) {
    await prisma.user.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        email: row.email,
        name: row.name ?? null,
        password: row.password,
        role: row.role,
        status: row.status,
        lastLogin: row.lastLogin ?? row.last_login ?? null,
        createdAt: row.createdAt ?? row.created_at ?? new Date(),
        updatedAt: row.updatedAt ?? row.updated_at ?? new Date(),
      },
      update: {
        email: row.email,
        name: row.name ?? null,
        password: row.password,
        role: row.role,
        status: row.status,
        lastLogin: row.lastLogin ?? row.last_login ?? null,
        updatedAt: row.updatedAt ?? row.updated_at ?? new Date(),
      },
    });
  }

  console.log(`Imported ${rows.length} users`);
}

async function importFieldReports() {
  const rows = await fetchRows('FieldReport');
  if (!rows.length) {
    console.log('No FieldReport table found in source or table is empty.');
    return;
  }

  for (const row of rows) {
    await prisma.fieldReport.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        reporterId: row.reporterId ?? row.reporter_id ?? null,
        petugasCode: row.petugasCode ?? row.petugas_code,
        petugasName: row.petugasName ?? row.petugas_name,
        petugasEmail: row.petugasEmail ?? row.petugas_email ?? null,
        commoditySlug: row.commoditySlug ?? row.commodity_slug,
        commodityName: row.commodityName ?? row.commodity_name,
        market: row.market,
        price: row.price,
        reportDate: row.reportDate ?? row.report_date,
        latitude: row.latitude,
        longitude: row.longitude,
        accuracy: row.accuracy ?? null,
        locationLabel: row.locationLabel ?? row.location_label,
        notes: row.notes ?? null,
        photoUrl: row.photoUrl ?? row.photo_url ?? null,
        status: row.status,
        reviewedById: row.reviewedById ?? row.reviewed_by_id ?? null,
        reviewedAt: row.reviewedAt ?? row.reviewed_at ?? null,
        createdAt: row.createdAt ?? row.created_at ?? new Date(),
        updatedAt: row.updatedAt ?? row.updated_at ?? new Date(),
      },
      update: {
        reporterId: row.reporterId ?? row.reporter_id ?? null,
        petugasCode: row.petugasCode ?? row.petugas_code,
        petugasName: row.petugasName ?? row.petugas_name,
        petugasEmail: row.petugasEmail ?? row.petugas_email ?? null,
        commoditySlug: row.commoditySlug ?? row.commodity_slug,
        commodityName: row.commodityName ?? row.commodity_name,
        market: row.market,
        price: row.price,
        reportDate: row.reportDate ?? row.report_date,
        latitude: row.latitude,
        longitude: row.longitude,
        accuracy: row.accuracy ?? null,
        locationLabel: row.locationLabel ?? row.location_label,
        notes: row.notes ?? null,
        photoUrl: row.photoUrl ?? row.photo_url ?? null,
        status: row.status,
        reviewedById: row.reviewedById ?? row.reviewed_by_id ?? null,
        reviewedAt: row.reviewedAt ?? row.reviewed_at ?? null,
        updatedAt: row.updatedAt ?? row.updated_at ?? new Date(),
      },
    });
  }

  console.log(`Imported ${rows.length} field reports`);
}

async function importAggregationRuns() {
  const rows = await fetchRows('AggregationRun');
  if (!rows.length) {
    console.log('No AggregationRun table found in source or table is empty.');
    return;
  }

  for (const row of rows) {
    await prisma.aggregationRun.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        runAt: row.runAt ?? row.run_at,
        scanned: row.scanned,
        groups: row.groups,
        created: row.created,
        skipped: row.skipped,
        details: normalizeJson(row.details),
        createdAt: row.createdAt ?? row.created_at ?? new Date(),
      },
      update: {
        runAt: row.runAt ?? row.run_at,
        scanned: row.scanned,
        groups: row.groups,
        created: row.created,
        skipped: row.skipped,
        details: normalizeJson(row.details),
      },
    });
  }

  console.log(`Imported ${rows.length} aggregation runs`);
}

async function main() {
  console.log('Connecting to SP2K_Fahmi source database...');
  await source.connect();

  try {
    await importCommodities();
    await importPrices();
    await importUsers();
    await importFieldReports();
    await importAggregationRuns();

    console.log('Data migration from SP2K_Fahmi completed.');
  } finally {
    await source.end();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
