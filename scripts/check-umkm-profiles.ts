import { db } from './src/lib/db';

async function checkUmkmProfiles() {
  try {
    // Check for bandar-001
    const bandar = await db.umkmProfile.findFirst({
      where: { slug: 'bandar-001' },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    if (bandar) {
      console.log('✓ Found UMKM profile "bandar-001":');
      console.log('  UMKM Name:', bandar.umkmName);
      console.log('  Slug:', bandar.slug);
      console.log('  Owner:', bandar.owner.name, `(${bandar.owner.email})`);
      console.log('  City:', bandar.city || 'N/A');
      console.log('  Status:', bandar.status);
      console.log('  URL: http://localhost:3000/user/bandar-001');
    } else {
      console.log('✗ UMKM profile "bandar-001" not found');
      console.log('\nSearching for UMKM profiles with "bandar" in slug...');
      
      const similar = await db.umkmProfile.findMany({
        where: {
          slug: {
            contains: 'bandar'
          }
        },
        take: 5
      });
      
      if (similar.length > 0) {
        console.log(`Found ${similar.length} UMKM profiles:`);
        similar.forEach(u => {
          console.log(`  - ${u.slug}: ${u.umkmName}`);
        });
      } else {
        console.log('No UMKM profiles found with "bandar"');
        
        // Show all UMKM profiles
        const all = await db.umkmProfile.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' }
        });
        
        console.log(`\nShowing ${all.length} recent UMKM profiles:`);
        all.forEach(u => {
          console.log(`  - ${u.slug}: ${u.umkmName} (${u.city || 'no city'})`);
          console.log(`    URL: http://localhost:3000/user/${u.slug}`);
        });
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkUmkmProfiles();
