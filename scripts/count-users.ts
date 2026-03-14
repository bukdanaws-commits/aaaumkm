import { db } from '../src/lib/db';

async function countUsers() {
  try {
    // Count total profiles
    const totalProfiles = await db.profile.count();
    console.log('📊 Total Profiles:', totalProfiles);

    // Count by role
    const roles = await db.userRole.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    console.log('\n👥 Users by Role:');
    roles.forEach(r => {
      console.log(`  - ${r.role}: ${r._count.role}`);
    });

    // Count user credits
    const totalCredits = await db.userCredit.count();
    console.log('\n💰 Users with Credits:', totalCredits);

    // Get some sample users
    const sampleUsers = await db.profile.findMany({
      take: 5,
      select: {
        userId: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('\n📝 Sample Users (latest 5):');
    sampleUsers.forEach((user, idx) => {
      console.log(`  ${idx + 1}. ${user.name || user.email} (${user.userId})`);
      console.log(`     Created: ${user.createdAt.toLocaleDateString()}`);
    });

    // Count credit transactions
    const bonusTransactions = await db.creditTransaction.count({
      where: {
        type: 'bonus',
        description: 'Bonus registrasi user baru',
      },
    });

    console.log('\n🎁 Users who received registration bonus:', bonusTransactions);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

countUsers();
