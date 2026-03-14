import { db } from '@/lib/db';

/**
 * Script untuk assign role admin ke user yang sudah login dengan Google
 * 
 * CARA PAKAI:
 * 1. Login dulu dengan Google OAuth di website
 * 2. Cek email Anda di database
 * 3. Jalankan script ini dengan email Anda
 * 
 * Contoh: npx tsx scripts/create-admin-from-google.ts your-email@gmail.com
 */

async function assignAdminRole() {
  const email = process.argv[2];

  if (!email) {
    console.log('❌ Error: Email tidak diberikan\n');
    console.log('📝 Cara pakai:');
    console.log('   npx tsx scripts/create-admin-from-google.ts your-email@gmail.com\n');
    console.log('💡 Langkah-langkah:');
    console.log('   1. Login dulu dengan Google OAuth di http://localhost:3000/auth');
    console.log('   2. Setelah login, jalankan script ini dengan email Google Anda');
    console.log('   3. Refresh halaman dan Anda akan jadi admin\n');
    process.exit(1);
  }

  try {
    console.log(`🔍 Mencari user dengan email: ${email}\n`);

    // Find user by email
    const user = await db.profile.findFirst({
      where: { email },
      include: { userRoles: true },
    });

    if (!user) {
      console.log('❌ User tidak ditemukan!\n');
      console.log('💡 Pastikan Anda sudah login dengan Google OAuth terlebih dahulu.');
      console.log('   Kunjungi: http://localhost:3000/auth\n');
      
      // Show all users
      const allUsers = await db.profile.findMany({
        select: { email: true, name: true },
        take: 10,
      });
      
      if (allUsers.length > 0) {
        console.log('📋 User yang tersedia:');
        allUsers.forEach(u => {
          console.log(`   - ${u.email} (${u.name || 'No name'})`);
        });
        console.log('');
      }
      
      process.exit(1);
    }

    console.log(`✅ User ditemukan:`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   User ID: ${user.userId}`);
    console.log(`   Current roles: ${user.userRoles.map(r => r.role).join(', ') || 'none'}\n`);

    // Check if already admin
    const hasAdminRole = user.userRoles.some(r => r.role === 'admin');
    
    if (hasAdminRole) {
      console.log('✅ User sudah memiliki role admin!\n');
      process.exit(0);
    }

    // Assign admin role
    console.log('🔧 Menambahkan role admin...\n');
    
    await db.userRole.create({
      data: {
        userId: user.userId,
        role: 'admin',
        assignedBy: 'system',
      },
    });

    console.log('✅ Role admin berhasil ditambahkan!\n');
    console.log('🎉 Sekarang Anda bisa akses admin panel di:');
    console.log('   http://localhost:3000/admin\n');
    console.log('💡 Refresh halaman jika Anda sudah login.\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

assignAdminRole();
