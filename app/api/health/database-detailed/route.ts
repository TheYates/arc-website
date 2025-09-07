import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth, resetDatabaseConnection } from '@/lib/database/postgresql';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Detailed database health check requested');
    
    // Check if reset is requested
    const url = new URL(request.url);
    const shouldReset = url.searchParams.get('reset') === 'true';
    
    let healthResult;
    let resetResult = null;
    
    if (shouldReset) {
      console.log('🔄 Reset requested, attempting connection reset...');
      resetResult = await resetDatabaseConnection();
      
      // Check health after reset
      healthResult = await checkDatabaseHealth(3);
    } else {
      // Just check health
      healthResult = await checkDatabaseHealth(3);
    }
    
    // Additional environment info
    const envInfo = {
      databaseUrl: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@') : 'Not set',
      fallbackUrl: process.env.DATABASE_FALLBACK_URL ? 
        process.env.DATABASE_FALLBACK_URL.replace(/:[^:@]*@/, ':****@') : 'Not set',
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
    
    const response = {
      health: healthResult,
      reset: resetResult,
      environment: envInfo,
      suggestions: generateSuggestions(healthResult, resetResult),
    };
    
    console.log('📊 Health check result:', {
      status: healthResult.status,
      resetSuccess: resetResult?.success,
    });
    
    return NextResponse.json(response, {
      status: healthResult.status === 'healthy' ? 200 : 503,
    });
    
  } catch (error) {
    console.error('❌ Health check endpoint error:', error);
    
    return NextResponse.json({
      health: {
        status: 'error',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      environment: {
        timestamp: new Date().toISOString(),
      },
    }, { status: 500 });
  }
}

function generateSuggestions(healthResult: any, resetResult: any): string[] {
  const suggestions: string[] = [];
  
  if (healthResult.status === 'unhealthy') {
    suggestions.push('Database connection is failing');
    
    if (resetResult?.suggestion) {
      suggestions.push(resetResult.suggestion);
    }
    
    if (healthResult.message.includes('Can\'t reach database server')) {
      suggestions.push('Check if Supabase project is paused');
      suggestions.push('Verify network connectivity');
      suggestions.push('Try switching to fallback URL');
    }
    
    if (healthResult.message.includes('timeout')) {
      suggestions.push('Connection is timing out - may be network or server issue');
      suggestions.push('Consider increasing timeout values');
    }
  } else if (healthResult.status === 'healthy') {
    suggestions.push('Database connection is working normally');
  }
  
  return suggestions;
}

export async function POST(request: NextRequest) {
  // Force a connection reset
  try {
    console.log('🔄 Forced database connection reset requested');
    const resetResult = await resetDatabaseConnection();
    
    return NextResponse.json({
      reset: resetResult,
      timestamp: new Date().toISOString(),
    }, {
      status: resetResult.success ? 200 : 503,
    });
    
  } catch (error) {
    console.error('❌ Forced reset error:', error);
    
    return NextResponse.json({
      error: `Reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
