"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

export type Admin = {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  password : string
  role: {
    _id: string
    role: string
    capabilities: string[]
  }
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<Admin>[] = [
  {
    accessorKey: "fullName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />
  },
  {
    accessorKey: "role.role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
]