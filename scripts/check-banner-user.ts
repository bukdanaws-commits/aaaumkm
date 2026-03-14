import { db } from './src/lib/db';

async function checkBannerUser() {
  try {
    // Check the specific banner IDs that failed
    const bannerIds = ['cmmgfyd5a0006uxbghmubhifs', 'cmmgfyddo000cuxbg87nwu5cw'];
    
    for (const id of bannerIds) {
      const banner = await db.banner.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          userId: true,
          position: true,
        },
      });

      if (banner) {
        console.log(`\nBanner: ${banner.title}`);
        console.log(`  ID: ${banner.id}`);
        console.log(`  UserId: ${banner.userId}`);
        console.log(`  Position: ${banner.position}`);

        // Check if user exists
        const user = await db.user.findUnique({
          where: { id: banner.userId },
          select: { id: true, email: true },
        });

        if (user) {
          console.log(`  ✓ User exists: ${user.email}`);
        } else {
          console.log(`  ✗ User NOT found in database!`);
        }
      } else {
        console.log(`\nBanner ${id} not found`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkBannerUser();
