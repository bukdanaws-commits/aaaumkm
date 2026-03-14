import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductionData() {
  console.log('🔍 Checking Production Database Data\n');
  console.log('═'.repeat(60));
  console.log('');

  try {
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    // Check counts
    const counts = {
      listings: await prisma.listing.count(),
      categories: await prisma.category.count(),
      users: await prisma.profile.count(),
      sponsors: await prisma.sponsor.count(),
      banners: await prisma.banner.count(),
    };

    console.log('📊 Data Summary:');
    console.log(`   Listings: ${counts.listings}`);
    console.log(`   Categories: ${counts.categories}`);
    console.log(`   Users: ${counts.users}`);
    console.log(`   Sponsors: ${counts.sponsors}`);
    console.log(`   Banners: ${counts.banners}`);
    console.log('');

    if (counts.listings === 0) {
      console.log('❌ Database is EMPTY - No listings found');
      console.log('   Need to run seed script\n');
    } else {
      console.log('✅ Database has data');
      
      // Show sample listings
      const sampleListings = await prisma.listing.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          price: true,
          status: true,
        },
      });

      console.log('\n📦 Sample Listings:');
      sampleListings.forEach((listing, i) => {
        console.log(`   ${i + 1}. ${listing.title} - Rp ${listing.price.toLocaleString()} (${listing.status})`);
      });
      console.log('');
    }

    console.log('═'.repeat(60));
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionData();
