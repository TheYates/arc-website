import { PrismaClient } from '@prisma/client';

// Global variable to store the Prisma client instance
let prisma: PrismaClient | null = null;

// Connection retry configuration
const CONNECTION_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  connectionTimeout: 10000, // 10 seconds
};

// Database connection status
let connectionStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
let lastConnectionAttempt = 0;
let connectionError: string | null = null;

/**
 * Create a new Prisma client with optimized settings
 */
function createPrismaClient(databaseUrl?: string): PrismaClient {
  const url = databaseUrl || process.env.DATABASE_URL;
  
  return new PrismaClient({
    datasources: url ? {
      db: { url }
    } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'minimal',
  });
}

/**
 * Test database connection with timeout
 */
async function testConnection(client: PrismaClient, timeout = CONNECTION_CONFIG.connectionTimeout): Promise<boolean> {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), timeout);
    });

    const connectPromise = client.$connect().then(() => client.$queryRaw`SELECT 1 as test`);
    
    await Promise.race([connectPromise, timeoutPromise]);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Get database connection with automatic retry and fallback
 */
export async function getDbConnection(): Promise<PrismaClient> {
  // Return existing connection if available and recently tested
  if (prisma && connectionStatus === 'connected' && 
      Date.now() - lastConnectionAttempt < 30000) { // 30 seconds cache
    return prisma;
  }

  // Disconnect existing client if any
  if (prisma) {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.warn('Error disconnecting previous Prisma client:', error);
    }
    prisma = null;
  }

  const urls = [
    process.env.DATABASE_URL,
    process.env.DATABASE_FALLBACK_URL,
  ].filter(Boolean);

  for (let urlIndex = 0; urlIndex < urls.length; urlIndex++) {
    const url = urls[urlIndex];
    console.log(`🔄 Attempting database connection ${urlIndex + 1}/${urls.length}...`);

    for (let retry = 0; retry < CONNECTION_CONFIG.maxRetries; retry++) {
      try {
        const client = createPrismaClient(url);
        
        // Test the connection
        const isConnected = await testConnection(client);
        
        if (isConnected) {
          prisma = client;
          connectionStatus = 'connected';
          lastConnectionAttempt = Date.now();
          connectionError = null;
          console.log(`✅ Database connection successful (URL ${urlIndex + 1}, attempt ${retry + 1})`);
          return prisma;
        } else {
          await client.$disconnect();
          throw new Error('Connection test failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`❌ Connection attempt ${retry + 1}/${CONNECTION_CONFIG.maxRetries} failed for URL ${urlIndex + 1}: ${errorMessage}`);
        
        if (retry < CONNECTION_CONFIG.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, CONNECTION_CONFIG.retryDelay * (retry + 1)));
        }
      }
    }
  }

  // All connection attempts failed
  connectionStatus = 'error';
  connectionError = 'All database connection attempts failed';
  lastConnectionAttempt = Date.now();
  
  // Return a client anyway for graceful degradation
  prisma = createPrismaClient();
  console.error('⚠️ Database connection failed, returning client for graceful degradation');
  return prisma;
}

/**
 * Execute database operation with error handling
 */
export async function withDbConnection<T>(
  operation: (prisma: PrismaClient) => Promise<T>,
  fallbackValue?: T
): Promise<T> {
  try {
    const client = await getDbConnection();
    return await operation(client);
  } catch (error) {
    console.error('Database operation failed:', error);
    
    if (fallbackValue !== undefined) {
      console.log('Returning fallback value due to database error');
      return fallbackValue;
    }
    
    throw error;
  }
}

/**
 * Get connection status for health checks
 */
export function getConnectionStatus() {
  return {
    status: connectionStatus,
    lastAttempt: lastConnectionAttempt,
    error: connectionError,
  };
}

/**
 * Force reconnection (useful for health checks)
 */
export async function forceReconnect(): Promise<boolean> {
  connectionStatus = 'disconnected';
  lastConnectionAttempt = 0;

  try {
    const client = await getDbConnection();
    // If we get here, connection was successful
    // TypeScript doesn't recognize that getDbConnection() can change connectionStatus
    return client !== null && (connectionStatus as string) === 'connected';
  } catch (error) {
    // If getDbConnection() throws, connection failed
    connectionStatus = 'error';
    return false;
  }
}

// Cleanup on process exit
process.on('beforeExit', async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});
