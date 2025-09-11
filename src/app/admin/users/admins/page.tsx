"use client"

import { useState } from "react"
import { DataTable } from "@/components/admin/users/admins/data-table"
import { columns } from "@/components/admin/users/admins/columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateAdminDialog } from "@/components/admin/users/admins/create-admin-dialog"
import { useAuth } from "@/contexts/auth-context"
import { redirect } from "next/navigation"

export default function AdminsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { hasCapability } = useAuth()

  // Check if user has the required capability
  if (!hasCapability("admins management")) {
    redirect("/admin")
  }

  return (
    <div className="space-y-8 h-screen">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admins</h2>
          <p className="text-muted-foreground">
            Manage admin users and their roles
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </div>
      <DataTable columns={columns} />
      <CreateAdminDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  )
}