"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { Category } from "./columns"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const category = row.original as Category
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    _id: category._id,
    category: category.category
  })

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('https://api.thegpdn.org/api/admin/editresourceCategory', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Category updated successfully')
        setEditDialogOpen(false)
        window.location.reload()
      } else {
        toast.error('Failed to update category')
      }
    } catch (error) {
      toast.error('Error updating category')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch('https://api.thegpdn.org/api/admin/deleteresourceCategory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ _id: category._id })
        })

        const data = await response.json()
        if (data.success) {
          toast.success('Category deleted successfully')
          window.location.reload()
        } else {
          toast.error('Failed to delete category')
        }
      } catch (error) {
        toast.error('Error deleting category')
        console.error('Error:', error)
      }
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category Name</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Category"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}