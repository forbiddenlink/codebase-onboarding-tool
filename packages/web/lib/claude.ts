import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client with API key from environment
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Verify API key is configured
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('Warning: ANTHROPIC_API_KEY not configured. AI features will not work.')
}

/**
 * Analyze code using Claude Sonnet 4
 * @param code - The code to analyze
 * @param question - Optional specific question about the code
 * @param language - Programming language of the code
 * @returns Analysis result from Claude
 */
export async function analyzeCode(
  code: string,
  question?: string,
  language: string = 'unknown'
): Promise<{ analysis: string; confidence: number }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  const systemPrompt = `You are an expert code analyzer. Analyze the provided ${language} code and provide insights about:
- Purpose and functionality
- Key components and patterns
- Potential issues or improvements
- Dependencies and relationships

Be concise and focus on the most important aspects.`

  const userPrompt = question
    ? `${question}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``
    : `Analyze this code:\n\`\`\`${language}\n${code}\n\`\`\``

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    // Extract text content from response
    const analysis = message.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('\n')

    // Confidence score based on response quality (simplified)
    const confidence = analysis.length > 100 ? 0.85 : 0.7

    return {
      analysis,
      confidence,
    }
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error(`Failed to analyze code: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate explanation for a code snippet
 * @param code - The code snippet
 * @param language - Programming language
 * @returns Plain English explanation
 */
export async function explainCode(
  code: string,
  language: string = 'unknown'
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Explain what this ${language} code does in plain English:\n\n\`\`\`${language}\n${code}\n\`\`\``,
        },
      ],
    })

    return message.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('\n')
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error(`Failed to explain code: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Answer a question about the codebase using RAG
 * @param question - User's question
 * @param codeContext - Relevant code snippets for context
 * @returns Answer with sources
 */
export async function answerQuestion(
  question: string,
  codeContext: Array<{ file: string; code: string; language: string }>
): Promise<{ answer: string; confidence: number; sources: string[] }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  // Build context from code snippets
  const contextText = codeContext
    .map(
      (ctx) =>
        `File: ${ctx.file}\n\`\`\`${ctx.language}\n${ctx.code}\n\`\`\``
    )
    .join('\n\n')

  const systemPrompt = `You are a helpful codebase assistant. Answer questions about the code using the provided context.
Always cite which files you're referencing in your answer.
If you're not confident about the answer, say so.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Context:\n${contextText}\n\nQuestion: ${question}`,
        },
      ],
    })

    const answer = message.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('\n')

    // Extract mentioned files as sources
    const sources = codeContext.map((ctx) => ctx.file)

    // Simple confidence calculation based on answer quality
    const confidence = answer.toLowerCase().includes("i'm not sure") ||
      answer.toLowerCase().includes("i don't know")
      ? 0.5
      : 0.85

    return {
      answer,
      confidence,
      sources,
    }
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error(`Failed to answer question: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check if Claude API is properly configured
 * @returns true if API key is set and valid
 */
export async function checkClaudeConnection(): Promise<boolean> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return false
  }

  try {
    // Simple test request
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: 'Hello',
        },
      ],
    })

    return message.content.length > 0
  } catch (error) {
    console.error('Claude connection test failed:', error)
    return false
  }
}

export { anthropic }
export default anthropic
