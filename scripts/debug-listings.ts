import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function debugListings() {
  console.log('🔍 Debugging Listings...\n');

  try {
    // Test 1: Raw count
    console.log('TEST 1: Count all listings');
    const totalCount = await prisma.listing.count();
    console.log(`✅ Total listings in database: ${totalCount}\n`);

    // Test 2: Count by status
    console.log('TEST 2: Count by status');
    const activeCount = await prisma.listing.count({ where: { status: 'active' } });
    const pendingCount = await prisma.listing.count({ where: { status: 'pending_review' } });
    const draftCount = await prisma.listing.count({ where: { status: 'draft' } });
    console.log(`   Active: ${activeCount}`);
    console.log(`   Pending: ${pendingCount}`);
    console.log(`   Draft: ${draftCount}\n`);

    // Test 3: Fetch all listings (simple)
    console.log('TEST 3: Fetch all listings (simple query)');
    const allListings = await prisma.listing.findMany({
      take: 10,
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        city: true,
        province: true,
        categoryId: true,
      }
    });
    console.log(`✅ Found ${allListings.length} listings`);
    allListings.forEach((listing, i) => {
      console.log(`   ${i + 1}. ${listing.title} - Rp ${listing.price.toLocaleString()} - ${listing.status}`);
      console.log(`      Location: ${listing.city}, ${listing.province}`);
      console.log(`      Category ID: ${listing.categoryId || 'NULL'}`);
    });
    console.log('');

    // Test 4: Fetch with images
    console.log('TEST 4: Fetch listings with images');
    const listingsWithImages = await prisma.listing.findMany({
      take: 5,
      where: { status: 'active' },
      select: {
        id: true,
        title: true,
        price: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { imageUrl: true }
        }
      }
    });
    console.log(`✅ Found ${listingsWithImages.length} active listings`);
    listingsWithImages.forEach((listing, i) => {
      console.log(`   ${i + 1}. ${listing.title}`);
      console.log(`      Image: ${listing.images[0]?.imageUrl || 'NO IMAGE'}`);
    });
    console.log('');

    // Test 5: Fetch with category
    console.log('TEST 5: Fetch listings with category');
    const listingsWithCategory = await prisma.listing.findMany({
      take: 5,
      where: { status: 'active' },
      select: {
        id: true,
        title: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
    console.log(`✅ Found ${listingsWithCategory.length} listings with category`);
    listingsWithCategory.forEach((listing, i) => {
      console.log(`   ${i + 1}. ${listing.title}`);
      console.log(`      Category: ${listing.category?.name || 'NO CATEGORY'} (${listing.category?.id || 'NULL'})`);
    });
    console.log('');

    // Test 6: Check categories
    console.log('TEST 6: Check categories');
    const categoriesCount = await prisma.category.count();
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        listingCount: true
      }
    });
    console.log(`✅ Total categories: ${categoriesCount}`);
    categories.forEach((cat, i) => {
      console.log(`   ${i + 1}. ${cat.name} (${cat.slug}) - ${cat.listingCount} listings`);
    });
    console.log('');

    // Test 7: Simulate marketplace API query
    console.log('TEST 7: Simulate marketplace API query');
    const marketplaceListings = await prisma.listing.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 24,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        condition: true,
        city: true,
        province: true,
        viewCount: true,
        favoriteCount: true,
        createdAt: true,
        isFeatured: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { imageUrl: true },
        },
      },
    });
    console.log(`✅ Marketplace query returned: ${marketplaceListings.length} listings`);
    if (marketplaceListings.length === 0) {
      console.log('   ⚠️  NO ACTIVE LISTINGS FOUND!');
      console.log('   Possible reasons:');
      console.log('   1. All listings have status != "active"');
      console.log('   2. No listings in database');
      console.log('   3. Database connection issue');
    } else {
      console.log('   Sample:');
      marketplaceListings.slice(0, 3).forEach((listing, i) => {
        console.log(`   ${i + 1}. ${listing.title}`);
        console.log(`      Price: Rp ${listing.price.toLocaleString()}`);
        console.log(`      Image: ${listing.images[0]?.imageUrl || 'NO IMAGE'}`);
        console.log(`      Location: ${listing.city}, ${listing.province}`);
      });
    }
    console.log('');

    // Test 8: Check database connection
    console.log('TEST 8: Database connection info');
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL?.split('@')[1]?.split('?')[0] || 'Hidden'}`);
    console.log(`   Connection: ✅ OK`);
    console.log('');

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   Total Listings: ${totalCount}`);
    console.log(`   Active Listings: ${activeCount}`);
    console.log(`   Categories: ${categoriesCount}`);
    console.log('');

    if (activeCount === 0 && totalCount > 0) {
      console.log('⚠️  PROBLEM FOUND:');
      console.log('   You have listings but none are "active"');
      console.log('   Solution: Update listing status to "active"');
      console.log('   Run: UPDATE "Listing" SET status = \'active\' WHERE status != \'active\';');
    }

    if (totalCount === 0) {
      console.log('⚠️  PROBLEM FOUND:');
      console.log('   No listings in database');
      console.log('   Solution: Run seed script or create listings manually');
      console.log('   Run: npx ts-node prisma/seed-sample-listings.ts');
    }

  } catch (error) {
    console.error('❌ ERROR:', error);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   1. Check DATABASE_URL in .env');
    console.log('   2. Run: npx prisma generate');
    console.log('   3. Run: npx prisma db push');
    console.log('   4. Restart your dev server');
  } finally {
    await prisma.$disconnect();
  }
}

debugListings();
