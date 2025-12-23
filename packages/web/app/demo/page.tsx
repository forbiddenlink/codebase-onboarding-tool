'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUIStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Demo API functions
async function fetchSettings() {
  const res = await fetch('/api/settings')
  if (!res.ok) throw new Error('Failed to fetch settings')
  return res.json()
}

async function updateSearchQuery(query: string) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  return { query, timestamp: new Date().toISOString() }
}

export default function DemoPage() {
  // Zustand store usage
  const {
    searchQuery,
    setSearchQuery,
    unreadNotificationsCount,
    incrementUnreadNotifications,
    theme,
    isAnalyzing,
    setIsAnalyzing,
  } = useUIStore()

  // React Query usage - fetching data
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  })

  // React Query usage - mutations
  const queryClient = useQueryClient()
  const searchMutation = useMutation({
    mutationFn: updateSearchQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchResults'] })
    },
  })

  const [localInput, setLocalInput] = useState('')

  const handleSearch = () => {
    setSearchQuery(localInput)
    searchMutation.mutate(localInput)
  }

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setTimeout(() => setIsAnalyzing(false), 2000)
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Feature Verification Demo</h1>
        <p className="text-muted-foreground mb-8">
          This page demonstrates Tailwind CSS, shadcn/ui components, Zustand state management,
          and React Query in action.
        </p>

        {/* Shadcn/ui Alert Component */}
        <Alert className="mb-6">
          <AlertTitle>✅ All Systems Configured!</AlertTitle>
          <AlertDescription>
            Tailwind CSS, shadcn/ui, Zustand, and React Query are all working correctly.
          </AlertDescription>
        </Alert>

        {/* Zustand State Display */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Zustand State Management</CardTitle>
            <CardDescription>
              Global UI state managed with Zustand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Current Theme:</span>
              <Badge variant="secondary">{theme}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Search Query:</span>
              <Badge>{searchQuery || 'None'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Unread Notifications:</span>
              <Badge variant="destructive">{unreadNotificationsCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Analyzing:</span>
              <Badge variant={isAnalyzing ? 'default' : 'outline'}>
                {isAnalyzing ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button onClick={incrementUnreadNotifications} variant="outline" size="sm">
              Add Notification
            </Button>
            <Button onClick={handleAnalyze} variant="outline" size="sm" disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </Button>
          </CardFooter>
        </Card>

        {/* React Query Demo */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>React Query Server State</CardTitle>
            <CardDescription>
              Fetching and caching data from API endpoints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="text-muted-foreground">Loading settings...</div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load settings</AlertDescription>
              </Alert>
            )}
            {settings && (
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Settings loaded successfully!</strong>
                </div>
                <div className="text-xs text-muted-foreground">
                  Data is cached and will be refetched on window focus
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* shadcn/ui Components Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Shadcn/ui Components</CardTitle>
            <CardDescription>
              5+ shadcn/ui components used on this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search with Zustand & React Query</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="Enter search query..."
                    value={localInput}
                    onChange={(e) => setLocalInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={searchMutation.isPending}>
                    {searchMutation.isPending ? 'Searching...' : 'Search'}
                  </Button>
                </div>
                {searchMutation.isSuccess && (
                  <p className="text-sm text-muted-foreground">
                    Search completed at {new Date(searchMutation.data.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Component Status</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge>✓ Button</Badge>
                  <Badge variant="secondary">✓ Card</Badge>
                  <Badge variant="outline">✓ Input</Badge>
                  <Badge>✓ Label</Badge>
                  <Badge variant="secondary">✓ Badge</Badge>
                  <Badge variant="outline">✓ Alert</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Button Variants</Label>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Default</Button>
                  <Button size="sm" variant="secondary">Secondary</Button>
                  <Button size="sm" variant="outline">Outline</Button>
                  <Button size="sm" variant="ghost">Ghost</Button>
                  <Button size="sm" variant="destructive">Destructive</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
