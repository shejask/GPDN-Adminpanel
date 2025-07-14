"use client"

import { useState, useEffect } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreatePalliativeDialog } from "./create-palliative-dialog"
// Dialog is used in another component
// import { EditPalliativeDialog } from "./edit-palliative-dialog"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
}

export function PalliativeTable<TData, TValue>({
  columns,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [data, setData] = useState<TData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPalliativeUnits = async () => {
      try {
        const response = await fetch('https://api.thegpdn.org/api/palliative/fetchPalliativeUnit')
        const result = await response.json()
        if (result.success) {
          // Transform the data to match the expected format
          const transformedData = result.data.map((unit: { 
            _id: string; 
            name: string; 
            state: string; 
            country: string; 
            address?: string; 
            contact?: string; 
            email?: string; 
            website?: string;
            services?: { _id: string; service: string };
            contactDetails?: string;
            createdAt?: string;
          }) => ({
            _id: unit._id,
            name: unit.name,
            state: unit.state,
            country: unit.country,
            serviceId: unit.services?._id || "",
            serviceName: unit.services?.service || "",
            contactDetails: unit.contactDetails,
            createdAt: unit.createdAt
          }));
          setData(transformedData as TData[])
        }
      } catch (error) {
        console.error('Error fetching palliative units:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPalliativeUnits()
  }, [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Palliative Care Directory</h3>
          <p className="text-sm text-muted-foreground">A list of all palliative care units registered in the system.</p>
        </div>
        <CreatePalliativeDialog />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="bg-muted/50">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No palliative care units found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}