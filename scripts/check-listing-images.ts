import { db } from '@/lib/db';

async function checkListingImages() {
  console.log('🖼️  Checking listing images...\n');

  try {
    const listings = await db.listing.findMany({
      where: { status: 'active' },
      include: {
        images: true,
        category: {
          select: { name: true },
        },
      },
      take: 10,
    });

    console.log(`Found ${listings.length} active listings\n`);

    for (const listing of listings) {
      console.log(`📦 ${listing.title}`);
      console.log(`   Category: ${listing.category?.name || 'N/A'}`);
      console.log(`   Price: Rp ${listing.price.toLocaleString('id-ID')}`);
      console.log(`   Images: ${listing.images.length} total`);
      
      if (listing.images.length > 0) {
        const primaryImage = listing.images.find(img => img.isPrimary);
        if (primaryImage) {
          console.log(`   Primary Image: ${primaryImage.imageUrl.substring(0, 80)}...`);
        } else {
          console.log(`   ⚠️  No primary image set`);
          console.log(`   First Image: ${listing.images[0].imageUrl.substring(0, 80)}...`);
        }
      } else {
        console.log(`   ⚠️  NO IMAGES`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkListingImages();
