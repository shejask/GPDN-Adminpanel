"use client"

import { useEffect, useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import dynamic from "next/dynamic"
import Image from "next/image"

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="h-64 border rounded-md flex items-center justify-center">Loading editor...</div>,
})

export function CreateBlogDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Array<{ _id: string; category: string }>>([])
  const [editorLoaded, setEditorLoaded] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    description: "",
    authorId: "661f27a84fbc902a6a5b493c",
    tags: [] as string[],
    imageURL: "",
    category: "",
    categoryName: ""
  })
  
  const [tagInput, setTagInput] = useState("")

  // Initialize editor on client side only
  useEffect(() => {
    setEditorLoaded(true)
  }, [])

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

  // Helper function to convert data URL to File object
  const dataURLtoFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    return new File([blob], filename, { type: blob.type })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageURL: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Create FormData object for the API
    const formDataToSend = new FormData()
    formDataToSend.append('title', formData.title)
    formDataToSend.append('content', formData.content)
    formDataToSend.append('description', formData.description)
    formDataToSend.append('authorId', formData.authorId)
    formDataToSend.append('category', formData.category)
    // Format tags as a JSON string array as expected by the API
    formDataToSend.append('tags', JSON.stringify(formData.tags))
    
    // Convert base64 image to file if it exists
    if (formData.imageURL && formData.imageURL.startsWith('data:')) {
      const file = await dataURLtoFile(formData.imageURL, 'blog-thumbnail.jpg')
      formDataToSend.append('file', file)
    }

    try {
      const response = await fetch('https://api.thegpdn.org/api/blog/AddNewsAndBlogs', {
        method: 'POST',
        body: formDataToSend
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Blog created successfully')
        setOpen(false)
        // Reset form
        setFormData({
          title: "",
          content: "",
          description: "",
          authorId: "661f27a84fbc902a6a5b493c",
          tags: [],
          imageURL: "",
          category: "",
          categoryName: ""
        })
        // Refresh the table
        window.location.reload()
      } else {
        toast.error('Failed to create blog')
      }
    } catch (error) {
      toast.error('Error creating blog')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Blog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Blog</DialogTitle>
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
          <div className="grid gap-2 pt-5">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category}
              onValueChange={(value) => {
                const selectedCategory = categories.find(cat => cat._id === value)
                setFormData(prev => ({
                  ...prev,
                  category: value,
                  categoryName: selectedCategory ? selectedCategory.category : ''
                }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category">
                  {formData.categoryName || "Select a category"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories && categories.map((category) => (
                  <SelectItem 
                    className="text-white" 
                    key={category._id} 
                    value={category._id}
                  >
                    {category.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <div 
                  key={index} 
                  className="bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center gap-1"
                >
                  <span>{tag}</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        tags: prev.tags.filter((_, i) => i !== index)
                      }))
                    }}
                    className="text-primary hover:text-primary/80"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Enter a tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    e.preventDefault()
                    if (!formData.tags.includes(tagInput.trim())) {
                      setFormData(prev => ({
                        ...prev,
                        tags: [...prev.tags, tagInput.trim()]
                      }))
                    }
                    setTagInput('')
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={() => {
                  if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                    setFormData(prev => ({
                      ...prev,
                      tags: [...prev.tags, tagInput.trim()]
                    }))
                    setTagInput('')
                  }
                }}
              >
                Add
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Press Enter or click Add to add a tag
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Thumbnail</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {formData.imageURL && (
              <div className="mt-2">
                <p className="text-sm mb-1">Preview:</p>
                <Image 
                  src={formData.imageURL} 
                  alt="Blog image preview" 
                  className="max-h-32 rounded-md border" 
                  width={200}
                  height={150}
                />
              </div>
            )}
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Blog"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}