"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Blog } from "./columns"
import { BlogDetailContent } from "./blog-detail-content"

interface BlogDetailDialogProps {
  blog: Blog
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BlogDetailDialog({ blog, open, onOpenChange }: BlogDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <BlogDetailContent blog={blog} />
      </DialogContent>
    </Dialog>
  )
}
