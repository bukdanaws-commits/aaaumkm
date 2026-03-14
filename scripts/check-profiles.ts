import { db } from './src/lib/db';

async function checkProfiles() {
  try {
    const profiles = await db.profile.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        city: true,
        totalListings: true,
        activeListings: true,
      }
    });

    console.log(`Found ${profiles.length} profiles:\n`);
    profiles.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name || 'No name'}`);
      console.log(`   Email: ${p.email}`);
      console.log(`   User ID: ${p.userId}`);
      console.log(`   City: ${p.city || 'N/A'}`);
      console.log(`   Listings: ${p.activeListings}/${p.totalListings}`);
      console.log(`   URL: http://localhost:3000/user/${p.userId}`);
      console.log('');
    });

    if (profiles.length === 0) {
      console.log('No profiles found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkProfiles();
