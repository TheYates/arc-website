import { NextResponse } from 'next/server'
import { checkDatabaseHealth, resetDatabaseConnection } from '@/lib/database/postgresql'

export async function GET() {
  try {
    const health = await checkDatabaseHealth(3) // Try 3 times
    
    if (health.status === 'healthy') {
      return NextResponse.json({
        status: 'healthy',
        message: health.message,
        timestamp: new Date().toISOString(),
        connection: 'primary'
      })
    } else {
      // Try connection reset
      const reset = await resetDatabaseConnection()
      
      return NextResponse.json({
        status: 'unhealthy',
        message: health.message,
        resetAttempt: reset.message,
        resetSuccess: reset.success,
        timestamp: new Date().toISOString(),
        suggestion: reset.suggestion || 'Check database configuration'
      }, { status: 503 })
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log('🔄 Manual connection reset requested')
    const reset = await resetDatabaseConnection()
    
    return NextResponse.json({
      success: reset.success,
      message: reset.message,
      suggestion: reset.suggestion,
      timestamp: new Date().toISOString()
    }, { status: reset.success ? 200 : 500 })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}