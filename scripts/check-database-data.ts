import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking database data...\n');

  // Check listings
  const listingsCount = await prisma.listing.count();
  const activeListings = await prisma.listing.count({
    where: { status: 'active', deletedAt: null },
  });
  console.log(`📝 Listings: ${listingsCount} total, ${activeListings} active`);

  // Check categories
  const categoriesCount = await prisma.category.count();
  console.log(`📂 Categories: ${categoriesCount}`);

  // Check users
  const usersCount = await prisma.profile.count();
  console.log(`👥 Users: ${usersCount}`);

  // Check sponsors
  const sponsorsCount = await prisma.sponsor.count();
  console.log(`🏢 Sponsors: ${sponsorsCount}`);

  // Check products
  const productsCount = await prisma.product.count();
  console.log(`📦 Products: ${productsCount}`);

  // Check UMKM profiles
  const umkmCount = await prisma.umkmProfile.count();
  console.log(`🏪 UMKM Profiles: ${umkmCount}`);

  console.log('\n✅ Database check complete!');

  // Show sample listings
  console.log('\n📋 Sample Listings:');
  const sampleListings = await prisma.listing.findMany({
    take: 5,
    where: { status: 'active', deletedAt: null },
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
    },
  });

  sampleListings.forEach((listing, idx) => {
    console.log(`${idx + 1}. ${listing.title} - Rp ${listing.price.toLocaleString('id-ID')}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
