import { db } from './src/lib/db';

async function checkKycData() {
  try {
    console.log('🔍 Checking KYC data...\n');

    // Get all KYC requests
    const kycRequests = await db.kycVerification.findMany({
      include: {
        profile: {
          select: {
            name: true,
            email: true,
            userId: true,
          }
        },
        documents: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Total KYC requests: ${kycRequests.length}\n`);

    if (kycRequests.length === 0) {
      console.log('❌ No KYC requests found in database');
      console.log('Users need to submit KYC from their profile page first');
    } else {
      kycRequests.forEach((kyc, index) => {
        console.log(`${index + 1}. KYC Request:`);
        console.log(`   ID: ${kyc.id}`);
        console.log(`   User: ${kyc.profile.name || 'N/A'} (${kyc.profile.email})`);
        console.log(`   User ID: ${kyc.userId}`);
        console.log(`   Status: ${kyc.status}`);
        console.log(`   KTP: ${kyc.ktpNumber || 'N/A'}`);
        console.log(`   Documents: ${kyc.documents.length}`);
        console.log(`   Submitted: ${kyc.submittedAt || 'Not submitted'}`);
        console.log('');
      });
    }

    await db.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await db.$disconnect();
    process.exit(1);
  }
}

checkKycData();
