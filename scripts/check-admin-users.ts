import { db } from '@/lib/db';

async function checkAdminUsers() {
  console.log('🔍 Checking admin users in database...\n');

  try {
    // Get all users with their roles
    const usersWithRoles = await db.profile.findMany({
      include: {
        userRoles: true,
      },
      take: 20,
    });

    console.log(`📊 Total users: ${usersWithRoles.length}\n`);

    // Check for admin users
    const adminUsers = usersWithRoles.filter(user => 
      user.userRoles.some(role => role.role === 'admin')
    );

    console.log(`👑 Admin users: ${adminUsers.length}\n`);

    if (adminUsers.length === 0) {
      console.log('❌ NO ADMIN USERS FOUND!\n');
      console.log('📋 All users and their roles:\n');
      
      for (const user of usersWithRoles) {
        console.log(`User: ${user.email || user.name || user.userId}`);
        console.log(`  User ID: ${user.userId}`);
        console.log(`  Roles: ${user.userRoles.map(r => r.role).join(', ') || 'none'}`);
        console.log('');
      }
    } else {
      console.log('✅ Admin users found:\n');
      
      for (const admin of adminUsers) {
        console.log(`👑 Admin: ${admin.email || admin.name || admin.userId}`);
        console.log(`   User ID: ${admin.userId}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Name: ${admin.name || 'N/A'}`);
        console.log(`   Roles: ${admin.userRoles.map(r => r.role).join(', ')}`);
        console.log('');
      }
    }

    // Check auth.users table in Supabase
    console.log('\n📝 Note: Make sure the user exists in Supabase Auth (auth.users table)');
    console.log('   and the userId in profiles table matches the Supabase user ID.\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkAdminUsers();
