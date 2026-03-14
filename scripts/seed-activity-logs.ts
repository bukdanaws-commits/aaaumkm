import { db } from '../src/lib/db.ts';

async function seedActivityLogs() {
  console.log('🌱 Seeding activity logs...');

  try {
    // Get some users
    const users = await db.profile.findMany({
      take: 3,
      select: {
        userId: true,
        email: true,
      }
    });

    if (users.length === 0) {
      console.log('⚠️ No users found. Please create users first.');
      return;
    }

    const activities = [
      {
        action: 'create_listing',
        description: 'Membuat iklan baru: iPhone 15 Pro Max',
      },
      {
        action: 'place_order',
        description: 'Melakukan pesanan #ORD-001',
      },
      {
        action: 'approve_kyc',
        description: 'Menyetujui KYC untuk user',
      },
      {
        action: 'withdrawal',
        description: 'Melakukan penarikan dana Rp 500.000',
      },
      {
        action: 'buy_credits',
        description: 'Membeli 100 kredit',
      },
      {
        action: 'boost_listing',
        description: 'Boost iklan ke top search',
      },
      {
        action: 'update_listing',
        description: 'Mengupdate iklan: Laptop Gaming',
      },
      {
        action: 'cancel_order',
        description: 'Membatalkan pesanan #ORD-002',
      },
      {
        action: 'complete_order',
        description: 'Menyelesaikan pesanan #ORD-003',
      },
      {
        action: 'login',
        description: 'Login ke sistem',
      },
    ];

    // Create logs for each user
    for (const user of users) {
      for (let i = 0; i < 5; i++) {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        const hoursAgo = Math.floor(Math.random() * 72); // Random time in last 3 days
        
        await db.activityLog.create({
          data: {
            userId: user.userId,
            userEmail: user.email,
            action: activity.action,
            description: activity.description,
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            metadata: {
              timestamp: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
            },
            createdAt: new Date(Date.now() - hoursAgo * 3600000),
          },
        });
      }
    }

    const count = await db.activityLog.count();
    console.log(`✅ Created ${count} activity logs`);

  } catch (error) {
    console.error('❌ Error seeding activity logs:', error);
  } finally {
    await db.$disconnect();
  }
}

seedActivityLogs();
