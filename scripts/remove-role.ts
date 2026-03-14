import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeRole() {
  try {
    // Configuration
    const email = 'itarizvsn@gmail.com';
    const roleToRemove: 'admin' | 'penjual' = 'admin'; // Ganti dengan 'penjual' jika ingin remove role penjual
    
    console.log(`\n🔄 Removing role "${roleToRemove}" from ${email}...\n`);
    
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

    // Check if role exists
    const existingRole = profile.userRoles.find(r => r.role === roleToRemove);
    
    if (!existingRole) {
      console.log(`⚠️  User tidak memiliki role "${roleToRemove}"`);
      return;
    }

    // Remove role
    await prisma.userRole.delete({
      where: {
        id: existingRole.id,
      },
    });

    console.log('✅ Role berhasil dihapus!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${profile.email}`);
    console.log(`👤 Nama: ${profile.name}`);
    console.log(`🎭 Role Dihapus: ${roleToRemove.toUpperCase()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Show remaining roles
    const updatedProfile = await prisma.profile.findFirst({
      where: { email },
      include: {
        userRoles: true,
      },
    });

    console.log('\n📋 Role yang Tersisa:');
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
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeRole();
