import { PrismaClient } from '@prisma/client';
import "dotenv/config";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const commodities = [
    { slug: 'beras-medium', name: 'Beras Medium', unit: 'KG' },
    { slug: 'gula-pasir', name: 'Gula Pasir', unit: 'KG' },
    { slug: 'minyak-goreng', name: 'Minyak Goreng Curah', unit: 'LITER' },
    { slug: 'daging-sapi', name: 'Daging Sapi', unit: 'KG' },
    { slug: 'telur-ayam', name: 'Telur Ayam Ras', unit: 'KG' },
    { slug: 'cabai-rawit', name: 'Cabai Rawit Merah', unit: 'KG' },
  ];

  for (const c of commodities) {
    const commodity = await prisma.commodity.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug,
        name: c.name,
        unit: c.unit,
        description: `Harga rata-rata ${c.name} di tingkat konsumen Jawa Tengah`,
      },
    });

    console.log(`Created commodity: ${commodity.name}`);

    // Buat data harga dummy untuk 60 hari terakhir (Time Series)
    const basePrice = c.slug === 'daging-sapi' ? 130000 : c.slug === 'beras-medium' ? 13500 : 25000;
    
    // Periksa apakah harga sudah ada untuk menghindari duplikasi saat seeding ulang
    const existingPrices = await prisma.price.count({ where: { commodityId: commodity.id } });
    
    if (existingPrices === 0) {
      const prices = [];
      const now = new Date();
      let currentPrice = basePrice;
      
      for (let i = 60; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Random walk dengan rentang kecil
        const change = (Math.random() - 0.5) * (basePrice * 0.05);
        currentPrice = currentPrice + change;
        
        prices.push({
          commodityId: commodity.id,
          price: Math.round(currentPrice / 100) * 100, // Pembulatan ratusan
          date: date,
          market: "Rata-rata Jawa Tengah"
        });
      }
      
      await prisma.price.createMany({ data: prices });
      console.log(`Seeded 60 days of price data for ${commodity.name}`);
    }
  }

  // Seed Users if none exist
  const existingUsers = await prisma.user.count();
  if (existingUsers === 0) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const users = [
      { name: "Budi Santoso", email: "budi_admin@agromonitor.com", password: hashedPassword, role: "ADMIN", status: "ACTIVE", lastLogin: new Date("2024-05-17T08:30:00Z") },
      { name: "Siti Rahma", email: "siti_analis@agromonitor.com", password: hashedPassword, role: "EDITOR", status: "ACTIVE", lastLogin: new Date("2024-05-17T07:15:00Z") },
      { name: "Rudi Petugas", email: "rudi_petugas@agromonitor.com", password: hashedPassword, role: "PETUGAS", status: "ACTIVE", lastLogin: new Date("2024-05-17T06:45:00Z") },
      { name: "Andi Wijaya", email: "andi@gmail.com", password: hashedPassword, role: "VIEWER", status: "INACTIVE", lastLogin: new Date("2024-05-15T16:45:00Z") },
      { name: "Dewi Lestari", email: "dewi@admin.com", password: hashedPassword, role: "VIEWER", status: "ACTIVE", lastLogin: new Date("2024-05-17T06:20:00Z") },
    ];
    
    // We have to cast role to any because the enum in seed.ts might not match directly if Prisma client wasn't regenerated, but it should be fine.
    // Let's rely on Prisma client types.
    for (const u of users) {
      await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role as any,
          status: u.status,
          lastLogin: u.lastLogin
        }
      });
      console.log(`Created user: ${u.name}`);

    const existingFieldReports = await prisma.fieldReport.count();
    if (existingFieldReports === 0) {
      const petugas = await prisma.user.findUnique({ where: { email: 'rudi_petugas@agromonitor.com' } });

      await prisma.fieldReport.create({
        data: {
          reporterId: petugas?.id,
          petugasCode: 'PTG-194',
          petugasName: 'Rudi Petugas',
          petugasEmail: 'rudi_petugas@agromonitor.com',
          commoditySlug: 'beras-medium',
          commodityName: 'Beras Medium (Kg)',
          market: 'Pasar Johar, Semarang',
          price: 13500,
          reportDate: new Date('2024-05-17T00:00:00Z'),
          latitude: -6.9942,
          longitude: 110.4203,
          accuracy: 12.5,
          locationLabel: 'Pasar Johar, Semarang',
          notes: 'Harga stabil, stok cukup aman.',
          photoUrl: 'https://example.com/foto-petugas.jpg',
          status: 'SUBMITTED' as any,
        },
      });
      console.log('Created sample field report');
    }
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
