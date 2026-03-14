import { db } from './src/lib/db';

async function checkUserProfile() {
  try {
    // Check if User table exists and has data
    const users = await db.user.findMany({
      take: 5,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      }
    });
    
    console.log('Users in database:', users.length);
    users.forEach(u => {
      console.log(`- ${u.username || 'no-username'} (${u.email || 'no-email'})`);
    });
    
    // Check for specific user
    const bandarUser = await db.user.findFirst({
      where: {
        OR: [
          { username: 'bandar-001' },
          { email: { contains: 'bandar' } }
        ]
      }
    });
    
    if (bandarUser) {
      console.log('\nFound bandar-001:', bandarUser);
    } else {
      console.log('\nUser "bandar-001" not found in database');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkUserProfile();
