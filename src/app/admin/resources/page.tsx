import { DataTable } from "@/components/admin/resources/data-table"
import { columns } from "@/components/admin/resources/columns"
import { CreateResourceDialog } from "@/components/admin/resources/create-resource-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Resource {
  id: string;
  title: string;
  description?: string;
  approvalStatus: boolean;
  createdAt?: string;
  updatedAt?: string;
  author?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
}

async function getResources() {
  const res = await fetch('https://api.thegpdn.org/api/resource/fetchResource', { cache: 'no-store' })
  const data = await res.json()
  return data.data || []
}

export default async function ResourcesPage() {
  const resources = await getResources()
  const approvedResources = resources.filter((resource: Resource) => resource.approvalStatus)
  const pendingResources = resources.filter((resource: Resource) => !resource.approvalStatus)

  return (
    <div className="container mx-auto space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resources Management</h2>
          <p className="text-muted-foreground mt-1">Manage educational resources and materials</p>
        </div>
        <div className="flex space-x-2">
          <CreateResourceDialog />
        </div>
      </div>

      {/* Resources table with tabs */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>
            Browse and manage all educational resources in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Resources ({resources.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedResources.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingResources.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="p-0">
              <DataTable columns={columns} data={resources} />
            </TabsContent>
            <TabsContent value="approved" className="p-0">
              <DataTable columns={columns} data={approvedResources} />
            </TabsContent>
            <TabsContent value="pending" className="p-0">
              <DataTable columns={columns} data={pendingResources} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}