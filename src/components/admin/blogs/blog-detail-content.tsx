import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Blog } from "./columns"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Ensure the Blog type has the engagement properties
type BlogWithEngagement = Blog & {
  likes?: string[]
  dislikes?: string[]
  comments?: Array<{ id: string; text: string; userId: string; createdAt: string }>
}

// Props for the server component
interface BlogDetailContentProps {
  blog: Blog
}

export function BlogDetailContent({ blog }: BlogDetailContentProps) {
  // Parse tags if they're stored as a JSON string
  const parseTags = (tags: string[]) => {
    if (!tags || !tags.length) return []
    try {
      // Handle the case where tags might be stored as a JSON string array
      if (typeof tags[0] === 'string' && tags[0].startsWith('[')) {
        return JSON.parse(tags[0])
      }
      return tags
    } catch (error) {
      console.error('Error parsing tags:', error)
      return []
    }
  }

  // Helper function to get category display name
  const getCategoryDisplay = (category: string | Record<string, unknown>) => {
    if (typeof category === 'string') {
      return category
    }
    // If it's an object, try to get the category property based on API structure
    if (category && typeof category === 'object') {
      // First check for the 'category' property which is in the API response
      if ('category' in category && typeof category.category === 'string') {
        return category.category as string
      }
      // Fallbacks if structure changes
      return (category.name as string) || (category.title as string) || String(category)
    }
    return 'Unknown Category'
  }

  const formattedDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">{blog.title}</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-6">
        {/* Featured Image */}
        <div className="relative w-full h-[200px] overflow-hidden rounded-md border">
          {blog.thumbnail || blog.imageURL ? (
            <Image 
              src={blog.thumbnail || blog.imageURL} 
              alt={blog.title} 
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
              No image available
            </div>
          )}
        </div>
        
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-2">
              <h3 className="text-lg font-medium">Description</h3>
              <p className="text-gray-700">{blog.description}</p>
            </div>
            
            <div className="grid gap-2">
              <h3 className="text-lg font-medium">Category</h3>
              <Badge variant="outline" className="w-fit">{getCategoryDisplay(blog.category)}</Badge>
            </div>
            
            <div className="grid gap-2">
              <h3 className="text-lg font-medium">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {parseTags(blog.tags).map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                <p className="text-gray-700">{formattedDate(blog.createdAt)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="text-gray-700">{formattedDate(blog.updatedAt)}</p>
              </div>
            </div>

            <div className="hidden">
              <h3 className="text-sm font-medium text-gray-500">Approval Status</h3>
              <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                blog.approvalStatus ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {blog.approvalStatus ? 'Approved' : 'Pending'}
              </div>
            </div>
          </TabsContent>
          
          {/* Content Tab */}
          <TabsContent value="content">
            <div className="border rounded-md p-4 bg-white">
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
          </TabsContent>
          
          {/* Engagement Tab */}
          <TabsContent value="engagement">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Likes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{(blog as BlogWithEngagement).likes?.length || 0}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Dislikes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{(blog as BlogWithEngagement).dislikes?.length || 0}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{(blog as BlogWithEngagement).comments?.length || 0}</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Comments Section */}
            {(blog as BlogWithEngagement).comments && (blog as BlogWithEngagement).comments.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Comments</h3>
                <div className="space-y-4">
                  {/* Map through comments here if you have the comment data structure */}
                  {/* This is a placeholder for the comment structure */}
                  <p>Comments would be displayed here</p>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center py-8 text-gray-500">
                No comments yet
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
