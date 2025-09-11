"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

interface CreateCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCategoryDialog({ open, onOpenChange }: CreateCategoryDialogProps) {
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('https://api.thegpdn.org/api/admin/addCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Category added successfully')
        onOpenChange(false)
        window.location.reload()
      } else {
        toast.error('Failed to add category')
      }
    } catch (error) {
      toast.error('Error adding category')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Category Name</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Category"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}