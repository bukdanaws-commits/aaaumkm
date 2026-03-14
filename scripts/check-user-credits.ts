import { db } from './src/lib/db';

async function checkUserCredits() {
  try {
    console.log('Checking user credits...\n');

    // Get all users with their credits
    const users = await db.profile.findMany({
      select: {
        userId: true,
        name: true,
        email: true,
        credits: {
          select: {
            balance: true,
            totalPurchased: true,
            totalUsed: true,
            totalBonus: true,
          },
        },
      },
      take: 10,
    });

    console.log(`Found ${users.length} users:\n`);

    users.forEach((user) => {
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`  User ID: ${user.userId}`);
      if (user.credits) {
        console.log(`  Credit Balance: ${user.credits.balance}`);
        console.log(`  Total Purchased: ${user.credits.totalPurchased}`);
        console.log(`  Total Used: ${user.credits.totalUsed}`);
        console.log(`  Total Bonus: ${user.credits.totalBonus}`);
      } else {
        console.log(`  No credit record found`);
      }
      console.log('');
    });

    // Count users with credits
    const usersWithCredits = await db.userCredit.count();
    console.log(`\nTotal users with credit records: ${usersWithCredits}`);

    // Get credit transactions
    const transactions = await db.creditTransaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        profile: {
          select: { name: true, email: true },
        },
      },
    });

    console.log(`\nRecent credit transactions (${transactions.length}):`);
    transactions.forEach((tx) => {
      console.log(`  ${tx.profile.name}: ${tx.type} - ${tx.amount} credits`);
      console.log(`    Note: ${tx.note || 'N/A'}`);
      console.log(`    Date: ${tx.createdAt.toISOString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkUserCredits();
