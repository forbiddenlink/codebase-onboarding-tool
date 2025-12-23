'use client'

import { useState, useMemo } from 'react'
import AppLayout from '@/components/AppLayout'

// Sample files for search (in a real app, this would come from the database)
const sampleFiles = [
  { name: 'index.ts', path: 'src/index.ts', type: 'typescript', language: 'TypeScript', content: 'import express from "express"\nconst app = express()\napp.listen(3000)', size: 1245 },
  { name: 'userService.ts', path: 'src/services/userService.ts', type: 'typescript', language: 'TypeScript', content: 'export class UserService {\n  async getUser(id: string) {\n    return database.users.findById(id)\n  }\n}', size: 3421 },
  { name: 'auth.ts', path: 'src/middleware/auth.ts', type: 'typescript', language: 'TypeScript', content: 'import jwt from "jsonwebtoken"\nexport function authenticate(req, res, next) {\n  const token = req.headers.authorization\n  jwt.verify(token, secret)\n}', size: 2156 },
  { name: 'client.ts', path: 'src/database/client.ts', type: 'typescript', language: 'TypeScript', content: 'import { PrismaClient } from "@prisma/client"\nexport const database = new PrismaClient()', size: 876 },
  { name: 'user.ts', path: 'src/types/user.ts', type: 'typescript', language: 'TypeScript', content: 'export interface User {\n  id: string\n  name: string\n  email: string\n}', size: 432 },
  { name: 'logger.ts', path: 'src/utils/logger.ts', type: 'typescript', language: 'TypeScript', content: 'export const logger = {\n  info: (msg: string) => console.log(msg),\n  error: (msg: string) => console.error(msg)\n}', size: 654 },
  { name: 'app.py', path: 'app.py', type: 'python', language: 'Python', content: 'from flask import Flask\napp = Flask(__name__)\n\n@app.route("/")\ndef hello():\n    return "Hello World"', size: 2134 },
  { name: 'user_service.py', path: 'services/user_service.py', type: 'python', language: 'Python', content: 'class UserService:\n    def get_user(self, user_id):\n        return database.find_user(user_id)', size: 1876 },
  { name: 'auth.py', path: 'middleware/auth.py', type: 'python', language: 'Python', content: 'import jwt\ndef authenticate(request):\n    token = request.headers.get("Authorization")\n    return jwt.decode(token, secret)', size: 1543 },
  { name: 'client.py', path: 'database/client.py', type: 'python', language: 'Python', content: 'import sqlite3\nclass Database:\n    def __init__(self):\n        self.conn = sqlite3.connect("app.db")', size: 987 },
  { name: 'logger.py', path: 'utils/logger.py', type: 'python', language: 'Python', content: 'import logging\nlogger = logging.getLogger(__name__)\nlogger.setLevel(logging.INFO)', size: 765 },
  { name: 'README.md', path: 'README.md', type: 'markdown', language: 'Markdown', content: '# My Project\n\nThis is a sample project with TypeScript and Python code.', size: 234 },
  { name: 'package.json', path: 'package.json', type: 'json', language: 'JSON', content: '{\n  "name": "my-app",\n  "version": "1.0.0"\n}', size: 456 },
  { name: 'tsconfig.json', path: 'tsconfig.json', type: 'json', language: 'JSON', content: '{\n  "compilerOptions": {\n    "strict": true\n  }\n}', size: 321 },
  { name: 'requirements.txt', path: 'requirements.txt', type: 'text', language: 'Text', content: 'flask==2.0.1\npyjwt==2.1.0\nsqlite3', size: 123 },
]

// Calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

// Fuzzy match score (lower is better, 0 is exact match)
function fuzzyMatchScore(query: string, target: string): number {
  const lowerQuery = query.toLowerCase()
  const lowerTarget = target.toLowerCase()

  // Exact match
  if (lowerTarget === lowerQuery) return 0

  // Starts with query
  if (lowerTarget.startsWith(lowerQuery)) return 1

  // Contains query
  if (lowerTarget.includes(lowerQuery)) return 2

  // Fuzzy match with Levenshtein distance
  const distance = levenshteinDistance(lowerQuery, lowerTarget)

  // Tolerance based on query length
  const tolerance = Math.ceil(lowerQuery.length * 0.3)

  if (distance <= tolerance) {
    return 3 + distance / 10
  }

  return Infinity // No match
}

interface SearchResult {
  file: typeof sampleFiles[0]
  score: number
  matchType: 'exact' | 'starts-with' | 'contains' | 'fuzzy' | 'content'
  contentMatches?: Array<{ line: number; text: string; context: string }>
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'name' | 'content'>('name')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Get unique languages from files
  const availableLanguages = useMemo(() => {
    const languages = new Set(sampleFiles.map(f => f.language))
    return Array.from(languages).sort()
  }, [])

  // Search results with fuzzy matching and content search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const results: SearchResult[] = []

    for (const file of sampleFiles) {
      // Filter by language if selected
      if (selectedLanguages.length > 0 && !selectedLanguages.includes(file.language)) {
        continue
      }

      if (searchType === 'name') {
        // File name search with fuzzy matching
        const nameScore = fuzzyMatchScore(searchQuery, file.name)
        const pathScore = fuzzyMatchScore(searchQuery, file.path)

        const score = Math.min(nameScore, pathScore)

        if (score !== Infinity) {
          let matchType: SearchResult['matchType'] = 'fuzzy'
          if (score === 0) matchType = 'exact'
          else if (score === 1) matchType = 'starts-with'
          else if (score === 2) matchType = 'contains'

          results.push({ file, score, matchType })
        }
      } else if (searchType === 'content') {
        // Full-text content search
        const lines = file.content.split('\n')
        const contentMatches: SearchResult['contentMatches'] = []

        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(searchQuery.toLowerCase())) {
            // Get context (line before and after)
            const contextLines = [
              lines[index - 1] || '',
              line,
              lines[index + 1] || ''
            ]

            contentMatches.push({
              line: index + 1,
              text: line.trim(),
              context: contextLines.join('\n')
            })
          }
        })

        if (contentMatches.length > 0) {
          results.push({
            file,
            score: 0,
            matchType: 'content',
            contentMatches
          })
        }
      }
    }

    // Sort by score (lower is better)
    results.sort((a, b) => a.score - b.score)

    return results
  }, [searchQuery, searchType, selectedLanguages])

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Search</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Find files by name with fuzzy matching or search code content
          </p>
        </div>

        {/* Search Input */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchType === 'name'
                  ? "Search files by name (e.g., 'user', 'auth', 'index')..."
                  : "Search code content (e.g., 'express', 'jwt', 'database')..."
              }
              className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              aria-label="Search input"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          </div>

          {/* Search Type Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setSearchType('name')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'name'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                aria-label="Search by file name"
                aria-pressed={searchType === 'name'}
              >
                📄 File Name
              </button>
              <button
                onClick={() => setSearchType('content')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'content'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                aria-label="Search by code content"
                aria-pressed={searchType === 'content'}
              >
                📝 Code Content
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle filters"
              aria-expanded={showFilters}
            >
              🎛️ Filters {selectedLanguages.length > 0 && `(${selectedLanguages.length})`}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Filter by Language
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableLanguages.map(language => (
                  <button
                    key={language}
                    onClick={() => toggleLanguage(language)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedLanguages.includes(language)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
                    }`}
                    aria-label={`Filter by ${language}`}
                    aria-pressed={selectedLanguages.includes(language)}
                  >
                    {language}
                  </button>
                ))}
              </div>
              {selectedLanguages.length > 0 && (
                <button
                  onClick={() => setSelectedLanguages([])}
                  className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  aria-label="Clear all language filters"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="space-y-4">
          {searchQuery && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              {selectedLanguages.length > 0 && ` in ${selectedLanguages.join(', ')}`}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500 dark:text-gray-400">No results found</p>
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                Try adjusting your search query or filters
              </p>
            </div>
          )}

          {searchResults.map((result, index) => (
            <div
              key={`${result.file.path}-${index}`}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {result.file.name}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      result.matchType === 'exact'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : result.matchType === 'starts-with'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : result.matchType === 'contains'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : result.matchType === 'content'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {result.matchType === 'content' ? 'Content Match' : result.matchType}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      {result.file.language}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {result.file.path}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {(result.file.size / 1024).toFixed(1)} KB
                  </p>

                  {/* Content Matches */}
                  {result.contentMatches && result.contentMatches.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {result.contentMatches.slice(0, 3).map((match, matchIndex) => (
                        <div key={matchIndex} className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                          <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                            Line {match.line}
                          </div>
                          <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono overflow-x-auto">
                            <code
                              dangerouslySetInnerHTML={{
                                __html: match.text.replace(
                                  new RegExp(searchQuery, 'gi'),
                                  '<mark class="bg-yellow-200 dark:bg-yellow-900/50">$&</mark>'
                                )
                              }}
                            />
                          </pre>
                        </div>
                      ))}
                      {result.contentMatches.length > 3 && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          +{result.contentMatches.length - 3} more match{result.contentMatches.length - 3 !== 1 ? 'es' : ''}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <button
                  className="ml-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  aria-label={`Open ${result.file.name}`}
                >
                  Open →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!searchQuery && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              Start typing to search files
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  📄 File Name Search
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  Search by file name with fuzzy matching. Handles typos and partial matches.
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-500 mt-2">
                  Try: "user", "auth", "index"
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                  📝 Content Search
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-400">
                  Search within file contents. Highlights matches with context.
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-500 mt-2">
                  Try: "express", "jwt", "database"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
