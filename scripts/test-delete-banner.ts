import { db } from './src/lib/db';
import { checkUserRole } from './src/lib/auth/checkRole';

async function testDeleteBanner() {
  try {
    const userId = '6f15b3c4-2ad2-4cd8-af17-fc51e70bb673';
    
    console.log('1. Checking admin role...');
    const isAdmin = await checkUserRole(userId, 'admin');
    console.log('   Is admin?', isAdmin);
    
    if (!isAdmin) {
      console.error('❌ User is not admin!');
      return;
    }
    
    console.log('\n2. Getting first active banner...');
    const banner = await db.banner.findFirst({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    if (!banner) {
      console.log('❌ No banners found');
      return;
    }
    
    console.log('   Found banner:', banner.id);
    console.log('   Title:', banner.title);
    console.log('   Status:', banner.status);
    
    console.log('\n3. Attempting soft delete...');
    const updated = await db.banner.update({
      where: { id: banner.id },
      data: {
        deletedAt: new Date(),
        status: 'expired',
      },
    });
    
    console.log('✅ Banner deleted successfully!');
    console.log('   Deleted at:', updated.deletedAt);
    console.log('   Status:', updated.status);
    
    console.log('\n4. Verifying deletion...');
    const check = await db.banner.findUnique({
      where: { id: banner.id },
    });
    
    console.log('   Banner still exists:', !!check);
    console.log('   DeletedAt:', check?.deletedAt);
    console.log('   Status:', check?.status);
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
  }
}

testDeleteBanner();
