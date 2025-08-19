import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';

export async function POST() {
  try {
    // Disconnect and reconnect to reset the connection pool
    await prisma.$disconnect();
    await prisma.$connect();
    
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection reset successfully' 
    });
  } catch (error) {
    console.error('Failed to reset database connection:', error);
    return NextResponse.json(
      { error: 'Failed to reset database connection' },
      { status: 500 }
    );
  }
}
