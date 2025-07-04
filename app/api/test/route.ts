import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'

export async function GET() {
  try {
    await dbConnect()
    
    return NextResponse.json(
      { 
        message: 'Database connection successful!',
        timestamp: new Date().toISOString(),
        status: 'healthy'
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
