"use client"

import { Card, CardContent } from "@/components/ui/card"
// Hospital icon not currently used
// import { Hospital } from "lucide-react"
import { PalliativeTable } from "@/components/admin/palliative/data-table"
import { columns } from "@/components/admin/palliative/columns"

export function PalliativePageContent() {  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Palliative Care Units</h2>
        <p className="text-muted-foreground">
          Manage palliative care units and their associated services across different regions.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <PalliativeTable columns={columns} />
        </CardContent>
      </Card>
    </div>
  )
}
