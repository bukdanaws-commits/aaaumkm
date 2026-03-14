import { db } from './src/lib/db';

async function checkBanners() {
  try {
    const banners = await db.banner.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        position: true,
        status: true,
        startsAt: true,
        endsAt: true,
        imageUrl: true,
      },
    });

    console.log('Total banners:', banners.length);
    console.log('\nBanner details:');
    banners.forEach((banner, index) => {
      console.log(`\n${index + 1}. ${banner.title}`);
      console.log(`   Position: ${banner.position}`);
      console.log(`   Status: ${banner.status}`);
      console.log(`   Starts: ${banner.startsAt}`);
      console.log(`   Ends: ${banner.endsAt || 'No end date'}`);
      console.log(`   Image: ${banner.imageUrl.substring(0, 50)}...`);
    });

    // Check active banners
    const now = new Date();
    const activeBanners = banners.filter(b => 
      b.status === 'active' && 
      new Date(b.startsAt) <= now &&
      (!b.endsAt || new Date(b.endsAt) >= now)
    );

    console.log(`\n\nActive banners (should show on pages): ${activeBanners.length}`);
    activeBanners.forEach(b => {
      console.log(`  - ${b.position}: ${b.title}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkBanners();
