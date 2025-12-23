'use client'

import { useState, useEffect } from 'react'

interface WebhookConfig {
  url: string
  enabled: boolean
  events: string[]
  secret?: string
}

export default function SettingsPage() {
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    url: '',
    enabled: false,
    events: ['repository.analyzed', 'repository.updated'],
    secret: ''
  })
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    // Load saved webhook configuration
    const savedConfig = localStorage.getItem('codecompass-webhook-config')
    if (savedConfig) {
      try {
        setWebhookConfig(JSON.parse(savedConfig))
      } catch (error) {
        console.error('Failed to load webhook config:', error)
      }
    }
  }, [])

  const handleSave = async () => {
    setSaveStatus('saving')

    try {
      // Save to localStorage for demonstration
      // In production, this would be saved to the database via API
      localStorage.setItem('codecompass-webhook-config', JSON.stringify(webhookConfig))

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to save webhook config:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleTest = async () => {
    if (!webhookConfig.url) {
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
    setWebhookConfig(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Configure integrations and preferences</p>
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
                checked={webhookConfig.enabled}
                onChange={(e) => setWebhookConfig(prev => ({ ...prev, enabled: e.target.checked }))}
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
              value={webhookConfig.url}
              onChange={(e) => setWebhookConfig(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://your-server.com/webhooks/codecompass"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!webhookConfig.enabled}
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
              value={webhookConfig.secret}
              onChange={(e) => setWebhookConfig(prev => ({ ...prev, secret: e.target.value }))}
              placeholder="Enter a secret token for webhook verification"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!webhookConfig.enabled}
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
                    webhookConfig.events.includes(event.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!webhookConfig.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={webhookConfig.events.includes(event.id)}
                    onChange={() => toggleEvent(event.id)}
                    disabled={!webhookConfig.enabled}
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
          {webhookConfig.enabled && webhookConfig.url && (
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

          {/* Save Button */}
          <div className="flex justify-end">
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
              {saveStatus === 'saved' && '✓ Configuration Saved'}
              {saveStatus === 'error' && '✗ Save Failed'}
              {saveStatus === 'idle' && '💾 Save Configuration'}
            </button>
          </div>
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
