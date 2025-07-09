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

  // Initialize editor on client side only
  useEffect(() => {
    setEditorLoaded(true)
  }, [])

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://api.thegpdn.org/api/admin/fetchthreadCategory')
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

    // Create a separate payload with only the required fields for the API
    const payload = {
      title: formData.title,
      content: formData.content,
      description: formData.description,
      authorId: formData.authorId,
      category: formData.category,
      tags: formData.tags,
      file: formData.imageURL  // Using 'file' as required by the API
    }

    try {
      const response = await fetch('https://api.thegpdn.org/api/blog/AddNewsAndBlogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
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
          <div className="grid gap-2">
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
                    className="text-black" 
                    key={category._id} 
                    value={category.category}
                  >
                    {category.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags.join(',')}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value ? e.target.value.split(',').map(tag => tag.trim()) : [] }))}
              placeholder="tag1, tag2, tag3"
              required
            />
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
                <img 
                  src={formData.imageURL} 
                  alt="Blog image preview" 
                  className="max-h-32 rounded-md border" 
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