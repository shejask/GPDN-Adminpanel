"use client"

import { Column } from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon } from "@radix-ui/react-icons"
// cn import removed as it was unused
import { Button } from "@/components/ui/button"

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className="text-sm font-medium">{title}</div>
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => column.toggleSorting()}
    >
      <span className="text-sm font-medium">{title}</span>
      {{asc: <ArrowUpIcon className="ml-2 h-4 w-4" />,
        desc: <ArrowDownIcon className="ml-2 h-4 w-4" />}[column.getIsSorted() as string] ?? (
        <CaretSortIcon className="ml-2 h-4 w-4" />
      )}
    </Button>
  )
}