"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "@radix-ui/react-icons"
import { CreateThreadDialog } from "./new-thread-dialog"

export function NewThreadButtonClient() {
  const [showNewThreadDialog, setShowNewThreadDialog] = useState(false)
  
  return (
    <>
      <Button className="gap-1" onClick={() => setShowNewThreadDialog(true)}>
        <PlusIcon className="h-4 w-4" />
        New Thread
      </Button>
      
      <CreateThreadDialog 
        open={showNewThreadDialog} 
        onOpenChange={setShowNewThreadDialog} 
      />
    </>
  )
}
