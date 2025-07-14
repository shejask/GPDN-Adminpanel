"use client"

import { useState } from "react"
import { Row } from "@tanstack/react-table"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
// Select imports removed as they were unused
import { MoreHorizontalIcon } from "lucide-react"
import { toast } from "react-hot-toast"
import { Resource } from "./columns"
import { Badge } from "@/components/ui/badge"
import { Cross2Icon } from "@radix-ui/react-icons"
import dynamic from "next/dynamic"

// Import the rich text editor dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

// Add to imports
import { useEffect } from "react"

interface Category {
  _id: string
  category: string
}

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

function TagInput({ value, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <Badge key={index} variant="secondary" className="px-2 py-1 flex items-center gap-1">
            {tag}
            <button 
              type="button" 
              onClick={() => removeTag(tag)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Cross2Icon className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a tag and press Enter"
      />
    </div>
  );
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>): React.ReactNode {
  const resource = row.original as Resource
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState(resource)
  const [content, setContent] = useState(resource.content || "")
  const [tags, setTags] = useState<string[]>(resource.tags || [])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  // Categories are fetched and used for dropdown selection
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://api.thegpdn.org/api/admin/fetchresourceCategory")
        if (!response.ok) throw new Error("Failed to fetch categories")
        const data = await response.json()
        setCategories(data.data)
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast.error("Failed to load categories")
      }
    }

    if (editDialogOpen) {
      fetchCategories()
    }
  }, [editDialogOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      setNewFiles(prev => [...prev, ...Array.from(selectedFiles)])
    }
  }
  
  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
  }
  
  const removeExistingFile = (url: string) => {
    setEditFormData({
      ...editFormData,
      files: editFormData.files.filter(fileUrl => fileUrl !== url)
    })
  }

  // This function is kept for future use but currently not called
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleApproveOrDecline = async (approve: boolean) => {
    try {
      const response = await fetch('https://api.thegpdn.org/api/admin/approveORdeclineResource', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId: resource._id,
          actionStatus: approve
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to ${approve ? 'approve' : 'decline'} resource`)
      }

      toast.success(`Resource ${approve ? 'approved' : 'declined'} successfully`)
      window.location.reload()
    } catch (error) {
      toast.error(`Failed to ${approve ? 'approve' : 'decline'} resource`)
      console.error('Error updating resource status:', error)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // If we have new files, we need to use FormData
      if (newFiles.length > 0) {
        const formData = new FormData()
        formData.append('_id', resource._id)
        formData.append('title', editFormData.title)
        formData.append('description', editFormData.description)
        formData.append('content', content)
        formData.append('tags', JSON.stringify(tags))
        
        // Add existing files that weren't removed
        formData.append('existingFiles', JSON.stringify(editFormData.files))
        
        // Add new files
        newFiles.forEach(file => {
          formData.append('newFiles', file)
        })
        
        const response = await fetch('https://api.thegpdn.org/api/resource/EditResource', {
          method: 'PATCH',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error('Failed to update resource')
        }
      } else {
        // If no new files, we can use JSON
        const response = await fetch('https://api.thegpdn.org/api/resource/EditResource', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _id: resource._id,
            title: editFormData.title,
            description: editFormData.description,
            content: content,
            tags: tags,
            files: editFormData.files
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to update resource')
        }
      }



      toast.success('Resource updated successfully');
      setEditDialogOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update resource');
      console.error('Error updating resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resource?")) return

    try {
      const response = await fetch('https://api.thegpdn.org/api/resource/DeleteResource', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId: resource._id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete resource')
      }

      toast.success('Resource deleted successfully')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to delete resource')
      console.error('Error deleting resource:', error)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/resources/${resource._id}`}>View Details</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Approval/Decline removed as per user request */}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={handleDelete}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>
              Make changes to the resource here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="Enter resource title"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Enter resource description"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <div className="min-h-[200px]">
                  {editDialogOpen && (
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      placeholder="Enter rich content here..."
                      className="h-[150px] mb-12"
                    />
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="files">Files</Label>
                
                {/* Existing files */}
                {editFormData.files && editFormData.files.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm font-medium">Current Files:</p>
                    <div className="max-h-32 overflow-y-auto">
                      {editFormData.files.map((fileUrl, index) => {
                        const fileName = fileUrl.split('/').pop() || 'file';
                        const fileExt = fileName.split('.').pop()?.toLowerCase();
                        
                        return (
                          <div key={index} className="flex items-center justify-between py-1 border-b">
                            <div className="flex items-center gap-2">
                              {fileExt && ['jpg', 'jpeg', 'png', 'gif'].includes(fileExt) ? (
                                <Image 
                                  src={fileUrl} 
                                  alt={fileName} 
                                  width={32}
                                  height={32}
                                  className="object-cover rounded"
                                />
                              ) : (
                                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded">
                                  <span className="text-xs uppercase">{fileExt}</span>
                                </div>
                              )}
                              <span className="text-sm truncate max-w-[200px]">{fileName}</span>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeExistingFile(fileUrl)}
                            >
                              <Cross2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Upload new files */}
                <Input
                  id="files"
                  type="file"
                  accept="image/*,video/*,.pdf,.docx,.doc"
                  onChange={handleFileChange}
                  multiple
                />
                
                {/* New files preview */}
                {newFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm font-medium">New Files:</p>
                    <div className="max-h-32 overflow-y-auto">
                      {newFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between py-1 border-b">
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeNewFile(index)}
                          >
                            <Cross2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <TagInput value={tags} onChange={setTags} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}