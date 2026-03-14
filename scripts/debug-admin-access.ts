import { db } from './src/lib/db.ts';

async function debugAdminAccess() {
  console.log('='.repeat(60));
  console.log('🔍 DEBUG ADMIN ACCESS');
  console.log('='.repeat(60));
  
  const email = 'itarizvsn@gmail.com';
  
  try {
    // 1. Check if user exists in profiles
    console.log('\n1️⃣ Checking user in profiles table...');
    const profile = await db.profile.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    });
    
    if (!profile) {
      console.log('❌ User NOT FOUND in profiles table!');
      console.log('   Email:', email);
      return;
    }
    
    console.log('✅ User found in profiles:');
    console.log('   User ID:', profile.id);
    console.log('   Email:', profile.email);
    console.log('   Name:', profile.name);
    console.log('   Created:', profile.createdAt);
    
    // 2. Check roles in user_roles table
    console.log('\n2️⃣ Checking roles in user_roles table...');
    const userRoles = await db.userRole.findMany({
      where: { userId: profile.id },
      select: {
        id: true,
        role: true,
        createdAt: true,
      }
    });
    
    if (userRoles.length === 0) {
      console.log('❌ NO ROLES found for this user!');
      console.log('   User ID:', profile.id);
      console.log('   This is the problem - user has no admin role in database');
      return;
    }
    
    console.log(`✅ Found ${userRoles.length} role(s):`);
    userRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. Role: ${role.role}`);
      console.log(`      ID: ${role.id}`);
      console.log(`      Assigned: ${role.createdAt}`);
    });
    
    // 3. Check specifically for admin role
    console.log('\n3️⃣ Checking for ADMIN role...');
    const adminRole = userRoles.find(r => r.role === 'admin');
    
    if (!adminRole) {
      console.log('❌ ADMIN role NOT FOUND!');
      console.log('   Available roles:', userRoles.map(r => r.role).join(', '));
      console.log('   Need to assign admin role to this user');
      return;
    }
    
    console.log('✅ ADMIN role found:');
    console.log('   Role ID:', adminRole.id);
    console.log('   Assigned at:', adminRole.createdAt);
    
    // 4. Test checkUserRole function
    console.log('\n4️⃣ Testing checkUserRole function...');
    const { checkUserRole } = await import('./src/lib/auth/checkRole.ts');
    const isAdmin = await checkUserRole(profile.id, 'admin');
    
    console.log('   checkUserRole result:', isAdmin ? '✅ TRUE' : '❌ FALSE');
    
    if (!isAdmin) {
      console.log('   ⚠️ Function returned false even though role exists in DB!');
      console.log('   This indicates a problem with the checkUserRole function');
    }
    
    // 5. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log('User exists:', profile ? '✅' : '❌');
    console.log('Has roles:', userRoles.length > 0 ? '✅' : '❌');
    console.log('Has admin role:', adminRole ? '✅' : '❌');
    console.log('Function check:', isAdmin ? '✅' : '❌');
    
    if (profile && adminRole && isAdmin) {
      console.log('\n✅ Everything looks good in database!');
      console.log('   Problem might be:');
      console.log('   1. User session is cached (need to logout/login)');
      console.log('   2. API endpoint not being called correctly');
      console.log('   3. Browser cache issue');
    } else {
      console.log('\n❌ Found issues that need to be fixed!');
    }
    
  } catch (error) {
    console.error('\n❌ Error during debug:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
  } finally {
    await db.$disconnect();
  }
}

debugAdminAccess();
