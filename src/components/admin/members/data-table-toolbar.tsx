"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Cross2Icon } from "@radix-ui/react-icons"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter members..."
          value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("fullName")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            Status
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            checked={table.getColumn("registrationStatus")?.getFilterValue() === "pending"}
            onCheckedChange={() =>
              table.getColumn("registrationStatus")?.setFilterValue("pending")
            }
          >
            Pending
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={table.getColumn("registrationStatus")?.getFilterValue() === "approved"}
            onCheckedChange={() =>
              table.getColumn("registrationStatus")?.setFilterValue("approved")
            }
          >
            Approved
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={table.getColumn("registrationStatus")?.getFilterValue() === "decline"}
            onCheckedChange={() =>
              table.getColumn("registrationStatus")?.setFilterValue("decline")
            }
          >
            Declined
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}