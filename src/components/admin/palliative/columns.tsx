"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
// Dropdown imports removed as they were unused
import { DataTableColumnHeader } from "./data-table-column-header"
import { EditPalliativeDialog } from "./edit-palliative-dialog"

export type Palliative = {
  _id: string
  name: string
  state: string
  country: string
  serviceId: string
  serviceName?: string // For display purposes
  contactDetails: string
  createdAt: string
  updatedAt: string
  isPublic?: boolean // Whether the unit is approved for public display
}

export const columns: ColumnDef<Palliative>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />
  },
  {
    accessorKey: "state",
    header: ({ column }) => <DataTableColumnHeader column={column} title="State" />
  },
  {
    accessorKey: "country",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Country" />
  },
  {
    accessorKey: "serviceName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Service" />
  },
  {
    accessorKey: "contactDetails",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contact Details" />
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const palliative = row.original

      
      const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this unit?')) {
          try {
            const response = await fetch('https://api.thegpdn.org/api/admin/removePalliative', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ unitId: palliative._id })
            })
            const data = await response.json()
            if (data.success) {
              toast.success('Palliative unit deleted successfully')
              window.location.reload()
            } else {
              toast.error('Failed to delete palliative unit')
            }
          } catch (error) {
            console.error('Error deleting palliative unit:', error)
            toast.error('Error deleting palliative unit')
          }
        }
      }
      
      const togglePublicStatus = async (makePublic: boolean) => {
        try {
          const response = await fetch('https://api.thegpdn.org/api/admin/approveUnitForPublic', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              _id: palliative._id,
              actionStatus: makePublic 
            })
          })
          const data = await response.json()
          if (data.success) {
            toast.success(makePublic 
              ? 'Palliative unit approved for public display' 
              : 'Palliative unit set to private')
            window.location.reload()
          } else {
            toast.error(makePublic 
              ? 'Failed to approve palliative unit' 
              : 'Failed to set palliative unit to private')
          }
        } catch (error) {
          console.error('Error updating palliative unit public status:', error)
          toast.error('Error updating palliative unit status')
        }
      }

      return (
        <div className="flex items-center gap-2">
          <EditPalliativeDialog palliative={palliative} />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => togglePublicStatus(true)}
            className="h-8 w-8 p-0 text-green-600 hover:text-green-900 hover:bg-green-100"
            title="Make public"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => togglePublicStatus(false)}
            className="h-8 w-8 p-0 text-amber-600 hover:text-amber-900 hover:bg-amber-100"
            title="Make private"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-900 hover:bg-red-100"
            title="Delete palliative unit"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]