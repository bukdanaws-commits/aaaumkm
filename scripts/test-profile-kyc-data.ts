/**
 * Test script to verify profile and KYC data integration
 * Run: npx tsx test-profile-kyc-data.ts
 */

import { db } from './src/lib/db';

async function testProfileKycData() {
  try {
    console.log('🔍 Testing Profile and KYC Data Integration...\n');

    // Get a user with KYC data
    const kyc = await db.kycVerification.findFirst({
      where: {
        status: { in: ['pending', 'approved'] }
      },
      include: {
        documents: true,
      }
    });

    if (!kyc) {
      console.log('❌ No KYC data found in database');
      return;
    }

    console.log('✅ Found KYC record:', kyc.id);
    console.log('   User ID:', kyc.userId);
    console.log('   Status:', kyc.status);
    console.log('   KTP Number:', kyc.ktpNumber);

    // Get profile data
    const profile = await db.profile.findUnique({
      where: { userId: kyc.userId },
    });

    if (!profile) {
      console.log('❌ No profile found for user:', kyc.userId);
      return;
    }

    console.log('\n📋 Profile Data:');
    console.log('   Name:', profile.name);
    console.log('   Phone:', profile.phone);
    console.log('   Address:', profile.address);
    console.log('   Province ID:', profile.provinceId);
    console.log('   Regency ID:', profile.regencyId);
    console.log('   District ID:', profile.districtId);
    console.log('   Village ID:', profile.villageId);

    // Get region names
    if (profile.provinceId) {
      const province = await db.province.findUnique({
        where: { id: profile.provinceId },
      });
      console.log('\n🗺️  Region Names:');
      console.log('   Province:', province?.name || 'NOT FOUND');

      if (profile.regencyId) {
        const regency = await db.regency.findUnique({
          where: { id: profile.regencyId },
        });
        console.log('   Regency:', regency?.name || 'NOT FOUND');
      }

      if (profile.districtId) {
        const district = await db.district.findUnique({
          where: { id: profile.districtId },
        });
        console.log('   District:', district?.name || 'NOT FOUND');
      }

      if (profile.villageId) {
        const village = await db.village.findUnique({
          where: { id: profile.villageId },
        });
        console.log('   Village:', village?.name || 'NOT FOUND');
      }
    } else {
      console.log('\n⚠️  No region data found in profile');
    }

    // Get KYC documents
    console.log('\n📄 KYC Documents:');
    kyc.documents.forEach(doc => {
      console.log(`   ${doc.documentType}: ${doc.documentUrl ? '✅ Uploaded' : '❌ Missing'}`);
    });

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

testProfileKycData();
