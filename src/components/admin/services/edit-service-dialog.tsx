"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import { Service } from "./columns"

interface EditServiceDialogProps {
  service: Service
}

export function EditServiceDialog({ service }: EditServiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serviceName, setServiceName] = useState(service.service)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('https://api.thegpdn.org/api/palliative/editService', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: service._id,
          service: serviceName
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Service updated successfully')
        setOpen(false)
        window.location.reload()
      } else {
        toast.error('Failed to update service')
      }
    } catch (error) {
      toast.error('Error updating service')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="service">Service Name</Label>
            <Input
              id="service"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Service"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
