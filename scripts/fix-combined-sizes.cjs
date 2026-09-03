const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function fix() {
  const bad = await prisma.productVariant.findMany({
    where: { deletedAt: null, size: { contains: ',' } }
  });
  console.log('Bad variants found:', bad.length);

  for (const v of bad) {
    const sizes = v.size.split(',').map(s => s.trim()).filter(Boolean);
    console.log('Splitting variant', v.id, 'into sizes:', sizes);

    await prisma.productVariant.update({
      where: { id: v.id },
      data: { deletedAt: new Date() }
    });

    for (const size of sizes) {
      const sku = v.sku + '-' + size;
      await prisma.productVariant.create({
        data: {
          productId: v.productId,
          sku,
          color: v.color,
          size,
          stockQuantity: v.stockQuantity,
          isAvailable: v.isAvailable,
          priceOverride: v.priceOverride
        }
      });
      console.log('  Created:', sku, '/', size);
    }
  }

  await prisma.$disconnect();
  console.log('Done.');
}

fix().catch(e => { console.error(e.message); process.exit(1); });
