/**
 * Test Production API
 * Checks if /api/landing endpoint returns data
 */

async function testAPI() {
  console.log('🧪 Testing Production API\n');
  console.log('═'.repeat(60));
  console.log('');

  try {
    const url = 'https://aaaaaaaaam.vercel.app/api/landing';
    console.log(`📡 Fetching: ${url}\n`);

    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ API Response OK\n');
      console.log('📊 Data Summary:');
      console.log(`   Categories: ${data.categories?.length || 0}`);
      console.log(`   Featured Listings: ${data.featuredListings?.length || 0}`);
      console.log(`   Latest Listings: ${data.latestListings?.length || 0}`);
      console.log(`   Popular Listings: ${data.popularListings?.length || 0}`);
      console.log(`   Premium Boosted: ${data.premiumBoostedListings?.length || 0}`);
      console.log(`   Active Auctions: ${data.activeAuctions?.length || 0}`);
      console.log('');

      if (data.categories?.length > 0) {
        console.log('📂 Sample Categories:');
        data.categories.slice(0, 3).forEach((cat: any, i: number) => {
          console.log(`   ${i + 1}. ${cat.name}`);
        });
        console.log('');
      }

      if (data.latestListings?.length > 0) {
        console.log('📦 Sample Listings:');
        data.latestListings.slice(0, 3).forEach((listing: any, i: number) => {
          console.log(`   ${i + 1}. ${listing.title} - Rp ${listing.price.toLocaleString()}`);
        });
        console.log('');
      }

      console.log('✅ API is working correctly!');
    } else {
      console.log('❌ API Error:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${data.error || 'Unknown error'}`);
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }

  console.log('');
  console.log('═'.repeat(60));
}

testAPI();
