// src/app/api/test-connection/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Database connection failed'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing database connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}