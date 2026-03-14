import { db } from './src/lib/db.ts';

async function assignAdminToCorrectUser() {
  console.log('='.repeat(60));
  console.log('🔧 ASSIGN ADMIN ROLE TO CORRECT USER');
  console.log('='.repeat(60));
  
  const email = 'itarizvsn@gmail.com';
  
  try {
    // 1. Find user
    console.log('\n1️⃣ Finding user...');
    const profile = await db.profile.findFirst({
      where: { email },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
      }
    });
    
    if (!profile) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('✅ User found:');
    console.log('   Profile ID:', profile.id);
    console.log('   User ID:', profile.userId);
    console.log('   Email:', profile.email);
    console.log('   Name:', profile.name);
    
    // 2. Check existing roles
    console.log('\n2️⃣ Checking existing roles...');
    const existingRoles = await db.userRole.findMany({
      where: { userId: profile.userId },
    });
    
    console.log(`   Found ${existingRoles.length} existing role(s)`);
    existingRoles.forEach(role => {
      console.log(`   - ${role.role}`);
    });
    
    // 3. Check if admin role already exists
    const hasAdmin = existingRoles.some(r => r.role === 'admin');
    
    if (hasAdmin) {
      console.log('\n✅ User already has admin role!');
      return;
    }
    
    // 4. Assign admin role
    console.log('\n3️⃣ Assigning admin role...');
    const adminRole = await db.userRole.create({
      data: {
        userId: profile.userId,
        role: 'admin',
        assignedBy: profile.userId, // Self-assigned
      }
    });
    
    console.log('✅ Admin role assigned successfully!');
    console.log('   Role ID:', adminRole.id);
    console.log('   User ID:', adminRole.userId);
    console.log('   Role:', adminRole.role);
    console.log('   Assigned at:', adminRole.createdAt);
    
    // 5. Verify
    console.log('\n4️⃣ Verifying...');
    const { checkUserRole } = await import('./src/lib/auth/checkRole.ts');
    const isAdmin = await checkUserRole(profile.userId, 'admin');
    
    console.log('   checkUserRole result:', isAdmin ? '✅ TRUE' : '❌ FALSE');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS!');
    console.log('='.repeat(60));
    console.log('Admin role has been assigned to:', email);
    console.log('User ID:', profile.userId);
    console.log('\nNext steps:');
    console.log('1. Logout dari aplikasi');
    console.log('2. Clear browser cache/cookies');
    console.log('3. Login kembali dengan', email);
    console.log('4. Admin Panel Card akan muncul di dashboard');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
  } finally {
    await db.$disconnect();
  }
}

assignAdminToCorrectUser();
