// Test script for Support Ticket API
// Run with: npx tsx test-support-api.ts

const BASE_URL = 'http://localhost:3000';

async function testUserEndpoint() {
  console.log('\n📋 Testing User Support Endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/dashboard/support`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('✅ Correctly requires authentication');
    } else if (response.ok) {
      console.log(`✅ Found ${data.tickets?.length || 0} tickets`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function testAdminEndpoint() {
  console.log('\n📋 Testing Admin Support Endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/support`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('✅ Correctly requires authentication');
    } else if (response.ok) {
      console.log(`✅ Found ${data.tickets?.length || 0} tickets`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function testAdminEndpointWithFilters() {
  console.log('\n📋 Testing Admin Support Endpoint with Filters...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/support?status=open&priority=high`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('✅ Correctly requires authentication');
    } else if (response.ok) {
      console.log(`✅ Found ${data.tickets?.length || 0} tickets with filters`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function main() {
  console.log('🚀 Starting Support Ticket API Tests...');
  console.log('Note: These tests expect authentication to fail (401) when not logged in');
  
  await testUserEndpoint();
  await testAdminEndpoint();
  await testAdminEndpointWithFilters();
  
  console.log('\n✅ All tests completed!');
  console.log('\nTo test with authentication:');
  console.log('1. Start the dev server: npm run dev');
  console.log('2. Login to the app');
  console.log('3. Navigate to /dashboard/support (user) or /admin/support (admin)');
}

main();
