'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Editor } from './Editor'
import { Plus, Trash2, MoveUp, MoveDown, Globe, Loader2, Type, FileText, Tag, Image, Upload, X } from 'lucide-react'
import { ArticleSection, Category } from '@/types/database'

interface StructuredArticleEditorProps {
  onPublish: (articleData: ArticleData) => Promise<{ success: boolean; url: string }>
  initialData?: Partial<ArticleData>
  categories: Category[]
  onCreateCategory: (name: string) => Promise<Category>
}

export interface ArticleData {
  title: string
  slug: string
  excerpt: string
  image_id: string | null  // Cloudflare Images ID
  category_id: string | null
  sections: ArticleSection[]
}

export default function StructuredArticleEditor({ 
  onPublish, 
  initialData, 
  categories: initialCategories,
  onCreateCategory 
}: StructuredArticleEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageId, setImageId] = useState<string | null>(initialData?.image_id || null)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [categoryId, setCategoryId] = useState(initialData?.category_id || null)
  const [categories, setCategories] = useState<Category[]>(initialCategories) // Make categories dynamic
  const [sections, setSections] = useState<ArticleSection[]>(
    initialData?.sections || [{
      id: crypto.randomUUID(),
      header: '',
      content: '',
      order: 0
    }]
  )
  const [isPublishing, setIsPublishing] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [hasChanges, setHasChanges] = useState(!initialData) // Track if anything has changed

  const isEditMode = !!initialData

  // Check if content has changed from initial data
  const checkForChanges = () => {
    if (!initialData) {
      setHasChanges(true) // New article always has changes
      return
    }

    const hasContentChanges = 
      title !== (initialData.title || '') ||
      slug !== (initialData.slug || '') ||
      excerpt !== (initialData.excerpt || '') ||
      categoryId !== (initialData.category_id || null) ||
      imageFile !== null || // New image uploaded
      imageId !== (initialData.image_id || null) || // Image removed/changed
      JSON.stringify(sections) !== JSON.stringify(initialData.sections || [])

    setHasChanges(hasContentChanges)
  }

  // Check for changes whenever relevant state changes
  useEffect(() => {
    checkForChanges()
  }, [title, slug, excerpt, categoryId, imageFile, imageId, sections, initialData])

  // Generate Cloudflare Images URL from imageId
  const getImageUrl = (imageId: string): string => {
    return `https://imagedelivery.net/${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH}/${imageId}/public`
  }

  // Set initial image preview if we have an existing imageId
  useEffect(() => {
    if (initialData?.image_id && !imagePreview) {
      const imageUrl = getImageUrl(initialData.image_id)
      console.log('🖼️ Setting initial image preview:', imageUrl)
      setImagePreview(imageUrl)
    }
  }, [initialData?.image_id, imagePreview])

  // Debug logging for image state
  useEffect(() => {
    console.log('🔍 Image state:', { imageId, imagePreview: !!imagePreview, imageFile: !!imageFile })
  }, [imageId, imagePreview, imageFile])

  // Generate URL-friendly slug from title
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  }

  // Auto-generate slug when title changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    
    // Only auto-generate if slug is empty or matches previous title's slug
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle))
    }
  }

  // Optimized image handling - only process locally, upload on publish
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('Image size should be less than 5MB')
      return
    }

    setIsProcessingImage(true)

    try {
      // Only create local preview - no upload to R2 yet
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
        setImageFile(file) // Store file for later upload
        setIsProcessingImage(false)
        console.log('✅ Image ready for publishing:', file.name, formatBytes(file.size))
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('❌ Image processing failed:', error)
      setIsProcessingImage(false)
      alert('Failed to process image. Please try again.')
    }
  }

  // Remove image (handles both new uploads and existing images)
  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageId(null) // Clear existing image ID as well
    console.log('🗑️ Image removed')
  }

  // Format bytes helper
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Upload image to API (only called during publish)
  const uploadImageToAPI = async (file: File, slug: string): Promise<{ id: string; url: string; variants: any }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('slug', slug)

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Image upload failed')
    }

    const result = await response.json()
    return result
  }

  const addSection = () => {
    const newSection: ArticleSection = {
      id: crypto.randomUUID(),
      header: '',
      content: '',
      order: sections.length
    }
    setSections([...sections, newSection])
  }

  const removeSection = (sectionId: string) => {
    if (sections.length <= 1) return
    const updatedSections = sections
      .filter(section => section.id !== sectionId)
      .map((section, index) => ({ ...section, order: index }))
    setSections(updatedSections)
  }

  const updateSection = (sectionId: string, field: 'header' | 'content', value: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, [field]: value }
        : section
    ))
  }

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === sectionId)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sections.length - 1)
    ) return

    const newSections = [...sections]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    // Swap sections
    ;[newSections[currentIndex], newSections[targetIndex]] = 
     [newSections[targetIndex], newSections[currentIndex]]
    
    // Update order
    newSections.forEach((section, index) => {
      section.order = index
    })
    
    setSections(newSections)
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    
    setIsCreatingCategory(true)
    try {
      const category = await onCreateCategory(newCategoryName.trim())
      
      // Check if category already exists in local state (in case server returns existing)
      const existingIndex = categories.findIndex(cat => cat.id === category.id)
      if (existingIndex === -1) {
        setCategories(prev => [...prev, category]) // Add new category to dropdown
      }
      
      setCategoryId(category.id)
      setNewCategoryName('')
      setShowNewCategoryInput(false)
      
      console.log('✅ Category created and added to dropdown:', category.name)
    } catch (error) {
      console.error('Failed to create category:', error)
      alert('Failed to create category. Please try again.')
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const handlePublish = async () => {
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }
    if (!slug.trim()) {
      alert('Please enter a URL slug')
      return
    }
    if (!excerpt.trim()) {
      alert('Please enter an excerpt')
      return
    }
    if (!imagePreview && !imageFile && !imageId) {
      alert('Please add an image for the article')
      return
    }
    if (!categoryId) {
      alert('Please select a category')
      return
    }
    if (sections.some(s => !s.header.trim() || !s.content.trim())) {
      alert('Please fill in all section headers and content')
      return
    }

    setIsPublishing(true)
    try {
      // Upload image to Cloudflare Images if needed
      let finalImageId = imageId
      
      if (imageFile && slug.trim()) {
        console.log('🖼️ Uploading image...')
        console.log(`📊 File: ${imageFile.name} (${formatBytes(imageFile.size)})`)
        
        const uploadResult = await uploadImageToAPI(imageFile, slug.trim())
        finalImageId = uploadResult.id
        console.log('✅ Image uploaded successfully')
        
        // Clear the file since it's now uploaded
        setImageFile(null)
        setImageId(finalImageId)
      }

      const articleData: ArticleData = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        image_id: finalImageId,
        category_id: categoryId,
        sections: sections.map((section, index) => ({
          ...section,
          header: section.header.trim(),
          content: section.content.trim(),
          order: index
        }))
      }

      const result = await onPublish(articleData)
      if (result.success) {
        if (isEditMode) {
          alert(`Article updated successfully! View it at: ${result.url}`)
          router.push('/articles')
        } else {
          alert(`Article published successfully! View it at: ${result.url}`)
          
          // Reset form only for new articles
          setTitle('')
          setSlug('')
          setExcerpt('')
          setImageFile(null)
          setImagePreview(null)
          setImageId(null)
          setCategoryId(null)
          setSections([{
            id: crypto.randomUUID(),
            header: '',
            content: '',
            order: 0
          }])
        }
      }
    } catch (error) {
      console.error('Publishing error:', error)
      alert('Failed to publish article. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }

  const isFormValid = title.trim() && slug.trim() && excerpt.trim() && (imagePreview || imageFile || imageId) && categoryId && 
    sections.every(s => s.header.trim() && s.content.trim())

  return (
    <div className="space-y-8">
      {/* Article Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Article Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter article title..."
                className="font-medium"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated-from-title"
                  className="font-mono text-sm flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSlug(generateSlug(title))}
                  disabled={!title}
                  className="px-3"
                  title="Regenerate slug from title"
                >
                  🔄
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This will be your article URL: /{slug || 'your-article-title'}
                {!slug && title && (
                  <span className="text-blue-600 ml-1">
                    (auto-generated from title)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Article Image */}
          <div className="space-y-2">
            <Label htmlFor="image">Article Image</Label>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Article preview" 
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                    disabled={isProcessingImage || isPublishing}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  {isProcessingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <span className="text-sm">Processing...</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Add an image for your article</p>
                  <p className="text-sm text-gray-500">JPG, PNG, or WebP (max 5MB)</p>
                  <p className="text-xs text-blue-600 mt-2">✨ Uploads when you publish</p>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isProcessingImage || isPublishing}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image')?.click()}
                  className="flex items-center gap-2"
                  disabled={isProcessingImage || isPublishing}
                >
                  {isProcessingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isProcessingImage ? 'Processing...' : (imagePreview ? 'Change Image' : 'Choose Image')}
                </Button>
                {imageFile && !isProcessingImage && (
                  <span className="text-sm text-blue-600">
                    📋 Ready to publish ({formatBytes(imageFile.size)})
                  </span>
                )}
                {imagePreview && !imageFile && !isProcessingImage && (
                  <span className="text-sm text-green-600">
                    ✓ Image ready
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            
            <div className="flex items-center gap-2">
              <Select value={categoryId || ''} onValueChange={setCategoryId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {showNewCategoryInput && (
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleCreateCategory}
                  disabled={isCreatingCategory || !newCategoryName.trim()}
                >
                  {isCreatingCategory ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Create'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNewCategoryInput(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description of your article..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Article Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Article Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sections.map((section, index) => (
            <div key={section.id} className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Section {index + 1}</h3>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveSection(section.id, 'up')}
                    disabled={index === 0}
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveSection(section.id, 'down')}
                    disabled={index === sections.length - 1}
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSection(section.id)}
                    disabled={sections.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor={`header-${section.id}`}>Section Header</Label>
                  <Input
                    id={`header-${section.id}`}
                    value={section.header}
                    onChange={(e) => updateSection(section.id, 'header', e.target.value)}
                    placeholder="Enter section header..."
                    className="font-medium"
                  />
                </div>

                <div>
                  <Label htmlFor={`content-${section.id}`}>Section Content</Label>
                  <Editor
                    content={section.content}
                    onChange={(content) => updateSection(section.id, 'content', content)}
                    placeholder="Write your section content..."
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addSection}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </CardContent>
      </Card>

      {/* Publish Button */}
      <div className="flex justify-end">
        <div className="text-right">
          {isEditMode && !hasChanges && (
            <p className="text-sm text-muted-foreground mb-2">
              No changes made to publish
            </p>
          )}
          <Button
            type="button"
            onClick={handlePublish}
            disabled={!isFormValid || isPublishing || isProcessingImage || !hasChanges}
            className="min-w-[120px]"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? 'Updating...' : 'Publishing...'}
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update Article' : 'Publish Article'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 