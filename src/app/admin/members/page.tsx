import { DataTable } from "@/components/admin/members/data-table"
import { columns } from "@/components/admin/members/columns"
import { RegisterMemberDialog } from "@/components/admin/members/register-member-dialog"
import { SendInvitationDialog } from "@/components/admin/members/send-invitation-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Member {
  id: string;
  name?: string;
  email?: string;
  registrationStatus: "approved" | "pending" | "decline";
  createdAt?: string;
  updatedAt?: string;
  profile?: {
    avatar?: string;
    bio?: string;
  };
}

async function getMembers() {
  const res = await fetch('https://api.thegpdn.org/api/admin/fetchUser', { cache: 'no-store' })
  const data = await res.json()
  return data.data || []
}

export default async function MembersPage() {
  const members = await getMembers()
  const approvedMembers = members.filter((member: Member) => member.registrationStatus === "approved")
  const pendingMembers = members.filter((member: Member) => member.registrationStatus === "pending")
  const declinedMembers = members.filter((member: Member) => member.registrationStatus === "decline")

  return (
    <div className="container mx-auto space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Members Management</h2>
          <p className="text-muted-foreground mt-1">Manage healthcare professionals and members</p>
        </div>
        <div className="flex space-x-2">
          <SendInvitationDialog />
          <RegisterMemberDialog />
        </div>
      </div>

      {/* Member counts are now shown in the tabs */}

      {/* Members table with tabs */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Browse and manage all members and their registration status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Members ({members.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedMembers.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingMembers.length})</TabsTrigger>
              <TabsTrigger value="declined">Declined ({declinedMembers.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="p-0">
              <DataTable columns={columns} data={members} />
            </TabsContent>
            <TabsContent value="approved" className="p-0">
              <DataTable columns={columns} data={approvedMembers} />
            </TabsContent>
            <TabsContent value="pending" className="p-0">
              <DataTable columns={columns} data={pendingMembers} />
            </TabsContent>
            <TabsContent value="declined" className="p-0">
              <DataTable columns={columns} data={declinedMembers} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}