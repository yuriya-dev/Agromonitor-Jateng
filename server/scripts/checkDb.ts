import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const commodities = await prisma.commodity.count();
    const prices = await prisma.price.count();
    const users = await prisma.user.count();
    const fieldReports = await prisma.fieldReport.count();
    const aggregationRuns = await prisma.aggregationRun.count();

    console.log('--- DATABASE STATUS ---');
    console.log('Commodities:', commodities);
    console.log('Prices:', prices);
    console.log('Users:', users);
    console.log('FieldReports:', fieldReports);
    console.log('AggregationRuns:', aggregationRuns);
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
