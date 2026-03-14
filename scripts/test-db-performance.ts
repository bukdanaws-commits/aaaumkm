/**
 * Test Database Performance
 * 
 * Mengukur kecepatan koneksi dan query ke database
 * 
 * Usage:
 * npx tsx scripts/test-db-performance.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabasePerformance() {
  console.log('\n📊 Database Performance Test')
  console.log('═'.repeat(60))
  console.log('')

  try {
    // Test 1: Connection Time
    console.log('🔌 Test 1: Connection Time')
    const connectionStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const connectionTime = Date.now() - connectionStart
    console.log(`   ✅ Connection established in ${connectionTime}ms`)
    console.log('')

    // Test 2: Simple Query
    console.log('⚡ Test 2: Simple Query (SELECT COUNT)')
    const queryStart = Date.now()
    const profileCount = await prisma.profile.count()
    const queryTime = Date.now() - queryStart
    console.log(`   ✅ Query completed in ${queryTime}ms`)
    console.log(`   📊 Total profiles: ${profileCount}`)
    console.log('')

    // Test 3: Complex Query with Relations
    console.log('🔗 Test 3: Complex Query with Relations')
    const complexStart = Date.now()
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        userRoles: { select: { role: true } },
        listings: { select: { id: true }, take: 5 },
      },
      take: 10,
    })
    const complexTime = Date.now() - complexStart
    console.log(`   ✅ Query completed in ${complexTime}ms`)
    console.log(`   📊 Profiles fetched: ${profiles.length}`)
    console.log('')

    // Test 4: Bulk Query
    console.log('📦 Test 4: Bulk Query (1000 listings)')
    const bulkStart = Date.now()
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        price: true,
      },
      take: 1000,
    })
    const bulkTime = Date.now() - bulkStart
    console.log(`   ✅ Query completed in ${bulkTime}ms`)
    console.log(`   📊 Listings fetched: ${listings.length}`)
    console.log('')

    // Test 5: Aggregation Query
    console.log('📈 Test 5: Aggregation Query')
    const aggStart = Date.now()
    const stats = await prisma.listing.aggregate({
      _count: true,
      _avg: { price: true },
      _max: { price: true },
      _min: { price: true },
    })
    const aggTime = Date.now() - aggStart
    console.log(`   ✅ Query completed in ${aggTime}ms`)
    console.log(`   📊 Total listings: ${stats._count}`)
    console.log(`   📊 Avg price: Rp ${Math.round(stats._avg.price || 0).toLocaleString('id-ID')}`)
    console.log(`   📊 Max price: Rp ${Math.round(stats._max.price || 0).toLocaleString('id-ID')}`)
    console.log(`   📊 Min price: Rp ${Math.round(stats._min.price || 0).toLocaleString('id-ID')}`)
    console.log('')

    // Test 6: Multiple Sequential Queries
    console.log('🔄 Test 6: Multiple Sequential Queries (10 queries)')
    const multiStart = Date.now()
    for (let i = 0; i < 10; i++) {
      await prisma.profile.count()
    }
    const multiTime = Date.now() - multiStart
    const avgTime = multiTime / 10
    console.log(`   ✅ 10 queries completed in ${multiTime}ms`)
    console.log(`   📊 Average per query: ${avgTime.toFixed(2)}ms`)
    console.log('')

    // Test 7: Parallel Queries
    console.log('⚙️ Test 7: Parallel Queries (5 concurrent)')
    const parallelStart = Date.now()
    await Promise.all([
      prisma.profile.count(),
      prisma.listing.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.umkmProfile.count(),
    ])
    const parallelTime = Date.now() - parallelStart
    console.log(`   ✅ 5 parallel queries completed in ${parallelTime}ms`)
    console.log('')

    // Summary
    console.log('═'.repeat(60))
    console.log('📊 PERFORMANCE SUMMARY')
    console.log('═'.repeat(60))
    console.log(`Connection Time:        ${connectionTime}ms`)
    console.log(`Simple Query:           ${queryTime}ms`)
    console.log(`Complex Query:          ${complexTime}ms`)
    console.log(`Bulk Query (1000):      ${bulkTime}ms`)
    console.log(`Aggregation Query:      ${aggTime}ms`)
    console.log(`Sequential (10x):       ${multiTime}ms (avg: ${avgTime.toFixed(2)}ms)`)
    console.log(`Parallel (5x):          ${parallelTime}ms`)
    console.log('')

    // Performance Assessment
    console.log('📈 PERFORMANCE ASSESSMENT')
    console.log('═'.repeat(60))
    
    if (connectionTime < 100) {
      console.log('✅ Connection: EXCELLENT (< 100ms)')
    } else if (connectionTime < 500) {
      console.log('⚠️  Connection: GOOD (100-500ms)')
    } else {
      console.log('❌ Connection: SLOW (> 500ms)')
    }

    if (queryTime < 50) {
      console.log('✅ Simple Query: EXCELLENT (< 50ms)')
    } else if (queryTime < 200) {
      console.log('⚠️  Simple Query: GOOD (50-200ms)')
    } else {
      console.log('❌ Simple Query: SLOW (> 200ms)')
    }

    if (complexTime < 200) {
      console.log('✅ Complex Query: EXCELLENT (< 200ms)')
    } else if (complexTime < 500) {
      console.log('⚠️  Complex Query: GOOD (200-500ms)')
    } else {
      console.log('❌ Complex Query: SLOW (> 500ms)')
    }

    if (bulkTime < 500) {
      console.log('✅ Bulk Query: EXCELLENT (< 500ms)')
    } else if (bulkTime < 1000) {
      console.log('⚠️  Bulk Query: GOOD (500-1000ms)')
    } else {
      console.log('❌ Bulk Query: SLOW (> 1000ms)')
    }

    console.log('')
    console.log('💡 RECOMMENDATIONS:')
    console.log('═'.repeat(60))
    
    if (connectionTime > 500) {
      console.log('⚠️  Connection pooling might be slow')
      console.log('   → Check DATABASE_URL uses pooler endpoint (port 6543)')
      console.log('   → Verify connection_limit parameter')
    }

    if (queryTime > 200 || complexTime > 500) {
      console.log('⚠️  Queries are slow')
      console.log('   → Add indexes to frequently queried fields')
      console.log('   → Use select() to limit fields')
      console.log('   → Use take() to limit rows')
      console.log('   → Consider caching with Redis')
    }

    if (parallelTime > multiTime * 2) {
      console.log('⚠️  Parallel queries are slower than sequential')
      console.log('   → Connection pool might be exhausted')
      console.log('   → Increase connection_limit in DATABASE_URL')
    }

    console.log('')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabasePerformance()
