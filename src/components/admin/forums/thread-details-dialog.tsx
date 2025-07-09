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
import { ScrollArea } from "@/components/ui/scroll-area"
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
        } catch (e) {
          return tag;
        }
      }).flat();
    } catch (e) {
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-800">
        <DialogHeader className="border-b border-gray-800 pb-4">
          <DialogTitle className="text-2xl font-bold text-white">Thread Details</DialogTitle>
          <DialogDescription className="text-gray-400">
            Viewing details for thread created {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-6">
          {/* Thread Title */}
          <div className="bg-gray-800 rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">Title</h3>
            <p className="text-base text-white">{thread.title}</p>
          </div>
          
          {/* Thread Thumbnail */}
          {thread.thumbnail && (
            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-blue-400">Thumbnail</h3>
              <div className="relative overflow-hidden rounded-md aspect-video max-h-48 flex items-center justify-center bg-gray-700 border border-gray-700">
                <img 
                  src={thread.thumbnail} 
                  alt="Thread thumbnail" 
                  className="object-cover w-full h-full" 
                />
              </div>
            </div>
          )}
          
          {/* Thread Content */}
          <div className="bg-gray-800 rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">Content</h3>
            <div className="border border-gray-700 rounded-md p-4 bg-gray-800">
              <div 
                className="prose prose-invert max-w-none text-white" 
                dangerouslySetInnerHTML={{ __html: thread.content }} 
              />
            </div>
          </div>
          
          {/* Thread Author */}
          <div className="bg-gray-800 rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">Author</h3>
            <div className="flex items-center">
              <Avatar className="h-12 w-12 mr-4 ring-2 ring-blue-500">
                {thread.authorId?.imageURL ? (
                  <AvatarImage src={thread.authorId.imageURL} alt={thread.authorId.fullName || 'Author'} />
                ) : (
                  <AvatarFallback className="bg-blue-600 text-white">
                    {thread.authorId?.fullName ? thread.authorId.fullName.charAt(0) : 'A'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-medium text-white">{thread.authorId?.fullName || 'Unknown Author'}</p>
                <p className="text-sm text-gray-400">{thread.authorId?.email || 'No email'}</p>
              </div>
            </div>
          </div>
          
          {/* Thread Tags */}
          <div className="bg-gray-800 rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {parseTags(thread.tags).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="px-3 py-1.5 bg-blue-900/40 text-blue-300 border-blue-700 hover:bg-blue-800/50"
                >
                  {tag}
                </Badge>
              ))}
              {parseTags(thread.tags).length === 0 && (
                <p className="text-sm text-gray-400">No tags</p>
              )}
            </div>
          </div>
          
          {/* Thread Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">Stats</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Upvotes</span>
                  <span className="font-medium text-white bg-blue-900/30 px-3 py-1 rounded-full">{thread.upVote?.length || 0}</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Downvotes</span>
                  <span className="font-medium text-white bg-red-900/30 px-3 py-1 rounded-full">{thread.downVote?.length || 0}</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Shares</span>
                  <span className="font-medium text-white bg-green-900/30 px-3 py-1 rounded-full">{thread.shares || 0}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-400">Comments</span>
                  <span className="font-medium text-white bg-purple-900/30 px-3 py-1 rounded-full">{thread.comments?.length || 0}</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">Dates</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Created</span>
                  <span className="font-medium text-white">{format(new Date(thread.createdAt), 'PPP')}</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="font-medium text-white">{format(new Date(thread.updatedAt), 'PPP')}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-400">Status</span>
                  <span>
                    {thread.approvalStatus ? (
                      <Badge className="bg-green-900/50 text-green-300 border-green-700">Approved</Badge>
                    ) : (
                      <Badge className="bg-yellow-900/50 text-yellow-300 border-yellow-700">Pending</Badge>
                    )}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <DialogFooter className="border-t border-gray-800 pt-4">
          <Button 
            onClick={() => setIsOpen(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}