import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.bannerEvent.deleteMany();
  await prisma.couponUse.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.ticketReply.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.auctionBid.deleteMany();
  await prisma.listingAuction.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listingBoost.deleteMany();
  await prisma.savedListing.deleteMany();
  await prisma.listingReport.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.sellerReview.deleteMany();
  await prisma.order.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.creditTransaction.deleteMany();
  await prisma.userCredit.deleteMany();
  await prisma.creditTopupRequest.deleteMany();
  await prisma.creditPackage.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.umkmReview.deleteMany();
  await prisma.umkmProfile.deleteMany();
  await prisma.kycDocument.deleteMany();
  await prisma.kycVerification.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.boostType.deleteMany();
  await prisma.platformSetting.deleteMany();
  await prisma.adminLog.deleteMany();
  await prisma.auditLog.deleteMany();

  // ============================================
  // BOOST TYPES
  // ============================================
  console.log('📦 Creating boost types...');
  const boostTypes = await Promise.all([
    prisma.boostType.create({
      data: {
        type: 'highlight',
        name: 'Highlight Listing',
        description: 'Menonjolkan listing dengan warna dan border khusus',
        creditsPerDay: 10,
        multiplier: 1.5,
      },
    }),
    prisma.boostType.create({
      data: {
        type: 'top_search',
        name: 'Top Search Result',
        description: 'Listing muncul di posisi teratas hasil pencarian',
        creditsPerDay: 25,
        multiplier: 2.0,
      },
    }),
    prisma.boostType.create({
      data: {
        type: 'premium',
        name: 'Premium Placement',
        description: 'Tampil di homepage dan kategori premium',
        creditsPerDay: 50,
        multiplier: 3.0,
      },
    }),
  ]);

  // ============================================
  // CATEGORIES
  // ============================================
  console.log('📂 Creating categories...');
  const categories = await Promise.all([
    // Parent categories
    prisma.category.create({
      data: {
        id: 'cat-electronics',
        name: 'Elektronik',
        slug: 'elektronik',
        description: 'Perangkat elektronik dan gadget',
        iconUrl: '/icons/electronics.svg',
        imageBannerUrl: '/banners/electronics.jpg',
        sortOrder: 1,
        isActive: true,
        isFeatured: true,
        keywords: 'elektronik, gadget, hp, laptop, komputer',
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-fashion',
        name: 'Fashion',
        slug: 'fashion',
        description: 'Pakaian, sepatu, dan aksesoris',
        iconUrl: '/icons/fashion.svg',
        imageBannerUrl: '/banners/fashion.jpg',
        sortOrder: 2,
        isActive: true,
        isFeatured: true,
        keywords: 'fashion, baju, sepatu, tas, aksesoris',
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-property',
        name: 'Properti',
        slug: 'properti',
        description: 'Rumah, tanah, dan properti komersial',
        iconUrl: '/icons/property.svg',
        imageBannerUrl: '/banners/property.jpg',
        sortOrder: 3,
        isActive: true,
        isFeatured: true,
        keywords: 'properti, rumah, tanah, apartemen, ruko',
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-vehicle',
        name: 'Kendaraan',
        slug: 'kendaraan',
        description: 'Mobil, motor, dan kendaraan lainnya',
        iconUrl: '/icons/vehicle.svg',
        imageBannerUrl: '/banners/vehicle.jpg',
        sortOrder: 4,
        isActive: true,
        isFeatured: true,
        keywords: 'mobil, motor, kendaraan, sepeda',
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-food',
        name: 'Makanan & Minuman',
        slug: 'makanan-minuman',
        description: 'Produk kuliner dan minuman',
        iconUrl: '/icons/food.svg',
        imageBannerUrl: '/banners/food.jpg',
        sortOrder: 5,
        isActive: true,
        isFeatured: false,
        keywords: 'makanan, minuman, kuliner, snack, kue',
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-handmade',
        name: 'Handmade & Craft',
        slug: 'handmade-craft',
        description: 'Produk kerajinan tangan dan handmade',
        iconUrl: '/icons/handmade.svg',
        imageBannerUrl: '/banners/handmade.jpg',
        sortOrder: 6,
        isActive: true,
        isFeatured: true,
        keywords: 'handmade, craft, kerajinan, custom',
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-service',
        name: 'Jasa',
        slug: 'jasa',
        description: 'Berbagai layanan dan jasa profesional',
        iconUrl: '/icons/service.svg',
        imageBannerUrl: '/banners/service.jpg',
        sortOrder: 7,
        isActive: true,
        isFeatured: false,
        keywords: 'jasa, layanan, servis, profesional',
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-umkm',
        name: 'UMKM',
        slug: 'umkm',
        description: 'Produk dari pelaku UMKM Indonesia',
        iconUrl: '/icons/umkm.svg',
        imageBannerUrl: '/banners/umkm.jpg',
        sortOrder: 8,
        isActive: true,
        isFeatured: true,
        keywords: 'umkm, usaha kecil, produk lokal',
      },
    }),
  ]);

  // Child categories
  await Promise.all([
    prisma.category.create({
      data: {
        name: 'Smartphone',
        slug: 'smartphone',
        description: 'Handphone dan smartphone',
        parentId: 'cat-electronics',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Laptop',
        slug: 'laptop',
        description: 'Laptop dan notebook',
        parentId: 'cat-electronics',
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Komputer',
        slug: 'komputer',
        description: 'PC dan komputer desktop',
        parentId: 'cat-electronics',
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pakaian Pria',
        slug: 'pakaian-pria',
        description: 'Fashion pria',
        parentId: 'cat-fashion',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pakaian Wanita',
        slug: 'pakaian-wanita',
        description: 'Fashion wanita',
        parentId: 'cat-fashion',
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sepatu',
        slug: 'sepatu',
        description: 'Sepatu pria dan wanita',
        parentId: 'cat-fashion',
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Rumah',
        slug: 'rumah',
        description: 'Rumah tinggal',
        parentId: 'cat-property',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Tanah',
        slug: 'tanah',
        description: 'Tanah kavling dan pertanian',
        parentId: 'cat-property',
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Mobil',
        slug: 'mobil',
        description: 'Mobil bekas dan baru',
        parentId: 'cat-vehicle',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Motor',
        slug: 'motor',
        description: 'Motor bekas dan baru',
        parentId: 'cat-vehicle',
        sortOrder: 2,
        isActive: true,
      },
    }),
  ]);

  // ============================================
  // USERS & PROFILES
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
      bio: 'Administrator sistem marketplace',
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

  // Bandar (verified seller) users
  const bandarProfiles = await Promise.all([
    prisma.profile.create({
      data: {
        id: 'user-bandar1',
        userId: 'bandar-001',
        email: 'bandar1@marketplace.com',
        name: 'Toko Elektronik Jaya',
        phone: '081234567891',
        bio: 'Toko elektronik terpercaya sejak 2010',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        provinceId: '31',
        regencyId: '3171',
        isVerified: true,
        isKycVerified: true,
        totalListings: 25,
        activeListings: 20,
        soldCount: 150,
        totalSales: 500000000,
        averageRating: 4.8,
        totalReviews: 120,
      },
    }),
    prisma.profile.create({
      data: {
        id: 'user-bandar2',
        userId: 'bandar-002',
        email: 'bandar2@marketplace.com',
        name: 'Fashion Store ID',
        phone: '081234567892',
        bio: 'Fashion trend terkini dengan harga terbaik',
        city: 'Bandung',
        province: 'Jawa Barat',
        provinceId: '32',
        regencyId: '3273',
        isVerified: true,
        isKycVerified: true,
        totalListings: 50,
        activeListings: 45,
        soldCount: 300,
        totalSales: 750000000,
        averageRating: 4.9,
        totalReviews: 280,
      },
    }),
    prisma.profile.create({
      data: {
        id: 'user-bandar3',
        userId: 'bandar-003',
        email: 'bandar3@marketplace.com',
        name: 'Motor Sport Gallery',
        phone: '081234567893',
        bio: 'Spesialis motor sport dan sparepart',
        city: 'Surabaya',
        province: 'Jawa Timur',
        provinceId: '35',
        regencyId: '3578',
        isVerified: true,
        isKycVerified: true,
        totalListings: 30,
        activeListings: 28,
        soldCount: 80,
        totalSales: 1200000000,
        averageRating: 4.7,
        totalReviews: 65,
      },
    }),
  ]);

  for (const bandar of bandarProfiles) {
    await prisma.userRole.create({
      data: {
        userId: bandar.userId,
        role: 'penjual',
      },
    });
  }

  // Regular users
  const regularProfiles = await Promise.all([
    prisma.profile.create({
      data: {
        id: 'user-regular1',
        userId: 'user-001',
        email: 'user1@example.com',
        name: 'Budi Santoso',
        phone: '081234567894',
        bio: 'Pembeli aktif di marketplace',
        city: 'Yogyakarta',
        province: 'DI Yogyakarta',
        provinceId: '34',
        regencyId: '3471',
        isVerified: true,
        isKycVerified: false,
      },
    }),
    prisma.profile.create({
      data: {
        id: 'user-regular2',
        userId: 'user-002',
        email: 'user2@example.com',
        name: 'Siti Rahayu',
        phone: '081234567895',
        bio: 'Pecinta fashion dan handmade',
        city: 'Semarang',
        province: 'Jawa Tengah',
        provinceId: '33',
        regencyId: '3374',
        isVerified: true,
        isKycVerified: true,
      },
    }),
    prisma.profile.create({
      data: {
        id: 'user-regular3',
        userId: 'user-003',
        email: 'user3@example.com',
        name: 'Ahmad Hidayat',
        phone: '081234567896',
        bio: 'Collector gadget dan elektronik',
        city: 'Medan',
        province: 'Sumatera Utara',
        provinceId: '12',
        regencyId: '1271',
        isVerified: false,
        isKycVerified: false,
      },
    }),
    prisma.profile.create({
      data: {
        id: 'user-regular4',
        userId: 'user-004',
        email: 'user4@example.com',
        name: 'Dewi Lestari',
        phone: '081234567897',
        bio: 'Entrepreneur muda',
        city: 'Bali',
        province: 'Bali',
        provinceId: '51',
        regencyId: '5171',
        isVerified: true,
        isKycVerified: false,
      },
    }),
    prisma.profile.create({
      data: {
        id: 'user-regular5',
        userId: 'user-005',
        email: 'user5@example.com',
        name: 'Rudi Hermawan',
        phone: '081234567898',
        bio: 'Investor properti',
        city: 'Makassar',
        province: 'Sulawesi Selatan',
        provinceId: '73',
        regencyId: '7371',
        isVerified: true,
        isKycVerified: true,
      },
    }),
  ]);

  for (const user of regularProfiles) {
    await prisma.userRole.create({
      data: {
        userId: user.userId,
        role: 'user',
      },
    });
  }

  // ============================================
  // WALLETS
  // ============================================
  console.log('💰 Creating wallets...');
  await Promise.all([
    prisma.wallet.create({
      data: {
        userId: adminProfile.userId,
        balance: 10000000,
        status: 'active',
      },
    }),
    prisma.wallet.create({
      data: {
        userId: bandarProfiles[0].userId,
        balance: 50000000,
        status: 'active',
      },
    }),
    prisma.wallet.create({
      data: {
        userId: bandarProfiles[1].userId,
        balance: 75000000,
        status: 'active',
      },
    }),
    prisma.wallet.create({
      data: {
        userId: bandarProfiles[2].userId,
        balance: 30000000,
        status: 'active',
      },
    }),
    ...regularProfiles.map((user, i) =>
      prisma.wallet.create({
        data: {
          userId: user.userId,
          balance: 500000 + i * 250000,
          status: 'active',
        },
      })
    ),
  ]);

  // ============================================
  // USER CREDITS
  // ============================================
  console.log('💎 Creating user credits...');
  await Promise.all([
    prisma.userCredit.create({
      data: {
        userId: bandarProfiles[0].userId,
        balance: 500,
        totalPurchased: 1000,
        totalUsed: 500,
        totalBonus: 50,
      },
    }),
    prisma.userCredit.create({
      data: {
        userId: bandarProfiles[1].userId,
        balance: 1000,
        totalPurchased: 2000,
        totalUsed: 1000,
        totalBonus: 100,
      },
    }),
    prisma.userCredit.create({
      data: {
        userId: bandarProfiles[2].userId,
        balance: 250,
        totalPurchased: 500,
        totalUsed: 250,
        totalBonus: 25,
      },
    }),
    ...regularProfiles.map((user, i) =>
      prisma.userCredit.create({
        data: {
          userId: user.userId,
          balance: 50 + i * 25,
          totalPurchased: 100 + i * 50,
          totalUsed: 50 + i * 25,
          totalBonus: 10,
        },
      })
    ),
  ]);

  // ============================================
  // CREDIT PACKAGES
  // ============================================
  console.log('📦 Creating credit packages...');
  await Promise.all([
    prisma.creditPackage.create({
      data: {
        name: 'Starter',
        credits: 100,
        price: 50000,
        bonusCredits: 10,
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.creditPackage.create({
      data: {
        name: 'Basic',
        credits: 250,
        price: 100000,
        bonusCredits: 30,
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.creditPackage.create({
      data: {
        name: 'Pro',
        credits: 500,
        price: 175000,
        bonusCredits: 75,
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.creditPackage.create({
      data: {
        name: 'Business',
        credits: 1000,
        price: 300000,
        bonusCredits: 200,
        isActive: true,
        sortOrder: 4,
      },
    }),
    prisma.creditPackage.create({
      data: {
        name: 'Enterprise',
        credits: 2500,
        price: 700000,
        bonusCredits: 500,
        isActive: true,
        sortOrder: 5,
      },
    }),
  ]);

  // ============================================
  // LISTINGS
  // ============================================
  console.log('📝 Creating listings...');
  
  const listingTitles = [
    { title: 'iPhone 15 Pro Max 256GB', catId: 'cat-electronics', price: 21999000, city: 'Jakarta', condition: 'new' },
    { title: 'MacBook Pro M3 14 inch', catId: 'cat-electronics', price: 32999000, city: 'Jakarta', condition: 'new' },
    { title: 'Samsung Galaxy S24 Ultra', catId: 'cat-electronics', price: 19999000, city: 'Bandung', condition: 'new' },
    { title: 'ASUS ROG Gaming Laptop RTX 4060', catId: 'cat-electronics', price: 24500000, city: 'Surabaya', condition: 'new' },
    { title: 'Kemeja Batik Premium Pria', catId: 'cat-fashion', price: 350000, city: 'Yogyakarta', condition: 'new' },
    { title: 'Dress Wanita Elegant', catId: 'cat-fashion', price: 450000, city: 'Bandung', condition: 'new' },
    { title: 'Sepatu Sneakers Original', catId: 'cat-fashion', price: 1250000, city: 'Jakarta', condition: 'new' },
    { title: 'Rumah Minimalis 2 Lantai', catId: 'cat-property', price: 1500000000, city: 'Tangerang', condition: 'new' },
    { title: 'Tanah Kavling 200m2', catId: 'cat-property', price: 800000000, city: 'Bogor', condition: 'new' },
    { title: 'Toyota Fortuner 2022', catId: 'cat-vehicle', price: 550000000, city: 'Jakarta', condition: 'like_new' },
    { title: 'Honda CBR 150R 2023', catId: 'cat-vehicle', price: 35000000, city: 'Surabaya', condition: 'new' },
    { title: 'Yamaha NMAX 155 ABS', catId: 'cat-vehicle', price: 29000000, city: 'Bandung', condition: 'like_new' },
    { title: 'Kue Ulang Tahun Custom', catId: 'cat-food', price: 350000, city: 'Jakarta', condition: 'new' },
    { title: 'Snack Box Kue Kering', catId: 'cat-food', price: 150000, city: 'Semarang', condition: 'new' },
    { title: 'Tas Rotan Handmade Premium', catId: 'cat-handmade', price: 275000, city: 'Bali', condition: 'new' },
    { title: 'Jasa Desain Grafis Profesional', catId: 'cat-service', price: 500000, city: 'Jakarta', condition: 'new' },
    { title: 'Jasa Foto Prewedding', catId: 'cat-service', price: 3500000, city: 'Yogyakarta', condition: 'new' },
    { title: 'Produk Olahan Keripik Singkong', catId: 'cat-umkm', price: 25000, city: 'Lampung', condition: 'new' },
    { title: 'Kopi Arabika Premium 1kg', catId: 'cat-umkm', price: 180000, city: 'Aceh', condition: 'new' },
    { title: 'Batik Tulis Madura Asli', catId: 'cat-umkm', price: 850000, city: 'Madura', condition: 'new' },
    // Used items
    { title: 'iPhone 13 Pro 128GB Second', catId: 'cat-electronics', price: 9999000, city: 'Jakarta', condition: 'good' },
    { title: 'Laptop ThinkPad T480 Used', catId: 'cat-electronics', price: 5500000, city: 'Bandung', condition: 'good' },
    { title: 'PS5 Disc Edition Second', catId: 'cat-electronics', price: 6500000, city: 'Surabaya', condition: 'like_new' },
    { title: 'Mobil Honda Jazz 2019', catId: 'cat-vehicle', price: 195000000, city: 'Jakarta', condition: 'good' },
    { title: 'Motor Honda Vario 150 2021', catId: 'cat-vehicle', price: 17500000, city: 'Medan', condition: 'good' },
  ];

  const listings = [];
  for (let i = 0; i < listingTitles.length; i++) {
    const item = listingTitles[i];
    const sellerIndex = i % bandarProfiles.length;
    const listing = await prisma.listing.create({
      data: {
        id: `listing-${i + 1}`,
        userId: bandarProfiles[sellerIndex].userId,
        categoryId: item.catId,
        title: item.title,
        slug: item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: `Deskripsi lengkap untuk ${item.title}. Produk berkualitas dengan garansi resmi. Dijamin original dan terpercaya.`,
        price: item.price,
        priceType: 'fixed',
        listingType: 'sale',
        condition: item.condition,
        status: 'active',
        city: item.city,
        province: item.city === 'Jakarta' ? 'DKI Jakarta' : item.city === 'Bandung' ? 'Jawa Barat' : item.city === 'Surabaya' ? 'Jawa Timur' : 'Indonesia',
        viewCount: Math.floor(Math.random() * 500) + 50,
        clickCount: Math.floor(Math.random() * 200) + 20,
        shareCount: Math.floor(Math.random() * 50) + 5,
        favoriteCount: Math.floor(Math.random() * 30) + 3,
        isFeatured: i < 5,
        publishedAt: new Date(),
      },
    });
    listings.push(listing);

    // Add images for listing
    await prisma.listingImage.create({
      data: {
        listingId: listing.id,
        imageUrl: `https://picsum.photos/seed/${listing.id}/600/400`,
        isPrimary: true,
        sortOrder: 1,
      },
    });
    await prisma.listingImage.create({
      data: {
        listingId: listing.id,
        imageUrl: `https://picsum.photos/seed/${listing.id}-2/600/400`,
        isPrimary: false,
        sortOrder: 2,
      },
    });
  }

  // ============================================
  // ORDERS
  // ============================================
  console.log('🛒 Creating orders...');
  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed'];
  
  for (let i = 0; i < 15; i++) {
    const buyerIndex = i % regularProfiles.length;
    const listingIndex = i % listings.length;
    const listing = listings[listingIndex];
    
    await prisma.order.create({
      data: {
        id: `order-${i + 1}`,
        listingId: listing.id,
        buyerId: regularProfiles[buyerIndex].userId,
        sellerId: listing.userId,
        status: orderStatuses[i % orderStatuses.length],
        totalAmount: listing.price,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      },
    });
  }

  // ============================================
  // SAVED LISTINGS (WISHLIST)
  // ============================================
  console.log('❤️ Creating saved listings...');
  for (const user of regularProfiles) {
    for (let i = 0; i < 3; i++) {
      const listingIndex = Math.floor(Math.random() * listings.length);
      try {
        await prisma.savedListing.create({
          data: {
            userId: user.userId,
            listingId: listings[listingIndex].id,
          },
        });
      } catch {
        // Skip duplicates
      }
    }
  }

  // ============================================
  // CONVERSATIONS & MESSAGES
  // ============================================
  console.log('💬 Creating conversations...');
  for (let i = 0; i < 10; i++) {
    const buyerIndex = i % regularProfiles.length;
    const listingIndex = i % listings.length;
    const listing = listings[listingIndex];
    
    const conversation = await prisma.conversation.create({
      data: {
        id: `conv-${i + 1}`,
        listingId: listing.id,
        buyerId: regularProfiles[buyerIndex].userId,
        sellerId: listing.userId,
        lastMessage: i % 2 === 0 ? 'Apakah masih tersedia?' : 'Berapa harga terbaiknya?',
        lastMessageAt: new Date(Date.now() - i * 60 * 60 * 1000),
      },
    });

    // Add messages
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: regularProfiles[buyerIndex].userId,
        content: 'Halo, apakah produk ini masih tersedia?',
      },
    });
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: listing.userId,
        content: 'Halo, masih tersedia. Silakan di-order jika berminat.',
      },
    });
  }

  // ============================================
  // TESTIMONIALS
  // ============================================
  console.log('⭐ Creating testimonials...');
  await Promise.all([
    prisma.testimonial.create({
      data: {
        name: 'Andi Wijaya',
        content: 'Platform yang sangat membantu UMKM seperti saya. Penjualan meningkat 200% sejak bergabung!',
        rating: 5,
        company: 'Batik Nusantara',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Sari Dewi',
        content: 'Transaksi mudah dan aman. Sudah belanja puluhan kali tanpa masalah.',
        rating: 5,
        company: 'Fashion ID',
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Budi Hartono',
        content: 'Sistem boost listing sangat efektif. Produk saya jadi lebih mudah ditemukan pembeli.',
        rating: 4,
        company: 'Elektronik Jaya',
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Rina Susanti',
        content: 'Customer service responsif dan membantu. Recommended!',
        rating: 5,
        company: 'Cantik Store',
        isActive: true,
        sortOrder: 4,
      },
    }),
  ]);

  // ============================================
  // BANNERS
  // ============================================
  console.log('🖼️ Creating banners...');
  await Promise.all([
    prisma.banner.create({
      data: {
        id: 'banner-1',
        userId: adminProfile.userId,
        title: 'Promo Akhir Tahun',
        imageUrl: 'https://picsum.photos/seed/banner1/1200/400',
        targetUrl: '/marketplace',
        position: 'home',
        pricingModel: 'cpm',
        costPerMille: 50000,
        budgetTotal: 5000000,
        budgetSpent: 1500000,
        impressions: 30000,
        clicks: 1500,
        status: 'active',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.banner.create({
      data: {
        id: 'banner-2',
        userId: adminProfile.userId,
        title: 'Flash Sale Electronics',
        imageUrl: 'https://picsum.photos/seed/banner2/1200/400',
        targetUrl: '/marketplace?category=elektronik',
        position: 'home',
        pricingModel: 'cpc',
        costPerClick: 1000,
        budgetTotal: 3000000,
        budgetSpent: 800000,
        impressions: 25000,
        clicks: 800,
        status: 'active',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  // ============================================
  // COUPONS
  // ============================================
  console.log('🎟️ Creating coupons...');
  await Promise.all([
    prisma.coupon.create({
      data: {
        code: 'WELCOME100',
        creditsAmount: 100,
        maxUses: 1000,
        usedCount: 150,
        isActive: true,
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'BONUS50',
        creditsAmount: 50,
        maxUses: 500,
        usedCount: 75,
        isActive: true,
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'VIP200',
        creditsAmount: 200,
        maxUses: 100,
        usedCount: 25,
        minPurchase: 100000,
        isActive: true,
      },
    }),
  ]);

  // ============================================
  // PLATFORM SETTINGS
  // ============================================
  console.log('⚙️ Creating platform settings...');
  await Promise.all([
    prisma.platformSetting.create({
      data: {
        key: 'site_name',
        value: 'Marketplace Core',
        description: 'Nama platform',
      },
    }),
    prisma.platformSetting.create({
      data: {
        key: 'commission_rate',
        value: '5',
        description: 'Persentase komisi per transaksi',
      },
    }),
    prisma.platformSetting.create({
      data: {
        key: 'min_withdrawal',
        value: '100000',
        description: 'Minimal penarikan dana',
      },
    }),
    prisma.platformSetting.create({
      data: {
        key: 'listing_duration_days',
        value: '30',
        description: 'Durasi listing aktif dalam hari',
      },
    }),
    prisma.platformSetting.create({
      data: {
        key: 'contact_email',
        value: 'support@marketplace.com',
        description: 'Email kontak support',
      },
    }),
    prisma.platformSetting.create({
      data: {
        key: 'contact_phone',
        value: '021-12345678',
        description: 'Nomor telepon support',
      },
    }),
  ]);

  // ============================================
  // SUPPORT TICKETS
  // ============================================
  console.log('🎫 Creating support tickets...');
  const tickets = await Promise.all([
    prisma.supportTicket.create({
      data: {
        userId: regularProfiles[0].userId,
        subject: 'Pembayaran belum masuk',
        category: 'payment',
        priority: 'high',
        status: 'open',
      },
    }),
    prisma.supportTicket.create({
      data: {
        userId: regularProfiles[1].userId,
        subject: 'Cara mengaktifkan boost listing',
        category: 'feature',
        priority: 'normal',
        status: 'resolved',
      },
    }),
    prisma.supportTicket.create({
      data: {
        userId: regularProfiles[2].userId,
        subject: 'Laporan penjual tidak responsif',
        category: 'complaint',
        priority: 'urgent',
        status: 'in_progress',
      },
    }),
  ]);

  // Add ticket replies
  for (const ticket of tickets) {
    await prisma.ticketReply.create({
      data: {
        ticketId: ticket.id,
        userId: ticket.userId,
        message: 'Mohon bantuannya untuk masalah ini.',
        isStaff: false,
      },
    });
    if (ticket.status === 'resolved' || ticket.status === 'in_progress') {
      await prisma.ticketReply.create({
        data: {
          ticketId: ticket.id,
          userId: adminProfile.userId,
          message: 'Terima kasih atas laporannya. Tim kami sedang memproses.',
          isStaff: true,
        },
      });
    }
  }

  // ============================================
  // KYC VERIFICATIONS
  // ============================================
  console.log('📋 Creating KYC verifications...');
  await Promise.all([
    prisma.kycVerification.create({
      data: {
        userId: bandarProfiles[0].userId,
        ktpNumber: '3171234567890001',
        npwpNumber: '12.345.678.9-012.000',
        status: 'approved',
        submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        reviewedBy: adminProfile.userId,
        reviewedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.kycVerification.create({
      data: {
        userId: bandarProfiles[1].userId,
        ktpNumber: '3274567890120002',
        status: 'approved',
        submittedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        reviewedBy: adminProfile.userId,
        reviewedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.kycVerification.create({
      data: {
        userId: regularProfiles[0].userId,
        ktpNumber: '3471234567890003',
        status: 'pending',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.kycVerification.create({
      data: {
        userId: regularProfiles[2].userId,
        ktpNumber: '1271234567890004',
        status: 'under_review',
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  // ============================================
  // WITHDRAWALS
  // ============================================
  console.log('💸 Creating withdrawals...');
  await Promise.all([
    prisma.withdrawal.create({
      data: {
        userId: bandarProfiles[0].userId,
        amount: 5000000,
        bankName: 'BCA',
        bankAccount: '1234567890',
        bankAccountName: bandarProfiles[0].name,
        status: 'approved',
        processedBy: adminProfile.userId,
        processedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.withdrawal.create({
      data: {
        userId: bandarProfiles[1].userId,
        amount: 10000000,
        bankName: 'Mandiri',
        bankAccount: '0987654321',
        bankAccountName: bandarProfiles[1].name,
        status: 'pending',
      },
    }),
    prisma.withdrawal.create({
      data: {
        userId: bandarProfiles[2].userId,
        amount: 3000000,
        bankName: 'BNI',
        bankAccount: '1122334455',
        bankAccountName: bandarProfiles[2].name,
        status: 'processing',
      },
    }),
  ]);

  // ============================================
  // UMKM PROFILES
  // ============================================
  console.log('🏪 Creating UMKM profiles...');
  const umkmProfiles = await Promise.all([
    prisma.umkmProfile.create({
      data: {
        ownerId: bandarProfiles[0].userId,
        umkmName: 'Elektronik Jaya Abadi',
        brandName: 'EJStore',
        slug: 'elektronik-jaya-abadi',
        description: 'Toko elektronik terpercaya dengan produk berkualitas dan garansi resmi',
        categoryId: 'cat-electronics',
        businessScale: 'small',
        city: 'Jakarta',
        provinceId: '31',
        regencyId: '3171',
        address: 'Jl. Mangga Dua Raya No. 123',
        postalCode: '10730',
        phone: '021-6451234',
        email: 'contact@ejstore.com',
        website: 'https://ejstore.com',
        instagram: '@ejstore.official',
        whatsapp: '081234567891',
        isVerified: true,
        status: 'active',
        totalProducts: 25,
        totalOrders: 150,
        totalRevenue: 500000000,
        averageRating: 4.8,
        totalReviews: 120,
      },
    }),
    prisma.umkmProfile.create({
      data: {
        ownerId: bandarProfiles[1].userId,
        umkmName: 'Fashion Store Indonesia',
        brandName: 'FSI',
        slug: 'fashion-store-indonesia',
        description: 'Fashion trend terkini dengan koleksi terlengkap',
        categoryId: 'cat-fashion',
        businessScale: 'medium',
        city: 'Bandung',
        provinceId: '32',
        regencyId: '3273',
        address: 'Jl. Dago Atas No. 45',
        postalCode: '40135',
        phone: '022-2501234',
        email: 'hello@fsi.id',
        website: 'https://fsi.id',
        instagram: '@fashionstore.id',
        facebook: 'fashionstoreID',
        whatsapp: '081234567892',
        isVerified: true,
        status: 'active',
        totalProducts: 50,
        totalOrders: 300,
        totalRevenue: 750000000,
        averageRating: 4.9,
        totalReviews: 280,
      },
    }),
  ]);

  // ============================================
  // NOTIFICATIONS
  // ============================================
  console.log('🔔 Creating notifications...');
  for (const user of regularProfiles) {
    await prisma.notification.create({
      data: {
        userId: user.userId,
        type: 'info',
        title: 'Selamat Datang!',
        message: 'Terima kasih telah bergabung di Marketplace Core.',
        isRead: false,
      },
    });
    await prisma.notification.create({
      data: {
        userId: user.userId,
        type: 'success',
        title: 'Akun Terverifikasi',
        message: 'Selamat! Akun Anda telah berhasil diverifikasi.',
        isRead: user.isVerified,
        readAt: user.isVerified ? new Date() : null,
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - Users: ${regularProfiles.length + bandarProfiles.length + 1}`);
  console.log(`  - Categories: ${categories.length + 10}`);
  console.log(`  - Listings: ${listings.length}`);
  console.log(`  - Boost Types: ${boostTypes.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
