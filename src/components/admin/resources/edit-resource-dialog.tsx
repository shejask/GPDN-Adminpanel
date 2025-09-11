import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Resource } from "./columns";
import { CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface EditResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: Resource;
}

export function EditResourceDialog({
  open,
  onOpenChange,
  resource,
}: EditResourceDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Initialize form data when resource changes
  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title || "",
        description: resource.description || "",
        content: resource.content || "",
      });

      // Parse tags from the resource
      const parseTags = () => {
        if (!resource.tags || resource.tags.length === 0) {
          setTags([]);
          return;
        }

        const parsedTags: string[] = [];
        resource.tags.forEach(tag => {
          if (typeof tag === 'string' && tag.includes('[')) {
            try {
              // Try to parse JSON array string
              const jsonTags = JSON.parse(tag.replace(/^[\s"]+|[\s"]+$/g, ''));
              if (Array.isArray(jsonTags)) {
                jsonTags.forEach(t => {
                  if (typeof t === 'string') {
                    parsedTags.push(t.trim());
                  }
                });
              }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_error) {
              parsedTags.push(tag.replace(/[\[\]"]/g, '').trim());
            }
          } else {
            parsedTags.push(typeof tag === 'string' ? tag : String(tag));
          }
        });

        setTags(parsedTags);
      };

      parseTags();
    }
  }, [resource]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`https://api.thegpdn.org/api/admin/resource`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resourceId: resource._id,
          title: formData.title,
          description: formData.description,
          content: formData.content,
          tags: tags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update resource");
      }

      toast({
        title: "Success",
        description: "Resource updated successfully",
      });

      onOpenChange(false);
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error updating resource:", error);
      toast({
        title: "Error",
        description: "Failed to update resource. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Resource</DialogTitle>
          <DialogDescription>
            Make changes to the resource details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Resource title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the resource"
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Resource content or additional details"
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="newTag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-2 py-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {tags.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  No tags added yet
                </span>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title || !formData.description || tags.length === 0}
              className="gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>Update Resource</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
