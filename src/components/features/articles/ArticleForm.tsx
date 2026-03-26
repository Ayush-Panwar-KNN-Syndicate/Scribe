'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Editor } from './Editor'
import { Loader2, Globe } from 'lucide-react'
import { useDomain } from '@/contexts/DomainContext'

interface ArticleFormProps {
  action: (formData: FormData) => Promise<void>
  initialData?: {
    title: string
    content_markdown: string
    excerpt: string
  }
}

export default function ArticleForm({ action, initialData }: ArticleFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content_markdown || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [isSaving, setIsSaving] = useState(false)
  const { currentDomain } = useDomain()

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true)
    try {
      // Add domain to form data
      if (currentDomain) {
        formData.append('domain', currentDomain.domain)
      }
      await action(formData)
      alert('Article saved successfully!')
    } catch (error) {
      alert('Failed to save article. Please try again.')
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Domain Badge */}
      {currentDomain && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">
                Publishing to:
              </span>
              <strong className="text-blue-600 dark:text-blue-400">
                {currentDomain.siteName}
              </strong>
              <span className="text-gray-500 dark:text-gray-400">
                ({currentDomain.domain})
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <form action={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Article Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your article title..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description of your article..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <Editor
                content={content}
                onChange={setContent}
                placeholder="Start writing your article..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Article'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}        