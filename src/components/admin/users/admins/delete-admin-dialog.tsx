"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

interface DeleteAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  adminId: string
  adminName: string
}

export function DeleteAdminDialog({ 
  open, 
  onOpenChange, 
  adminId, 
  adminName 
}: DeleteAdminDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch('https://api.thegpdn.org/api/admin/deleteAdmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId }),
      })

      const result = await response.json()
      if (result.status === 200) { // Changed to check status
        toast.success("Admin deleted successfully")
        // Dispatch event instead of reloading page
        window.dispatchEvent(new CustomEvent('adminUpdated'))
        onOpenChange(false)
      } else {
        toast.error(result.message || "Failed to delete admin")
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
      toast.error("Error deleting admin")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Admin</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the admin user <strong>{adminName}</strong>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}