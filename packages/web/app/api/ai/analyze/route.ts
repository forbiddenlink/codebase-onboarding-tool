import { NextRequest, NextResponse } from 'next/server'
import { analyzeCode, explainCode } from '@/lib/claude'

/**
 * POST /api/ai/analyze
 * Analyze code using Claude Sonnet 4
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, question, language, type } = body

    // Validate input
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      )
    }

    if (code.length > 50000) {
      return NextResponse.json(
        { error: 'Code is too long (max 50,000 characters)' },
        { status: 400 }
      )
    }

    // Check API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI features not configured. Please set ANTHROPIC_API_KEY environment variable.' },
        { status: 503 }
      )
    }

    // Perform analysis based on type
    if (type === 'explain') {
      const explanation = await explainCode(code, language || 'unknown')

      return NextResponse.json({
        success: true,
        type: 'explain',
        result: explanation,
        model: 'claude-sonnet-4-20250514',
      })
    } else {
      // Default to analyze
      const result = await analyzeCode(code, question, language || 'unknown')

      return NextResponse.json({
        success: true,
        type: 'analyze',
        analysis: result.analysis,
        confidence: result.confidence,
        model: 'claude-sonnet-4-20250514',
      })
    }
  } catch (error) {
    console.error('AI analysis error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service not configured properly' },
          { status: 503 }
        )
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to analyze code. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/analyze
 * Check AI service status
 */
export async function GET() {
  const isConfigured = !!process.env.ANTHROPIC_API_KEY

  return NextResponse.json({
    configured: isConfigured,
    model: 'claude-sonnet-4-20250514',
    status: isConfigured ? 'ready' : 'not_configured',
  })
}
