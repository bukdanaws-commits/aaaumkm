import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignRole() {
  try {
    // Configuration
    const email = 'itarizvsn@gmail.com';
    const roleToAssign: 'admin' | 'penjual' = 'admin'; // Ganti dengan 'penjual' jika ingin assign role penjual
    
    console.log(`\n🔄 Assigning role "${roleToAssign}" to ${email}...\n`);
    
    // Find user by email
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

    // Check if role already exists
    const existingRole = profile.userRoles.find(r => r.role === roleToAssign);
    
    if (existingRole) {
      console.log(`⚠️  User sudah memiliki role "${roleToAssign}"`);
      console.log(`   Assigned at: ${existingRole.createdAt.toLocaleString('id-ID')}`);
      return;
    }

    // Assign new role
    const newRole = await prisma.userRole.create({
      data: {
        userId: profile.userId,
        role: roleToAssign,
        assignedBy: 'system',
      },
    });

    console.log('✅ Role berhasil di-assign!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${profile.email}`);
    console.log(`👤 Nama: ${profile.name}`);
    console.log(`🎭 Role Baru: ${newRole.role.toUpperCase()}`);
    console.log(`📅 Assigned At: ${newRole.createdAt.toLocaleString('id-ID')}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Show all roles
    const updatedProfile = await prisma.profile.findFirst({
      where: { email },
      include: {
        userRoles: true,
      },
    });

    console.log('\n📋 Semua Role User:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (updatedProfile?.userRoles.length === 0) {
      console.log('- USER (default)');
    } else {
      console.log('- USER (default)');
      updatedProfile?.userRoles.forEach((role) => {
        console.log(`- ${role.role.toUpperCase()}`);
      });
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (roleToAssign === 'admin') {
      console.log('🎉 User sekarang bisa akses Admin Panel di /admin');
    } else if (roleToAssign === 'penjual') {
      console.log('🎉 User sekarang memiliki akses fitur Penjual');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignRole();
