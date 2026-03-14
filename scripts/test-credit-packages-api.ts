async function testCreditPackagesAPI() {
  try {
    console.log('Testing /api/admin/credit-packages endpoint...\n');

    // Test 1: Get all packages
    console.log('1. Fetching all packages...');
    const response1 = await fetch('http://localhost:3000/api/admin/credit-packages');
    const data1 = await response1.json();
    console.log(`   Found ${data1.packages.length} packages`);
    data1.packages.forEach((pkg: any) => {
      console.log(`   - ${pkg.name}: ${pkg.credits} credits + ${pkg.bonusCredits} bonus = Rp ${pkg.price.toLocaleString('id-ID')}`);
    });

    // Test 2: Get active packages only
    console.log('\n2. Fetching active packages only...');
    const response2 = await fetch('http://localhost:3000/api/admin/credit-packages?active=true');
    const data2 = await response2.json();
    console.log(`   Found ${data2.packages.length} active packages`);
    data2.packages.forEach((pkg: any) => {
      console.log(`   - ${pkg.name}: ${pkg.isActive ? 'ACTIVE' : 'INACTIVE'}`);
    });

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCreditPackagesAPI();
