Migration & Deployment Quick Guide

This file outlines the minimal steps to apply Prisma migrations and deploy the server with the new AggregationRun model and aggregation features.

1) Update schema & create migration (development)

   cd server
   npx prisma migrate dev --name add-aggregation-run

   - This will create a new migration and attempt to apply it to the database used by `DATABASE_URL`.
   - If the database has drift or requires reset, Prisma may prompt to reset. Take caution in production.

2) Generate Prisma client

   npx prisma generate

3) Build server

   npm run build

4) Run server (dev)

   npx ts-node src/index.ts

5) Production considerations

   - Use `prisma migrate deploy` in CI/CD to apply migrations non-interactively.
   - Ensure backups are taken before applying migrations to production databases.
   - Start the server via process manager (pm2/systemd/docker) so the scheduled aggregation runs reliably.

6) Backfill & Manual Aggregation

   - Backfill script: `npx ts-node scripts/backfillApprovedReports.ts` (one-time)
   - Manual aggregation endpoint (Admin): POST `/api/admin/field-reports/aggregate`
   - Aggregation history GET (Admin): GET `/api/admin/aggregations`

7) Audit

   - Aggregation runs are persisted in the `AggregationRun` table (fields: scanned, groups, created, skipped, details).
