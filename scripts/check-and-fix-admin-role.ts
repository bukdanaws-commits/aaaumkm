import { db } from './src/lib/db';

async function checkAndFixAdminRole() {
  try {
    // Get user with email itarizvsn@gmail.com
    const user = await db.user.findFirst({
      where: {
        email: 'itarizvsn@gmail.com',
      },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✓ User found: ${user.email}`);
    console.log(`  ID: ${user.id}`);

    // Check if user has admin role
    const adminRole = await db.userRole.findFirst({
      where: {
        userId: user.id,
        role: 'admin',
      },
    });

    if (adminRole) {
      console.log('✓ User already has admin role');
    } else {
      console.log('⚠ User does NOT have admin role');
      console.log('Creating admin role...');
      
      await db.userRole.create({
        data: {
          userId: user.id,
          role: 'admin',
        },
      });

      console.log('✅ Admin role created successfully!');
    }

    // Show all roles for this user
    const allRoles = await db.userRole.findMany({
      where: { userId: user.id },
    });

    console.log(`\nAll roles for ${user.email}:`);
    allRoles.forEach(r => {
      console.log(`  - ${r.role}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkAndFixAdminRole();
