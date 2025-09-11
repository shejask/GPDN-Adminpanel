"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import { Blog } from "./columns"
import { useEffect } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="h-64 border rounded-md flex items-center justify-center">Loading editor...</div>,
})
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const blog = row.original as Blog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Array<{ _id: string; category: string }>>([])  
  const [editorLoaded, setEditorLoaded] = useState(false)
  
  // Helper function to get category string value
  const getCategoryString = (category: string | Record<string, unknown>): string => {
    if (typeof category === 'string') {
      return category
    }
    if (category && typeof category === 'object') {
      return (category.category as string) || (category.name as string) || String(category)
    }
    return ''
  }

  // Helper function to get category ID
  const getCategoryId = (category: string | Record<string, unknown>): string => {
    if (typeof category === 'string') {
      return category
    }
    if (category && typeof category === 'object') {
      return (category._id as string) || (category.id as string) || String(category)
    }
    return ''
  }

  const [formData, setFormData] = useState({
    _id: blog._id,
    title: blog.title,
    content: blog.content,
    description: blog.description,
    authorId: blog.authorId,
    tags: blog.tags,
    imageURL: blog.imageURL,
    category: getCategoryString(blog.category),
    categoryId: getCategoryId(blog.category),
    categoryName: getCategoryString(blog.category)
  })

  // Initialize editor on client side only
  useEffect(() => {
    setEditorLoaded(true)
  }, [])

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://api.thegpdn.org/api/blog/fetchCategory')
        const data = await response.json()
        if (data.success) {
          setCategories(data.data)
          // Find and set the initial category name
          const blogCategoryString = getCategoryString(blog.category)
          const initialCategory = data.data.find((cat: { _id: string; category: string }) => 
            cat._id === getCategoryId(blog.category) || cat.category === blogCategoryString
          )
          if (initialCategory) {
            setFormData(prev => ({
              ...prev,
              category: initialCategory.category,
              categoryId: initialCategory._id,
              categoryName: initialCategory.category
            }))
          }
        } else {
          toast.error('Failed to fetch categories')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast.error('Error fetching categories')
      }
    }

    fetchCategories()
  }, [blog.category])

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

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Send the appropriate category value based on what the API expects
      const submitData = {
        ...formData,
        category: formData.categoryId || formData.category // Use ID if available, otherwise use name
      }
      
      const response = await fetch('https://api.thegpdn.org/api/blog/EditNewsAndBlogs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Blog updated successfully')
        setEditDialogOpen(false)
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="grid gap-4 py-4">
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
                  const selectedCategory = categories.find(cat => cat.category === value)
                  setFormData(prev => ({
                    ...prev,
                    category: value,
                    categoryId: selectedCategory ? selectedCategory._id : '',
                    categoryName: selectedCategory ? selectedCategory.category : ''
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue>
                    {formData.categoryName || "Select a category"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat.category}>
                      {cat.category}
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
              <Label htmlFor="image">Image</Label>
              {formData.imageURL && (
                <div className="mb-2">
                  <Image 
                    src={formData.imageURL} 
                    alt="Blog image" 
                    className="max-w-full h-auto rounded-md"
                    width={300}
                    height={200}
                  />
                </div>
              )}
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Blog"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}