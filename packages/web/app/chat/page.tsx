'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // TODO: Implement actual API call to chat endpoint
      // For now, just add a mock response
      await new Promise(resolve => setTimeout(resolve, 1000))

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a placeholder response. The AI chat functionality will be implemented with Claude API integration.',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col" style={{ height: 'calc(100vh - 160px)' }}>
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Chat
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ask questions about your codebase
          </p>
        </div>

        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto py-6 -mx-8 px-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-7xl mb-6">💬</div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Start a conversation
            </h2>
            <p className="text-muted-foreground max-w-lg mb-6 text-lg">
              Ask questions about your codebase, architecture, or specific files.
              The AI will help you understand the code better.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
              <div className="p-4 border border-border rounded-lg text-left hover:border-primary transition cursor-pointer">
                <div className="text-sm font-semibold mb-1">💡 Example Question</div>
                <div className="text-sm text-muted-foreground">&quot;Where is authentication handled?&quot;</div>
              </div>
              <div className="p-4 border border-border rounded-lg text-left hover:border-primary transition cursor-pointer">
                <div className="text-sm font-semibold mb-1">🔍 Example Question</div>
                <div className="text-sm text-muted-foreground">&quot;How does data flow through the app?&quot;</div>
              </div>
              <div className="p-4 border border-border rounded-lg text-left hover:border-primary transition cursor-pointer">
                <div className="text-sm font-semibold mb-1">📊 Example Question</div>
                <div className="text-sm text-muted-foreground">&quot;What are the main modules?&quot;</div>
              </div>
              <div className="p-4 border border-border rounded-lg text-left hover:border-primary transition cursor-pointer">
                <div className="text-sm font-semibold mb-1">🛠️ Example Question</div>
                <div className="text-sm text-muted-foreground">&quot;Explain the API structure&quot;</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm font-semibold mb-1">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="text-sm font-semibold mb-1">AI Assistant</div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

        {/* Input area */}
        <div className="border-t border-border py-4 -mx-8 px-8">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your codebase..."
              className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
