"use client"

import React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import Image from "next/image"

export type Member = {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  imageURL?: string
  bio?: string
  countryOfPractice?: string
  medicalQualification?: string
  yearOfGraduation?: number
  hasFormalTrainingInPalliativeCare?: boolean
  medicalRegistrationAuthority?: string
  medicalRegistrationNumber?: string
  affiliatedPalliativeAssociations?: string
  specialInterestsInPalliativeCare?: string
  role?: string
  registrationStatus: string
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<Member>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "imageURL",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Profile" />
    ),
    cell: ({ row }) => {
      const imageURL = row.getValue("imageURL") as string | undefined
      return imageURL ? (
        <div className="relative h-10 w-10 overflow-hidden rounded-md">
          <Image
            src={imageURL}
            alt="Profile picture"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
          <span className="text-xs">No img</span>
        </div>
      )
    },
  },
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Full Name" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone Number" />
    ),
  },
  {
    accessorKey: "countryOfPractice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Country" />
    ),
  },
  {
    accessorKey: "medicalQualification",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Qualification" />
    ),
  },
  {
    accessorKey: "registrationStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("registrationStatus") as string
      return (
        <Badge
          variant={status === "approved" ? "default" : status === "decline" ? "destructive" : "outline"}
          className={status === "approved" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registered On" />
    ),
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString()
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]