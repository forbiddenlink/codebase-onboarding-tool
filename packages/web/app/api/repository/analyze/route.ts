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

      // Start basic file scanning (simplified for now)
      const files = scanDirectory(repoPath, repoPath)

      // Store file count in analysis result
      await prisma.analysisResult.create({
        data: {
          repositoryId: repository.id,
          fileCount: files.length,
          data: JSON.stringify({ files: files.slice(0, 100) }), // Store first 100 files
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

      // Start basic file scanning
      const files = scanDirectory(targetPath, targetPath)

      // Store file count in analysis result
      await prisma.analysisResult.create({
        data: {
          repositoryId: repository.id,
          fileCount: files.length,
          data: JSON.stringify({ files: files.slice(0, 100) }),
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
