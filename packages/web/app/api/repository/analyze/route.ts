import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import simpleGit from 'simple-git'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { CodeParser } from '@codecompass/analyzer/dist/parser'

// Helper function to validate and sanitize repository path
function validatePath(inputPath: string): { valid: boolean; error?: string; sanitized?: string } {
  try {
    // Resolve to absolute path to prevent traversal
    const absolutePath = path.resolve(inputPath)

    // Check for path traversal attempts
    if (inputPath.includes('..') || inputPath.includes('~')) {
      return { valid: false, error: 'Invalid path: path traversal not allowed' }
    }

    // Ensure path doesn't access sensitive directories
    const sensitiveDirectories = ['/etc', '/var', '/usr', '/bin', '/sbin', '/root', '/System']
    const isSensitive = sensitiveDirectories.some(dir =>
      absolutePath.startsWith(dir) || absolutePath === dir
    )

    if (isSensitive) {
      return { valid: false, error: 'Invalid path: access to system directories not allowed' }
    }

    return { valid: true, sanitized: absolutePath }
  } catch (error) {
    return { valid: false, error: 'Invalid path format' }
  }
}

// Helper function to validate git URL
function validateGitUrl(url: string): { valid: boolean; error?: string } {
  try {
    // Check if URL matches git URL patterns
    const gitUrlPattern = /^(https?:\/\/|git@)(github\.com|gitlab\.com|bitbucket\.org)[/:].+\.git$/i

    if (!gitUrlPattern.test(url)) {
      return { valid: false, error: 'Invalid git URL: only GitHub, GitLab, and Bitbucket URLs are allowed' }
    }

    // Additional security: no shell metacharacters
    if (/[;&|`$()]/.test(url)) {
      return { valid: false, error: 'Invalid git URL: contains unsafe characters' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path: repoPath, url: repoUrl, type } = body

    if (type === 'local') {
      // Validate local path
      if (!repoPath) {
        return NextResponse.json(
          { error: 'Repository path is required' },
          { status: 400 }
        )
      }

      // Validate and sanitize path
      const pathValidation = validatePath(repoPath)
      if (!pathValidation.valid) {
        return NextResponse.json(
          { error: pathValidation.error },
          { status: 400 }
        )
      }

      const sanitizedPath = pathValidation.sanitized!

      // Check if path exists
      if (!fs.existsSync(sanitizedPath)) {
        return NextResponse.json(
          { error: 'Repository path does not exist' },
          { status: 400 }
        )
      }

      // Check if it's a git repository
      const gitDir = path.join(sanitizedPath, '.git')
      if (!fs.existsSync(gitDir)) {
        return NextResponse.json(
          { error: 'Path is not a git repository' },
          { status: 400 }
        )
      }

      // Get repository name from path
      const repoName = path.basename(sanitizedPath)

      // Check if repository exists
      let repository = await prisma.repository.findFirst({
        where: { path: sanitizedPath },
      })

      if (repository) {
        // Update existing repository
        repository = await prisma.repository.update({
          where: { id: repository.id },
          data: {
            name: repoName,
            lastAnalyzedAt: new Date(),
          },
        })
      } else {
        // Create new repository
        repository = await prisma.repository.create({
          data: {
            name: repoName,
            path: sanitizedPath,
            url: null,
            lastAnalyzedAt: new Date(),
          },
        })
      }

      // Start comprehensive file scanning and knowledge graph creation
      const files = scanDirectory(sanitizedPath, sanitizedPath)
      const knowledgeGraph = await buildKnowledgeGraph(repository.id, sanitizedPath, files)

      // Store analysis results with knowledge graph
      await prisma.analysisResult.create({
        data: {
          repositoryId: repository.id,
          fileCount: files.length,
          data: JSON.stringify({
            files: files.slice(0, 100),
            fileStats: knowledgeGraph.fileStats,
            languageDistribution: knowledgeGraph.languageDistribution,
            totalLines: knowledgeGraph.totalLines
          }),
        },
      })

      // Write shared cache file for CLI and VS Code extension
      const cacheDir = path.join(sanitizedPath, '.codecompass')
      const cacheFile = path.join(cacheDir, 'analysis-cache.json')

      try {
        // Create cache directory if it doesn't exist
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true })
        }

        // Write cache file with analysis results
        const cacheData = {
          analyzedAt: new Date().toISOString(),
          fileCount: files.length,
          fileTypes: knowledgeGraph.fileStats,
          languageDistribution: knowledgeGraph.languageDistribution,
          totalLines: knowledgeGraph.totalLines,
          repositoryId: repository.id,
          repositoryName: repository.name,
        }

        fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2), 'utf8')
        logger.info('Shared cache written', { cacheFile })
      } catch (error) {
        logger.error('Failed to write shared cache file', error)
        // Don't fail the request if cache write fails
      }

      return NextResponse.json({
        success: true,
        message: 'Repository analyzed successfully',
        repository: {
          id: repository.id,
          name: repository.name,
          path: repository.path,
          fileCount: files.length,
        },
      })
    } else if (type === 'remote') {
      // Validate git URL
      if (!repoUrl) {
        return NextResponse.json(
          { error: 'Git URL is required' },
          { status: 400 }
        )
      }

      // Validate git URL for security
      const urlValidation = validateGitUrl(repoUrl)
      if (!urlValidation.valid) {
        return NextResponse.json(
          { error: urlValidation.error },
          { status: 400 }
        )
      }

      // Extract repository name from URL
      const repoName = repoUrl
        .split('/')
        .pop()
        ?.replace('.git', '') || 'repository'

      // Create directory for cloned repositories
      const cloneDir = path.join(process.cwd(), 'cloned-repos')
      if (!fs.existsSync(cloneDir)) {
        fs.mkdirSync(cloneDir, { recursive: true })
      }

      const targetPath = path.join(cloneDir, repoName)

      // Clone repository with timeout and error handling
      const git = simpleGit({
        timeout: {
          block: 300000, // 5 minutes max for clone operations
        },
      })

      // Remove existing directory if it exists
      if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true })
      }

      logger.info('Cloning repository', { repoUrl, targetPath })
      await git.clone(repoUrl, targetPath, ['--depth', '1']) // Shallow clone for faster cloning
      logger.info('Repository cloned successfully', { repoName })

      // Check if repository exists
      let repository = await prisma.repository.findFirst({
        where: { url: repoUrl },
      })

      if (repository) {
        // Update existing repository
        repository = await prisma.repository.update({
          where: { id: repository.id },
          data: {
            name: repoName,
            path: targetPath,
            lastAnalyzedAt: new Date(),
          },
        })
      } else {
        // Create new repository
        repository = await prisma.repository.create({
          data: {
            name: repoName,
            path: targetPath,
            url: repoUrl,
            lastAnalyzedAt: new Date(),
          },
        })
      }

      // Start comprehensive file scanning and knowledge graph creation
      const files = scanDirectory(targetPath, targetPath)
      const knowledgeGraph = await buildKnowledgeGraph(repository.id, targetPath, files)

      // Store analysis results with knowledge graph
      await prisma.analysisResult.create({
        data: {
          repositoryId: repository.id,
          fileCount: files.length,
          data: JSON.stringify({
            files: files.slice(0, 100),
            fileStats: knowledgeGraph.fileStats,
            languageDistribution: knowledgeGraph.languageDistribution,
            totalLines: knowledgeGraph.totalLines
          }),
        },
      })

      // Write shared cache file for CLI and VS Code extension
      const cacheDir = path.join(targetPath, '.codecompass')
      const cacheFile = path.join(cacheDir, 'analysis-cache.json')

      try {
        // Create cache directory if it doesn't exist
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true })
        }

        // Write cache file with analysis results
        const cacheData = {
          analyzedAt: new Date().toISOString(),
          fileCount: files.length,
          fileTypes: knowledgeGraph.fileStats,
          languageDistribution: knowledgeGraph.languageDistribution,
          totalLines: knowledgeGraph.totalLines,
          repositoryId: repository.id,
          repositoryName: repository.name,
        }

        fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2), 'utf8')
        logger.info('Shared cache written', { cacheFile })
      } catch (error) {
        logger.error('Failed to write shared cache file', error)
        // Don't fail the request if cache write fails
      }

      return NextResponse.json({
        success: true,
        message: 'Repository cloned and analyzed successfully',
        repository: {
          id: repository.id,
          name: repository.name,
          path: repository.path,
          fileCount: files.length,
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid request type' },
      { status: 400 }
    )
  } catch (error) {
    logger.error('Repository analysis error', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze repository' },
      { status: 500 }
    )
  }
}

// Helper function to scan directory and get file list
function scanDirectory(dir: string, baseDir: string): string[] {
  const files: string[] = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    // Skip node_modules, .git, and other common ignored directories
    if (item === 'node_modules' || item === '.git' || item === 'dist' || item === 'build') {
      continue
    }

    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...scanDirectory(fullPath, baseDir))
    } else {
      // Store relative path
      const relativePath = path.relative(baseDir, fullPath)
      files.push(relativePath)
    }
  }

  return files
}

// Helper function to detect language from file extension
function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  const languageMap: Record<string, string> = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.go': 'go',
    '.rs': 'rust',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.rb': 'ruby',
    '.php': 'php',
    '.cs': 'csharp',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.sh': 'shell',
    '.json': 'json',
    '.md': 'markdown',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.toml': 'toml',
    '.xml': 'xml',
    '.html': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.sql': 'sql'
  }
  return languageMap[ext] || 'unknown'
}

// Helper function to count lines of code
function countLinesOfCode(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return content.split('\n').length
  } catch (error) {
    return 0
  }
}

// Calculate basic complexity based on control flow keywords
function calculateComplexity(filePath: string, _language: string): number {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    // Count control flow keywords as a simple complexity metric
    const controlFlowKeywords = [
      'if', 'else', 'for', 'while', 'switch', 'case',
      'catch', 'try', '?', '&&', '||'
    ]

    let complexity = 1 // Base complexity

    for (const keyword of controlFlowKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g')
      const matches = content.match(regex)
      if (matches) {
        complexity += matches.length
      }
    }

    return complexity
  } catch (error) {
    return 1
  }
}

// Build comprehensive knowledge graph
interface FileStats {
  name: string
  extension: string
  language: string
  size: number
  linesOfCode: number
  complexity: number
  lastModified: Date
}

async function buildKnowledgeGraph(
  repositoryId: string,
  repoPath: string,
  files: string[]
): Promise<{
  fileStats: Record<string, FileStats>
  languageDistribution: Record<string, number>
  totalLines: number
}> {
  const languageDistribution: Record<string, number> = {}
  let totalLines = 0
  const fileStats: Record<string, FileStats> = {}

  // Initialize the code parser for TypeScript/JavaScript/Python/etc parsing
  const codeParser = new CodeParser()

  // Process each file and create FileNode entries
  for (const relativePath of files) {
    const fullPath = path.join(repoPath, relativePath)

    try {
      const stat = fs.statSync(fullPath)
      const fileName = path.basename(relativePath)
      const extension = path.extname(fileName)
      const language = detectLanguage(relativePath)
      const linesOfCode = countLinesOfCode(fullPath)
      const complexity = calculateComplexity(fullPath, language)

      // Update language distribution
      languageDistribution[language] = (languageDistribution[language] || 0) + 1
      totalLines += linesOfCode

      // Store file stats
      fileStats[relativePath] = {
        name: fileName,
        extension,
        language,
        size: stat.size,
        linesOfCode,
        complexity,
        lastModified: stat.mtime
      }

      // Parse TypeScript/JavaScript/Python files with tree-sitter
      let parsedData = null
      if (['typescript', 'javascript', 'python'].includes(language)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8')
          const parseResult = await codeParser.parseFile(fullPath, content)
          parsedData = {
            imports: parseResult.imports,
            exports: parseResult.exports,
            functions: parseResult.functions.map(f => ({
              name: f.name,
              startLine: f.startLine,
              endLine: f.endLine,
              parameters: f.parameters
            })),
            classes: parseResult.classes.map(c => ({
              name: c.name,
              startLine: c.startLine,
              endLine: c.endLine,
              methods: c.methods.map(m => m.name),
              properties: c.properties.map(p => p.name)
            }))
          }

          logger.info(`Parsed ${language} file: ${relativePath}`, {
            imports: parseResult.imports.length,
            exports: parseResult.exports.length,
            functions: parseResult.functions.length,
            classes: parseResult.classes.length
          })
        } catch (parseError) {
          logger.error(`Error parsing file ${relativePath}`, parseError)
        }
      }

      // Create FileNode in database with parsed data
      await prisma.fileNode.upsert({
        where: {
          repositoryId_path: {
            repositoryId,
            path: relativePath
          }
        },
        update: {
          name: fileName,
          extension,
          language,
          size: stat.size,
          linesOfCode,
          complexity,
          lastModified: stat.mtime,
          metadata: parsedData ? JSON.stringify(parsedData) : null
        },
        create: {
          repositoryId,
          path: relativePath,
          name: fileName,
          extension,
          language,
          size: stat.size,
          linesOfCode,
          complexity,
          lastModified: stat.mtime,
          primaryAuthor: null,
          metadata: parsedData ? JSON.stringify(parsedData) : null
        }
      })
    } catch (error) {
      logger.error(`Error processing file ${relativePath}`, error)
    }
  }

  return {
    fileStats,
    languageDistribution,
    totalLines
  }
}
