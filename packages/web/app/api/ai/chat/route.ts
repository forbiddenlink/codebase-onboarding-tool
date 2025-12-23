import { NextRequest, NextResponse } from 'next/server'
import { answerQuestion } from '@/lib/claude'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/ai/chat
 * Answer questions about the codebase using RAG
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, repositoryId, userId } = body

    // Validate input
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      )
    }

    if (!repositoryId) {
      return NextResponse.json(
        { error: 'Repository ID is required' },
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

    // Retrieve relevant code context from repository
    // For now, get a sample of files (in production, this would use vector search)
    const files = await prisma.fileNode.findMany({
      where: {
        repositoryId,
      },
      take: 5, // Limit to 5 most relevant files
      orderBy: {
        linesOfCode: 'desc', // Prioritize larger files (placeholder for relevance)
      },
    })

    // Read file contents and build context
    const fs = await import('fs')
    const path = await import('path')
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
    })

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      )
    }

    const codeContext: Array<{ file: string; code: string; language: string }> = []

    for (const file of files) {
      try {
        const filePath = path.join(repository.path, file.path)
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8')
          // Limit code snippet size
          const truncatedContent = content.slice(0, 2000)
          codeContext.push({
            file: file.path,
            code: truncatedContent,
            language: file.language,
          })
        }
      } catch (error) {
        console.error(`Failed to read file ${file.path}:`, error)
      }
    }

    // Get answer from Claude
    const result = await answerQuestion(question, codeContext)

    // Save chat message to database
    if (userId) {
      await prisma.chatMessage.create({
        data: {
          repositoryId,
          userId,
          role: 'user',
          content: question,
        },
      })

      await prisma.chatMessage.create({
        data: {
          repositoryId,
          userId,
          role: 'assistant',
          content: result.answer,
          confidence: result.confidence,
          sources: JSON.stringify(result.sources),
        },
      })
    }

    return NextResponse.json({
      success: true,
      answer: result.answer,
      confidence: result.confidence,
      sources: result.sources,
      model: 'claude-sonnet-4-20250514',
    })
  } catch (error) {
    console.error('Chat error:', error)

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
      { error: 'Failed to process question. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/chat
 * Retrieve chat history for a repository
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const repositoryId = searchParams.get('repositoryId')
    const userId = searchParams.get('userId')

    if (!repositoryId) {
      return NextResponse.json(
        { error: 'Repository ID is required' },
        { status: 400 }
      )
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        repositoryId,
        ...(userId && { userId }),
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 50, // Limit to last 50 messages
    })

    return NextResponse.json({
      success: true,
      messages,
    })
  } catch (error) {
    console.error('Failed to retrieve chat history:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve chat history' },
      { status: 500 }
    )
  }
}
