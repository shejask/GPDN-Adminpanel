"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import * as React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { DataTableRowActions } from "./data-table-row-actions";

export type Category = {
  _id: string
  category: string
  createdAt: string
  updatedAt: string
  approvalStatus?: boolean // Added approvalStatus, optional in case not all data has it
}

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category Name" />
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return date.toLocaleDateString()
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [isApproving, setIsApproving] = React.useState(false);
      const [isRejecting, setIsRejecting] = React.useState(false);
      const category = row.original as Category;
      const handleApprovalChange = async (approve: boolean) => {
        if (approve) setIsApproving(true);
        else setIsRejecting(true);
        try {
          const response = await fetch('https://api.thegpdn.org/api/admin/resourceCategoryApproval', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: category._id, approvalStatus: approve })
          });
          const data = await response.json();
          if (data.success) {
            window.location.reload();
          } else {
            alert('Failed to update approval status');
          }
        } catch (err) {
          alert('Error updating approval status');
        } finally {
          setIsApproving(false);
          setIsRejecting(false);
        }
      };
      console.log('Category data:', category);
      // Default to false if approvalStatus is undefined
      const isApproved = Boolean(category.approvalStatus);
      console.log('Is approved:', isApproved);
      
      return (
        <div className="flex items-center gap-2">
          {/* Always show at least one button */}
          {!isApproved ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleApprovalChange(true)}
              disabled={isApproving}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Approve Category"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleApprovalChange(false)}
              disabled={isRejecting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Revoke Category"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
          
          {/* Also add the row actions back */}
          <DataTableRowActions row={row} />
        </div>
      );
    },
  },
]