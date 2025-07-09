"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  const [formData, setFormData] = useState({
    _id: blog._id,
    title: blog.title,
    content: blog.content,
    description: blog.description,
    authorId: blog.authorId,
    tags: blog.tags,
    imageURL: blog.imageURL,
    category: blog.category,
    categoryName: "" // Add this to store category name
  })

  // Add this effect to set initial category name
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://api.thegpdn.org/api/admin/fetchthreadCategory')
        const data = await response.json()
        if (data.success) {
          setCategories(data.data)
          // Find and set the initial category name
          const initialCategory = data.data.find((cat: { _id: string; category: string }) => cat._id === blog.category)
          if (initialCategory) {
            setFormData(prev => ({
              ...prev,
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
  }, [])

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
      const response = await fetch('https://api.thegpdn.org/api/admin/editNewsAndBlogs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const response = await fetch('https://api.thegpdn.org/api/admin/deleteNewsAndBlogs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ BlogId: blog._id })
        })

        const data = await response.json()
        if (data.success) {
          toast.success('Blog deleted successfully')
          window.location.reload()
        } else {
          toast.error('Failed to delete blog')
        }
      } catch (error) {
        toast.error('Error deleting blog')
        console.error('Error:', error)
      }
    }
  }

  const handleApproveOrDecline = async (approve: boolean) => {
    try {
      const response = await fetch('https://api.thegpdn.org/api/admin/approveORdeclineBlogs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: blog._id,
          actionStatus: approve
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`Blog ${approve ? 'approved' : 'declined'} successfully`)
        window.location.reload()
      } else {
        toast.error(`Failed to ${approve ? 'approve' : 'decline'} blog`)
      }
    } catch (error) {
      toast.error(`Error ${approve ? 'approving' : 'declining'} blog`)
      console.error('Error:', error)
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
          <DropdownMenuItem onClick={() => handleApproveOrDecline(true)}>Approve</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleApproveOrDecline(false)}>Decline</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                required
              />
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
                  <img 
                    src={formData.imageURL} 
                    alt="Blog image" 
                    className="max-w-full h-auto rounded-md"
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