"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons"
import { toast } from "react-hot-toast"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"

// Import the rich text editor dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { 
  ssr: false,
  loading: () => <div className="h-40 border rounded-md flex items-center justify-center">Loading editor...</div>
})
import "react-quill/dist/quill.snow.css"

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

export function CreateResourceDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [editorLoaded, setEditorLoaded] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    authorId: "6809566a07a7740c4443afa8"
  })

  // Initialize editor on client side only
  useEffect(() => {
    setEditorLoaded(true)
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://api.thegpdn.org/api/admin/fetchresourceCategory")
        if (!response.ok) throw new Error("Failed to fetch categories")
        const data = await response.json()
        setCategories(data.data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      setFiles(prev => [...prev, ...Array.from(selectedFiles)])
    }
  }
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) {
      toast.error("Please select at least one file")
      return
    }
    
    // Check file sizes - limit to 10MB per file
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} file(s) exceed the 10MB size limit. Please compress or resize your files.`);
      return;
    }
    
    // Check total upload size - limit to 50MB total
    const TOTAL_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB
    const totalSize = files.reduce((total, file) => total + file.size, 0);
    
    if (totalSize > TOTAL_SIZE_LIMIT) {
      toast.error(`Total upload size (${(totalSize / (1024 * 1024)).toFixed(2)}MB) exceeds the 50MB limit. Please reduce the number or size of files.`);
      return;
    }

    setLoading(true)

    try {
      const data = new FormData()
      data.append("title", formData.title)
      data.append("description", formData.description)
      data.append("content", content)
      data.append("authorId", formData.authorId)
      data.append("tags", JSON.stringify(tags))
      
      // Add category if selected
      if (selectedCategory) {
        data.append("category", selectedCategory)
      }
      
      // Append multiple files with the key 'file' (singular) as expected by the server
      files.forEach((file) => {
        data.append('file', file)
      })

      const response = await fetch("https://api.thegpdn.org/api/resource/AddResource", {
        method: "POST",
        body: data, 
      })

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error("Files are too large. Please reduce file sizes or upload fewer files.")
        } else {
          // Try to get more detailed error information from the response
          let errorDetail = `${response.status} ${response.statusText}`;
          try {
            const errorResponse = await response.text();
            console.log('Server error response:', errorResponse);
            if (errorResponse) {
              try {
                const parsedError = JSON.parse(errorResponse);
                if (parsedError.message) {
                  errorDetail = parsedError.message;
                }
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              } catch (_parseError) {
                // If it's not JSON, use the raw text
                errorDetail = errorResponse;
              }
            }
          } catch (error) {
            console.error('Failed to parse error response:', error);
          }
          throw new Error(`Failed to create resource: ${errorDetail}`)
        }
      }

      toast.success("Resource created successfully")
      setOpen(false)
      setFormData({
        title: "",
        description: "",
        authorId: "6809566a07a7740c4443afa8"
      })
      setContent("")
      setTags([])
      setFiles([])
      setSelectedCategory("")
      window.location.reload()
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : { message: "Failed to create resource" };
      const errorMessage = errorObj.message;
      toast.error(errorMessage);
      console.error("Error creating resource:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Resource</DialogTitle>
          <DialogDescription>
            Add a new resource to the platform. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter resource title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter resource description"
                required
              />
            </div>
            {categories.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <div className="min-h-[200px]">
                {editorLoaded && (
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Enter rich content here..."
                    className="h-[150px] mb-12"
                  />
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="files">Files Upload</Label>
              <Input
                id="files"
                type="file"
                accept="image/*,video/*,.pdf,.docx,.doc"
                onChange={handleFileChange}
                multiple
              />
              {files.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium">Selected Files ({files.length}):</p>
                  <div className="max-h-32 overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between py-1 px-2 border rounded">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm truncate block">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeFile(index)}
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
              {loading ? "Creating..." : "Create Resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}