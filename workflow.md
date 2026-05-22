
**System Workflow & User Flows**

This document summarizes the expected workflows for each user role in the Agromonitor-Jateng system, the APIs and database side-effects involved, scheduled jobs, and operational runbook items for deploy and maintenance.

**Overview**
- **Purpose:** Provide a single reference describing what each user does in the system, how data moves between client/server/db, and how automated processes (aggregation, backfill) operate.
- **Actors:** `Admin`, `Editor`, `Petugas` (field officer), `Viewer`.

**Petugas (Field Officer)**
- **Action:** Submit field report (price observation) using mobile UI.
- **UI steps:** Open `Portal Petugas` → capture GPS (browser `navigator.geolocation`) → choose commodity + market → enter price, notes → attach photo (camera or gallery) → submit.
- **API calls:** `POST /api/field-reports` with payload { petugasCode, petugasName, petugasEmail, commoditySlug, commodityName, market, price, reportDate, latitude, longitude, accuracy, locationLabel, notes, photoUrl }.
- **DB effects:** creates `FieldReport` row with status `SUBMITTED` and timestamps.
- **Next steps:** Report appears in Admin list for review. No immediate change to `Price` table until Admin approves or aggregation runs.

**Admin**
- **Action:** Review, verify, and approve/reject field reports; manage users and run aggregations/backfill.
- **UI steps:** Open Admin → `Field Reports` list → filter/search → click report → mark `REVIEWED` / `APPROVED` / `REJECTED` → (optional) add review notes.
- **API calls:**
	- GET `/api/admin/field-reports` — list and filter
	- PUT `/api/admin/field-reports/:id` — update status (body: `{ status: 'APPROVED'|'REJECTED'|'REVIEWED', reviewedById }`)
	- POST `/api/admin/field-reports/aggregate` — trigger aggregation run (manual)
- **DB effects on Approve:** status set to `APPROVED`; controller logic will:
	- create a `Price` entry for `reportDate + 1 day` (if none exists) with `source = 'FieldReport'` — immediate single-report integration.
	- Aggregation endpoint/cron will average multiple `APPROVED` reports per commodity/market to create `Price` entries with `source = 'FieldReportsAggregate'`.

**Editor**
- **Action:** Manage commodity metadata and adjust price data if needed.
- **UI steps:** Open Admin → Commodities → add/update commodity, edit price records (if allowed).
- **API calls:** Commodity management endpoints (`/api/commodities`), price CRUD (if exposed).
- **DB effects:** Update `Commodity` or `Price` rows as edited.

**Viewer**
- **Action:** Read-only access to dashboards, commodity prices, reports (as permitted).
- **UI steps:** Browse dashboard pages and public views.
- **API calls:** GET on public endpoints (`/api/commodities`, `/api/notifications`, public report summaries).

**Automated Processes**
- **Immediate approve flow:** When an Admin updates a `FieldReport` to `APPROVED`, the server attempts to create a single `Price` row for the next day using that report's `price` (duplicates are avoided by checking commodity+date+market range).
- **Aggregation job (daily):** A scheduled job runs daily (configured at system startup; default 01:00 local time) to:
	- Collect all `APPROVED` reports, group by `(commoditySlug, market, nextDay)`, compute average price (rounded to nearest 100), and insert a `Price` row per group if absent.
	- Record summary in logs; skipped groups (existing price) are reported in the job result.
- **Backfill script:** `server/scripts/backfillApprovedReports.ts` — one-time/manual script to create `Price` rows for existing `APPROVED` reports that lack next-day `Price` entries.

**Data Model Effects (summary)**
- `FieldReport` — created by Petugas submissions (status: SUBMITTED → REVIEWED → APPROVED/REJECTED). Fields include GPS, photoUrl, commoditySlug, market, price, reportDate.
- `Price` — time-series used by dashboards and ML. Can be created by:
	- Seeder (initial history)
	- Immediate creation on `APPROVED` report
	- Aggregation (averaging multiple reports) with `source` set to `FieldReportsAggregate`
- `Commodity` — referenced by `FieldReport` via `commoditySlug`; aggregation ensures commodity exists (auto-create if necessary).

**Operational Runbook**
- **Apply DB changes / migration**
	- Run: `npx prisma migrate dev --name <migration-name>` (development) or `prisma migrate deploy` in production.
	- Regenerate client: `npx prisma generate`.
- **Seed / initial data**
	- Run seed: `npx ts-node prisma/seed.ts` (dev) — creates commodities, historical `Price` series, sample users and sample `FieldReport`.
- **Start server (dev)**
	- `npx ts-node src/index.ts` (hot/dev run).
	- Or build and run compiled: `npm run build` then `npm run start` (ensure build produces `dist` if start expects it).
- **Run backfill (manual)**
	- `npx ts-node scripts/backfillApprovedReports.ts` — create missing price rows from existing `APPROVED` reports.
- **Manual aggregation trigger**
	- POST to `/api/admin/field-reports/aggregate` (Admin-only) to run the aggregator on-demand.
- **Scheduled aggregation**
	- The server schedules a daily aggregation at 01:00 local time on startup. Ensure the server process is running continuously (or use a process manager / cron to start daily if not long-running).

**Monitoring & Logs**
- **Logs:** Aggregation prints summary with counts (created/skipped/scanned). Monitor app logs for errors during aggregation or price creation.
- **Alerts:** Configure alerts for repeated aggregation failures or high error rates (e.g., on failures creating `Price`).

**Security & Permissions**
- **Role enforcement:** Ensure API endpoints performing approval/aggregation are protected and accessible only to `Admin` role users. Add middleware for auth if not present.
- **Data integrity:** Approvals should be audited: store `reviewedById`, `reviewedAt`, and optional review notes.

**Operational Checklist for a Release**
- Update Prisma schema and commit migration.
- Run migrations on staging then seed (if needed) and verify sample `FieldReport` → approval → `Price` creation.
- Deploy server process with scheduler (pm2/systemd/container). Verify scheduled job runs or manually run `/aggregate` once.
- Verify UI: submit from `Portal Petugas`, see in Admin, approve, confirm `Price` created.

**Next steps / Enhancements (optional)**
- Store aggregation runs in DB (`AggregationRun`) for historical traceability.
- Add admin UI to view aggregation history and manual reconciliation tools.
- Implement more sophisticated deduplication rules (e.g., prefer admin-reviewed reports over auto-created ones, weight reports by reporter reliability, or aggregate by region hierarchy).

---


