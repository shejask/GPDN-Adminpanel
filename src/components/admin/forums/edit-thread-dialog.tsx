"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusIcon, UploadIcon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons"
import { toast } from "react-hot-toast"
import dynamic from "next/dynamic"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Thread } from "./columns"

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="h-64 border rounded-md flex items-center justify-center">Loading editor...</div>,
})

interface EditThreadDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  thread: Thread;
}

export function EditThreadDialog({ open = false, onOpenChange, thread }: EditThreadDialogProps) {
  const [isOpen, setIsOpen] = useState(open)
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [users, setUsers] = useState<Array<{ _id: string; fullName: string; email: string; imageURL?: string }>>([])
  const [tagInput, setTagInput] = useState("")
  
  // Parse tags from thread
  const parseTags = (threadTags: string[]) => {
    try {
      return threadTags.map(tag => {
        try {
          return JSON.parse(tag);
        } catch {
          return tag;
        }
      }).flat();
    } catch {
      return [];
    }
  };
  
  const [tags, setTags] = useState<string[]>(parseTags(thread?.tags || []))
  
  const [formData, setFormData] = useState({
    title: thread?.title || "",
    content: thread?.content || "",
    authorId: thread?.authorId?._id || "",
    thumbnail: thread?.thumbnail || ""
  })
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [editorLoaded, setEditorLoaded] = useState(false)
  
  // Initialize editor on client side only
  useEffect(() => {
    setEditorLoaded(true)
  }, [])
  
  // Handle external open state changes
  useEffect(() => {
    setIsOpen(open)
  }, [open])
  
  // Notify parent component of open state changes
  useEffect(() => {
    if (typeof onOpenChange === 'function') {
      onOpenChange(isOpen)
    }
  }, [isOpen, onOpenChange])
  
  // Fetch users when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen])
  
  // Function to fetch users from API
  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('https://api.thegpdn.org/api/admin/fetchUser', { 
        cache: 'no-store' 
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }
  
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  }
  
  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create FormData to send file along with other data
      const submitFormData = new FormData()
      
      // Add only the required _id field
      submitFormData.append('_id', thread._id)
      
      // Add other fields (these are optional but included based on your form)
      submitFormData.append('title', formData.title)
      submitFormData.append('content', formData.content)
      
      // Add tags as JSON string array
      submitFormData.append('tags', JSON.stringify(tags))
      
      // Add file if selected
      if (thumbnailFile) {
        submitFormData.append('file', thumbnailFile)
      }
      
      // Send the request with FormData
      const response = await fetch("https://api.thegpdn.org/api/thread/EditThread", {
        method: "PATCH",
        body: submitFormData, // Don't set Content-Type header, let browser set it with boundary
      })

      if (!response.ok) {
        throw new Error("Failed to update thread")
      }

      const result = await response.json()
      
      if (result.success) {
        toast.success("Thread updated successfully")
        setIsOpen(false)
        // Optionally refresh the threads list
        window.location.reload()
      } else {
        throw new Error(result.message || "Failed to update thread")
      }
    } catch (error) {
      toast.error("Failed to update thread")
      console.error("Error updating thread:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Thread</DialogTitle>
          <DialogDescription>
            Edit the thread details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter thread title"
                className="focus-visible:ring-primary/50 transition-all duration-200"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content" className="text-sm font-medium">Content</Label>
              {editorLoaded && (
                <div className="min-h-[200px] border rounded-md overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Enter thread content"
                    className="h-64"
                  />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="authorId" className="text-sm font-medium">Author</Label>
              <Select
                value={formData.authorId}
                onValueChange={(value) => setFormData({ ...formData, authorId: value })}
              >
                <SelectTrigger className="w-full focus-visible:ring-primary/50 transition-all duration-200">
                  <SelectValue placeholder="Select an author" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <ScrollArea className="h-[200px] pt-3">
                    {loadingUsers ? (
                      <div className="flex items-center justify-center p-4">
                        <span className="text-sm text-muted-foreground">Loading authors...</span>
                      </div>
                    ) : users.length === 0 ? (
                      <div className="flex items-center justify-center p-4">
                        <span className="text-sm text-muted-foreground">No authors found</span>
                      </div>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user._id} value={user._id} className="flex items-center py-2 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              {user.imageURL ? (
                                <AvatarImage src={user.imageURL} alt={user.fullName} />
                              ) : (
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {user.fullName?.charAt(0) || 'U'}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <span className="font-medium">{user.fullName || user.email}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
              <div className="min-h-[40px] flex flex-wrap gap-2 mb-2 border rounded-md p-2">
                {tags.length > 0 ? tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="px-3 py-1.5 text-sm flex items-center gap-1 bg-primary/10 hover:bg-primary/20 transition-all duration-200"
                  >
                    {tag}
                    <button 
                      type="button"
                      onClick={() => setTags(tags.filter((_, i) => i !== index))}
                      className="ml-1 rounded-full hover:bg-primary/30 p-1 transition-all duration-200"
                    >
                      <Cross2Icon className="h-3 w-3" />
                    </button>
                  </Badge>
                )) : (
                  <span className="text-sm text-muted-foreground p-1">No tags added yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  id="tagInput"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  className="focus-visible:ring-primary/50 transition-all duration-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      e.preventDefault()
                      if (!tags.includes(tagInput.trim())) {
                        setTags([...tags, tagInput.trim()])
                      }
                      setTagInput('')
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  className="transition-all duration-200 hover:bg-primary/10"
                  onClick={() => {
                    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                      setTags([...tags, tagInput.trim()])
                      setTagInput('')
                    }
                  }}
                  disabled={!tagInput.trim() || tags.includes(tagInput.trim())}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              {tags.length === 0 && (
                <p className="text-sm text-muted-foreground">Add at least one tag</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="thumbnail" className="text-sm font-medium">Thumbnail</Label>
              <div className="border rounded-md p-4 bg-muted/30">
                {formData.thumbnail ? (
                  <div className="space-y-3">
                    <div className="relative overflow-hidden rounded-md aspect-video max-h-48 flex items-center justify-center bg-muted">
                      <Image 
                        src={formData.thumbnail} 
                        alt="Thumbnail preview" 
                        className="object-cover w-full h-full" 
                        width={400}
                        height={225}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">Image uploaded successfully</p>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setFormData({ ...formData, thumbnail: "" })
                          setThumbnailFile(null)
                        }}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md text-center space-y-2">
                    <UploadIcon className="h-8 w-8 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Drag & drop or click to upload</p>
                      <p className="text-xs text-muted-foreground">Supports JPG, PNG, GIF up to 5MB</p>
                    </div>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setThumbnailFile(file);
                          // Create a preview URL
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, thumbnail: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="mt-2"
                      onClick={() => document.getElementById('thumbnail')?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)} 
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.title || !formData.content || tags.length === 0}
              className="gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>Update Thread</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}