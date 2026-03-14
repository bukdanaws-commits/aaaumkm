/**
 * Debug API Error
 * Test /api/landing endpoint and show detailed error
 */

async function debugAPI() {
  console.log('🔍 Debugging API Error\n');
  console.log('═'.repeat(60));
  console.log('');

  try {
    const url = 'https://aaaaaaaaam.vercel.app/api/landing';
    console.log(`📡 Testing: ${url}\n`);

    const response = await fetch(url);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`OK: ${response.ok}\n`);

    if (!response.ok) {
      console.log('❌ API Error Response:');
      console.log(JSON.stringify(data, null, 2));
      console.log('');
      
      if (data.error) {
        console.log(`Error Message: ${data.error}`);
      }
    } else {
      console.log('✅ API Success Response:');
      console.log(`Categories: ${data.categories?.length || 0}`);
      console.log(`Featured Listings: ${data.featuredListings?.length || 0}`);
      console.log(`Latest Listings: ${data.latestListings?.length || 0}`);
      console.log(`Popular Listings: ${data.popularListings?.length || 0}`);
      console.log(`Premium Boosted: ${data.premiumBoostedListings?.length || 0}`);
      console.log(`Active Auctions: ${data.activeAuctions?.length || 0}`);
    }

    console.log('');
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Fetch Error:', error);
  }
}

debugAPI();
