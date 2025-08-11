import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/database/postgresql';

// GET /api/health/database - Check database connectivity
export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database: health,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlHost: process.env.DATABASE_URL ? 
          process.env.DATABASE_URL.split('@')[1]?.split(':')[0] || 'unknown' : 
          'missing'
      }
    }, {
      status: health.status === 'healthy' ? 200 : 503
    });

  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database: {
        status: 'error',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }, {
      status: 500
    });
  }
}