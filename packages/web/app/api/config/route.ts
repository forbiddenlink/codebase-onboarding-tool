import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'sk-ant-api03-xxxxx';
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
    const hasDatabaseUrl = !!process.env.DATABASE_URL;

    // Don't expose actual keys, just check if they're configured
    return NextResponse.json({
      status: 'ok',
      environment: process.env.NODE_ENV,
      configuration: {
        anthropicApiKey: hasAnthropicKey ? 'configured' : 'not configured (using placeholder)',
        nextAuthSecret: hasNextAuthSecret ? 'configured' : 'not configured',
        databaseUrl: hasDatabaseUrl ? 'configured' : 'not configured',
      },
      message: hasAnthropicKey
        ? 'All API keys are properly configured'
        : 'API keys are loaded from .env but need real values',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
