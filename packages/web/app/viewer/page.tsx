'use client'

import { useState } from 'react'

// Sample code for demonstration
const sampleCode = `import { useState, useEffect } from 'react'

export default function Example() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('Count changed:', count)
  }, [count])

  // Handle click event
  const handleClick = () => {
    setCount(prev => prev + 1)
  }

  return (
    <div className="container">
      <h1>Counter: {count}</h1>
      <button onClick={handleClick}>
        Increment
      </button>
    </div>
  )
}`

export default function ViewerPage() {
  const [code] = useState(sampleCode)
  const lines = code.split('\n')

  // Simple syntax highlighting using regex
  const highlightSyntax = (line: string) => {
    let highlighted = line

    // Keywords
    highlighted = highlighted.replace(
      /\b(import|export|default|function|const|let|var|return|if|else|for|while|class|extends|from|useState|useEffect)\b/g,
      '<span class="text-purple-600 font-semibold">$1</span>'
    )

    // Strings
    highlighted = highlighted.replace(
      /(['"`])(.*?)\1/g,
      '<span class="text-green-600">$1$2$1</span>'
    )

    // Comments
    highlighted = highlighted.replace(
      /(\/\/.*$)/g,
      '<span class="text-gray-500 italic">$1</span>'
    )

    // Functions
    highlighted = highlighted.replace(
      /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
      '<span class="text-blue-600">$1</span>('
    )

    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+)\b/g,
      '<span class="text-orange-600">$1</span>'
    )

    return highlighted
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-8 py-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Code Viewer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and explore your code with syntax highlighting
        </p>
      </div>

      {/* Code viewer */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">File:</span>
              <span className="text-sm font-mono font-semibold">
                example.tsx
              </span>
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="flex">
              {/* Line numbers */}
              <div className="bg-muted px-4 py-4 text-right select-none border-r border-border">
                {lines.map((_, index) => (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground font-mono leading-6"
                  >
                    {index + 1}
                  </div>
                ))}
              </div>

              {/* Code content */}
              <div className="flex-1 px-4 py-4 overflow-x-auto">
                {lines.map((line, index) => (
                  <div
                    key={index}
                    className="text-sm font-mono leading-6"
                    dangerouslySetInnerHTML={{
                      __html: highlightSyntax(line) || '&nbsp;',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Syntax highlighting is applied to keywords, strings, comments, functions, and numbers.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
