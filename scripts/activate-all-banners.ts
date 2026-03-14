import { db } from '../src/lib/db';

async function activateAllBanners() {
  try {
    // Get all pending banners
    const pendingBanners = await db.banner.findMany({
      where: {
        status: 'pending',
        deletedAt: null,
      },
    });

    console.log(`Found ${pendingBanners.length} pending banners`);

    // Activate all
    const result = await db.banner.updateMany({
      where: {
        status: 'pending',
        deletedAt: null,
      },
      data: {
        status: 'active',
      },
    });

    console.log(`✅ Activated ${result.count} banners`);

    // Show active banners
    const activeBanners = await db.banner.findMany({
      where: {
        status: 'active',
        deletedAt: null,
      },
      select: {
        title: true,
        position: true,
        status: true,
      },
    });

    console.log('\nActive banners:');
    activeBanners.forEach(b => {
      console.log(`  ✓ ${b.position}: ${b.title}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

activateAllBanners();
