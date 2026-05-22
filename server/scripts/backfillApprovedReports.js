"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
require("dotenv/config");
const prisma = new client_1.PrismaClient();
async function run() {
    console.log('Backfill: start scanning APPROVED FieldReports...');
    const reports = await prisma.fieldReport.findMany({ where: { status: 'APPROVED' }, orderBy: { reportDate: 'asc' } });
    let created = 0;
    let skipped = 0;
    for (const r of reports) {
        try {
            // find or create commodity
            let commodity = await prisma.commodity.findUnique({ where: { slug: r.commoditySlug } });
            if (!commodity) {
                commodity = await prisma.commodity.create({ data: { slug: r.commoditySlug, name: r.commodityName || r.commoditySlug, unit: 'KG', description: `Auto-created from backfill for report ${r.id}` } });
            }
            // compute next day range
            const next = new Date(r.reportDate);
            next.setDate(next.getDate() + 1);
            const start = new Date(next);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 1);
            const exists = await prisma.price.findFirst({ where: { commodityId: commodity.id, date: { gte: start, lt: end } } });
            if (exists) {
                skipped++;
                continue;
            }
            await prisma.price.create({ data: { commodityId: commodity.id, price: Number(r.price), date: start, market: r.market || 'Rata-rata Jawa Tengah', status: 'VALID', source: 'FieldReport' } });
            created++;
        }
        catch (e) {
            console.error('Error processing report', r.id, e);
        }
    }
    console.log(`Backfill finished. Created: ${created}, Skipped(existing): ${skipped}, Scanned: ${reports.length}`);
}
run()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=backfillApprovedReports.js.map