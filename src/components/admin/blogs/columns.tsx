"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { Button } from "@/components/ui/button"
import { Eye, Trash2, Edit } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { BlogDetailDialog } from "./blog-detail-dialog"
import { EditBlogDialog } from "./edit-blog-dialog"
import Image from "next/image"

// ActionButtons component for blog actions
interface ActionButtonsProps {
  blog: Blog;
}

const ActionButtons = ({ blog }: ActionButtonsProps) => {
  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const response = await fetch('https://api.thegpdn.org/api/blog/DeleteNewsAndBlogs', {
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

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setEditOpen(true)}
        className="text-green-600 hover:text-green-700 hover:bg-green-100"
        title="Edit blog"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setDetailOpen(true)}
        className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleDelete}
        className="text-red-500 hover:text-red-700 hover:bg-red-100"
        title="Delete blog"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      {/* Edit blog dialog */}
      <EditBlogDialog 
        blog={blog} 
        open={editOpen} 
        onOpenChange={setEditOpen} 
      />
      
      {/* Blog detail dialog */}
      <BlogDetailDialog 
        blog={blog} 
        open={detailOpen} 
        onOpenChange={setDetailOpen} 
      />
    </div>
  )
}

// Define the category object type based on the API response
type CategoryObject = {
  _id: string;
  category: string;  // The actual category name
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type Blog = {
  _id: string
  title: string
  description: string
  content: string
  authorId: string
  tags: string[]
  imageURL: string
  thumbnail: string
  category: string | CategoryObject  // Category can be either a string or an object
  approvalStatus: boolean
  likes: string[]
  dislikes: string[]
  comments: Array<{ id: string; text: string; userId: string; createdAt: string }>
  createdAt: string
  updatedAt: string
  __v?: number
}

export const columns: ColumnDef<Blog>[] = [
  {
    id: "thumbnail",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Thumbnail" />,
    cell: ({ row }) => {
      // Try different possible image fields
      const imageUrl = row.original.thumbnail || row.original.imageURL || "";
      
      return (
        <div className="flex items-center justify-center py-2">
          {imageUrl ? (
            <div className="relative w-[80px] h-[60px] overflow-hidden rounded-md border border-gray-200 shadow-sm">
              <Image 
                src={imageUrl} 
                alt={row.original.title} 
                fill
                sizes="80px"
                className="object-cover"
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : (
            <div className="w-[80px] h-[60px] bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500 shadow-sm">
              No image
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => (
      <div className="font-medium max-w-[200px] truncate" title={row.original.title}>
        {row.original.title}
      </div>
    )
  },
  {
    accessorKey: "tags",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tags" />,
    cell: ({ row }) => {
      // Parse tags if they're stored as a JSON string
      const parseTags = (tags: string[]) => {
        if (!tags || !tags.length) return []
        try {
          // Handle the case where tags might be stored as a JSON string array
          if (typeof tags[0] === 'string' && tags[0].startsWith('[')) {
            return JSON.parse(tags[0])
          }
          return tags
        } catch (error) {
          console.error('Error parsing tags:', error)
          return []
        }
      }
      
      const tags = parseTags(row.original.tags)
      
      return (
        <div className="flex flex-wrap gap-1 max-w-[200px] overflow-hidden">
          {tags.length > 0 ? (
            tags.slice(0, 2).map((tag: string, index: number) => (
              <span 
                key={index} 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs">No tags</span>
          )}
          {tags.length > 2 && (
            <span className="text-xs text-gray-500">+{tags.length - 2}</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "likes",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Likes" />,
    cell: ({ row }) => {
      const likes = row.original.likes?.length || 0
      return (
        <div className="text-center">
          <span className="font-medium">{likes}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => {
      // Get category display value based on API response structure
      let categoryValue = 'Unknown';
      
      const category = row.original.category;
      if (typeof category === 'string') {
        // If category is directly a string
        categoryValue = category;
      } else if (typeof category === 'object' && category !== null) {
        // If category is an object with the structure from the API response
        if ('category' in category && typeof category.category === 'string') {
          categoryValue = category.category;
        } else if ('_id' in category) {
          // Fallback to ID if no category name is found
          categoryValue = `Category ID: ${String(category._id).substring(0, 8)}...`;
        }
      }
      
      return (
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {categoryValue}
        </div>
      );
    }
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created Date" />,
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return (
        <div className="text-sm">
          {date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const blog = row.original
      return <ActionButtons blog={blog} />
    },
  }
]
