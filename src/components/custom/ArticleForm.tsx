'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Editor } from './Editor'
import { Loader2 } from 'lucide-react'

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

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true)
    try {
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