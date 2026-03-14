import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCategories() {
  console.log('🔍 Analyzing Categories...\n');

  try {
    // Count total categories
    const totalCategories = await prisma.category.count();
    console.log(`📊 Total Categories: ${totalCategories}\n`);

    // Count parent categories (kategori utama)
    const parentCategories = await prisma.category.count({
      where: { parentId: null }
    });
    console.log(`📂 Kategori Utama (Parent): ${parentCategories}`);

    // Count subcategories
    const subCategories = await prisma.category.count({
      where: { parentId: { not: null } }
    });
    console.log(`📁 Sub Kategori: ${subCategories}\n`);

    // List all parent categories with details
    console.log('📋 DAFTAR KATEGORI UTAMA:\n');
    const parents = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        listingCount: true,
        _count: {
          select: { children: true }
        }
      }
    });

    parents.forEach((cat, index) => {
      const iconDisplay = cat.icon || '❓';
      const colorDisplay = cat.color || '#CCCCCC';
      console.log(`${index + 1}. ${cat.name}`);
      console.log(`   Slug: ${cat.slug}`);
      console.log(`   Icon: ${iconDisplay}`);
      console.log(`   Color: ${colorDisplay}`);
      console.log(`   Sub Kategori: ${cat._count.children}`);
      console.log(`   Listings: ${cat.listingCount}`);
      console.log('');
    });

    // Check if categories have icon and color
    const categoriesWithIcon = await prisma.category.count({
      where: {
        parentId: null,
        icon: { not: null }
      }
    });

    const categoriesWithColor = await prisma.category.count({
      where: {
        parentId: null,
        color: { not: null }
      }
    });

    console.log('🎨 ICON & COLOR STATUS:');
    console.log(`   Categories with Icon: ${categoriesWithIcon}/${parentCategories}`);
    console.log(`   Categories with Color: ${categoriesWithColor}/${parentCategories}\n`);

    if (categoriesWithIcon === 0 || categoriesWithColor === 0) {
      console.log('⚠️  WARNING: Categories missing icon/color!');
      console.log('   Run: npx tsx prisma/seed-categories.ts\n');
    }

    // Sample subcategories
    console.log('📁 SAMPLE SUB KATEGORI (5 first):\n');
    const sampleSubs = await prisma.category.findMany({
      where: { parentId: { not: null } },
      take: 5,
      select: {
        name: true,
        slug: true,
        parent: {
          select: { name: true }
        }
      }
    });

    sampleSubs.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.name} (${sub.slug})`);
      console.log(`   Parent: ${sub.parent?.name || 'Unknown'}\n`);
    });

    // Expected vs Actual
    console.log('✅ EXPECTED STRUCTURE:');
    console.log('   Kategori Utama: 25');
    console.log('   Sub Kategori: 150');
    console.log('   Total: 175\n');

    console.log('📊 ACTUAL IN DATABASE:');
    console.log(`   Kategori Utama: ${parentCategories}`);
    console.log(`   Sub Kategori: ${subCategories}`);
    console.log(`   Total: ${totalCategories}\n`);

    if (parentCategories < 25) {
      console.log('⚠️  MISSING CATEGORIES!');
      console.log(`   Expected: 25 parent categories`);
      console.log(`   Found: ${parentCategories}`);
      console.log('   Solution: Run seed script');
      console.log('   Command: npx tsx prisma/seed-categories.ts\n');
    } else if (parentCategories === 25) {
      console.log('✅ All 25 parent categories found!\n');
    }

    // Check for categories without subcategories
    const parentsWithoutSubs = await prisma.category.findMany({
      where: {
        parentId: null,
        children: { none: {} }
      },
      select: { name: true }
    });

    if (parentsWithoutSubs.length > 0) {
      console.log('⚠️  CATEGORIES WITHOUT SUBCATEGORIES:');
      parentsWithoutSubs.forEach(cat => {
        console.log(`   - ${cat.name}`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ ERROR:', error);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   1. Run: npx prisma generate');
    console.log('   2. Run: npx prisma db push');
    console.log('   3. Run: npx tsx prisma/seed-categories.ts');
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
