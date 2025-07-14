"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import * as React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
// Row actions are handled directly in the ActionCell component

export type Category = {
  _id: string
  category: string
  createdAt: string
  updatedAt: string
  approvalStatus?: boolean // Added approvalStatus, optional in case not all data has it
}

// Separate component for cell actions to properly use React hooks
function ActionCell({ category }: { category: Category }) {
  const [isApproving, setIsApproving] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);
  
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      alert('Error updating approval status');
    } finally {
      setIsApproving(false);
      setIsRejecting(false);
    }
  };
  
  // Default to false if approvalStatus is undefined
  const isApproved = Boolean(category.approvalStatus);
  
  return (
    <div className="flex items-center gap-2">
      {/* Always show at least one button */}
      {!isApproved ? (
        <>
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
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleApprovalChange(false)}
            disabled={isRejecting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Reject Category"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </>
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
    </div>
  );
}

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category Name" />
    ),
    // Make sure we're rendering a string, not an object
    cell: ({ row }) => {
      const categoryValue = row.getValue("category");
      // If it's an object with a 'category' property, return that property
      if (categoryValue && typeof categoryValue === 'object' && 'category' in categoryValue) {
        return categoryValue.category;
      }
      // Otherwise return the value directly (should be a string)
      return categoryValue as string;
    },
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
      const category = row.original as Category;
      return <ActionCell category={category} />;
    }
  }
]