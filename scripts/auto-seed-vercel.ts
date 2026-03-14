/**
 * Auto Seed Script for Vercel Deployment
 * 
 * This script automatically seeds the production database after deployment.
 * It runs as part of the build process and is safe to run multiple times.
 * 
 * FEATURES:
 * - Checks if database is already seeded (prevents duplicates)
 * - Only seeds if database is empty
 * - Safe to run multiple times
 * - Logs all operations for debugging
 * 
 * USAGE:
 * This script is automatically called by the postbuild script in package.json
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function autoSeedVercel() {
  console.log('\n🌱 Auto-Seed for Vercel Deployment');
  console.log('═'.repeat(60));
  console.log('');

  try {
    // Check connection
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected successfully\n');

    // Check if already seeded
    console.log('🔍 Checking if database needs seeding...');
    const listingCount = await prisma.listing.count();
    const categoryCount = await prisma.category.count();
    const userCount = await prisma.profile.count();

    console.log(`   Listings: ${listingCount}`);
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Users: ${userCount}`);
    console.log('');

    if (listingCount > 0 || categoryCount > 0 || userCount > 0) {
      console.log('✅ Database already has data - skipping seed');
      console.log('   (This is normal for redeployments)\n');
      return;
    }

    console.log('🚀 Database is empty - starting seed process...\n');

    // Seed minimal data for production
    await seedMinimalData();

    console.log('');
    console.log('═'.repeat(60));
    console.log('🎉 Auto-seed completed successfully!');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Auto-seed error:', error);
    console.error('');
    console.error('⚠️  This is not critical - deployment will continue');
    console.error('   You can manually seed later using:');
    console.error('   DATABASE_URL="..." npx tsx scripts/seed-production.ts');
    console.error('');
    // Don't throw - allow deployment to continue even if seed fails
  } finally {
    await prisma.$disconnect();
  }
}

async function seedMinimalData() {
  // ============================================
  // CATEGORIES
  // ============================================
  console.log('📂 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        id: 'cat-electronics',
        name: 'Elektronik',
        slug: 'elektronik',
        description: 'Perangkat elektronik dan gadget',
        sortOrder: 1,
        isActive: true,
        isFeatured: true,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-fashion',
        name: 'Fashion',
        slug: 'fashion',
        description: 'Pakaian, sepatu, dan aksesoris',
        sortOrder: 2,
        isActive: true,
        isFeatured: true,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-property',
        name: 'Properti',
        slug: 'properti',
        description: 'Rumah, tanah, dan properti komersial',
        sortOrder: 3,
        isActive: true,
        isFeatured: true,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-vehicle',
        name: 'Kendaraan',
        slug: 'kendaraan',
        description: 'Mobil, motor, dan kendaraan lainnya',
        sortOrder: 4,
        isActive: true,
        isFeatured: true,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-food',
        name: 'Makanan & Minuman',
        slug: 'makanan-minuman',
        description: 'Produk kuliner dan minuman',
        sortOrder: 5,
        isActive: true,
        isFeatured: false,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-handmade',
        name: 'Handmade & Craft',
        slug: 'handmade-craft',
        description: 'Produk kerajinan tangan dan handmade',
        sortOrder: 6,
        isActive: true,
        isFeatured: true,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-umkm',
        name: 'UMKM',
        slug: 'umkm',
        description: 'Produk dari pelaku UMKM Indonesia',
        sortOrder: 7,
        isActive: true,
        isFeatured: true,
      },
    }),
  ]);
  console.log(`✅ Created ${categories.length} categories\n`);

  // ============================================
  // USERS
  // ============================================
  console.log('👥 Creating users...');
  
  // Admin user
  const adminProfile = await prisma.profile.create({
    data: {
      id: 'user-admin',
      userId: 'admin-001',
      email: 'admin@marketplace.com',
      name: 'Admin Marketplace',
      phone: '081234567890',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      provinceId: '31',
      regencyId: '3171',
      isVerified: true,
      isKycVerified: true,
    },
  });
  
  await prisma.userRole.create({
    data: {
      userId: adminProfile.userId,
      role: 'admin',
    },
  });

  // Seller users
  const seller1 = await prisma.profile.create({
    data: {
      id: 'user-seller1',
      userId: 'seller-001',
      email: 'seller1@marketplace.com',
      name: 'Toko Elektronik Jaya',
      phone: '081234567891',
      bio: 'Toko elektronik terpercaya sejak 2010',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      provinceId: '31',
      regencyId: '3171',
      isVerified: true,
      isKycVerified: true,
    },
  });
  
  await prisma.userRole.create({
    data: {
      userId: seller1.userId,
      role: 'penjual',
    },
  });

  const seller2 = await prisma.profile.create({
    data: {
      id: 'user-seller2',
      userId: 'seller-002',
      email: 'seller2@marketplace.com',
      name: 'Fashion Store ID',
      phone: '081234567892',
      bio: 'Fashion trend terkini dengan harga terbaik',
      city: 'Bandung',
      province: 'Jawa Barat',
      provinceId: '32',
      regencyId: '3273',
      isVerified: true,
      isKycVerified: true,
    },
  });
  
  await prisma.userRole.create({
    data: {
      userId: seller2.userId,
      role: 'penjual',
    },
  });

  console.log('✅ Created 3 users (1 admin, 2 sellers)\n');

  // ============================================
  // LISTINGS
  // ============================================
  console.log('📦 Creating listings...');
  
  const listingData = [
    {
      userId: seller1.userId,
      categoryId: 'cat-electronics',
      title: 'iPhone 15 Pro Max 256GB',
      price: 21999000,
      city: 'Jakarta',
      condition: 'new' as const,
    },
    {
      userId: seller1.userId,
      categoryId: 'cat-electronics',
      title: 'MacBook Pro M3 14 inch',
      price: 32999000,
      city: 'Jakarta',
      condition: 'new' as const,
    },
    {
      userId: seller1.userId,
      categoryId: 'cat-electronics',
      title: 'Samsung Galaxy S24 Ultra',
      price: 19999000,
      city: 'Jakarta',
      condition: 'new' as const,
    },
    {
      userId: seller2.userId,
      categoryId: 'cat-fashion',
      title: 'Kemeja Batik Premium Pria',
      price: 350000,
      city: 'Bandung',
      condition: 'new' as const,
    },
    {
      userId: seller2.userId,
      categoryId: 'cat-fashion',
      title: 'Dress Wanita Elegant',
      price: 450000,
      city: 'Bandung',
      condition: 'new' as const,
    },
    {
      userId: seller2.userId,
      categoryId: 'cat-fashion',
      title: 'Sepatu Sneakers Original',
      price: 1250000,
      city: 'Bandung',
      condition: 'new' as const,
    },
    {
      userId: seller1.userId,
      categoryId: 'cat-vehicle',
      title: 'Honda CBR 150R 2023',
      price: 35000000,
      city: 'Jakarta',
      condition: 'new' as const,
    },
    {
      userId: seller2.userId,
      categoryId: 'cat-handmade',
      title: 'Tas Rotan Handmade Premium',
      price: 275000,
      city: 'Bandung',
      condition: 'new' as const,
    },
    {
      userId: seller1.userId,
      categoryId: 'cat-umkm',
      title: 'Kopi Arabika Premium 1kg',
      price: 180000,
      city: 'Jakarta',
      condition: 'new' as const,
    },
    {
      userId: seller2.userId,
      categoryId: 'cat-umkm',
      title: 'Batik Tulis Madura Asli',
      price: 850000,
      city: 'Bandung',
      condition: 'new' as const,
    },
  ];

  for (const item of listingData) {
    const listing = await prisma.listing.create({
      data: {
        ...item,
        slug: item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: `Deskripsi lengkap untuk ${item.title}. Produk berkualitas dengan garansi resmi.`,
        priceType: 'fixed',
        listingType: 'sale',
        status: 'active',
        province: item.city === 'Jakarta' ? 'DKI Jakarta' : 'Jawa Barat',
        viewCount: Math.floor(Math.random() * 100) + 10,
        clickCount: Math.floor(Math.random() * 50) + 5,
        isFeatured: Math.random() > 0.5,
        publishedAt: new Date(),
      },
    });

    // Add primary image
    await prisma.listingImage.create({
      data: {
        listingId: listing.id,
        imageUrl: `https://picsum.photos/seed/${listing.id}/600/400`,
        isPrimary: true,
        sortOrder: 1,
      },
    });
  }

  console.log(`✅ Created ${listingData.length} listings\n`);

  // ============================================
  // SPONSORS
  // ============================================
  console.log('🏢 Creating sponsors...');
  
  const sponsors = [
    {
      name: 'Bank Indonesia',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Logo_Bank_Indonesia.svg/320px-Logo_Bank_Indonesia.svg.png',
      websiteUrl: 'https://www.bi.go.id',
      sortOrder: 1,
    },
    {
      name: 'OJK',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Logo_Otoritas_Jasa_Keuangan.svg/320px-Logo_Otoritas_Jasa_Keuangan.svg.png',
      websiteUrl: 'https://www.ojk.go.id',
      sortOrder: 2,
    },
    {
      name: 'Danantara Indonesia',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Logo_Danantara.svg/320px-Logo_Danantara.svg.png',
      websiteUrl: 'https://danantara.co.id',
      sortOrder: 3,
    },
    {
      name: 'BUMN Untuk Indonesia',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Logo_BUMN.svg/320px-Logo_BUMN.svg.png',
      websiteUrl: 'https://bumn.go.id',
      sortOrder: 4,
    },
    {
      name: 'Kementerian UMKM',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Logo_Kementerian_Koperasi_dan_UKM_Republik_Indonesia.svg/320px-Logo_Kementerian_Koperasi_dan_UKM_Republik_Indonesia.svg.png',
      websiteUrl: 'https://kemenkopukm.go.id',
      sortOrder: 5,
    },
    {
      name: 'Pertamina',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Pertamina_Logo.svg/320px-Pertamina_Logo.svg.png',
      websiteUrl: 'https://www.pertamina.com',
      sortOrder: 6,
    },
    {
      name: 'BNI',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/320px-BNI_logo.svg.png',
      websiteUrl: 'https://www.bni.co.id',
      sortOrder: 7,
    },
    {
      name: 'PLN',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/PLN_logo.svg/320px-PLN_logo.svg.png',
      websiteUrl: 'https://www.pln.co.id',
      sortOrder: 8,
    },
    {
      name: 'KAI',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/KAI_logo.svg/320px-KAI_logo.svg.png',
      websiteUrl: 'https://www.kai.id',
      sortOrder: 9,
    },
  ];

  for (const sponsor of sponsors) {
    await prisma.sponsor.create({
      data: {
        name: sponsor.name,
        logoUrl: sponsor.logoUrl,
        website: sponsor.websiteUrl,
        sortOrder: sponsor.sortOrder,
        isActive: true,
      },
    });
  }

  console.log(`✅ Created ${sponsors.length} sponsors\n`);
}

// Run if called directly
if (require.main === module) {
  autoSeedVercel()
    .then(() => {
      console.log('✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(0); // Exit with 0 to not fail the build
    });
}

export { autoSeedVercel };
