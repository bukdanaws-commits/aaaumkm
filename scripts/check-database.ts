import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Analyzing Database...\n');

  try {
    // Check Categories
    const categoriesCount = await prisma.category.count();
    const parentCategories = await prisma.category.count({
      where: { parentId: null }
    });
    const subCategories = await prisma.category.count({
      where: { parentId: { not: null } }
    });
    
    console.log('📂 CATEGORIES:');
    console.log(`   Total: ${categoriesCount}`);
    console.log(`   Parent Categories: ${parentCategories}`);
    console.log(`   Sub Categories: ${subCategories}`);
    
    if (categoriesCount > 0) {
      const sampleCategories = await prisma.category.findMany({
        where: { parentId: null },
        take: 5,
        select: { id: true, name: true, slug: true, icon: true, color: true }
      });
      console.log('   Sample Categories:');
      sampleCategories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug}) ${cat.icon || 'no icon'} ${cat.color || 'no color'}`);
      });
    }
    console.log('');

    // Check Listings
    const listingsCount = await prisma.listing.count();
    const activeListings = await prisma.listing.count({
      where: { status: 'active' }
    });
    const pendingListings = await prisma.listing.count({
      where: { status: 'pending_review' }
    });
    
    console.log('📦 LISTINGS:');
    console.log(`   Total: ${listingsCount}`);
    console.log(`   Active: ${activeListings}`);
    console.log(`   Pending Review: ${pendingListings}`);
    
    if (listingsCount > 0) {
      const sampleListings = await prisma.listing.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          price: true,
          status: true,
          createdAt: true,
          category: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      console.log('   Recent Listings:');
      sampleListings.forEach(listing => {
        console.log(`   - ${listing.title} (Rp ${listing.price.toLocaleString()}) - ${listing.status} - ${listing.category?.name || 'No category'}`);
      });
    } else {
      console.log('   ⚠️  No listings found in database!');
    }
    console.log('');

    // Check Users
    const usersCount = await prisma.profile.count();
    const verifiedUsers = await prisma.profile.count({
      where: { isVerified: true }
    });
    
    console.log('👥 USERS:');
    console.log(`   Total Profiles: ${usersCount}`);
    console.log(`   Verified: ${verifiedUsers}`);
    console.log('');

    // Check KYC
    const kycCount = await prisma.kycVerification.count();
    const approvedKyc = await prisma.kycVerification.count({
      where: { status: 'approved' }
    });
    
    console.log('🔐 KYC VERIFICATIONS:');
    console.log(`   Total: ${kycCount}`);
    console.log(`   Approved: ${approvedKyc}`);
    console.log('');

    // Check Images
    const imagesCount = await prisma.listingImage.count();
    console.log('🖼️  LISTING IMAGES:');
    console.log(`   Total: ${imagesCount}`);
    console.log('');

    // Check Orders
    const ordersCount = await prisma.order.count();
    console.log('🛒 ORDERS:');
    console.log(`   Total: ${ordersCount}`);
    console.log('');

    // Database Connection Status
    console.log('✅ Database Connection: OK');
    console.log('📊 Database URL:', process.env.DATABASE_URL?.split('@')[1]?.split('?')[0] || 'Hidden');

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (categoriesCount === 0) {
      console.log('   ⚠️  Run: npx ts-node prisma/seed-categories.ts');
    }
    if (listingsCount === 0) {
      console.log('   ⚠️  No listings found. Create listings via:');
      console.log('      - UI: http://localhost:3000/listing/create');
      console.log('      - Or create sample listings seed script');
    }
    if (usersCount === 0) {
      console.log('   ⚠️  No users found. Login via Google OAuth first');
    }

  } catch (error) {
    console.error('❌ Database Error:', error);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   1. Check if DATABASE_URL is correct in .env');
    console.log('   2. Run: npx prisma db push');
    console.log('   3. Run: npx prisma generate');
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
