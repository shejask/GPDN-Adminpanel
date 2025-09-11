"use client"

import React, { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Eye } from "lucide-react"
import { ResourceApprovalActions } from "./ResourceApprovalActions"
import { ResourceDetailsDialog } from "./ResourceDetailsDialog"

// Separate component for view button to properly use React hooks
function ViewButtonCell({ resource }: { resource: Resource }) {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowDetailsDialog(true)} 
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </Button>
      {showDetailsDialog && (
        <ResourceDetailsDialog
          resourceId={resource._id}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      )}
    </>
  );
}

export type Resource = {
  _id: string
  title: string
  description: string
  content?: string
  files: string[]
  tags: string[]
  authorId?: {
    _id: string
    fullName: string
    email: string
    imageURL?: string
  } | string
  approvalStatus: boolean
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<Resource>[] = [
  // 1. Thumbnail
  {
    accessorKey: "files",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thumbnail" />
    ),
    cell: ({ row }) => {
      const files = row.getValue("files") as string[]
      if (!files || files.length === 0) return "No files";
      const firstFile = files[0];
      const fileExt = firstFile.split('.').pop()?.toLowerCase();
      if (fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'png' || fileExt === 'gif') {
        return (
          <div className="flex items-center">
            <Image 
              src={firstFile} 
              alt={row.getValue("title") as string} 
              width={64}
              height={64}
              className="object-cover rounded"
            />
            {files.length > 1 && <span className="ml-2 text-xs text-gray-500">+{files.length - 1} more</span>}
          </div>
        );
      }
      return (
        <div className="flex items-center">
          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
            <span className="text-xs uppercase">{fileExt}</span>
          </div>
          {files.length > 1 && <span className="ml-2 text-xs text-gray-500">+{files.length - 1} more</span>}
        </div>
      );
    },
  },
  // 2. Title
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
  },
  // 3. Author
  {
    accessorKey: "authorId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Author" />
    ),
    cell: ({ row }) => {
      const authorData = row.original.authorId;
      
      // Handle case where authorId is an object with nested data
      if (authorData && typeof authorData === 'object' && 'fullName' in authorData) {
        const fullName = authorData.fullName as string;
        const imageURL = authorData.imageURL as string | undefined;
        
        return (
          <div className="flex items-center gap-2">
            {imageURL ? (
              <Image 
                src={imageURL} 
                alt={fullName} 
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-600">{fullName.charAt(0)}</span>
              </div>
            )}
            <div className="flex flex-col">
              <span>{fullName}</span>
              <span className="text-xs text-gray-500">{authorData.email}</span>
            </div>
          </div>
        );
      }
      
      return "Admin";
    },
  },
  // 4. Tags
  {
    accessorKey: "tags",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tags" />
    ),
    cell: ({ row }) => {
      const rawTags = row.getValue("tags") as string[] | string;
      let parsedTags: string[] = [];
      
      // Handle different formats of tags
      if (Array.isArray(rawTags)) {
        parsedTags = rawTags;
      } else if (typeof rawTags === 'string') {
        try {
          const parsed = JSON.parse(rawTags);
          parsedTags = Array.isArray(parsed) ? parsed : [rawTags];
        } catch {
          parsedTags = [rawTags];
        }
      }
      const cleanTags = parsedTags.map(tag => {
        if (typeof tag === 'string') {
          return tag.replace(/[\[\]"]/g, '').trim();
        }
        return String(tag);
      });
      return (
        <div className="flex flex-wrap gap-1">
          {cleanTags && cleanTags.length > 0 ? cleanTags.map((tag, index) => (
            <Badge key={index} variant="outline">{tag}</Badge>
          )) : "No tags"}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created " />
    ),
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString()
    },
  },
  // 5. Status
  {
    accessorKey: "approvalStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("approvalStatus") as boolean;
      const resourceId = row.original._id;
      // Use the dedicated component to handle approval actions and hooks
      return <ResourceApprovalActions resourceId={resourceId} approvalStatus={status} />;
    },
  },
  // 6. View button follows next
  // 7. View (as a button)
  {
    id: "view",
    header: "View",
    cell: ({ row }) => {
      return <ViewButtonCell resource={row.original} />;
    },
  },
  // 8. Actions (always last)
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />, 
  },
]