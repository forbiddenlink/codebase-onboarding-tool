import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Global settings stored in user's home directory
const SETTINGS_DIR = path.join(os.homedir(), '.codecompass')
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json')

interface CodeCompassSettings {
  apiKey?: string
  enableHoverTooltips: boolean
  enableInlineAnnotations: boolean
  enableNotifications: boolean
  theme: 'light' | 'dark' | 'auto'
  webhooks: {
    enabled: boolean
    url: string
    secret?: string
    events: string[]
  }
}

const defaultSettings: CodeCompassSettings = {
  apiKey: '',
  enableHoverTooltips: true,
  enableInlineAnnotations: true,
  enableNotifications: true,
  theme: 'auto',
  webhooks: {
    enabled: false,
    url: '',
    secret: '',
    events: ['repository.analyzed', 'repository.updated']
  }
}

// GET - Read settings
export async function GET() {
  try {
    // Ensure settings directory exists
    if (!fs.existsSync(SETTINGS_DIR)) {
      fs.mkdirSync(SETTINGS_DIR, { recursive: true })
    }

    // If settings file doesn't exist, create it with defaults
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2))
      return NextResponse.json(defaultSettings)
    }

    // Read and parse settings file
    const settingsData = fs.readFileSync(SETTINGS_FILE, 'utf-8')
    const settings = JSON.parse(settingsData)

    // Merge with defaults to handle any missing fields
    const mergedSettings = { ...defaultSettings, ...settings }

    return NextResponse.json(mergedSettings)
  } catch (error) {
    console.error('Error reading settings:', error)
    return NextResponse.json(
      { error: 'Failed to read settings' },
      { status: 500 }
    )
  }
}

// POST - Update settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Ensure settings directory exists
    if (!fs.existsSync(SETTINGS_DIR)) {
      fs.mkdirSync(SETTINGS_DIR, { recursive: true })
    }

    // Read existing settings or use defaults
    let existingSettings = defaultSettings
    if (fs.existsSync(SETTINGS_FILE)) {
      const settingsData = fs.readFileSync(SETTINGS_FILE, 'utf-8')
      existingSettings = JSON.parse(settingsData)
    }

    // Merge existing settings with updates
    const updatedSettings = {
      ...existingSettings,
      ...body,
      // Merge nested objects properly
      webhooks: {
        ...existingSettings.webhooks,
        ...(body.webhooks || {})
      }
    }

    // Write settings to file
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2))

    return NextResponse.json({
      success: true,
      settings: updatedSettings
    })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
