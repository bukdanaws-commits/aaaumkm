import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const email = 'bukdan1001@gmail.com';
    
    console.log(`\n🔍 Mencari user dengan email: ${email}\n`);
    
    // Cari di profile table
    const profile = await prisma.profile.findFirst({
      where: { email },
      include: {
        userRoles: true,
        userCredits: true,
        wallet: true,
        listings: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        ordersAsBuyer: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
          },
        },
        ordersAsSeller: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
          },
        },
      },
    });

    if (!profile) {
      console.log('❌ User TIDAK DITEMUKAN di database\n');
      return;
    }

    console.log('✅ User DITEMUKAN!\n');
    console.log('📋 Detail User:');
    console.log('=====================================');
    console.log(`User ID: ${profile.userId}`);
    console.log(`Email: ${profile.email}`);
    console.log(`Nama: ${profile.name}`);
    console.log(`Phone: ${profile.phone || 'Tidak ada'}`);
    console.log(`KYC Verified: ${profile.isKycVerified ? 'Ya' : 'Tidak'}`);
    console.log(`Created At: ${profile.createdAt}`);
    console.log('');

    // Role
    console.log('👤 Role:');
    if (profile.userRoles.length > 0) {
      profile.userRoles.forEach(role => {
        console.log(`  - ${role.role}`);
      });
    } else {
      console.log('  - user (default)');
    }
    console.log('');

    // Credits
    console.log('💰 Kredit:');
    if (profile.userCredits) {
      console.log(`  Balance: ${profile.userCredits.balance}`);
      console.log(`  Total Bonus: ${profile.userCredits.totalBonus}`);
      console.log(`  Total Purchased: ${profile.userCredits.totalPurchased}`);
      console.log(`  Total Used: ${profile.userCredits.totalUsed}`);
    } else {
      console.log('  Belum ada data kredit');
    }
    console.log('');

    // Wallet
    console.log('💳 Wallet:');
    if (profile.wallet) {
      console.log(`  Balance: Rp ${profile.wallet.balance.toLocaleString('id-ID')}`);
      console.log(`  Status: ${profile.wallet.status}`);
    } else {
      console.log('  Belum ada wallet');
    }
    console.log('');

    // Listings
    console.log('📦 Iklan:');
    console.log(`  Total: ${profile.listings.length}`);
    if (profile.listings.length > 0) {
      profile.listings.slice(0, 5).forEach(listing => {
        console.log(`  - ${listing.title} (${listing.status})`);
      });
      if (profile.listings.length > 5) {
        console.log(`  ... dan ${profile.listings.length - 5} lainnya`);
      }
    }
    console.log('');

    // Orders
    console.log('🛒 Pesanan:');
    console.log(`  Sebagai Buyer: ${profile.ordersAsBuyer.length}`);
    console.log(`  Sebagai Seller: ${profile.ordersAsSeller.length}`);
    console.log('');

    // Check credit transactions
    const creditTransactions = await prisma.creditTransaction.findMany({
      where: { userId: profile.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log('💳 Transaksi Kredit (10 terakhir):');
    if (creditTransactions.length > 0) {
      creditTransactions.forEach(tx => {
        const sign = tx.type === 'bonus' || tx.type === 'purchase' ? '+' : '-';
        console.log(`  ${sign}${tx.amount} - ${tx.description} (${tx.type}) - ${tx.createdAt.toLocaleDateString('id-ID')}`);
      });
    } else {
      console.log('  Belum ada transaksi kredit');
    }
    console.log('');

    // Check if received registration bonus
    const registrationBonus = await prisma.creditTransaction.findFirst({
      where: {
        userId: profile.userId,
        type: 'bonus',
        description: 'Bonus registrasi user baru',
      },
    });

    console.log('🎁 Bonus Registrasi:');
    if (registrationBonus) {
      console.log(`  ✅ Sudah menerima bonus registrasi`);
      console.log(`  Tanggal: ${registrationBonus.createdAt.toLocaleDateString('id-ID')}`);
      console.log(`  Jumlah: ${registrationBonus.amount} kredit`);
    } else {
      console.log(`  ❌ Belum menerima bonus registrasi`);
    }
    console.log('');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
