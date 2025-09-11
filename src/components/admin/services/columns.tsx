"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/admin/services/data-table-column-header"
import { EditServiceDialog } from "@/components/admin/services/edit-service-dialog"
import { toast } from "react-hot-toast"

export type Service = {
  _id: string
  service: string
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<Service>[] = [
  {
    accessorKey: "service",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Service Name" />
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <div>{date.toLocaleDateString()}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const service = row.original

      return (
        <div className="flex items-center gap-2">
          <EditServiceDialog service={service} />
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
            title="Delete Service"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this service?')) {
                try {
                  const response = await fetch('https://api.thegpdn.org/api/palliative/deleteService', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ _id: service._id })
                  })
                  const data = await response.json()
                  if (data.success) {
                    toast.success('Service deleted successfully')
                    window.location.reload()
                  } else {
                    toast.error('Failed to delete service')
                  }
                } catch (error) {
                  console.error('Error deleting service:', error)
                  toast.error('Error deleting service')
                }
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
