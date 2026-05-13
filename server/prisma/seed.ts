import { PrismaClient } from '@prisma/client';
import "dotenv/config";

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
