import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Resource } from "./columns";
import { ExternalLink, FileText } from "lucide-react";
import Image from "next/image";

interface ResourceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: string;
}

// Extended type with potential additional fields from API response
type ResourceDetailsData = Resource & {
  // Additional fields can be added here as needed
  additionalInfo?: string;
};

export function ResourceDetailsDialog({
  open,
  onOpenChange,
  resourceId,
}: ResourceDetailsDialogProps) {
  const [resource, setResource] = useState<ResourceDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResourceDetails = async () => {
      if (!open || !resourceId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`https://api.thegpdn.org/api/resource/fetchResource?resourceId=${resourceId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch resource details");
        }
        
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setResource(data.data[0]);
        } else {
          throw new Error("Resource not found");
        }
      } catch (error) {
        console.error("Error fetching resource details:", error);
        toast({
          title: "Error",
          description: "Failed to load resource details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResourceDetails();
  }, [open, resourceId, toast]);

  // Parse tags from string format to array if needed
  const renderTags = (tags: (string | string[])[]) => {
    if (!tags || tags.length === 0) return <span>No tags</span>;
    
    const parsedTags = tags.map(tag => {
      if (typeof tag === 'string' && tag.includes('[')) {
        try {
          // Try to parse JSON array string
          return JSON.parse(tag.replace(/^[\s"]+|[\s"]+$/g, ''));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
          // If parsing fails, return the original tag
          return tag;
        }
      }
      return tag;
    }).flat();
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {parsedTags.map((tag, index) => (
          <Badge key={index} variant="outline">
            {typeof tag === 'string' ? tag.replace(/[\[\]"]/g, '').trim() : String(tag)}
          </Badge>
        ))}
      </div>
    );
  };

  const renderFiles = (files: string[]) => {
    if (!files || files.length === 0) return <span>No files</span>;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {files.map((file, index) => {
          const isImage = file.match(/\.(jpeg|jpg|gif|png)$/i);
          
          return isImage ? (
            <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
              <Image 
                src={file} 
                alt={`Resource file ${index + 1}`}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <a 
                href={file} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute top-2 right-2 bg-black/50 p-1 rounded-full hover:bg-black/70"
              >
                <ExternalLink className="h-4 w-4 text-white" />
              </a>
            </div>
          ) : (
            <div key={index} className="flex items-center gap-2 p-3 border rounded-md">
              <FileText className="h-5 w-5 text-blue-500" />
              <a 
                href={file} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex-1 truncate"
              >
                {file.split('/').pop()}
              </a>
              <ExternalLink className="h-4 w-4 text-gray-500" />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {loading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              resource?.title || "Resource Details"
            )}
          </DialogTitle>
          <DialogDescription>
            {loading ? (
              <Skeleton className="h-4 w-full mt-2" />
            ) : (
              <span className="text-sm text-muted-foreground">
                Created on {resource?.createdAt ? new Date(resource.createdAt).toLocaleDateString() : "Unknown date"}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : resource ? (
          <div className="space-y-6">
            {/* Author info */}
            <div className="flex items-center gap-3 border-b pb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={typeof resource.authorId === 'object' ? resource.authorId.imageURL : undefined} 
                  alt="Author" 
                />
                <AvatarFallback>
                  {typeof resource.authorId === 'object' ? resource.authorId.fullName.charAt(0) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {typeof resource.authorId === 'object' ? resource.authorId.fullName : 'Unknown Author'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {typeof resource.authorId === 'object' ? resource.authorId.email : ''}
                </p>
              </div>
            </div>

            {/* Files/Images */}
            <div>
              <h3 className="text-sm font-medium mb-1">Files</h3>
              {renderFiles(resource.files)}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium mb-1">Description</h3>
              <p className="text-sm">{resource.description}</p>
            </div>

            {/* Content */}
            {resource.content && (
              <div>
                <h3 className="text-sm font-medium mb-1">Content</h3>
                <div 
                  className="text-sm prose max-w-none border rounded-md p-4 bg-slate-50"
                  dangerouslySetInnerHTML={{ __html: resource.content }}
                />
              </div>
            )}

            {/* Tags */}
            <div>
              <h3 className="text-sm font-medium mb-1">Tags</h3>
              {renderTags(resource.tags)}
            </div>

            {/* Status */}
            <div>
              <h3 className="text-sm font-medium mb-1">Status</h3>
              <Badge variant="outline" className={resource.approvalStatus ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                {resource.approvalStatus ? "Approved" : "Pending"}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p>Resource not found or failed to load.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
