"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardList, Stethoscope } from "lucide-react"
import { DataTable } from "@/components/admin/services/data-table"
import { columns } from "@/components/admin/services/columns"
import { CreateServiceDialog } from "@/components/admin/services/create-service-dialog"
import { Service } from "@/components/admin/services/columns"

interface ServicesPageTabsProps {
  services: Service[]
}

export function ServicesPageTabs({ services }: ServicesPageTabsProps) {
  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all" className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4" />
          All Services
        </TabsTrigger>
        <TabsTrigger value="manage" className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Manage
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Services Directory</h3>
            <p className="text-sm text-muted-foreground">A list of all healthcare services available in the system.</p>
          </div>
          <CreateServiceDialog />
        </div>
        
        <Card>
          <CardContent className="p-0 pt-6">
            <DataTable columns={columns} data={services} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="manage" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Service Statistics</CardTitle>
            <CardDescription>Overview of service usage and distribution.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-primary/10">
                <CardHeader className="pb-2">
                  <CardDescription>Total Services</CardDescription>
                  <CardTitle className="text-2xl">{services.length}</CardTitle>
                </CardHeader>
              </Card>
              
              <Card className="bg-secondary/10">
                <CardHeader className="pb-2">
                  <CardDescription>Recently Added</CardDescription>
                  <CardTitle className="text-2xl">
                    {services.filter(s => {
                      const date = new Date(s.createdAt);
                      const now = new Date();
                      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
                      return date > thirtyDaysAgo;
                    }).length}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
