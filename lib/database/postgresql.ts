import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Note: Connection timeouts are now handled via URL parameters
    // in the DATABASE_URL environment variable
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;

// Database connection helper with retry logic
export async function connectToDatabase(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log("✅ Connected to PostgreSQL database");
      return true;
    } catch (error) {
      console.error(
        `❌ Database connection attempt ${i + 1}/${retries} failed:`,
        error
      );
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  return false;
}

// Database disconnection helper
export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect();
    console.log("✅ Disconnected from PostgreSQL database");
  } catch (error) {
    console.error("❌ Error disconnecting from database:", error);
  }
}

// Enhanced health check function with retry
export async function checkDatabaseHealth(retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "healthy", message: "Database connection is working" };
    } catch (error) {
      if (i < retries - 1) {
        console.log(`⏳ Health check retry ${i + 1}/${retries}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        return {
          status: "unhealthy",
          message: `Database connection failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        };
      }
    }
  }
  return { status: "unhealthy", message: "Max retries exceeded" };
}

// Connection reset utility for intermittent issues
export async function resetDatabaseConnection() {
  try {
    console.log("🔄 Resetting database connection...");
    await prisma.$disconnect();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

    // Test connection with timeout
    const connectionPromise = prisma.$connect().then(() => prisma.$queryRaw`SELECT 1`);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), 10000)
    );

    await Promise.race([connectionPromise, timeoutPromise]);
    console.log("✅ Connection reset and tested successfully");
    return { success: true, message: "Connection reset successfully" };
  } catch (error) {
    console.error("❌ Primary connection reset failed:", error);

    // Try fallback connection if available
    if (process.env.DATABASE_FALLBACK_URL) {
      console.log("🔄 Attempting fallback connection...");
      try {
        const fallbackPrisma = new PrismaClient({
          datasources: {
            db: {
              url: process.env.DATABASE_FALLBACK_URL,
            },
          },
          log: ["error"],
        });

        const fallbackConnectionPromise = fallbackPrisma.$connect().then(() =>
          fallbackPrisma.$queryRaw`SELECT 1`
        );
        const fallbackTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Fallback timeout')), 10000)
        );

        await Promise.race([fallbackConnectionPromise, fallbackTimeoutPromise]);
        await fallbackPrisma.$disconnect();

        console.log("✅ Fallback connection works - primary may be down");
        return {
          success: false,
          message: "Primary connection failed but fallback works",
          suggestion: "Primary database may be paused or unreachable",
        };
      } catch (fallbackError) {
        console.error("❌ Fallback connection also failed:", fallbackError);
      }
    }

    return {
      success: false,
      message: `All connection attempts failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
