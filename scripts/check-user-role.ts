import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserRole() {
  try {
    const email = 'itarizvsn@gmail.com';
    
    console.log(`\n🔍 Mencari user dengan email: ${email}\n`);
    
    // Find profile by email
    const profile = await prisma.profile.findFirst({
      where: { email },
      include: {
        userRoles: true,
      },
    });

    if (!profile) {
      console.log('❌ User tidak ditemukan');
      return;
    }

    console.log('✅ User ditemukan:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${profile.email}`);
    console.log(`👤 Nama: ${profile.name || 'Belum diisi'}`);
    console.log(`🆔 User ID: ${profile.userId}`);
    console.log(`📱 Phone: ${profile.phone || 'Belum diisi'}`);
    console.log(`✓ Verified: ${profile.isVerified ? 'Ya' : 'Tidak'}`);
    console.log(`✓ KYC Verified: ${profile.isKycVerified ? 'Ya' : 'Tidak'}`);
    console.log(`📅 Dibuat: ${profile.createdAt.toLocaleString('id-ID')}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🎭 ROLES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (profile.userRoles.length === 0) {
      console.log('⚠️  User belum memiliki role yang di-assign');
      console.log('   Default role: "user" (otomatis)');
    } else {
      profile.userRoles.forEach((userRole, index) => {
        console.log(`${index + 1}. Role: ${userRole.role.toUpperCase()}`);
        console.log(`   Assigned By: ${userRole.assignedBy || 'System'}`);
        console.log(`   Assigned At: ${userRole.createdAt.toLocaleString('id-ID')}`);
        console.log('');
      });
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();
