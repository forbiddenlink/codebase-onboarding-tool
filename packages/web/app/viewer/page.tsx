'use client'

import { useState, useRef } from 'react'
import AppLayout from '@/components/AppLayout'

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
  calledBy?: Array<{ name: string; file: string }>
  connectsTo?: string[]
}> = {
  'useState': {
    purpose: 'React Hook that lets you add state to functional components',
    parameters: ['initialState: any - The initial state value'],
    returnValue: '[state, setState] - Returns current state and updater function',
    calledBy: [
      { name: 'Example component', file: 'example.tsx:4' }
    ],
    connectsTo: ['React state management system', 'Component re-render cycle']
  },
  'useEffect': {
    purpose: 'React Hook that performs side effects in functional components',
    parameters: ['effect: () => void - The effect function', 'deps: any[] - Dependency array'],
    returnValue: 'void',
    calledBy: [
      { name: 'Example component', file: 'example.tsx:6' }
    ],
    connectsTo: ['Component lifecycle', 'Side effects system', 'Dependency tracking']
  },
  'handleClick': {
    purpose: 'Handles button click events to increment the counter',
    parameters: [],
    returnValue: 'void',
    calledBy: [
      { name: 'button onClick', file: 'example.tsx:23' }
    ],
    connectsTo: ['Event handling system', 'setCount state updater']
  },
  'setCount': {
    purpose: 'Updates the count state value',
    parameters: ['newValue: number | ((prev: number) => number)'],
    returnValue: 'void',
    calledBy: [
      { name: 'handleClick', file: 'example.tsx:17' }
    ],
    connectsTo: ['useState hook', 'Component state']
  },
  'Example': {
    purpose: 'Main component that displays a counter with increment functionality',
    parameters: [],
    returnValue: 'JSX.Element',
    calledBy: [
      { name: 'App root', file: 'app.tsx:12' }
    ],
    connectsTo: ['useState hook', 'useEffect hook', 'DOM rendering']
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
  codeVersion: string // Hash or version identifier
  lineContent: string // The actual line content when annotation was created
  status?: 'current' | 'outdated' | 'moved'
}

// Code version history for demonstration
interface CodeVersion {
  id: string
  name: string
  code: string
  timestamp: Date
}

export default function ViewerPage() {
  const [code, setCode] = useState(sampleCode)
  const [currentVersionId, setCurrentVersionId] = useState('v1')
  const [codeVersions] = useState<CodeVersion[]>([
    { id: 'v1', name: 'Version A (Initial)', code: sampleCode, timestamp: new Date('2024-01-15') },
    { id: 'v2', name: 'Version B (Modified)', code: sampleCode.replace('const [count, setCount] = useState(0)', 'const [count, setCount] = useState(10) // Changed initial value'), timestamp: new Date('2024-01-20') }
  ])
  const [hoveredFunction, setHoveredFunction] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [customAnnotations, setCustomAnnotations] = useState<CustomAnnotation[]>([])
  const [annotationText, setAnnotationText] = useState('')
  const [showAnnotationForm, setShowAnnotationForm] = useState(false)
  const [expandedAnnotation, setExpandedAnnotation] = useState<number | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarks, setBookmarks] = useState<string[]>(['example.tsx']) // Pre-populated with current file

  // File-level notes
  interface FileNote {
    id: string
    text: string
    author: string
    timestamp: Date
  }
  const [fileNotes, setFileNotes] = useState<FileNote[]>([
    {
      id: '1',
      text: 'This is the main example component that demonstrates useState and useEffect hooks. Good starting point for learning React basics.',
      author: 'Senior Developer',
      timestamp: new Date('2024-01-10')
    }
  ])
  const [showAddNoteForm, setShowAddNoteForm] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')

  const lines = code.split('\n')
  const tooltipRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentFileName = 'example.tsx'

  const toggleBookmark = () => {
    if (isBookmarked) {
      setBookmarks(bookmarks.filter(f => f !== currentFileName))
      setIsBookmarked(false)
    } else {
      setBookmarks([...bookmarks, currentFileName])
      setIsBookmarked(true)
    }
  }

  // Initialize bookmark status
  useState(() => {
    setIsBookmarked(bookmarks.includes(currentFileName))
  })

  // Escape HTML entities to prevent XSS
  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Simple syntax highlighting using regex
  const highlightSyntax = (line: string) => {
    // Tokenize to avoid overlapping replacements
    const tokens: Array<{ type: string; content: string }> = []
    let remaining = line

    // Match patterns in order of precedence
    const patterns = [
      { type: 'comment', regex: /^(\/\/.*)/ },
      { type: 'string', regex: /^(['"`])((?:\\.|(?!\1).)*?)\1/ },
      { type: 'function', regex: /^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/ },
      { type: 'keyword', regex: /^(import|export|default|function|const|let|var|return|if|else|for|while|class|extends|from)\b/ },
      { type: 'number', regex: /^(\d+)\b/ },
      { type: 'text', regex: /^(.)/ }
    ]

    while (remaining.length > 0) {
      let matched = false
      for (const pattern of patterns) {
        const match = remaining.match(pattern.regex)
        if (match) {
          tokens.push({ type: pattern.type, content: match[0] })
          remaining = remaining.substring(match[0].length)
          matched = true
          break
        }
      }
      if (!matched) {
        // Safety: consume one character
        tokens.push({ type: 'text', content: remaining[0] })
        remaining = remaining.substring(1)
      }
    }

    // Render tokens with proper styling (escape content to prevent XSS)
    return tokens.map(token => {
      const escaped = escapeHtml(token.content);
      switch (token.type) {
        case 'keyword':
          return `<span class="text-purple-600 font-semibold">${escaped}</span>`
        case 'string':
          return `<span class="text-green-600">${escaped}</span>`
        case 'comment':
          return `<span class="text-gray-500 italic">${escaped}</span>`
        case 'function': {
          const funcName = token.content.trim()
          const escapedFuncName = escapeHtml(funcName);
          if (functionMetadata[funcName]) {
            return `<span class="text-blue-600 font-semibold cursor-help hover:underline" data-function="${escapedFuncName}">${escapedFuncName}</span>`
          }
          return `<span class="text-blue-600">${escapedFuncName}</span>`
        }
        case 'number':
          return `<span class="text-orange-600">${escaped}</span>`
        default:
          return escaped
      }
    }).join('')
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
      const currentLine = lines[selectedLine - 1] || ''
      const newAnnotation: CustomAnnotation = {
        id: Date.now().toString(),
        lineNumber: selectedLine,
        text: annotationText,
        author: 'Current User',
        timestamp: new Date(),
        codeVersion: currentVersionId,
        lineContent: currentLine,
        status: 'current'
      }
      setCustomAnnotations([...customAnnotations, newAnnotation])
      setShowAnnotationForm(false)
      setAnnotationText('')
      setSelectedLine(null)
    }
  }

  const handleVersionChange = (versionId: string) => {
    const version = codeVersions.find(v => v.id === versionId)
    if (version) {
      setCurrentVersionId(versionId)
      setCode(version.code)
      // Update annotation statuses based on new code
      updateAnnotationStatuses(version.code, versionId)
    }
  }

  const updateAnnotationStatuses = (newCode: string, _versionId: string) => {
    const newLines = newCode.split('\n')
    const updatedAnnotations = customAnnotations.map(annotation => {
      const currentLineContent = newLines[annotation.lineNumber - 1] || ''

      // Check if the line content matches the original
      if (currentLineContent === annotation.lineContent) {
        return { ...annotation, status: 'current' as const }
      }

      // Check if the line moved to a different location
      const movedLineIndex = newLines.findIndex(line => line === annotation.lineContent)
      if (movedLineIndex !== -1) {
        return {
          ...annotation,
          status: 'moved' as const,
          lineNumber: movedLineIndex + 1
        }
      }

      // Line was modified or removed
      return { ...annotation, status: 'outdated' as const }
    })
    setCustomAnnotations(updatedAnnotations)
  }

  const handleExportAnnotations = () => {
    // Create export data
    const exportData = {
      fileName: 'example.tsx',
      exportDate: new Date().toISOString(),
      totalAnnotations: customAnnotations.length,
      annotations: customAnnotations.map(annotation => ({
        id: annotation.id,
        lineNumber: annotation.lineNumber,
        text: annotation.text,
        author: annotation.author,
        timestamp: annotation.timestamp.toISOString(),
        codeVersion: annotation.codeVersion,
        lineContent: annotation.lineContent,
        status: annotation.status
      }))
    }

    // Convert to JSON
    const jsonString = JSON.stringify(exportData, null, 2)

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `annotations-${new Date().getTime()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportAnnotations = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedData = JSON.parse(content)

        // Validate the imported data structure
        if (!importedData.annotations || !Array.isArray(importedData.annotations)) {
          alert('Invalid annotation file format')
          return
        }

        // Convert imported annotations to the correct format
        const newAnnotations: CustomAnnotation[] = importedData.annotations.map((annotation: {
          id: string
          lineNumber: number
          text: string
          author: string
          timestamp: string
          codeVersion: string
          lineContent: string
          status: 'current' | 'outdated' | 'moved'
        }) => ({
          id: annotation.id,
          lineNumber: annotation.lineNumber,
          text: annotation.text,
          author: annotation.author,
          timestamp: new Date(annotation.timestamp),
          codeVersion: annotation.codeVersion,
          lineContent: annotation.lineContent,
          status: annotation.status
        }))

        // Merge with existing annotations (avoid duplicates by ID)
        const existingIds = new Set(customAnnotations.map(a => a.id))
        const uniqueNewAnnotations = newAnnotations.filter(a => !existingIds.has(a.id))

        setCustomAnnotations([...customAnnotations, ...uniqueNewAnnotations])

        // Show success message
        alert(`Successfully imported ${uniqueNewAnnotations.length} annotations!`)

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } catch (error) {
        console.error('Error importing annotations:', error)
        alert('Failed to import annotations. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const toggleAnnotation = (lineNumber: number) => {
    setExpandedAnnotation(expandedAnnotation === lineNumber ? null : lineNumber)
  }

  // File note handlers
  const handleAddFileNote = () => {
    if (newNoteText.trim()) {
      const newNote: FileNote = {
        id: Date.now().toString(),
        text: newNoteText,
        author: 'Current User',
        timestamp: new Date()
      }
      setFileNotes([...fileNotes, newNote])
      setNewNoteText('')
      setShowAddNoteForm(false)
    }
  }

  const handleDeleteFileNote = (id: string) => {
    setFileNotes(fileNotes.filter(note => note.id !== id))
  }

  const handleEditFileNote = (id: string, newText: string) => {
    setFileNotes(fileNotes.map(note =>
      note.id === id ? { ...note, text: newText, timestamp: new Date() } : note
    ))
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
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Code Viewer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and explore your code with syntax highlighting, hover tooltips, and annotations
        </p>

        {/* Bookmarks Section */}
        {bookmarks.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⭐</span>
              <h2 className="font-semibold text-sm">Bookmarked Files ({bookmarks.length})</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {bookmarks.map((file, index) => (
                <button
                  key={index}
                  className="px-3 py-1 bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 rounded text-xs font-mono hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors flex items-center gap-2"
                  onClick={() => {
                    // In a real app, this would navigate to the file
                    alert(`Navigating to ${file}`)
                  }}
                  aria-label={`Navigate to bookmarked file ${file}`}
                >
                  <span>{file}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setBookmarks(bookmarks.filter(f => f !== file))
                      if (file === currentFileName) {
                        setIsBookmarked(false)
                      }
                    }}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                    aria-label={`Remove ${file} from bookmarks`}
                  >
                    ×
                  </button>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* File Notes Section */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <h2 className="font-semibold text-sm">File Notes ({fileNotes.length})</h2>
            </div>
            <button
              onClick={() => setShowAddNoteForm(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
              aria-label="Add new file note"
            >
              + Add Note
            </button>
          </div>

          {fileNotes.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              No notes yet. Click &quot;+ Add Note&quot; to add notes about this file or module.
            </p>
          ) : (
            <div className="space-y-3">
              {fileNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg"
                >
                  <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">{note.text}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <span className="font-medium">{note.author}</span>
                      <span>•</span>
                      <span>{note.timestamp.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newText = prompt('Edit note:', note.text)
                          if (newText && newText.trim()) {
                            handleEditFileNote(note.id, newText)
                          }
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        aria-label={`Edit note from ${note.author}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this note?')) {
                            handleDeleteFileNote(note.id)
                          }
                        }}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline"
                        aria-label={`Delete note from ${note.author}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Code viewer */}
      <div>
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">File:</span>
                <span className="text-sm font-mono font-semibold">
                  example.tsx
                </span>
                <button
                  onClick={toggleBookmark}
                  className={`ml-2 text-xl transition-all hover:scale-110 ${
                    isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'
                  }`}
                  title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                  aria-label={isBookmarked ? 'Remove file from bookmarks' : 'Add file to bookmarks'}
                  aria-pressed={isBookmarked}
                >
                  {isBookmarked ? '⭐' : '☆'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Version:</span>
                <select
                  value={currentVersionId}
                  onChange={(e) => handleVersionChange(e.target.value)}
                  className="text-sm font-mono border border-border rounded px-2 py-1 bg-background"
                  aria-label="Select code version"
                >
                  {codeVersions.map(version => (
                    <option key={version.id} value={version.id}>
                      {version.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={triggerFileInput}
                className="text-sm px-3 py-1 rounded border border-border bg-background hover:bg-accent flex items-center gap-2"
                title="Import annotations from JSON file"
                aria-label="Import annotations from JSON file"
              >
                📥 Import Annotations
              </button>
              <button
                onClick={handleExportAnnotations}
                disabled={customAnnotations.length === 0}
                className="text-sm px-3 py-1 rounded border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Export annotations as JSON"
                aria-label={`Export ${customAnnotations.length} annotations as JSON`}
              >
                📦 Export Annotations ({customAnnotations.length})
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportAnnotations}
                className="hidden"
              />
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
                        aria-label={`View ${builtInAnnotations[index + 1].type} annotation on line ${index + 1}`}
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
                        aria-label={`View custom annotation on line ${index + 1}`}
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
                      aria-label={`Add annotation to line ${index + 1}`}
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
                              <div className="font-semibold mb-1 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span>📝</span>
                                  <span>Custom Annotation</span>
                                </div>
                                {annotation.status && annotation.status !== 'current' && (
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    annotation.status === 'outdated' ? 'bg-red-100 text-red-700 border border-red-300' :
                                    annotation.status === 'moved' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                                    ''
                                  }`}>
                                    {annotation.status === 'outdated' ? '⚠️ Outdated' : '↕️ Moved'}
                                  </span>
                                )}
                              </div>
                              <p className="mb-2">{annotation.text}</p>
                              <div className="text-xs text-purple-600 flex flex-wrap items-center gap-2">
                                <span>By: {annotation.author}</span>
                                <span>•</span>
                                <span>{annotation.timestamp.toLocaleString()}</span>
                                <span>•</span>
                                <span>Version: {annotation.codeVersion}</span>
                                {annotation.status === 'outdated' && (
                                  <>
                                    <span>•</span>
                                    <span className="text-red-600">Original line: &quot;{annotation.lineContent.substring(0, 30)}...&quot;</span>
                                  </>
                                )}
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
            <p>📝 Hover over any line and click &quot;+ Add annotation&quot; to add custom notes</p>
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
                <ul className="text-muted-foreground list-none space-y-1 mt-1">
                  {functionMetadata[hoveredFunction].calledBy?.map((caller, i) => (
                    <li key={i} className="text-xs">
                      <span className="text-foreground">{caller.name}</span>
                      <span className="text-muted-foreground ml-1">({caller.file})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {functionMetadata[hoveredFunction].connectsTo && (
              <div>
                <span className="font-semibold">Connects to:</span>
                <ul className="text-muted-foreground list-disc list-inside mt-1">
                  {functionMetadata[hoveredFunction].connectsTo?.map((connection, i) => (
                    <li key={i} className="text-xs">{connection}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Annotation form modal */}
      {showAnnotationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="annotation-modal-title">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 id="annotation-modal-title" className="text-lg font-semibold mb-4">Add Annotation to Line {selectedLine}</h3>
            <label htmlFor="annotation-text" className="sr-only">Annotation text</label>
            <textarea
              id="annotation-text"
              value={annotationText}
              onChange={(e) => setAnnotationText(e.target.value)}
              placeholder="Enter your annotation text..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background min-h-[120px]"
              autoFocus
              aria-label="Annotation text"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAnnotationForm(false)
                  setAnnotationText('')
                  setSelectedLine(null)
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition"
                aria-label="Cancel annotation"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAnnotation}
                disabled={!annotationText.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Save annotation"
              >
                Save Annotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add File Note modal */}
      {showAddNoteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="note-modal-title">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 id="note-modal-title" className="text-lg font-semibold mb-4">Add File Note</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a note about this file or module to help team members understand its purpose and important details.
            </p>
            <label htmlFor="file-note-text" className="sr-only">File note text</label>
            <textarea
              id="file-note-text"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Enter your note about this file..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background min-h-[120px]"
              autoFocus
              aria-label="File note text"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAddNoteForm(false)
                  setNewNoteText('')
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition"
                aria-label="Cancel file note"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFileNote}
                disabled={!newNoteText.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Save file note"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
