const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'));
  console.log('FALLBACK_URL:', process.env.DATABASE_FALLBACK_URL?.replace(/:[^:@]*@/, ':****@'));

  const urls = [
    { name: 'Primary', url: process.env.DATABASE_URL },
    { name: 'Fallback', url: process.env.DATABASE_FALLBACK_URL }
  ].filter(item => item.url);

  for (const { name, url } of urls) {
    console.log(`\n🔄 Testing ${name} URL...`);

    const prisma = new PrismaClient({
      datasources: {
        db: { url }
      },
      log: ['error'],
      errorFormat: 'pretty',
    });

    try {
      console.log(`⏱️ Attempting connection to ${name}...`);

      // Test with timeout
      const connectPromise = prisma.$connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000)
      );

      await Promise.race([connectPromise, timeoutPromise]);
      console.log(`✅ ${name} connection successful`);

      // Test simple query
      console.log(`⏱️ Testing query on ${name}...`);
      const queryPromise = prisma.$queryRaw`SELECT 1 as test, NOW() as timestamp`;
      const queryTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
      );

      const result = await Promise.race([queryPromise, queryTimeoutPromise]);
      console.log(`✅ ${name} query successful:`, result);

      // Test table access
      try {
        const userCount = await prisma.user.count();
        console.log(`✅ ${name} User table accessible, count: ${userCount}`);

        // If we get here, this connection works!
        await prisma.$disconnect();
        console.log(`🎉 ${name} connection is fully functional!`);
        return;

      } catch (tableError) {
        console.log(`⚠️ ${name} table access failed:`, tableError.message);
      }

    } catch (error) {
      console.error(`❌ ${name} connection failed:`, error.message);
      console.error(`❌ Error details:`, {
        code: error.code,
        name: error.name,
        stack: error.stack?.split('\n')[0]
      });
    } finally {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.warn(`⚠️ ${name} disconnect error:`, disconnectError.message);
      }
    }
  }

  console.log('\n❌ All database connections failed');
}

testConnection().catch(console.error);
