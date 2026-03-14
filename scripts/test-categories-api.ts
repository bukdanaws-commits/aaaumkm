/**
 * Manual test script for categories API
 * Tests both Prisma and direct SQL implementations
 */

async function testCategoriesAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing Categories API...\n');
  
  try {
    // Test 1: Fetch categories
    console.log('Test 1: Fetching categories...');
    const response = await fetch(`${baseUrl}/api/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✓ Response received');
    console.log(`✓ Categories count: ${data.categories?.length || 0}`);
    
    if (data.categories && data.categories.length > 0) {
      console.log('✓ Sample category:', {
        id: data.categories[0].id,
        name: data.categories[0].name,
        slug: data.categories[0].slug,
        listingCount: data.categories[0].listingCount,
      });
    }
    
    // Verify response structure
    if (!data.categories) {
      throw new Error('Missing categories field in response');
    }
    
    // Verify each category has required fields
    for (const category of data.categories) {
      if (!category.id || !category.name || !category.slug) {
        throw new Error(`Invalid category structure: ${JSON.stringify(category)}`);
      }
    }
    
    console.log('\n✓ All tests passed!');
    
  } catch (error) {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testCategoriesAPI();
