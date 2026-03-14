/**
 * Seed Marketplace Data Script
 * 
 * Creates realistic Indonesian marketplace data:
 * - 10 random users with gmail.com emails
 * - 50 diverse products across multiple categories
 * - Beautiful Unsplash images
 * - Realistic pricing and descriptions
 * 
 * Usage:
 * npx tsx scripts/seed-marketplace-data.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Random name generators
const firstNames = [
  'Budi', 'Siti', 'Ahmad', 'Dewi', 'Rudi', 'Rina', 'Hendra', 'Lina', 'Bambang', 'Sinta',
  'Joko', 'Maya', 'Adi', 'Putri', 'Doni', 'Ratna', 'Eko', 'Nita', 'Fajar', 'Sari'
]

const lastNames = [
  'Santoso', 'Wijaya', 'Rahman', 'Kusuma', 'Setiawan', 'Handoko', 'Suryanto', 'Pratama',
  'Gunawan', 'Hermawan', 'Nugroho', 'Prabowo', 'Sutrisno', 'Wibowo', 'Hartono'
]

const businessNames = [
  'Toko Elektronik', 'Fashion Store', 'Rumah Kerajinan', 'Toko Buku', 'Warung Kopi',
  'Toko Sepatu', 'Toko Tas', 'Toko Perhiasan', 'Toko Mainan', 'Toko Peralatan'
]

// Indonesian marketplace products
const products = [
  // Elektronik (Electronics)
  { category: 'Elektronik', title: 'Smartphone Samsung Galaxy A15', price: 2499000, description: 'Smartphone terbaru dengan layar AMOLED 6.5 inch, baterai 5000mAh, dan kamera 50MP' },
  { category: 'Elektronik', title: 'Laptop ASUS VivoBook 15', price: 5999000, description: 'Laptop ringan dengan prosesor Intel Core i5, RAM 8GB, SSD 512GB, cocok untuk kerja dan gaming' },
  { category: 'Elektronik', title: 'Headphone Wireless Sony WH-CH720', price: 899000, description: 'Headphone nirkabel dengan noise cancellation, baterai tahan 35 jam' },
  { category: 'Elektronik', title: 'Tablet iPad 10.2 inch', price: 4299000, description: 'Tablet dengan layar Retina, prosesor A14 Bionic, cocok untuk multimedia' },
  { category: 'Elektronik', title: 'Smart Watch Xiaomi Band 8', price: 599000, description: 'Jam tangan pintar dengan monitor detak jantung, GPS, tahan air' },

  // Fashion
  { category: 'Fashion', title: 'Jaket Denim Premium', price: 349000, description: 'Jaket denim berkualitas tinggi, nyaman dipakai, cocok untuk casual dan formal' },
  { category: 'Fashion', title: 'Sepatu Sneaker Nike Air Max', price: 1299000, description: 'Sepatu sneaker original dengan teknologi Air Max, nyaman untuk sehari-hari' },
  { category: 'Fashion', title: 'Tas Tangan Kulit Asli', price: 599000, description: 'Tas tangan dari kulit asli, desain elegan, cocok untuk wanita modern' },
  { category: 'Fashion', title: 'Kemeja Batik Pria Premium', price: 249000, description: 'Kemeja batik tradisional dengan motif unik, bahan berkualitas' },
  { category: 'Fashion', title: 'Dress Wanita Casual', price: 199000, description: 'Dress casual dengan bahan katun, desain modern, tersedia berbagai warna' },

  // Properti (Real Estate)
  { category: 'Properti', title: 'Rumah Minimalis 2 Lantai', price: 450000000, description: 'Rumah minimalis di lokasi strategis, 3 kamar tidur, 2 kamar mandi, garasi' },
  { category: 'Properti', title: 'Apartemen Studio Furnished', price: 350000000, description: 'Apartemen studio di pusat kota, fully furnished, siap huni' },
  { category: 'Properti', title: 'Tanah Kavling Siap Bangun', price: 200000000, description: 'Tanah kavling 500m2 di area berkembang, dekat dengan pusat kota' },
  { category: 'Properti', title: 'Ruko Komersial 2 Lantai', price: 800000000, description: 'Ruko komersial di lokasi ramai, cocok untuk bisnis retail atau kantor' },
  { category: 'Properti', title: 'Kos-kosan 10 Kamar', price: 600000000, description: 'Bangunan kos-kosan dengan 10 kamar, lokasi dekat kampus' },

  // Kendaraan (Vehicles)
  { category: 'Kendaraan', title: 'Motor Honda CB150R', price: 18000000, description: 'Motor sport 150cc, mesin bertenaga, konsumsi bahan bakar irit' },
  { category: 'Kendaraan', title: 'Mobil Toyota Avanza 2020', price: 145000000, description: 'Mobil keluarga 7 penumpang, mesin 1500cc, kondisi prima' },
  { category: 'Kendaraan', title: 'Sepeda Gunung MTB', price: 2499000, description: 'Sepeda gunung dengan frame aluminium, 21 speed, cocok untuk petualangan' },
  { category: 'Kendaraan', title: 'Motor Vespa Vintage', price: 25000000, description: 'Motor Vespa klasik, mesin original, kondisi terawat' },
  { category: 'Kendaraan', title: 'Mobil Daihatsu Xenia 2019', price: 125000000, description: 'Mobil MPV keluarga, mesin 1300cc, AC dingin, power steering' },

  // Makanan & Minuman (Food & Beverages)
  { category: 'Makanan & Minuman', title: 'Kopi Arabika Premium 1kg', price: 249000, description: 'Kopi arabika pilihan dari Sumatera, aroma kuat, rasa nikmat' },
  { category: 'Makanan & Minuman', title: 'Teh Hijau Organik', price: 89000, description: 'Teh hijau organik tanpa pestisida, menyegarkan dan sehat' },
  { category: 'Makanan & Minuman', title: 'Coklat Artisan Homemade', price: 149000, description: 'Coklat premium buatan tangan, bahan pilihan, rasa autentik' },
  { category: 'Makanan & Minuman', title: 'Madu Asli Hutan', price: 199000, description: 'Madu murni dari hutan, tidak dicampur, kaya nutrisi' },
  { category: 'Makanan & Minuman', title: 'Snack Keripik Pisang', price: 49000, description: 'Keripik pisang renyah, tanpa MSG, kemasan 200g' },

  // Handmade & Craft
  { category: 'Handmade & Craft', title: 'Tas Rotan Handmade', price: 349000, description: 'Tas rotan buatan tangan, desain unik, cocok untuk liburan' },
  { category: 'Handmade & Craft', title: 'Keramik Dekorasi Rumah', price: 199000, description: 'Keramik buatan tangan, desain modern, cocok untuk dekorasi' },
  { category: 'Handmade & Craft', title: 'Batik Tulis Madura', price: 599000, description: 'Batik tulis asli Madura, motif tradisional, kualitas premium' },
  { category: 'Handmade & Craft', title: 'Kalung Perak Handmade', price: 299000, description: 'Kalung perak 925, desain eksklusif, dibuat dengan tangan' },
  { category: 'Handmade & Craft', title: 'Lukisan Kanvas Original', price: 799000, description: 'Lukisan kanvas original dari seniman lokal, unik dan bernilai seni' },

  // UMKM
  { category: 'UMKM', title: 'Sambal Matah Tradisional', price: 39000, description: 'Sambal matah buatan rumahan, resep tradisional, rasa autentik' },
  { category: 'UMKM', title: 'Dodol Garut Premium', price: 79000, description: 'Dodol garut kualitas premium, kemasan 250g, tahan lama' },
  { category: 'UMKM', title: 'Tahu Goreng Crispy', price: 29000, description: 'Tahu goreng crispy, dibuat fresh setiap hari, lezat dan bergizi' },
  { category: 'UMKM', title: 'Kerupuk Udang Asli', price: 49000, description: 'Kerupuk udang asli, tanpa pengawet, renyah dan gurih' },
  { category: 'UMKM', title: 'Jamu Tradisional Herbal', price: 59000, description: 'Jamu tradisional dari bahan herbal pilihan, menyehatkan' },

  // Buku & Media
  { category: 'Elektronik', title: 'E-Reader Kindle Paperwhite', price: 1999000, description: 'E-reader dengan layar 6.8 inch, tahan air, baterai tahan 10 minggu' },
  { category: 'Elektronik', title: 'Kamera Mirrorless Canon EOS M50', price: 6999000, description: 'Kamera mirrorless 24MP, video 4K, cocok untuk content creator' },
  { category: 'Elektronik', title: 'Speaker Bluetooth JBL Flip 6', price: 1299000, description: 'Speaker portabel dengan suara jernih, tahan air, baterai 12 jam' },
  { category: 'Elektronik', title: 'Power Bank 30000mAh', price: 299000, description: 'Power bank kapasitas besar, fast charging, cocok untuk perjalanan' },
  { category: 'Elektronik', title: 'Charger Wireless Fast', price: 199000, description: 'Charger wireless 15W, kompatibel semua smartphone, charging cepat' },

  // Fashion Accessories
  { category: 'Fashion', title: 'Topi Baseball Branded', price: 149000, description: 'Topi baseball dengan logo brand, bahan berkualitas, nyaman dipakai' },
  { category: 'Fashion', title: 'Sarung Tangan Kulit', price: 199000, description: 'Sarung tangan kulit asli, hangat dan stylish, cocok untuk musim dingin' },
  { category: 'Fashion', title: 'Scarf Silk Premium', price: 249000, description: 'Scarf sutra premium, desain elegan, cocok untuk wanita modern' },
  { category: 'Fashion', title: 'Ikat Pinggang Kulit', price: 179000, description: 'Ikat pinggang kulit asli, desain klasik, tahan lama' },
  { category: 'Fashion', title: 'Kacamata Hitam UV Protection', price: 299000, description: 'Kacamata hitam dengan perlindungan UV, desain trendy' },

  // Peralatan Rumah Tangga
  { category: 'Elektronik', title: 'Blender Philips 2 Liter', price: 799000, description: 'Blender dengan motor kuat, kapasitas 2 liter, mudah dibersihkan' },
  { category: 'Elektronik', title: 'Rice Cooker Miyako 2 Liter', price: 399000, description: 'Rice cooker dengan teknologi terbaru, memasak nasi sempurna' },
  { category: 'Elektronik', title: 'Vacuum Cleaner Philips', price: 1999000, description: 'Vacuum cleaner dengan daya hisap kuat, hemat energi' },
  { category: 'Elektronik', title: 'Setrika Uap Philips', price: 599000, description: 'Setrika uap dengan teknologi terbaru, hasil setrika sempurna' },
  { category: 'Elektronik', title: 'Microwave Panasonic 25L', price: 1299000, description: 'Microwave dengan kapasitas 25 liter, fitur lengkap' },
]

// Unsplash image URLs (realistic product images)
const unsplashImages = [
  // Electronics
  'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=600&h=400&fit=crop', // smartphone
  'https://images.unsplash.com/photo-1588872657840-790ff3bde08c?w=600&h=400&fit=crop', // laptop
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop', // headphones
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop', // tablet
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop', // smartwatch
  
  // Fashion
  'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=600&h=400&fit=crop', // jacket
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop', // sneakers
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=400&fit=crop', // handbag
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=400&fit=crop', // batik shirt
  'https://images.unsplash.com/photo-1595777707802-21b287e3fbf9?w=600&h=400&fit=crop', // dress
  
  // Property
  'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=600&h=400&fit=crop', // house
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop', // apartment
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', // land
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop', // commercial
  'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=600&h=400&fit=crop', // building
  
  // Vehicles
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', // motorcycle
  'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=600&h=400&fit=crop', // car
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', // bicycle
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', // vespa
  'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=600&h=400&fit=crop', // car
  
  // Food & Beverages
  'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=600&h=400&fit=crop', // coffee
  'https://images.unsplash.com/photo-1597318972826-c0e0c1e8e8c0?w=600&h=400&fit=crop', // tea
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop', // chocolate
  'https://images.unsplash.com/photo-1587049352861-d92d19620e76?w=600&h=400&fit=crop', // honey
  'https://images.unsplash.com/photo-1599599810694-b5ac4dd64b73?w=600&h=400&fit=crop', // snacks
  
  // Handmade & Craft
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=400&fit=crop', // basket
  'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=600&h=400&fit=crop', // ceramic
  'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=600&h=400&fit=crop', // batik
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=400&fit=crop', // necklace
  'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=600&h=400&fit=crop', // painting
  
  // UMKM
  'https://images.unsplash.com/photo-1599599810694-b5ac4dd64b73?w=600&h=400&fit=crop', // sambal
  'https://images.unsplash.com/photo-1599599810694-b5ac4dd64b73?w=600&h=400&fit=crop', // dodol
  'https://images.unsplash.com/photo-1599599810694-b5ac4dd64b73?w=600&h=400&fit=crop', // tahu
  'https://images.unsplash.com/photo-1599599810694-b5ac4dd64b73?w=600&h=400&fit=crop', // kerupuk
  'https://images.unsplash.com/photo-1599599810694-b5ac4dd64b73?w=600&h=400&fit=crop', // jamu
]

async function seedMarketplaceData() {
  console.log('\n🌱 Seeding Marketplace Data')
  console.log('═'.repeat(60))
  console.log('')

  try {
    // Create 10 random users
    console.log('👥 Creating 10 random users...')
    const users = []
    
    for (let i = 0; i < 10; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const randomNum = Math.floor(Math.random() * 10000)
      const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomNum}@gmail.com`
      const businessName = businessNames[Math.floor(Math.random() * businessNames.length)]
      const userId = `seller-${i + 1}`
      
      // Check if user already exists
      let profile = await prisma.profile.findUnique({
        where: { userId },
      })

      if (!profile) {
        profile = await prisma.profile.create({
          data: {
            id: `user-${i + 1}`,
            userId,
            email,
            name: `${businessName} ${firstName}`,
            phone: `08${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            city: ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Yogyakarta'][Math.floor(Math.random() * 5)],
            province: ['DKI Jakarta', 'Jawa Barat', 'Jawa Timur', 'Sumatera Utara', 'DI Yogyakarta'][Math.floor(Math.random() * 5)],
            provinceId: ['31', '32', '35', '12', '34'][Math.floor(Math.random() * 5)],
            regencyId: ['3171', '3273', '3578', '1201', '3471'][Math.floor(Math.random() * 5)],
            isVerified: true,
            isKycVerified: true,
          },
        })

        const existingRole = await prisma.userRole.findFirst({
          where: { userId },
        })

        if (!existingRole) {
          await prisma.userRole.create({
            data: {
              userId: profile.userId,
              role: 'penjual',
            },
          })
        }
      }

      users.push(profile)
    }
    console.log(`✅ Created/Found ${users.length} users\n`)

    // Create 50 products
    console.log('📦 Creating 50 products across categories...')
    let productCount = 0

    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const user = users[i % users.length]
      const category = await prisma.category.findFirst({
        where: { name: product.category },
      })

      if (!category) continue

      const imageUrl = unsplashImages[i % unsplashImages.length]
      
      const baseSlug = product.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const uniqueSlug = `${baseSlug}-${i}-${Math.random().toString(36).substring(7)}`
      
      const listing = await prisma.listing.create({
        data: {
          userId: user.userId,
          categoryId: category.id,
          title: product.title,
          slug: uniqueSlug,
          description: product.description,
          price: product.price,
          priceType: 'fixed',
          listingType: 'sale',
          condition: 'new',
          status: 'active',
          city: user.city,
          province: user.province,
          provinceId: user.provinceId,
          regencyId: user.regencyId,
          viewCount: Math.floor(Math.random() * 500) + 10,
          clickCount: Math.floor(Math.random() * 200) + 5,
          isFeatured: Math.random() > 0.7,
          publishedAt: new Date(),
        },
      })

      // Add image
      await prisma.listingImage.create({
        data: {
          listingId: listing.id,
          imageUrl,
          isPrimary: true,
          sortOrder: 1,
        },
      })

      productCount++
    }
    console.log(`✅ Created ${productCount} products\n`)

    console.log('═'.repeat(60))
    console.log('🎉 Marketplace data seeded successfully!')
    console.log('')
    console.log('Summary:')
    console.log(`  ✅ Users created: ${users.length}`)
    console.log(`  ✅ Products created: ${productCount}`)
    console.log(`  ✅ Categories: ${products.length > 0 ? 'Multiple' : '0'}`)
    console.log('')

  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedMarketplaceData()
