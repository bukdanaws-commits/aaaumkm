import { db } from './src/lib/db.ts';

async function testAPICheckRole() {
  console.log('='.repeat(60));
  console.log('🧪 TEST API CHECK ROLE LOGIC');
  console.log('='.repeat(60));
  
  const email = 'itarizvsn@gmail.com';
  
  try {
    // 1. Get profile
    console.log('\n1️⃣ Getting profile...');
    const profile = await db.profile.findFirst({
      where: { email },
      select: {
        id: true,
        userId: true,
        email: true,
      }
    });
    
    if (!profile) {
      console.log('❌ Profile not found!');
      return;
    }
    
    console.log('✅ Profile found:');
    console.log('   Profile ID (CUID):', profile.id);
    console.log('   User ID (UUID from Supabase):', profile.userId);
    console.log('   Email:', profile.email);
    
    // 2. Check what Supabase auth returns
    console.log('\n2️⃣ Simulating Supabase auth.getUser()...');
    console.log('   Supabase will return user.id:', profile.userId);
    console.log('   This is the UUID from auth.users table');
    
    // 3. Check roles with userId (what API uses)
    console.log('\n3️⃣ Checking roles with userId (Supabase UUID)...');
    const rolesWithUserId = await db.userRole.findMany({
      where: { userId: profile.userId },
    });
    
    console.log(`   Found ${rolesWithUserId.length} role(s) with userId:`, profile.userId);
    rolesWithUserId.forEach(role => {
      console.log(`   - ${role.role} (ID: ${role.id})`);
    });
    
    // 4. Check roles with profile.id (CUID)
    console.log('\n4️⃣ Checking roles with profile.id (CUID)...');
    const rolesWithProfileId = await db.userRole.findMany({
      where: { userId: profile.id },
    });
    
    console.log(`   Found ${rolesWithProfileId.length} role(s) with profile.id:`, profile.id);
    rolesWithProfileId.forEach(role => {
      console.log(`   - ${role.role} (ID: ${role.id})`);
    });
    
    // 5. Test checkUserRole function with both IDs
    console.log('\n5️⃣ Testing checkUserRole function...');
    const { checkUserRole } = await import('./src/lib/auth/checkRole.ts');
    
    console.log('   Testing with userId (UUID):', profile.userId);
    const isAdminWithUserId = await checkUserRole(profile.userId, 'admin');
    console.log('   Result:', isAdminWithUserId ? '✅ TRUE' : '❌ FALSE');
    
    console.log('\n   Testing with profile.id (CUID):', profile.id);
    const isAdminWithProfileId = await checkUserRole(profile.id, 'admin');
    console.log('   Result:', isAdminWithProfileId ? '✅ TRUE' : '❌ FALSE');
    
    // 6. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log('Profile ID (CUID):', profile.id);
    console.log('User ID (UUID):', profile.userId);
    console.log('Roles with UUID:', rolesWithUserId.length);
    console.log('Roles with CUID:', rolesWithProfileId.length);
    console.log('checkUserRole(UUID):', isAdminWithUserId ? '✅' : '❌');
    console.log('checkUserRole(CUID):', isAdminWithProfileId ? '✅' : '❌');
    
    if (rolesWithUserId.length > 0 && isAdminWithUserId) {
      console.log('\n✅ Everything is correct!');
      console.log('   API should work properly');
      console.log('   Problem might be browser cache or session');
    } else {
      console.log('\n❌ Found the problem!');
      if (rolesWithUserId.length === 0) {
        console.log('   No roles found with UUID');
        console.log('   Need to assign role with correct userId');
      }
      if (!isAdminWithUserId) {
        console.log('   checkUserRole function not working correctly');
      }
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

testAPICheckRole();
