import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCheckRoleAPI() {
  try {
    const userId = '773a778e-64cb-424b-93b3-8879e6583fda'; // itarizvsn@gmail.com
    
    console.log('\n🧪 Testing Check Role API Logic\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`User ID: ${userId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Test 1: Check if user has admin role
    console.log('Test 1: Check Admin Role');
    const adminRole = await prisma.userRole.findFirst({
      where: { 
        userId, 
        role: 'admin' 
      },
    });
    
    const isAdmin = !!adminRole;
    console.log(`Result: ${isAdmin ? '✅ IS ADMIN' : '❌ NOT ADMIN'}`);
    
    if (adminRole) {
      console.log(`Role ID: ${adminRole.id}`);
      console.log(`Assigned By: ${adminRole.assignedBy}`);
      console.log(`Assigned At: ${adminRole.createdAt.toLocaleString('id-ID')}`);
    }
    console.log('');
    
    // Test 2: Get all roles
    console.log('Test 2: Get All Roles');
    const allRoles = await prisma.userRole.findMany({
      where: { userId },
      select: { role: true },
    });
    
    const roles = ['user', ...allRoles.map(r => r.role)];
    const uniqueRoles = [...new Set(roles)];
    
    console.log(`Roles: ${uniqueRoles.join(', ')}`);
    console.log('');
    
    // Test 3: Check if user has penjual role
    console.log('Test 3: Check Penjual Role');
    const penjualRole = await prisma.userRole.findFirst({
      where: { 
        userId, 
        role: 'penjual' 
      },
    });
    
    const isPenjual = !!penjualRole;
    console.log(`Result: ${isPenjual ? '✅ IS PENJUAL' : '❌ NOT PENJUAL'}`);
    console.log('');
    
    // Test 4: Get user profile
    console.log('Test 4: Get User Profile');
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        email: true,
        name: true,
        isVerified: true,
        isKycVerified: true,
      },
    });
    
    if (profile) {
      console.log(`Email: ${profile.email}`);
      console.log(`Name: ${profile.name}`);
      console.log(`Verified: ${profile.isVerified}`);
      console.log(`KYC Verified: ${profile.isKycVerified}`);
    }
    console.log('');
    
    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`User ID: ${userId}`);
    console.log(`Email: ${profile?.email}`);
    console.log(`Is Admin: ${isAdmin ? '✅ YES' : '❌ NO'}`);
    console.log(`Is Penjual: ${isPenjual ? '✅ YES' : '❌ NO'}`);
    console.log(`All Roles: ${uniqueRoles.join(', ')}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Expected API Response
    console.log('📤 Expected API Response:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(JSON.stringify({
      userId,
      email: profile?.email,
      roles: uniqueRoles,
      isAdmin,
      isPenjual,
    }, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (isAdmin) {
      console.log('✅ API SHOULD RETURN: isAdmin = true');
      console.log('✅ Admin layout SHOULD ALLOW ACCESS');
    } else {
      console.log('❌ API WILL RETURN: isAdmin = false');
      console.log('❌ Admin layout WILL BLOCK ACCESS');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCheckRoleAPI();
