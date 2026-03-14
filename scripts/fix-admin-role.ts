import { db } from './src/lib/db';

async function fixAdminRole() {
  try {
    const userId = '6f15b3c4-2ad2-4cd8-af17-fc51e70bb673';
    const email = 'itarizvsn@gmail.com';

    console.log(`Checking admin role for user: ${email}`);
    console.log(`User ID: ${userId}`);

    // Check if user has admin role
    const adminRole = await db.userRole.findFirst({
      where: {
        userId: userId,
        role: 'admin',
      },
    });

    if (adminRole) {
      console.log('✓ User already has admin role');
      console.log(`  Role ID: ${adminRole.id}`);
    } else {
      console.log('⚠ User does NOT have admin role');
      console.log('Creating admin role...');
      
      const newRole = await db.userRole.create({
        data: {
          userId: userId,
          role: 'admin',
        },
      });

      console.log('✅ Admin role created successfully!');
      console.log(`  Role ID: ${newRole.id}`);
    }

    // Show all roles for this user
    const allRoles = await db.userRole.findMany({
      where: { userId: userId },
    });

    console.log(`\nAll roles for ${email}:`);
    if (allRoles.length === 0) {
      console.log('  (no roles found)');
    } else {
      allRoles.forEach(r => {
        console.log(`  - ${r.role} (ID: ${r.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAdminRole();
