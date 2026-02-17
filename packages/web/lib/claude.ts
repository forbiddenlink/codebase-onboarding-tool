import Anthropic from '@anthropic-ai/sdk'
import { getCachedResponse, cacheResponse } from './cache'

// Type definitions for Anthropic API responses
interface TextBlock {
  type: 'text';
  text: string;
}

// Initialize Anthropic client with API key from environment
// Only initialize if API key is configured and not a placeholder
const hasValidApiKey = process.env.ANTHROPIC_API_KEY &&
  !process.env.ANTHROPIC_API_KEY.includes('xxxxx') &&
  process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')

const anthropic = hasValidApiKey ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null

// Verify API key is configured
if (!hasValidApiKey) {
  console.warn('Warning: ANTHROPIC_API_KEY not configured or is a placeholder. AI features will not work.')
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
  if (!anthropic) {
    throw new Error('Anthropic API key not configured or is invalid')
  }

  // Check cache first
  const cacheKey = { code, question: question || '', language };
  const cached = await getCachedResponse<{ analysis: string; confidence: number }>('analyze', cacheKey);
  if (cached) {
    return cached;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = await (anthropic as any).messages.create({
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
    type ContentBlock = { type: string; text?: string };
    const analysis = message.content
      .filter((block: ContentBlock): block is TextBlock => block.type === 'text')
      .map((block: TextBlock) => block.text)
      .join('\n')

    // Confidence score based on response quality (simplified)
    const confidence = analysis.length > 100 ? 0.85 : 0.7

    const result = {
      analysis,
      confidence,
    };

    // Cache the result
    await cacheResponse('analyze', cacheKey, result);

    return result;
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
  if (!anthropic) {
    throw new Error('Anthropic API key not configured or is invalid')
  }

  // Check cache first
  const cacheKey = { code, language };
  const cached = await getCachedResponse<string>('explain', cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = await (anthropic as any).messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Explain what this ${language} code does in plain English:\n\n\`\`\`${language}\n${code}\n\`\`\``,
        },
      ],
    })

    type ContentBlock = { type: string; text?: string };
    const explanation = message.content
      .filter((block: ContentBlock): block is TextBlock => block.type === 'text')
      .map((block: TextBlock) => block.text)
      .join('\n');

    // Cache the explanation
    await cacheResponse('explain', cacheKey, explanation);

    return explanation;
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
  if (!anthropic) {
    throw new Error('Anthropic API key not configured or is invalid')
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = await (anthropic as any).messages.create({
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

    type ContentBlock = { type: string; text?: string };
    const answer = message.content
      .filter((block: ContentBlock): block is TextBlock => block.type === 'text')
      .map((block: TextBlock) => block.text)
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
  if (!anthropic) {
    return false
  }

  try {
    // Simple test request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = await (anthropic as any).messages.create({
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
