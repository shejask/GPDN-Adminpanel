"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import { Blog } from "./columns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="h-64 border rounded-md flex items-center justify-center">Loading editor...</div>,
})

interface EditBlogDialogProps {
  blog: Blog
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditBlogDialog({ blog, open, onOpenChange }: EditBlogDialogProps) {
  const [isOpen, setIsOpen] = useState(open || false)
  const [loading, setLoading] = useState(false)
  const [editorLoaded, setEditorLoaded] = useState(false)
  const [, setNewThumbnailFile] = useState<File | null>(null)
  const [previewThumbnail, setPreviewThumbnail] = useState<string>("")
  const [formData, setFormData] = useState({
    _id: blog._id,
    title: blog.title,
    description: blog.description,
    content: blog.content,
    tags: Array.isArray(blog.tags) ? blog.tags : [],
    category: typeof blog.category === 'string' ? blog.category : (blog.category as { _id: string })?._id || ""
  })
  
  const [categories, setCategories] = useState<Array<{ _id: string; category: string }>>([])
  const [newTag, setNewTag] = useState("")

  // Initialize editor on client side only
  useEffect(() => {
    setEditorLoaded(true)
  }, [])

  // Sync external open state
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  // Notify parent of state changes
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen)
    }
  }, [isOpen, onOpenChange])

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://api.thegpdn.org/api/admin/fetchCategory')
        const data = await response.json()
        if (data.success) {
          setCategories(data.data)
        } else {
          toast.error('Failed to fetch categories')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast.error('Error fetching categories')
      }
    }

    fetchCategories()
  }, [])

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
    ],
  }
  
  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image',
    'blockquote', 'code-block',
    'color', 'background',
    'align'
  ]

  // Handle thumbnail file change
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewThumbnail(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('https://api.thegpdn.org/api/blog/EditNewsAndBlogs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Blog updated successfully')
        setIsOpen(false)
        window.location.reload()
      } else {
        toast.error('Failed to update blog')
      }
    } catch (error) {
      toast.error('Error updating blog')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Blog</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <div className="min-h-[300px]">
              {editorLoaded && (
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Enter blog content here..."
                  className="h-[250px] mb-12"
                />
              )}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category}
              onValueChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  category: value
                }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem 
                    key={category._id} 
                    value={category._id}
                  >
                    {category.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2 pt-5">
            <Label htmlFor="thumbnail">Thumbnail</Label>
            
            {/* Current thumbnail display */}
            {(blog.thumbnail || blog.imageURL) && !previewThumbnail && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-2">Current thumbnail:</p>
                <div className="relative w-[200px] h-[150px] overflow-hidden rounded-md border">
                  <Image 
                    src={blog.thumbnail || blog.imageURL} 
                    alt="Current thumbnail" 
                    fill
                    sizes="200px"
                    className="object-cover"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            )}
            
            {/* New thumbnail preview */}
            {previewThumbnail && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-2">New thumbnail preview:</p>
                <div className="relative w-[200px] h-[150px] overflow-hidden rounded-md border">
                  <Image 
                    src={previewThumbnail} 
                    alt="New thumbnail preview" 
                    fill
                    sizes="200px"
                    className="object-cover"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            )}
            
            {/* File upload */}
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
            />
            <p className="text-sm text-muted-foreground">
              Upload a new image to replace the current thumbnail
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
          </div>
          
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Blog"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}