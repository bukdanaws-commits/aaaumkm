import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixListingsStatus() {
  console.log('🔧 Fixing listings status...\n');

  try {
    // Check current status distribution
    const statusCounts = await prisma.listing.groupBy({
      by: ['status'],
      _count: true,
    });

    console.log('📊 Current status distribution:');
    statusCounts.forEach(item => {
      console.log(`   ${item.status}: ${item._count} listings`);
    });
    console.log('');

    // Count non-active listings
    const nonActiveCount = await prisma.listing.count({
      where: {
        status: { not: 'active' }
      }
    });

    if (nonActiveCount === 0) {
      console.log('✅ All listings are already active!');
      return;
    }

    console.log(`⚠️  Found ${nonActiveCount} non-active listings`);
    console.log('🔄 Updating all listings to "active" status...');

    const result = await prisma.listing.updateMany({
      where: {
        status: { not: 'active' }
      },
      data: {
        status: 'active',
        publishedAt: new Date(),
      }
    });

    console.log(`✅ Updated ${result.count} listings to active status`);
    console.log('');

    // Verify
    const activeCount = await prisma.listing.count({
      where: { status: 'active' }
    });

    console.log('📊 Final status:');
    console.log(`   Active listings: ${activeCount}`);
    console.log('');
    console.log('✨ Done! All listings are now active and visible in marketplace.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixListingsStatus();
