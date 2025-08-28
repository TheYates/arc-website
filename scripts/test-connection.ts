#!/usr/bin/env tsx

import { connectToDatabase, checkDatabaseHealth, resetDatabaseConnection } from '../lib/database/postgresql'

async function testConnection() {
  console.log('🔍 Testing database connection...\n')

  // Test initial connection
  console.log('1. Testing initial connection...')
  const connected = await connectToDatabase()
  if (!connected) {
    console.log('❌ Initial connection failed')
    return
  }

  // Test health check
  console.log('\n2. Testing health check...')
  const health = await checkDatabaseHealth()
  console.log(`Health Status: ${health.status}`)
  console.log(`Message: ${health.message}`)

  // Test connection reset
  console.log('\n3. Testing connection reset...')
  const reset = await resetDatabaseConnection()
  console.log(`Reset Status: ${reset.success ? 'Success' : 'Failed'}`)
  console.log(`Message: ${reset.message}`)

  // Final health check
  console.log('\n4. Final health check...')
  const finalHealth = await checkDatabaseHealth()
  console.log(`Final Health Status: ${finalHealth.status}`)
  console.log(`Message: ${finalHealth.message}`)

  if (finalHealth.status === 'healthy') {
    console.log('\n✅ Database connection is working properly!')
  } else {
    console.log('\n❌ Database connection issues persist')
  }
}

testConnection().catch(console.error)