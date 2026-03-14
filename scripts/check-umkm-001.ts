import { db } from './src/lib/db';

async function checkUmkm001() {
  try {
    const umkm = await db.umkmProfile.findFirst({
      where: { slug: 'umkm-001' },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    if (umkm) {
      console.log('✓ Found UMKM profile "umkm-001":');
      console.log('  UMKM Name:', umkm.umkmName);
      console.log('  Slug:', umkm.slug);
      console.log('  Owner:', umkm.owner.name, `(${umkm.owner.email})`);
      console.log('  City:', umkm.city || 'N/A');
      console.log('  Status:', umkm.status);
      console.log('\n  ✓ URL: http://localhost:3000/user/umkm-001');
    } else {
      console.log('✗ UMKM profile "umkm-001" not found');
      console.log('\nAvailable UMKM profiles:');
      
      const all = await db.umkmProfile.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
      
      all.forEach(u => {
        console.log(`  - ${u.slug}: ${u.umkmName}`);
        console.log(`    URL: http://localhost:3000/user/${u.slug}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkUmkm001();
