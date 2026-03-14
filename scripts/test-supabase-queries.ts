/**
 * Test Supabase Query Abstraction Layer
 * Run: npx tsx scripts/test-supabase-queries.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { getSupabaseClient } from '../src/lib/supabase-client'
import { findMany, findOne, count, rpc } from '../src/lib/supabase-queries'

async function main() {
  console.log('🔍 Testing Supabase Query Abstraction Layer...\n')

  const supabase = getSupabaseClient()

  // Test 1: findMany with categories
  console.log('1. Testing findMany() with categories...')
  const categoriesResult = await findMany(supabase, 'categories', {
    select: 'id, name, slug',
    limit: 5,
  })

  if (categoriesResult.error) {
    console.error('❌ Error:', categoriesResult.error.message)
  } else {
    console.log(`✅ Found ${categoriesResult.count} categories`)
    if (categoriesResult.data && categoriesResult.data.length > 0) {
      categoriesResult.data.forEach((cat: any, i: number) => {
        console.log(`   ${i + 1}. ${cat.name} (${cat.slug})`)
      })
    } else {
      console.log('   (No data found)')
    }
  }

  // Test 2: findMany with filters
  console.log('\n2. Testing findMany() with filters...')
  const activeListingsResult = await findMany(supabase, 'listings', {
    select: 'id, title, price, status',
    filters: { status: 'active' },
    orderBy: [{ column: 'createdAt', ascending: false }],
    limit: 3,
  })

  if (activeListingsResult.error) {
    console.error('❌ Error:', activeListingsResult.error.message)
  } else {
    console.log(`✅ Found ${activeListingsResult.count} active listings`)
    if (activeListingsResult.data && activeListingsResult.data.length > 0) {
      activeListingsResult.data.forEach((listing: any, i: number) => {
        console.log(`   ${i + 1}. ${listing.title} - Rp ${listing.price?.toLocaleString('id-ID')}`)
      })
    } else {
      console.log('   (No data found)')
    }
  }

  // Test 3: count records
  console.log('\n3. Testing count()...')
  const categoriesCount = await count(supabase, 'categories')
  const listingsCount = await count(supabase, 'listings')
  const activeListingsCount = await count(supabase, 'listings', { status: 'active' })

  if (categoriesCount.error) {
    console.error('❌ Categories count error:', categoriesCount.error.message)
  } else {
    console.log(`✅ Total categories: ${categoriesCount.count}`)
  }

  if (listingsCount.error) {
    console.error('❌ Listings count error:', listingsCount.error.message)
  } else {
    console.log(`✅ Total listings: ${listingsCount.count}`)
  }

  if (activeListingsCount.error) {
    console.error('❌ Active listings count error:', activeListingsCount.error.message)
  } else {
    console.log(`✅ Active listings: ${activeListingsCount.count}`)
  }

  // Test 4: RPC function call
  console.log('\n4. Testing rpc() with get_platform_stats...')
  const statsResult = await rpc(supabase, 'get_platform_stats')

  if (statsResult.error) {
    console.log('⚠️  RPC error:', statsResult.error.message)
  } else {
    console.log('✅ RPC call successful')
    console.log('   Stats:', JSON.stringify(statsResult.data, null, 2))
  }

  // Test 5: Complex query with relations
  console.log('\n5. Testing complex query with relations...')
  const listingsWithRelations = await findMany(supabase, 'listings', {
    select: `
      id,
      title,
      price,
      status,
      categoryId,
      categories (
        id,
        name,
        slug
      )
    `,
    limit: 3,
  })

  if (listingsWithRelations.error) {
    console.error('❌ Error:', listingsWithRelations.error.message)
  } else {
    console.log(`✅ Found ${listingsWithRelations.count} listings with relations`)
    if (listingsWithRelations.data && listingsWithRelations.data.length > 0) {
      listingsWithRelations.data.forEach((listing: any, i: number) => {
        console.log(`   ${i + 1}. ${listing.title}`)
        if (listing.categories) {
          console.log(`      Category: ${listing.categories.name}`)
        }
      })
    } else {
      console.log('   (No data found)')
    }
  }

  console.log('\n✅ All query abstraction tests completed!')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
