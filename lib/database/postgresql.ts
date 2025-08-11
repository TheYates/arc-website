import { PrismaClient } from '@prisma/client' 

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma

// Database connection helper
export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Connected to PostgreSQL database')
    return true
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL database:', error)
    return false
  }
}

// Database disconnection helper
export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect()
    console.log('✅ Disconnected from PostgreSQL database')
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error)
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', message: 'Database connection is working' }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}
