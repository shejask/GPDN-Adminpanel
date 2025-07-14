import { DataTable } from "@/components/admin/blogs/data-table"
import { columns } from "@/components/admin/blogs/columns"

async function BlogsPage() {
  return (
    <div className="space-y-8 h-screen">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">News & Blogs</h2>
          <p className="text-muted-foreground">
            Manage news articles and blog posts here
          </p>
        </div>
      </div>
      <DataTable columns={columns} />
    </div>
  )
}

export default BlogsPage