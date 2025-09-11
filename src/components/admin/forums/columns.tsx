"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { MoreHorizontal, Trash2, Eye, CheckCircle, XCircle, Edit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { DeleteThreadDialog } from "@/components/admin/forums/delete-thread-dialog"
import { EditThreadDialog } from "@/components/admin/forums/edit-thread-dialog"
import { ThreadDetailsDialog } from "@/components/admin/forums/thread-details-dialog"
import { useToast } from "@/components/ui/use-toast"

export type Thread = {
  _id: string
  title: string
  content: string
  authorId: {
    _id: string
    fullName: string
    email: string
    imageURL: string
  }
  thumbnail: string
  tags: string[]
  upVote: string[]
  downVote: string[]
  shares: number
  comments: Array<Record<string, unknown>>
  approvalStatus: boolean
  createdAt: string
  updatedAt: string
}

// Create a separate ActionCell component to fix React hooks usage
function ActionCell({ thread }: { thread: Thread }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const { toast } = useToast()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  
  const handleApprovalChange = async (approve: boolean) => {
    try {
      if (approve) {
        setIsApproving(true)
      } else {
        setIsRejecting(true)
      }
      
      console.log('Attempting to change approval status:', { threadId: thread._id, approvalStatus: approve })
      
      // Use the production API endpoint with PATCH method as specified
      const response = await fetch(`https://api.thegpdn.org/api/admin/approveORdeclineThreads`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId: thread._id,
          approvalStatus: approve
        }),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Failed to ${approve ? 'approve' : 'reject'} thread: ${response.status}`)
      }
      
      console.log('Successfully changed approval status to:', approve)

      toast({
        title: approve ? "Thread approved" : "Thread rejected",
        description: `The thread has been successfully ${approve ? 'approved' : 'rejected'}.`,
        variant: "default",
      })
      
      // Refresh the page to update the thread list
      window.location.reload()
    } catch (error) {
      console.error(`Error ${approve ? 'approving' : 'rejecting'} thread:`, error)
      toast({
        title: "Error",
        description: `Failed to ${approve ? 'approve' : 'reject'} the thread. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
      setIsRejecting(false)
    }
  }
  
  return (
    <div className="flex space-x-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowDetailsDialog(true)} 
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowEditDialog(true)} 
        title="Edit Thread"
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      {!thread.approvalStatus && (
        <>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleApprovalChange(true)}
            disabled={isApproving}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            title="Approve Thread"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleApprovalChange(false)}
            disabled={isRejecting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Reject Thread"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </>
      )}
      
      {thread.approvalStatus && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleApprovalChange(false)}
          disabled={isRejecting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          title="Revoke Thread"
        >
          <XCircle className="h-4 w-4" />
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {showDeleteDialog && (
        <DeleteThreadDialog 
          open={showDeleteDialog}
          threadId={thread._id}
          threadTitle={thread.title}
        />
      )}
      
      {showEditDialog && (
        <EditThreadDialog
          open={showEditDialog}
          onOpenChange={(open) => setShowEditDialog(open)}
          thread={thread}
        />
      )}
      
      {showDetailsDialog && (
        <ThreadDetailsDialog
          open={showDetailsDialog}
          onOpenChange={(open) => setShowDetailsDialog(open)}
          thread={thread}
        />
      )}
    
    </div>
  )
}

export const columns: ColumnDef<Thread>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <div className="h-8 w-8 mr-2 rounded-md overflow-hidden flex-shrink-0">
            {row.original.thumbnail ? (
              <Image 
                src={row.original.thumbnail} 
                alt={row.original.title} 
                width={32}
                height={32}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                {row.original.title.charAt(0)}
              </div>
            )}
          </div>
          <div className="font-medium">{row.original.title}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "authorId",
    header: "Author",
    cell: ({ row }) => {
      const author = row.original.authorId
      
      // Add null check for author
      if (!author) {
        return (
          <div className="flex items-center">
            <div className="h-8 w-8 mr-2 rounded-full overflow-hidden flex-shrink-0">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                N/A
              </div>
            </div>
            <div>Unknown Author</div>
          </div>
        )
      }
      
      return (
        <div className="flex items-center">
          <div className="h-8 w-8 mr-2 rounded-full overflow-hidden flex-shrink-0">
            {author.imageURL ? (
              <Image 
                src={author.imageURL} 
                alt={author.fullName || 'Author'} 
                width={32}
                height={32}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                {author.fullName ? author.fullName.charAt(0) : 'A'}
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{author.fullName}</div>
            <div className="text-xs text-muted-foreground">{author.email}</div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags.map(tag => {
        try {
          return JSON.parse(tag);
        } catch {
          return [tag];
        }
      }).flat();
      
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag, i) => (
            <Badge key={i} variant="outline">{tag}</Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline">+{tags.length - 2}</Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "approvalStatus",
    header: "Status",
    cell: ({ row }) => {
      return row.original.approvalStatus ? (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      ) : (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      return formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      return <ActionCell thread={row.original} />
    },
  },
]
