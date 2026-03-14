/**
 * Test Supabase Connection Script
 * Run: npx tsx scripts/test-supabase-connection.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { getSupabaseClient, testSupabaseConnection } from '../src/lib/supabase-client'

async function main() {
  console.log('🔍 Testing Supabase connection...\n')

  // Test 1: Check environment variables
  console.log('1. Checking environment variables...')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found')
    process.exit(1)
  }
  console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`)

  if (!supabaseAnonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not found')
    process.exit(1)
  }
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Found')

  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found')
    process.exit(1)
  }
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY: Found\n')

  // Test 2: Initialize client
  console.log('2. Initializing Supabase client...')
  try {
    const supabase = getSupabaseClient()
    console.log('✅ Supabase client initialized\n')
  } catch (error: any) {
    console.error('❌ Failed to initialize client:', error.message)
    process.exit(1)
  }

  // Test 3: Test connection with simple query
  console.log('3. Testing database connection...')
  const isConnected = await testSupabaseConnection()
  
  if (!isConnected) {
    console.error('❌ Connection test failed')
    process.exit(1)
  }

  // Test 4: Fetch sample data from categories
  console.log('\n4. Fetching sample data from categories table...')
  try {
    const supabase = getSupabaseClient()
    const { data, error, count } = await supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .limit(3)

    if (error) {
      console.error('❌ Query failed:', error.message)
      process.exit(1)
    }

    console.log(`✅ Query successful - Found ${count} total categories`)
    console.log('\nSample categories:')
    console.log(JSON.stringify(data, null, 2))
  } catch (error: any) {
    console.error('❌ Query error:', error.message)
    process.exit(1)
  }

  // Test 5: Test raw SQL query
  console.log('\n5. Testing with raw SQL query...')
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.rpc('get_platform_stats')

    if (error) {
      console.log('⚠️  RPC function not available:', error.message)
    } else {
      console.log('✅ RPC query successful')
      console.log('Platform stats:', data)
    }
  } catch (error: any) {
    console.log('⚠️  RPC query error:', error.message)
  }

  console.log('\n✅ All tests passed! Supabase connection is working correctly.')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
