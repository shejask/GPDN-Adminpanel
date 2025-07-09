"use client"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertCircle } from "lucide-react"
import { useToast } from "../../../components/ui/use-toast"

interface DeleteThreadDialogProps {
  open: boolean
  threadId: string
  threadTitle: string
  onClose?: () => void
  onDeleted?: () => void
}

export function DeleteThreadDialog({
  open,
  threadId,
  threadTitle,
  onClose,
  onDeleted,
}: DeleteThreadDialogProps) {
  const [isOpen, setIsOpen] = useState(open)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  // Sync internal state with prop
  useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      
      console.log('Attempting to delete thread:', threadId)
      
      // Using fetch with POST method and proper JSON body
      const response = await fetch('https://api.thegpdn.org/api/thread/DeleteThread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ threadId })
      })
      
      console.log('Delete response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Failed to delete thread: ${response.status}`)
      }

      toast({
        title: "Thread deleted",
        description: "The thread has been successfully deleted.",
        variant: "default",
      })
      
      // Close the dialog
      setIsOpen(false)
      
      // Call the onDeleted callback if provided
      if (onDeleted) {
        onDeleted()
      } else {
        // Fallback to page refresh if no callback provided
        window.location.reload()
      }
    } catch (error) {
      console.error('Error deleting thread:', error)
      toast({
        title: "Error",
        description: "Failed to delete the thread. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Delete Thread
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this thread? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="border rounded-md p-3 bg-muted/50">
          <p className="font-medium text-sm truncate">{threadTitle}</p>
          <p className="text-xs text-muted-foreground mt-1">ID: {threadId}</p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-1"
          >
            {isDeleting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Thread
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}