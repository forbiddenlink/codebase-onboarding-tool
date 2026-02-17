import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/notifications/check-changes - Check for significant changes in learned areas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, repositoryId } = body

    if (!userId || !repositoryId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, repositoryId' },
        { status: 400 }
      )
    }

    // Get user's learning path
    const learningPath = await prisma.learningPath.findUnique({
      where: {
        userId_repositoryId: {
          userId,
          repositoryId,
        },
      },
      include: {
        items: true,
      },
    })

    if (!learningPath) {
      return NextResponse.json(
        { message: 'No learning path found for this user and repository' },
        { status: 404 }
      )
    }

    // Get completed learning path items
    const completedItems = learningPath.items.filter((item: { completed: boolean; fileId: string }) => item.completed)

    if (completedItems.length === 0) {
      return NextResponse.json({
        message: 'No completed learning items to check',
        notificationsCreated: 0,
      })
    }

    // Get the file IDs that the user has learned
    const learnedFileIds = completedItems.map((item: { fileId: string }) => item.fileId)

    // Get the files from the database
    const files = await prisma.fileNode.findMany({
      where: {
        id: { in: learnedFileIds },
      },
    })

    // Check for significant changes (this is a simplified version)
    // In a real implementation, you would:
    // 1. Compare current file state with state when it was learned
    // 2. Check git history for commits since learning
    // 3. Analyze complexity changes, LOC changes, etc.

    const notificationsToCreate = []

    for (const file of files) {
      // Simulate checking for significant changes
      // In reality, you'd compare with historical data
      const hasSignificantChange = Math.random() > 0.7 // 30% chance of change for demo

      if (hasSignificantChange) {
        // Determine type of change
        const changeTypes = [
          {
            type: 'learned_area_changed',
            title: 'Learned Module Updated',
            message: `The file "${file.name}" that you learned has been significantly modified. You may want to review the changes.`,
          },
          {
            type: 'breaking_change',
            title: 'Breaking Change Detected',
            message: `A breaking change was detected in "${file.name}". The API or interface may have changed.`,
          },
          {
            type: 'module_updated',
            title: 'Module Enhancement',
            message: `New features or improvements were added to "${file.name}". Check out the updates!`,
          },
        ]

        const changeType = changeTypes[Math.floor(Math.random() * changeTypes.length)]

        notificationsToCreate.push({
          userId,
          type: changeType.type,
          title: changeType.title,
          message: changeType.message,
          metadata: JSON.stringify({
            fileId: file.id,
            filePath: file.path,
            fileName: file.name,
            repositoryId,
            detectedAt: new Date().toISOString(),
          }),
        })
      }
    }

    // Create notifications in bulk
    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate,
      })
    }

    return NextResponse.json({
      message: `Checked ${files.length} learned files`,
      notificationsCreated: notificationsToCreate.length,
      filesChecked: files.length,
    })
  } catch (error) {
    console.error('Error checking for changes:', error)
    return NextResponse.json(
      { error: 'Failed to check for changes' },
      { status: 500 }
    )
  }
}
