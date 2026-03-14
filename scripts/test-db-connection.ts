/**
 * Test Database Connection
 * 
 * This script tests if Prisma can connect to the database
 * and verifies the connection is working properly.
 * 
 * Usage:
 * npx tsx scripts/test-db-connection.ts
 */

import { PrismaClient } from '@prisma/client'

async function testConnection() {
  console.log('\n🔌 Testing Database Connection')
  console.log('═'.repeat(60))
  console.log('')

  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

  try {
    console.log('📋 Environment Variables:')
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✓ Set' : '✗ Not set'}`)
    console.log(`   DIRECT_URL: ${process.env.DIRECT_URL ? '✓ Set' : '✗ Not set'}`)
    console.log('')

    console.log('🔗 Attempting to connect to database...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Connected successfully!\n')

    // Test query
    console.log('📊 Testing database queries...')
    
    const profileCount = await prisma.profile.count()
    console.log(`   Profiles: ${profileCount}`)

    const listingCount = await prisma.listing.count()
    console.log(`   Listings: ${listingCount}`)

    const categoryCount = await prisma.category.count()
    console.log(`   Categories: ${categoryCount}`)

    const userRoleCount = await prisma.userRole.count()
    console.log(`   User Roles: ${userRoleCount}`)

    console.log('')
    console.log('═'.repeat(60))
    console.log('✅ All tests passed! Database connection is working.')
    console.log('')

  } catch (error) {
    console.error('')
    console.error('❌ Connection failed!')
    console.error('')
    
    if (error instanceof Error) {
      console.error('Error:', error.message)
      console.error('')
      
      if (error.message.includes('ECONNREFUSED')) {
        console.error('💡 Hint: Database server is not responding.')
        console.error('   Check if Supabase is running and DATABASE_URL is correct.')
      } else if (error.message.includes('ENOTFOUND')) {
        console.error('💡 Hint: Cannot resolve database hostname.')
        console.error('   Check if DATABASE_URL has correct hostname.')
      } else if (error.message.includes('authentication failed')) {
        console.error('💡 Hint: Authentication failed.')
        console.error('   Check if DATABASE_URL has correct username/password.')
      } else if (error.message.includes('P1012')) {
        console.error('💡 Hint: Prisma schema validation error.')
        console.error('   Run: npx prisma generate')
      }
    }
    
    console.error('')
    process.exit(1)

  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
