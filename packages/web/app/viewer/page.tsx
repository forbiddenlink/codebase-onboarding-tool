'use client'

import { useState, useRef } from 'react'

// Sample code for demonstration with edge cases
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

// Function metadata for tooltips
const functionMetadata: Record<string, {
  purpose: string
  parameters: string[]
  returnValue: string
  calledBy?: string[]
}> = {
  'useState': {
    purpose: 'React Hook that lets you add state to functional components',
    parameters: ['initialState: any - The initial state value'],
    returnValue: '[state, setState] - Returns current state and updater function',
    calledBy: ['Example component']
  },
  'useEffect': {
    purpose: 'React Hook that performs side effects in functional components',
    parameters: ['effect: () => void - The effect function', 'deps: any[] - Dependency array'],
    returnValue: 'void',
    calledBy: ['Example component']
  },
  'handleClick': {
    purpose: 'Handles button click events to increment the counter',
    parameters: [],
    returnValue: 'void',
    calledBy: ['button onClick']
  },
  'setCount': {
    purpose: 'Updates the count state value',
    parameters: ['newValue: number | ((prev: number) => number)'],
    returnValue: 'void',
    calledBy: ['handleClick']
  },
  'Example': {
    purpose: 'Main component that displays a counter with increment functionality',
    parameters: [],
    returnValue: 'JSX.Element',
    calledBy: ['App root']
  }
}

// Built-in annotations for common gotchas and edge cases
const builtInAnnotations: Record<number, {
  type: 'warning' | 'info' | 'gotcha'
  message: string
  explanation: string
  examples?: string[]
}> = {
  4: {
    type: 'info',
    message: 'useState Hook',
    explanation: 'useState initializes state in functional components. The initial value is only used on the first render.',
    examples: ['const [value, setValue] = useState(0)', 'const [user, setUser] = useState(null)']
  },
  6: {
    type: 'gotcha',
    message: 'useEffect Dependency Array',
    explanation: 'This effect runs whenever "count" changes. Missing dependencies can cause stale closures. Including unnecessary dependencies causes extra renders.',
    examples: [
      'useEffect(() => { ... }, [count]) // Runs when count changes',
      'useEffect(() => { ... }, []) // Runs once on mount',
      'useEffect(() => { ... }) // Runs on every render - usually a mistake!'
    ]
  },
  11: {
    type: 'warning',
    message: 'Event Handler Definition',
    explanation: 'Defining functions inside components creates new instances on each render. For performance-critical components, consider useCallback.',
    examples: [
      'const handleClick = useCallback(() => { ... }, [dependencies])'
    ]
  },
  13: {
    type: 'gotcha',
    message: 'State Updater Function',
    explanation: 'Using the functional form (prev => prev + 1) ensures you always work with the latest state, which is important when updates are batched.',
    examples: [
      'setCount(count + 1) // ❌ May be stale',
      'setCount(prev => prev + 1) // ✓ Always current'
    ]
  }
}

interface CustomAnnotation {
  id: string
  lineNumber: number
  text: string
  author: string
  timestamp: Date
}

export default function ViewerPage() {
  const [code] = useState(sampleCode)
  const [hoveredFunction, setHoveredFunction] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [customAnnotations, setCustomAnnotations] = useState<CustomAnnotation[]>([])
  const [annotationText, setAnnotationText] = useState('')
  const [showAnnotationForm, setShowAnnotationForm] = useState(false)
  const [expandedAnnotation, setExpandedAnnotation] = useState<number | null>(null)

  const lines = code.split('\n')
  const tooltipRef = useRef<HTMLDivElement>(null)

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

    // Functions with hover detection
    highlighted = highlighted.replace(
      /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
      (_match, funcName) => {
        if (functionMetadata[funcName]) {
          return `<span class="text-blue-600 font-semibold cursor-help hover:underline" data-function="${funcName}">${funcName}</span>(`
        }
        return `<span class="text-blue-600">${funcName}</span>(`
      }
    )

    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+)\b/g,
      '<span class="text-orange-600">$1</span>'
    )

    return highlighted
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const functionName = target.getAttribute('data-function')

    if (functionName && functionMetadata[functionName]) {
      setHoveredFunction(functionName)
      setTooltipPosition({ x: e.clientX, y: e.clientY })
    } else {
      setHoveredFunction(null)
    }
  }

  const handleAddAnnotation = (lineNumber: number) => {
    setSelectedLine(lineNumber)
    setShowAnnotationForm(true)
    setAnnotationText('')
  }

  const handleSaveAnnotation = () => {
    if (annotationText.trim() && selectedLine !== null) {
      const newAnnotation: CustomAnnotation = {
        id: Date.now().toString(),
        lineNumber: selectedLine,
        text: annotationText,
        author: 'Current User',
        timestamp: new Date()
      }
      setCustomAnnotations([...customAnnotations, newAnnotation])
      setShowAnnotationForm(false)
      setAnnotationText('')
      setSelectedLine(null)
    }
  }

  const toggleAnnotation = (lineNumber: number) => {
    setExpandedAnnotation(expandedAnnotation === lineNumber ? null : lineNumber)
  }

  const getAnnotationIcon = (type: 'warning' | 'info' | 'gotcha') => {
    switch (type) {
      case 'warning': return '⚠️'
      case 'gotcha': return '💡'
      case 'info': return 'ℹ️'
    }
  }

  const getAnnotationColor = (type: 'warning' | 'info' | 'gotcha') => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-300 text-yellow-800'
      case 'gotcha': return 'bg-blue-50 border-blue-300 text-blue-800'
      case 'info': return 'bg-green-50 border-green-300 text-green-800'
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-8 py-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Code Viewer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and explore your code with syntax highlighting, hover tooltips, and annotations
        </p>
      </div>

      {/* Code viewer */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">File:</span>
              <span className="text-sm font-mono font-semibold">
                example.tsx
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></span>
                Gotcha
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></span>
                Warning
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-100 border border-green-300 rounded"></span>
                Info
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></span>
                Custom
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
                    className="text-sm text-muted-foreground font-mono leading-6 flex items-center justify-end gap-2"
                  >
                    {/* Built-in annotation indicator */}
                    {builtInAnnotations[index + 1] && (
                      <button
                        onClick={() => toggleAnnotation(index + 1)}
                        className="text-xs hover:scale-110 transition-transform"
                        title="View annotation"
                      >
                        {getAnnotationIcon(builtInAnnotations[index + 1].type)}
                      </button>
                    )}

                    {/* Custom annotation indicator */}
                    {customAnnotations.some(a => a.lineNumber === index + 1) && (
                      <button
                        onClick={() => toggleAnnotation(index + 1)}
                        className="text-xs text-purple-600 hover:scale-110 transition-transform"
                        title="View custom annotation"
                      >
                        📝
                      </button>
                    )}

                    <span>{index + 1}</span>
                  </div>
                ))}
              </div>

              {/* Code content */}
              <div className="flex-1 px-4 py-4 overflow-x-auto">
                {lines.map((line, index) => (
                  <div key={index} className="relative group">
                    <div
                      className="text-sm font-mono leading-6 hover:bg-accent/30 transition-colors"
                      dangerouslySetInnerHTML={{
                        __html: highlightSyntax(line) || '&nbsp;',
                      }}
                      onMouseMove={handleMouseMove}
                    />

                    {/* Add annotation button */}
                    <button
                      onClick={() => handleAddAnnotation(index + 1)}
                      className="absolute right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-background border border-border"
                      title="Add annotation"
                    >
                      + Add annotation
                    </button>

                    {/* Expanded annotation */}
                    {expandedAnnotation === index + 1 && (
                      <div className="mt-2 mb-2">
                        {/* Built-in annotation */}
                        {builtInAnnotations[index + 1] && (
                          <div className={`p-3 border rounded-lg text-sm ${getAnnotationColor(builtInAnnotations[index + 1].type)}`}>
                            <div className="font-semibold mb-1 flex items-center gap-2">
                              <span>{getAnnotationIcon(builtInAnnotations[index + 1].type)}</span>
                              <span>{builtInAnnotations[index + 1].message}</span>
                            </div>
                            <p className="mb-2">{builtInAnnotations[index + 1].explanation}</p>
                            {builtInAnnotations[index + 1].examples && (
                              <div className="mt-2">
                                <p className="font-semibold mb-1">Examples:</p>
                                <div className="space-y-1">
                                  {builtInAnnotations[index + 1].examples!.map((example, i) => (
                                    <code key={i} className="block bg-white/50 px-2 py-1 rounded text-xs">
                                      {example}
                                    </code>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Custom annotations */}
                        {customAnnotations
                          .filter(a => a.lineNumber === index + 1)
                          .map(annotation => (
                            <div key={annotation.id} className="p-3 border border-purple-300 rounded-lg text-sm bg-purple-50 text-purple-800 mt-2">
                              <div className="font-semibold mb-1 flex items-center gap-2">
                                <span>📝</span>
                                <span>Custom Annotation</span>
                              </div>
                              <p className="mb-2">{annotation.text}</p>
                              <div className="text-xs text-purple-600 flex items-center gap-2">
                                <span>By: {annotation.author}</span>
                                <span>•</span>
                                <span>{annotation.timestamp.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-muted-foreground space-y-2">
            <p>✨ Hover over function names (blue text) to see detailed tooltips</p>
            <p>💡 Click on annotation icons to view gotchas, warnings, and edge cases</p>
            <p>📝 Hover over any line and click "+ Add annotation" to add custom notes</p>
          </div>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredFunction && functionMetadata[hoveredFunction] && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-card border border-border rounded-lg shadow-xl p-4 max-w-md"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
            pointerEvents: 'none'
          }}
        >
          <div className="font-semibold text-sm text-blue-600 mb-2">
            {hoveredFunction}()
          </div>
          <div className="text-sm space-y-2">
            <div>
              <span className="font-semibold">Purpose:</span>
              <p className="text-muted-foreground">{functionMetadata[hoveredFunction].purpose}</p>
            </div>
            {functionMetadata[hoveredFunction].parameters.length > 0 && (
              <div>
                <span className="font-semibold">Parameters:</span>
                <ul className="text-muted-foreground list-disc list-inside">
                  {functionMetadata[hoveredFunction].parameters.map((param, i) => (
                    <li key={i} className="text-xs">{param}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <span className="font-semibold">Returns:</span>
              <p className="text-muted-foreground text-xs">{functionMetadata[hoveredFunction].returnValue}</p>
            </div>
            {functionMetadata[hoveredFunction].calledBy && (
              <div>
                <span className="font-semibold">Called by:</span>
                <p className="text-muted-foreground text-xs">{functionMetadata[hoveredFunction].calledBy?.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Annotation form modal */}
      {showAnnotationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Annotation to Line {selectedLine}</h3>
            <textarea
              value={annotationText}
              onChange={(e) => setAnnotationText(e.target.value)}
              placeholder="Enter your annotation text..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background min-h-[120px]"
              autoFocus
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAnnotationForm(false)
                  setAnnotationText('')
                  setSelectedLine(null)
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAnnotation}
                disabled={!annotationText.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Annotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
