"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import { PlusCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreateServiceDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serviceName, setServiceName] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!serviceName.trim()) {
      toast.error('Please enter a service name')
      return
    }
    
    setLoading(true)

    try {
      const response = await fetch('https://api.thegpdn.org/api/palliative/addService', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service: serviceName })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Service created successfully')
        setOpen(false)
        setServiceName("")
        router.refresh()
      } else {
        toast.error(data.message || 'Failed to create service')
      }
    } catch (error) {
      toast.error('Error creating service')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" size="sm">
          <PlusCircle className="h-4 w-4" />
          Add Service
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
          <DialogDescription>
            Add a new healthcare service to the platform. Services can be assigned to healthcare professionals.  
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="service" className="font-medium">Service Name</Label>
            <Input
              id="service"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Enter service name"
              className="focus-visible:ring-primary"
              required
              autoFocus
            />
          </div>
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Creating..." : "Create Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
