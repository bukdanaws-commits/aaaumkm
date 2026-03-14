import { db } from './src/lib/db';

async function checkBandarUser() {
  try {
    // Check for bandar-001 profile
    const profile = await db.profile.findFirst({
      where: {
        username: 'bandar-001'
      },
      include: {
        listings: {
          where: {
            deletedAt: null
          },
          take: 5
        }
      }
    });

    if (profile) {
      console.log('✓ Found profile for bandar-001:');
      console.log('  User ID:', profile.userId);
      console.log('  Full Name:', profile.fullName || 'N/A');
      console.log('  Username:', profile.username);
      console.log('  City:', profile.city || 'N/A');
      console.log('  Total Listings:', profile.listings.length);
    } else {
      console.log('✗ Profile "bandar-001" not found');
      console.log('\nSearching for similar usernames...');
      
      const similarProfiles = await db.profile.findMany({
        where: {
          username: {
            contains: 'bandar'
          }
        },
        take: 5
      });
      
      if (similarProfiles.length > 0) {
        console.log(`Found ${similarProfiles.length} profiles with "bandar":`);
        similarProfiles.forEach(p => {
          console.log(`  - ${p.username} (${p.fullName || 'no name'})`);
        });
      } else {
        console.log('No profiles found with "bandar" in username');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkBandarUser();
