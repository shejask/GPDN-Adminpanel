"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/admin/categories/data-table"
import { columns } from "@/components/admin/categories/columns"
import { CreateCategoryDialog } from "@/components/admin/categories/create-category-dialog"

interface Category {
  _id: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://api.thegpdn.org/api/blog/fetchCategory')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">
            Manage your categories here
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setDialogOpen(true)}>Add Category</Button>
        </div>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <DataTable columns={columns} data={categories} />
      )}
      <CreateCategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}