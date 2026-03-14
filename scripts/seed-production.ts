/**
 * Production Database Seeding Script
 * 
 * USAGE:
 * 1. Set production DATABASE_URL:
 *    $env:DATABASE_URL="your_production_url"
 * 
 * 2. Run script:
 *    npx tsx scripts/seed-production.ts
 * 
 * SAFETY:
 * - Checks if database already has data
 * - Skips if listings exist (prevents duplicates)
 * - Can be run multiple times safely
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProduction() {
  console.log('🌱 Production Database Seeding\n');
  console.log('═'.repeat(60));
  console.log('');

  try {
    // Check connection
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    // Check if already seeded
    console.log('🔍 Checking existing data...');
    const counts = {
      listings: await prisma.listing.count(),
      categories: await prisma.category.count(),
      users: await prisma.profile.count(),
      sponsors: await prisma.sponsor.count(),
    };

    console.log(`   Listings: ${counts.listings}`);
    console.log(`   Categories: ${counts.categories}`);
    console.log(`   Users: ${counts.users}`);
    console.log(`   Sponsors: ${counts.sponsors}`);
    console.log('');

    if (counts.listings > 0) {
      console.log('⚠️  Database already has data!');
      console.log('   Skipping seed to avoid duplicates.\n');
      console.log('💡 To re-seed, first clear the database:');
      console.log('   1. Go to Supabase Dashboard');
      console.log('   2. SQL Editor → Run: TRUNCATE TABLE listings CASCADE;');
      console.log('   3. Run this script again\n');
      return;
    }

    console.log('🚀 Starting seed process...\n');

    // Import seed data
    const { categories: categoryData } = await import('../prisma/seed-data/categories');
    const { users: userData } = await import('../prisma/seed-data/users');
    const { listings: listingData } = await import('../prisma/seed-data/listings');
    const { sponsors: sponsorData } = await import('../prisma/seed-data/sponsors');

    // Seed categories
    console.log('📂 Seeding categories...');
    for (const category of categoryData) {
      await prisma.category.create({ data: category });
    }
    console.log(`✅ Created ${categoryData.length} categories\n`);

    // Seed users
    console.log('👥 Seeding users...');
    for (const user of userData) {
      await prisma.profile.create({ data: user });
      
      // Create user roles
      if (user.roles) {
        for (const role of user.roles) {
          await prisma.userRole.create({
            data: {
              userId: user.userId,
              role,
              assignedBy: 'system',
            },
          });
        }
      }
    }
    console.log(`✅ Created ${userData.length} users\n`);

    // Seed listings
    console.log('📦 Seeding listings...');
    for (const listing of listingData) {
      const { images, ...listingData } = listing;
      
      const created = await prisma.listing.create({
        data: listingData,
      });

      // Create images
      if (images) {
        for (const image of images) {
          await prisma.listingImage.create({
            data: {
              listingId: created.id,
              ...image,
            },
          });
        }
      }
    }
    console.log(`✅ Created ${listingData.length} listings\n`);

    // Seed sponsors
    console.log('🏢 Seeding sponsors...');
    for (const sponsor of sponsorData) {
      await prisma.sponsor.create({ data: sponsor });
    }
    console.log(`✅ Created ${sponsorData.length} sponsors\n`);

    console.log('═'.repeat(60));
    console.log('');
    console.log('🎉 Production database seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   ✅ ${categoryData.length} categories`);
    console.log(`   ✅ ${userData.length} users`);
    console.log(`   ✅ ${listingData.length} listings`);
    console.log(`   ✅ ${sponsorData.length} sponsors`);
    console.log('');
    console.log('🌐 Test your site:');
    console.log('   https://aaaaaaaaam.vercel.app/');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error seeding production database:');
    console.error(error);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Check DATABASE_URL is correct');
    console.error('   2. Verify database is accessible');
    console.error('   3. Run migrations: npx prisma migrate deploy');
    console.error('   4. Check Supabase dashboard for errors');
    console.error('');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedProduction()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedProduction };
