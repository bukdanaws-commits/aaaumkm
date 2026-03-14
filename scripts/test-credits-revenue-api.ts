async function testCreditsRevenueAPI() {
  try {
    console.log('Testing /api/admin/credits endpoint for revenue...\n');

    // Use admin user ID
    const adminUserId = '6f15b3c4-2ad2-4cd8-af17-fc51e70bb673';

    const response = await fetch('http://localhost:3000/api/admin/credits', {
      headers: {
        'Authorization': `Bearer ${adminUserId}`,
      },
    });

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      return;
    }

    const data = await response.json();

    console.log('API Response:');
    console.log(`Total Transactions: ${data.transactions.length}`);
    console.log(`Total Revenue: Rp ${data.totalRevenue.toLocaleString('id-ID')}`);
    
    console.log('\n✅ Revenue data is available!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCreditsRevenueAPI();
