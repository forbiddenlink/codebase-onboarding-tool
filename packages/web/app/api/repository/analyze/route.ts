import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import simpleGit from 'simple-git'

const prisma = new PrismaClient()

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

      // Check if path exists
      if (!fs.existsSync(repoPath)) {
        return NextResponse.json(
          { error: 'Repository path does not exist' },
          { status: 400 }
        )
      }

      // Check if it's a git repository
      const gitDir = path.join(repoPath, '.git')
      if (!fs.existsSync(gitDir)) {
        return NextResponse.json(
          { error: 'Path is not a git repository' },
          { status: 400 }
        )
      }

      // Get repository name from path
      const repoName = path.basename(repoPath)

      // Check if repository exists
      let repository = await prisma.repository.findFirst({
        where: { path: repoPath },
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
            path: repoPath,
            url: null,
            lastAnalyzedAt: new Date(),
          },
        })
      }

      // Start comprehensive file scanning and knowledge graph creation
      const files = scanDirectory(repoPath, repoPath)
      const knowledgeGraph = await buildKnowledgeGraph(repository.id, repoPath, files)

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

      // Clone repository
      const git = simpleGit()

      // Remove existing directory if it exists
      if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true })
      }

      await git.clone(repoUrl, targetPath)

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
    console.error('Repository analysis error:', error)
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
async function buildKnowledgeGraph(
  repositoryId: string,
  repoPath: string,
  files: string[]
): Promise<{
  fileStats: Record<string, any>
  languageDistribution: Record<string, number>
  totalLines: number
}> {
  const languageDistribution: Record<string, number> = {}
  let totalLines = 0
  const fileStats: Record<string, any> = {}

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

      // Create FileNode in database
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
          lastModified: stat.mtime
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
          primaryAuthor: null
        }
      })
    } catch (error) {
      console.error(`Error processing file ${relativePath}:`, error)
    }
  }

  return {
    fileStats,
    languageDistribution,
    totalLines
  }
}
