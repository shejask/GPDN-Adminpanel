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
} from "@/components/ui/dialog"
import { formatDistanceToNow, format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { Thread } from "./columns"

interface ThreadDetailsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  thread: Thread;
}

export function ThreadDetailsDialog({ open = false, onOpenChange, thread }: ThreadDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(open)
  
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold">Thread Details</DialogTitle>
          <DialogDescription>
            Viewing details for thread created {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-6">
          {/* Thread Title */}
          <div className="rounded-lg p-4 shadow-md border">
            <h3 className="text-lg font-semibold mb-2">Title</h3>
            <p className="text-base">{thread.title}</p>
          </div>
          
          {/* Thread Thumbnail */}
          {thread.thumbnail && (
            <div className="rounded-lg p-4 shadow-md border">
              <h3 className="text-lg font-semibold mb-2">Thumbnail</h3>
              <div className="relative overflow-hidden rounded-md aspect-video max-h-48 flex items-center justify-center border">
                <Image 
                  src={thread.thumbnail} 
                  alt="Thread thumbnail" 
                  width={400}
                  height={225}
                  className="object-cover" 
                />
              </div>
            </div>
          )}
          
          {/* Thread Content */}
          <div className="rounded-lg p-4 shadow-md border">
            <h3 className="text-lg font-semibold mb-2">Content</h3>
            <div className="border rounded-md p-4 bg-white text-white">
              <div 
                className="prose max-w-none text-white" 
                dangerouslySetInnerHTML={{ __html: thread.content }} 
              />
            </div>
          </div>
          
          {/* Thread Author */}
          <div className="rounded-lg p-4 shadow-md border">
            <h3 className="text-lg font-semibold mb-3">Author</h3>
            <div className="flex items-center">
              <Avatar className="h-12 w-12 mr-4 ring-2">
                {thread.authorId?.imageURL ? (
                  <AvatarImage src={thread.authorId.imageURL} alt={thread.authorId.fullName || 'Author'} />
                ) : (
                  <AvatarFallback>
                    {thread.authorId?.fullName ? thread.authorId.fullName.charAt(0) : 'A'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-medium">{thread.authorId?.fullName || 'Unknown Author'}</p>
                <p className="text-sm text-muted-foreground">{thread.authorId?.email || 'No email'}</p>
              </div>
            </div>
          </div>
          
          {/* Thread Tags */}
          <div className="rounded-lg p-4 shadow-md border">
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {parseTags(thread.tags).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="px-3 py-1.5"
                >
                  {tag}
                </Badge>
              ))}
              {parseTags(thread.tags).length === 0 && (
                <p className="text-sm text-muted-foreground">No tags</p>
              )}
            </div>
          </div>
          
          {/* Thread Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg p-4 shadow-md border">
              <h3 className="text-lg font-semibold mb-3">Stats</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Upvotes</span>
                  <span className="font-medium">{thread.upVote?.length || 0}</span>
                </li>
                <li className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Downvotes</span>
                  <span className="font-medium">{thread.downVote?.length || 0}</span>
                </li>
                <li className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Shares</span>
                  <span className="font-medium">{thread.shares || 0}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-muted-foreground">Comments</span>
                  <span className="font-medium">{thread.comments?.length || 0}</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg p-4 shadow-md border">
              <h3 className="text-lg font-semibold mb-3">Dates</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{format(new Date(thread.createdAt), 'PPP')}</span>
                </li>
                
                <li className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <span>
                    {thread.approvalStatus ? (
                      <Badge variant="default">Approved</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <DialogFooter className="border-t pt-4">
          <Button 
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}