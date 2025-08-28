import { PrismaClient } from '@prisma/client' 

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'], 
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Enhanced connection configuration for Supabase
    __internal: {
      engine: {
        connectionTimeout: 30000, // 30 seconds
        poolTimeout: 30000, // 30 seconds
        maxOpenConnections: 5, // Limit concurrent connections
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma

// Database connection helper with retry logic
export async function connectToDatabase(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect()
      console.log('✅ Connected to PostgreSQL database')
      return true
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`, error)
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000 // Exponential backoff: 1s, 2s, 4s
        console.log(`⏳ Retrying in ${delay/1000} seconds...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  return false
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

// Enhanced health check function with retry
export async function checkDatabaseHealth(retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`
      return { status: 'healthy', message: 'Database connection is working' }
    } catch (error) {
      if (i < retries - 1) {
        console.log(`⏳ Health check retry ${i + 1}/${retries}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        return { 
          status: 'unhealthy', 
          message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }
      }
    }
  }
  return { status: 'unhealthy', message: 'Max retries exceeded' }
}

// Connection reset utility for intermittent issues
export async function resetDatabaseConnection() {
  try {
    console.log('🔄 Resetting database connection...')
    await prisma.$disconnect()
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
    await prisma.$connect()
    
    // Test the connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Connection reset and tested successfully')
    return { success: true, message: 'Connection reset successfully' }
  } catch (error) {
    console.error('❌ Connection reset failed:', error)
    
    // Try fallback connection if available
    if (process.env.DATABASE_FALLBACK_URL) {
      console.log('🔄 Attempting fallback connection...')
      try {
        // Temporarily switch to fallback URL
        const fallbackPrisma = new PrismaClient({
          datasources: {
            db: {
              url: process.env.DATABASE_FALLBACK_URL,
            },
          },
        })
        
        await fallbackPrisma.$connect()
        await fallbackPrisma.$queryRaw`SELECT 1`
        await fallbackPrisma.$disconnect()
        
        console.log('✅ Fallback connection works - consider switching')
        return { 
          success: false, 
          message: 'Primary connection failed but fallback works',
          suggestion: 'Consider switching to fallback URL'
        }
      } catch (fallbackError) {
        console.error('❌ Fallback connection also failed:', fallbackError)
      }
    }
    
    return { 
      success: false, 
      message: `Connection reset failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}
