import { db } from '@/lib/db';

async function testLandingAPI() {
  console.log('🧪 Testing Landing API data fetch...\n');

  try {
    // Test categories
    const categories = await db.category.findMany({
      where: {
        isActive: true,
        parentId: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        iconUrl: true,
        imageBannerUrl: true,
        listingCount: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
    console.log(`✅ Categories: ${categories.length} found`);
    console.log(`   Sample: ${categories.slice(0, 3).map(c => c.name).join(', ')}\n`);

    // Test featured listings
    const featuredListings = await db.listing.findMany({
      where: {
        status: 'active',
        isFeatured: true,
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        category: {
          select: { name: true, slug: true },
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    console.log(`✅ Featured Listings: ${featuredListings.length} found`);
    if (featuredListings.length > 0) {
      console.log(`   Sample: ${featuredListings.slice(0, 3).map(l => l.title).join(', ')}\n`);
    }

    // Test boosted listings
    const boostedListings = await db.listing.findMany({
      where: {
        status: 'active',
        boosts: {
          some: {
            status: 'active',
            endsAt: { gt: new Date() },
          },
        },
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        boosts: {
          where: {
            status: 'active',
            endsAt: { gt: new Date() },
          },
          select: { boostType: true },
        },
        category: {
          select: { name: true, slug: true },
        },
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });
    console.log(`✅ Boosted Listings: ${boostedListings.length} found\n`);

    // Test latest listings
    const latestListings = await db.listing.findMany({
      where: {
        status: 'active',
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        category: {
          select: { name: true, slug: true },
        },
      },
      take: 12,
      orderBy: { createdAt: 'desc' },
    });
    console.log(`✅ Latest Listings: ${latestListings.length} found`);
    if (latestListings.length > 0) {
      console.log(`   Sample: ${latestListings.slice(0, 3).map(l => l.title).join(', ')}\n`);
    }

    // Test popular listings
    const popularListings = await db.listing.findMany({
      where: {
        status: 'active',
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        category: {
          select: { name: true, slug: true },
        },
      },
      take: 12,
      orderBy: { viewCount: 'desc' },
    });
    console.log(`✅ Popular Listings: ${popularListings.length} found`);
    if (popularListings.length > 0) {
      console.log(`   Sample: ${popularListings.slice(0, 3).map(l => l.title).join(', ')}\n`);
    }

    // Test active auctions
    const activeAuctions = await db.listingAuction.findMany({
      where: {
        status: 'active',
        endsAt: { gt: new Date() },
      },
      include: {
        listing: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
            category: {
              select: { name: true, slug: true },
            },
          },
        },
        bids: {
          select: { amount: true },
          orderBy: { amount: 'desc' },
          take: 1,
        },
      },
      take: 6,
      orderBy: { endsAt: 'asc' },
    });
    console.log(`✅ Active Auctions: ${activeAuctions.length} found\n`);

    console.log('✅ All API queries successful!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Featured: ${featuredListings.length}`);
    console.log(`   - Boosted: ${boostedListings.length}`);
    console.log(`   - Latest: ${latestListings.length}`);
    console.log(`   - Popular: ${popularListings.length}`);
    console.log(`   - Auctions: ${activeAuctions.length}`);

  } catch (error) {
    console.error('❌ Error testing landing API:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

testLandingAPI();
