import { DataTable } from "@/components/admin/forums/data-table"
import { columns } from "@/components/admin/forums/columns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewThreadButtonClient } from "@/components/admin/forums/new-thread-button"

interface Thread {
  id: string;
  title: string;
  content: string;
  approvalStatus: boolean;
  createdAt?: string;
  updatedAt?: string;
  author?: {
    id: string;
    name: string;
  };
}

async function getThreads() {
  const res = await fetch('https://api.thegpdn.org/api/thread/FetchThread', { cache: 'no-store' })
  const data = await res.json()
  return data.data || []
}

export default async function ForumsPage() {
  const threads = await getThreads()
  const approvedThreads = threads.filter((thread: Thread) => thread.approvalStatus === true)
  const pendingThreads = threads.filter((thread: Thread) => thread.approvalStatus === false)

  return (
    <div className="container mx-auto space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Forums Management</h2>
          <p className="text-muted-foreground mt-1">Manage discussion threads and topics</p>
        </div>
        <div className="flex space-x-2">
          <NewThreadButtonClient />
        </div>
      </div>

      

      {/* Threads table with tabs */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Forum Threads</CardTitle>
          <CardDescription>
            Browse and manage all discussion threads and their approval status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Threads ({threads.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedThreads.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingThreads.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="p-0">
              <DataTable columns={columns} data={threads} />
            </TabsContent>
            <TabsContent value="approved" className="p-0">
              <DataTable columns={columns} data={approvedThreads} />
            </TabsContent>
            <TabsContent value="pending" className="p-0">
              <DataTable columns={columns} data={pendingThreads} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}