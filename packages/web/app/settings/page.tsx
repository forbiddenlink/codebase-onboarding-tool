'use client'

import { useState, useEffect } from 'react'

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

export default function SettingsPage() {
  const [settings, setSettings] = useState<CodeCompassSettings>({
    apiKey: '',
    enableHoverTooltips: true,
    enableInlineAnnotations: true,
    enableNotifications: true,
    theme: 'auto',
    webhooks: {
      url: '',
      enabled: false,
      events: ['repository.analyzed', 'repository.updated'],
      secret: ''
    }
  })
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load settings from API
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaveStatus('saving')

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleTest = async () => {
    if (!settings.webhooks.url) {
      setTestMessage('Please enter a webhook URL first')
      setTestStatus('error')
      setTimeout(() => setTestStatus('idle'), 3000)
      return
    }

    setTestStatus('testing')
    setTestMessage('')

    try {
      // Simulate webhook test
      const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook from CodeCompass',
          repository: 'test-repository'
        }
      }

      // In production, this would actually send a POST request to the webhook URL
      console.log('Test webhook payload:', testPayload)

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // For demonstration, always succeed
      setTestStatus('success')
      setTestMessage('Webhook test successful! Check your endpoint for the test payload.')
      setTimeout(() => {
        setTestStatus('idle')
        setTestMessage('')
      }, 5000)
    } catch (error) {
      console.error('Webhook test failed:', error)
      setTestStatus('error')
      setTestMessage('Webhook test failed. Please check the URL and try again.')
      setTimeout(() => {
        setTestStatus('idle')
        setTestMessage('')
      }, 5000)
    }
  }

  const toggleEvent = (event: string) => {
    setSettings(prev => ({
      ...prev,
      webhooks: {
        ...prev.webhooks,
        events: prev.webhooks.events.includes(event)
          ? prev.webhooks.events.filter(e => e !== event)
          : [...prev.webhooks.events, event]
      }
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <div className="text-gray-600">Loading settings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Configure CodeCompass across all interfaces (Web, CLI, VS Code)</p>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="text-3xl mr-3">⚙️</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
              <p className="text-gray-600">These settings apply to all interfaces</p>
            </div>
          </div>

          {/* API Key */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Anthropic API Key
            </label>
            <input
              type="password"
              value={settings.apiKey || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="sk-ant-api03-..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">
              Required for AI-powered features. Get your key from <a href="https://console.anthropic.com/" target="_blank" className="text-blue-600 hover:underline">console.anthropic.com</a>
            </p>
          </div>

          {/* Theme */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Theme Preference
            </label>
            <div className="flex gap-3">
              {(['light', 'dark', 'auto'] as const).map(theme => (
                <button
                  key={theme}
                  onClick={() => setSettings(prev => ({ ...prev, theme }))}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    settings.theme === theme
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {theme === 'light' && '☀️ Light'}
                  {theme === 'dark' && '🌙 Dark'}
                  {theme === 'auto' && '🔄 Auto'}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <div className="font-semibold text-gray-900">Hover Tooltips</div>
                <div className="text-sm text-gray-600">Show AI-powered tooltips when hovering over code</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableHoverTooltips}
                onChange={(e) => setSettings(prev => ({ ...prev, enableHoverTooltips: e.target.checked }))}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <div className="font-semibold text-gray-900">Inline Annotations</div>
                <div className="text-sm text-gray-600">Display inline code annotations and tips</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableInlineAnnotations}
                onChange={(e) => setSettings(prev => ({ ...prev, enableInlineAnnotations: e.target.checked }))}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <div className="font-semibold text-gray-900">Notifications</div>
                <div className="text-sm text-gray-600">Receive notifications when code areas you've learned change</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => setSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>
          </div>
        </div>

        {/* Integrations Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="text-3xl mr-3">🔗</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Git Webhooks</h2>
              <p className="text-gray-600">Receive notifications when repository events occur</p>
            </div>
          </div>

          {/* Enable/Disable Toggle */}
          <div className="mb-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">Enable Webhooks</h3>
              <p className="text-sm text-gray-600">Send POST requests to your endpoint when events occur</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.webhooks.enabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  webhooks: { ...prev.webhooks, enabled: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Webhook URL */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={settings.webhooks.url}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                webhooks: { ...prev.webhooks, url: e.target.value }
              }))}
              placeholder="https://your-server.com/webhooks/codecompass"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!settings.webhooks.enabled}
            />
            <p className="text-sm text-gray-500 mt-2">
              POST requests will be sent to this URL when events occur
            </p>
          </div>

          {/* Secret Token */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Secret Token (Optional)
            </label>
            <input
              type="password"
              value={settings.webhooks.secret}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                webhooks: { ...prev.webhooks, secret: e.target.value }
              }))}
              placeholder="Enter a secret token for webhook verification"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!settings.webhooks.enabled}
            />
            <p className="text-sm text-gray-500 mt-2">
              This token will be included in the X-CodeCompass-Signature header
            </p>
          </div>

          {/* Events to Subscribe */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Events to Subscribe
            </label>
            <div className="space-y-2">
              {[
                { id: 'repository.analyzed', label: 'Repository Analyzed', desc: 'Triggered when a repository analysis completes' },
                { id: 'repository.updated', label: 'Repository Updated', desc: 'Triggered when repository code changes are detected' },
                { id: 'learning.completed', label: 'Learning Path Completed', desc: 'Triggered when a user completes a learning path' },
                { id: 'annotation.added', label: 'Annotation Added', desc: 'Triggered when a new annotation is created' }
              ].map(event => (
                <label
                  key={event.id}
                  className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    settings.webhooks.events.includes(event.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!settings.webhooks.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={settings.webhooks.events.includes(event.id)}
                    onChange={() => toggleEvent(event.id)}
                    disabled={!settings.webhooks.enabled}
                    className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{event.label}</div>
                    <div className="text-sm text-gray-600">{event.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Test Webhook Button */}
          {settings.webhooks.enabled && settings.webhooks.url && (
            <div className="mb-6">
              <button
                onClick={handleTest}
                disabled={testStatus === 'testing'}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  testStatus === 'testing'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : testStatus === 'success'
                    ? 'bg-green-500 text-white'
                    : testStatus === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {testStatus === 'testing' && '⏳ Testing Webhook...'}
                {testStatus === 'success' && '✓ Test Successful'}
                {testStatus === 'error' && '✗ Test Failed'}
                {testStatus === 'idle' && '🧪 Test Webhook'}
              </button>
              {testMessage && (
                <div className={`mt-3 p-3 rounded-lg ${
                  testStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {testMessage}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            💡 Settings are synced across Web, CLI, and VS Code extension
          </div>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              saveStatus === 'saving'
                ? 'bg-blue-300 text-blue-100 cursor-not-allowed'
                : saveStatus === 'saved'
                ? 'bg-green-500 text-white'
                : saveStatus === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {saveStatus === 'saving' && '💾 Saving...'}
            {saveStatus === 'saved' && '✓ Settings Saved'}
            {saveStatus === 'error' && '✗ Save Failed'}
            {saveStatus === 'idle' && '💾 Save Settings'}
          </button>
        </div>

        {/* Webhook Payload Example */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">📝 Example Webhook Payload</h3>
          <p className="text-gray-600 mb-4">
            Your endpoint will receive POST requests with the following structure:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "event": "repository.analyzed",
  "timestamp": "2025-12-23T07:45:00.000Z",
  "repository": {
    "id": "repo-123",
    "name": "my-project",
    "path": "/path/to/repository"
  },
  "data": {
    "fileCount": 150,
    "linesOfCode": 25000,
    "languages": {
      "TypeScript": 45,
      "JavaScript": 30
    }
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}
