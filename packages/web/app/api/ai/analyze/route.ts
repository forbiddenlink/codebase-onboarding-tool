import { NextRequest, NextResponse } from 'next/server'
import { analyzeCode, explainCode } from '@/lib/claude'
import { withRateLimit, rateLimiters } from '@/lib/rate-limit'
import { analyzeRequestSchema, safeValidateRequest } from '@/lib/validation'

/**
 * POST /api/ai/analyze
 * Analyze code using Claude Sonnet 4
 */
async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input with Zod
    const validation = safeValidateRequest(analyzeRequestSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: validation.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        },
        { status: 400 }
      )
    }

    const { code, question, language, type } = validation.data;

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

// Apply rate limiting to POST handler
export async function POST(request: NextRequest) {
  return withRateLimit(request, rateLimiters.ai, () => handlePOST(request));
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
