import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAllRoles() {
  try {
    console.log('\n📊 DAFTAR SEMUA USER DENGAN ROLE KHUSUS\n');
    
    // Get all users with roles
    const allRoles = await prisma.userRole.findMany({
      include: {
        profile: true,
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    if (allRoles.length === 0) {
      console.log('⚠️  Belum ada user dengan role khusus (admin/penjual)');
      console.log('   Semua user masih menggunakan role default "USER"\n');
      return;
    }

    // Group by role
    const adminUsers = allRoles.filter(r => r.role === 'admin');
    const penjualUsers = allRoles.filter(r => r.role === 'penjual');

    // Display Admins
    console.log('👑 ADMIN USERS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (adminUsers.length === 0) {
      console.log('   Belum ada admin');
    } else {
      adminUsers.forEach((userRole, index) => {
        console.log(`${index + 1}. ${userRole.profile.name || 'No Name'}`);
        console.log(`   📧 ${userRole.profile.email}`);
        console.log(`   🆔 ${userRole.userId}`);
        console.log(`   📅 Assigned: ${userRole.createdAt.toLocaleString('id-ID')}`);
        console.log(`   👤 By: ${userRole.assignedBy || 'System'}`);
        console.log('');
      });
    }
    console.log('');

    // Display Penjuals
    console.log('🏪 PENJUAL USERS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (penjualUsers.length === 0) {
      console.log('   Belum ada penjual');
    } else {
      penjualUsers.forEach((userRole, index) => {
        console.log(`${index + 1}. ${userRole.profile.name || 'No Name'}`);
        console.log(`   📧 ${userRole.profile.email}`);
        console.log(`   🆔 ${userRole.userId}`);
        console.log(`   📅 Assigned: ${userRole.createdAt.toLocaleString('id-ID')}`);
        console.log(`   👤 By: ${userRole.assignedBy || 'System'}`);
        console.log('');
      });
    }
    console.log('');

    // Summary
    console.log('📈 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Admin: ${adminUsers.length}`);
    console.log(`Total Penjual: ${penjualUsers.length}`);
    console.log(`Total Special Roles: ${allRoles.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Get total users
    const totalUsers = await prisma.profile.count();
    const regularUsers = totalUsers - new Set(allRoles.map(r => r.userId)).size;
    
    console.log('👥 ALL USERS BREAKDOWN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Regular Users (USER only): ${regularUsers}`);
    console.log(`Users with Admin role: ${adminUsers.length}`);
    console.log(`Users with Penjual role: ${penjualUsers.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllRoles();
