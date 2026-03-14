import { db } from './src/lib/db';

async function testApiQuery() {
  try {
    console.log('Testing API query for users with credits...\n');

    const users = await db.profile.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        avatarUrl: true,
        isKycVerified: true,
        createdAt: true,
        userRoles: {
          select: { role: true },
        },
        kyc: {
          select: { status: true },
        },
        wallet: {
          select: { status: true, balance: true },
        },
        credits: {
          select: { balance: true },
        },
        _count: {
          select: { listings: true, ordersAsBuyer: true, ordersAsSeller: true },
        },
      },
    });

    console.log(`Found ${users.length} users:\n`);

    users.forEach((profile) => {
      const primaryRole = profile.userRoles[0]?.role || 'user';
      const walletStatus = profile.wallet?.status || 'active';
      
      let userStatus = 'active';
      if (walletStatus === 'frozen') {
        userStatus = 'suspended';
      } else if (walletStatus === 'closed') {
        userStatus = 'inactive';
      }

      const formattedUser = {
        id: profile.userId,
        email: profile.email,
        name: profile.name || 'Unknown',
        avatar_url: profile.avatarUrl,
        role: primaryRole,
        status: userStatus,
        kyc_status: profile.kyc?.status || 'not_submitted',
        is_kyc_verified: profile.isKycVerified,
        total_listings: profile._count.listings,
        total_orders_as_buyer: profile._count.ordersAsBuyer,
        total_orders_as_seller: profile._count.ordersAsSeller,
        wallet_balance: profile.wallet?.balance || 0,
        credit_balance: profile.credits?.balance || 0,
        created_at: profile.createdAt.toISOString(),
      };

      console.log('User:', formattedUser.name);
      console.log('  Email:', formattedUser.email);
      console.log('  Role:', formattedUser.role);
      console.log('  Wallet Balance:', formattedUser.wallet_balance);
      console.log('  Credit Balance:', formattedUser.credit_balance);
      console.log('  Has credits object:', !!profile.credits);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

testApiQuery();
