import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * 
 * Used by KeepAlive component to prevent Render free tier from sleeping
 * Returns minimal response to reduce bandwidth usage
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    uptime: process.uptime()
  });
} 