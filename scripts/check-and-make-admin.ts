/**
 * Check User and Make Admin
 * 
 * This script checks if a user exists in the database and makes them an admin.
 * 
 * Usage:
 * npx tsx scripts/check-and-make-admin.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAndMakeAdmin() {
  const email = 'itarizvsn@gmail.com'
  
  console.log('\n🔍 Checking User and Making Admin')
  console.log('═'.repeat(60))
  console.log('')

  try {
    // Find user by email
    console.log(`📧 Searching for user: ${email}`)
    const profile = await prisma.profile.findFirst({
      where: { email },
      include: {
        userRoles: true,
      },
    })

    if (!profile) {
      console.log('❌ User not found in database')
      console.log('')
      return
    }

    console.log('✅ User found!\n')
    console.log('User Details:')
    console.log(`  ID: ${profile.id}`)
    console.log(`  User ID: ${profile.userId}`)
    console.log(`  Email: ${profile.email}`)
    console.log(`  Name: ${profile.name}`)
    console.log(`  Phone: ${profile.phone}`)
    console.log(`  City: ${profile.city}`)
    console.log(`  Province: ${profile.province}`)
    console.log(`  Verified: ${profile.isVerified}`)
    console.log(`  KYC Verified: ${profile.isKycVerified}`)
    console.log('')

    // Check current roles
    console.log('Current Roles:')
    if (profile.userRoles.length === 0) {
      console.log('  No roles assigned')
    } else {
      profile.userRoles.forEach((role) => {
        console.log(`  - ${role.role}`)
      })
    }
    console.log('')

    // Check if already admin
    const isAdmin = profile.userRoles.some((role) => role.role === 'admin')

    if (isAdmin) {
      console.log('✅ User is already an admin')
      console.log('')
      return
    }

    // Make user admin
    console.log('🔐 Making user an admin...')
    const adminRole = await prisma.userRole.create({
      data: {
        userId: profile.userId,
        role: 'admin',
      },
    })

    console.log('✅ User is now an admin!\n')
    console.log('Admin Role Created:')
    console.log(`  ID: ${adminRole.id}`)
    console.log(`  User ID: ${adminRole.userId}`)
    console.log(`  Role: ${adminRole.role}`)
    console.log('')

    // Verify
    const updatedProfile = await prisma.profile.findFirst({
      where: { email },
      include: {
        userRoles: true,
      },
    })

    console.log('Updated Roles:')
    updatedProfile?.userRoles.forEach((role) => {
      console.log(`  - ${role.role}`)
    })
    console.log('')

    console.log('═'.repeat(60))
    console.log('🎉 User is now ready for admin testing!')
    console.log('')
    console.log('Login Instructions:')
    console.log(`  1. Go to https://aaaaaaaaam.vercel.app/`)
    console.log(`  2. Click "Login with Google"`)
    console.log(`  3. Use email: ${email}`)
    console.log(`  4. You will have admin access`)
    console.log('')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndMakeAdmin()
