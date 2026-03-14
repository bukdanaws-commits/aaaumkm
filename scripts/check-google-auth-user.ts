import { db } from './src/lib/db.ts';

async function checkGoogleAuthUser() {
  console.log('='.repeat(60));
  console.log('🔍 CHECK GOOGLE AUTH USER');
  console.log('='.repeat(60));
  
  const email = 'itarizvsn@gmail.com';
  
  try {
    // 1. Find all profiles with this email
    console.log('\n1️⃣ Finding all profiles with email:', email);
    const profiles = await db.profile.findMany({
      where: { email },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (profiles.length === 0) {
      console.log('❌ No profiles found!');
      return;
    }
    
    console.log(`✅ Found ${profiles.length} profile(s):`);
    profiles.forEach((profile, index) => {
      console.log(`\n   Profile ${index + 1}:`);
      console.log('   - Profile ID (CUID):', profile.id);
      console.log('   - User ID (UUID):', profile.userId);
      console.log('   - Email:', profile.email);
      console.log('   - Name:', profile.name);
      console.log('   - Created:', profile.createdAt);
    });
    
    // 2. Check roles for each profile
    console.log('\n2️⃣ Checking roles for each profile...');
    
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      console.log(`\n   Profile ${i + 1} (${profile.userId}):`);
      
      const roles = await db.userRole.findMany({
        where: { userId: profile.userId },
        select: {
          id: true,
          role: true,
          createdAt: true,
        }
      });
      
      if (roles.length === 0) {
        console.log('   ❌ No roles found');
      } else {
        console.log(`   ✅ Found ${roles.length} role(s):`);
        roles.forEach(role => {
          console.log(`      - ${role.role} (assigned: ${role.createdAt})`);
        });
      }
    }
    
    // 3. Find the profile that should have admin role
    console.log('\n3️⃣ Determining which profile to use...');
    
    // Check if any profile already has admin role
    let adminProfile = null;
    for (const profile of profiles) {
      const hasAdmin = await db.userRole.findFirst({
        where: {
          userId: profile.userId,
          role: 'admin'
        }
      });
      
      if (hasAdmin) {
        adminProfile = profile;
        console.log('   ✅ Found profile with admin role:');
        console.log('      User ID:', profile.userId);
        console.log('      Profile ID:', profile.id);
        break;
      }
    }
    
    if (!adminProfile) {
      // Use the most recent profile (likely the Google auth one)
      adminProfile = profiles[0];
      console.log('   ⚠️ No profile has admin role yet');
      console.log('   📌 Will use most recent profile:');
      console.log('      User ID:', adminProfile.userId);
      console.log('      Profile ID:', adminProfile.id);
      console.log('      Created:', adminProfile.createdAt);
    }
    
    // 4. Assign admin role if needed
    console.log('\n4️⃣ Checking if admin role needs to be assigned...');
    
    const existingAdmin = await db.userRole.findFirst({
      where: {
        userId: adminProfile.userId,
        role: 'admin'
      }
    });
    
    if (existingAdmin) {
      console.log('   ✅ Admin role already exists!');
      console.log('      Role ID:', existingAdmin.id);
      console.log('      Assigned:', existingAdmin.createdAt);
    } else {
      console.log('   ⚠️ Admin role NOT found, assigning now...');
      
      const newRole = await db.userRole.create({
        data: {
          userId: adminProfile.userId,
          role: 'admin',
          assignedBy: adminProfile.userId,
        }
      });
      
      console.log('   ✅ Admin role assigned!');
      console.log('      Role ID:', newRole.id);
      console.log('      User ID:', newRole.userId);
      console.log('      Assigned:', newRole.createdAt);
    }
    
    // 5. Verify with checkUserRole function
    console.log('\n5️⃣ Verifying with checkUserRole function...');
    const { checkUserRole } = await import('./src/lib/auth/checkRole.ts');
    const isAdmin = await checkUserRole(adminProfile.userId, 'admin');
    
    console.log('   Result:', isAdmin ? '✅ TRUE' : '❌ FALSE');
    
    // 6. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log('Email:', email);
    console.log('Total profiles:', profiles.length);
    console.log('Active profile User ID:', adminProfile.userId);
    console.log('Has admin role:', isAdmin ? '✅ YES' : '❌ NO');
    
    if (isAdmin) {
      console.log('\n✅ SUCCESS!');
      console.log('Admin role is assigned to the correct user.');
      console.log('\nNext steps:');
      console.log('1. Logout dari aplikasi (Google account)');
      console.log('2. Clear browser cache & cookies');
      console.log('3. Close all browser tabs');
      console.log('4. Open new browser window (or Incognito)');
      console.log('5. Login kembali dengan Google account');
      console.log('6. Admin Panel Card akan muncul di dashboard');
    } else {
      console.log('\n❌ FAILED!');
      console.log('Something went wrong with role assignment.');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
  } finally {
    await db.$disconnect();
  }
}

checkGoogleAuthUser();
