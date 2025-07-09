"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

export type Blog = {
  _id: string
  title: string
  description: string
  content: string
  authorId: string
  tags: string[]
  imageURL: string
  category: string
  approvalStatus: boolean
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<Blog>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />
  },
  {
    accessorKey: "category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />
  },
  {
    accessorKey: "approvalStatus",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <div className={`font-medium ${row.original.approvalStatus ? 'text-green-600' : 'text-yellow-600'}`}>
        {row.original.approvalStatus ? 'Approved' : 'Pending'}
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
]