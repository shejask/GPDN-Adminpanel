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
      console.log('Fetching categories from:', 'https://api.thegpdn.org/api/admin/fetchCategory')
      const response = await fetch('https://api.thegpdn.org/api/admin/fetchCategory')
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.success && data.data) {
        setCategories(data.data)
        console.log('Categories set:', data.data)
      } else {
        console.error('API returned unsuccessful response:', data)
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
        <div>Loading categories...</div>
      ) : categories.length > 0 ? (
        <DataTable columns={columns} data={categories} />
      ) : (
        <div className="text-center py-8">
          <p>No categories found. Check the browser console for any errors.</p>
          <Button 
            onClick={fetchCategories} 
            variant="outline" 
            className="mt-4"
          >
            Retry Fetch
          </Button>
        </div>
      )}
      <CreateCategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}