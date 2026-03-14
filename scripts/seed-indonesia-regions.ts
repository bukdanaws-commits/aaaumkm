/**
 * Seed Indonesia Regions to Database
 * 
 * USAGE:
 * $env:DATABASE_URL="postgresql://..."
 * npx tsx scripts/seed-indonesia-regions.ts
 */

import { PrismaClient } from '@prisma/client';
import { getProvinces, getRegencies, getDistricts } from 'idn-area-data';

const prisma = new PrismaClient();

async function seedIndonesiaRegions() {
  console.log('🌍 Seeding Indonesia Regions\n');
  console.log('═'.repeat(60));
  console.log('');

  try {
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    // Check if already seeded
    const existingProvinces = await prisma.province.count();
    if (existingProvinces > 0) {
      console.log('⚠️  Regions already seeded');
      console.log(`   Provinces: ${existingProvinces}`);
      return;
    }

    console.log('🚀 Starting seed...\n');

    // Get data
    const provinces = getProvinces();
    const regencies = getRegencies();
    const districts = getDistricts();

    // Seed provinces
    console.log('📍 Seeding provinces...');
    const provinceMap = new Map();
    
    for (const [key, province] of Object.entries(provinces)) {
      const created = await prisma.province.create({
        data: {
          id: key,
          name: (province as any).name,
        },
      });
      provinceMap.set(key, created.id);
    }
    console.log(`✅ Created ${Object.keys(provinces).length} provinces\n`);

    // Seed regencies
    console.log('📍 Seeding regencies...');
    const regencyMap = new Map();
    
    for (const [key, regency] of Object.entries(regencies)) {
      const regencyData = regency as any;
      const provinceId = provinceMap.get(regencyData.province_id);
      if (provinceId) {
        const created = await prisma.regency.create({
          data: {
            id: key,
            name: regencyData.name,
            provinceId: provinceId,
          },
        });
        regencyMap.set(key, created.id);
      }
    }
    console.log(`✅ Created ${Object.keys(regencies).length} regencies\n`);

    // Seed districts
    console.log('📍 Seeding districts...');
    for (const [key, district] of Object.entries(districts)) {
      const districtData = district as any;
      const regencyId = regencyMap.get(districtData.regency_id);
      if (regencyId) {
        await prisma.district.create({
          data: {
            id: key,
            name: districtData.name,
            regencyId: regencyId,
          },
        });
      }
    }
    console.log(`✅ Created ${Object.keys(districts).length} districts\n`);

    console.log('═'.repeat(60));
    console.log('');
    console.log('🎉 Indonesia regions seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   ✅ ${Object.keys(provinces).length} provinces`);
    console.log(`   ✅ ${Object.keys(regencies).length} regencies`);
    console.log(`   ✅ ${Object.keys(districts).length} districts`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedIndonesiaRegions();
