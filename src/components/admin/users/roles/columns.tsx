"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

export type Role = {
  _id: string
  role: string
  capabilities: string[]
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<Role>[] = [
  {
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role Name" />
  },
  {
    accessorKey: "capabilities",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Capabilities" />,
    cell: ({ row }) => {
      const capabilities = row.original.capabilities
      return (
        <div className="max-w-[500px] truncate">
          {capabilities.join(", ")}
        </div>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
]