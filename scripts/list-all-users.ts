import { db } from '@/lib/db';

async function listAllUsers() {
  console.log('👥 Listing all users in database...\n');

  try {
    const users = await db.profile.findMany({
      include: {
        userRoles: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📊 Total users: ${users.length}\n`);

    if (users.length === 0) {
      console.log('❌ No users found in database.\n');
      console.log('💡 Login with Google OAuth first at: http://localhost:3000/auth\n');
      return;
    }

    console.log('═'.repeat(80));
    console.log('');

    for (const user of users) {
      const roles = user.userRoles.map(r => r.role).join(', ') || 'none';
      const isAdmin = user.userRoles.some(r => r.role === 'admin');
      const isPenjual = user.userRoles.some(r => r.role === 'penjual');

      console.log(`${isAdmin ? '👑' : isPenjual ? '🏪' : '👤'} ${user.name || 'No Name'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   User ID: ${user.userId}`);
      console.log(`   Roles: ${roles}`);
      console.log(`   Verified: ${user.isVerified ? '✅' : '❌'}`);
      console.log(`   KYC: ${user.isKycVerified ? '✅' : '❌'}`);
      console.log(`   Listings: ${user.totalListings} (${user.activeListings} active)`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString('id-ID')}`);
      console.log('');
    }

    console.log('═'.repeat(80));
    console.log('');

    // Summary
    const adminCount = users.filter(u => u.userRoles.some(r => r.role === 'admin')).length;
    const penjualCount = users.filter(u => u.userRoles.some(r => r.role === 'penjual')).length;
    const regularCount = users.length - adminCount - penjualCount;

    console.log('📈 Summary:');
    console.log(`   👑 Admins: ${adminCount}`);
    console.log(`   🏪 Penjual: ${penjualCount}`);
    console.log(`   👤 Regular Users: ${regularCount}`);
    console.log('');

    // Instructions
    console.log('💡 To assign admin role:');
    console.log('   npx tsx scripts/create-admin-from-google.ts EMAIL\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

listAllUsers();
