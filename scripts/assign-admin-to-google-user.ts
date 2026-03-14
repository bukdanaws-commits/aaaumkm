import { db } from './src/lib/db.ts';

async function assignAdminToGoogleUser() {
  console.log('='.repeat(60));
  console.log('🔧 ASSIGN ADMIN TO GOOGLE AUTH USER');
  console.log('='.repeat(60));
  
  const email = 'itarizvsn@gmail.com';
  
  try {
    // 1. Find the most recent profile (Google auth)
    console.log('\n1️⃣ Finding Google auth profile...');
    const profiles = await db.profile.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    
    if (profiles.length === 0) {
      console.log('❌ No profile found!');
      return;
    }
    
    const googleProfile = profiles[0];
    console.log('✅ Found Google auth profile:');
    console.log('   User ID:', googleProfile.userId);
    console.log('   Profile ID:', googleProfile.id);
    console.log('   Email:', googleProfile.email);
    console.log('   Name:', googleProfile.name);
    console.log('   Created:', googleProfile.createdAt);
    
    // 2. Check if admin role already exists
    console.log('\n2️⃣ Checking existing roles...');
    const existingRoles = await db.userRole.findMany({
      where: { userId: googleProfile.userId },
    });
    
    console.log(`   Found ${existingRoles.length} existing role(s)`);
    existingRoles.forEach(role => {
      console.log(`   - ${role.role}`);
    });
    
    const hasAdmin = existingRoles.some(r => r.role === 'admin');
    
    if (hasAdmin) {
      console.log('\n✅ Admin role already exists!');
      return;
    }
    
    // 3. Assign admin role
    console.log('\n3️⃣ Assigning admin role to Google auth user...');
    const adminRole = await db.userRole.create({
      data: {
        userId: googleProfile.userId,
        role: 'admin',
        assignedBy: googleProfile.userId,
      }
    });
    
    console.log('✅ Admin role assigned successfully!');
    console.log('   Role ID:', adminRole.id);
    console.log('   User ID:', adminRole.userId);
    console.log('   Role:', adminRole.role);
    console.log('   Assigned at:', adminRole.createdAt);
    
    // 4. Verify
    console.log('\n4️⃣ Verifying...');
    const { checkUserRole } = await import('./src/lib/auth/checkRole.ts');
    const isAdmin = await checkUserRole(googleProfile.userId, 'admin');
    
    console.log('   checkUserRole result:', isAdmin ? '✅ TRUE' : '❌ FALSE');
    
    // 5. Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS!');
    console.log('='.repeat(60));
    console.log('Admin role has been assigned to Google auth user:');
    console.log('Email:', email);
    console.log('User ID:', googleProfile.userId);
    console.log('Name:', googleProfile.name);
    console.log('\n📋 NEXT STEPS:');
    console.log('='.repeat(60));
    console.log('');
    console.log('PILIHAN 1: Incognito Mode (Tercepat)');
    console.log('--------------------------------------');
    console.log('1. Tekan Ctrl + Shift + N (Chrome/Edge)');
    console.log('2. Buka: http://localhost:3000/auth');
    console.log('3. Klik "Login dengan Google"');
    console.log('4. Pilih akun:', email);
    console.log('5. Setelah login, lihat dashboard');
    console.log('6. Admin Panel Card akan muncul!');
    console.log('7. Klik "Buka Admin Panel"');
    console.log('');
    console.log('PILIHAN 2: Clear Cache (Permanent)');
    console.log('-----------------------------------');
    console.log('1. Logout dari aplikasi');
    console.log('2. Tekan Ctrl + Shift + Delete');
    console.log('3. Clear "Cookies" dan "Cache"');
    console.log('4. Time range: "All time"');
    console.log('5. Close all browser tabs');
    console.log('6. Open new browser');
    console.log('7. Login dengan Google account');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
  } finally {
    await db.$disconnect();
  }
}

assignAdminToGoogleUser();
