// Test script to verify delete functionality
import { db } from './src/lib/db';

async function testDelete() {
  try {
    console.log('Testing banner delete functionality...\n');
    
    // Get all banners
    const banners = await db.banner.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${banners.length} active banners:`);
    banners.forEach(b => {
      console.log(`- ${b.id}: ${b.title} (${b.status})`);
    });
    
    if (banners.length === 0) {
      console.log('\nNo banners to test delete with.');
      return;
    }
    
    // Check if there are any soft-deleted banners
    const deletedBanners = await db.banner.findMany({
      where: {
        deletedAt: { not: null }
      }
    });
    
    console.log(`\nFound ${deletedBanners.length} soft-deleted banners`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

testDelete();
