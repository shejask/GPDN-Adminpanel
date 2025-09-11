"use client"

import { useState, useEffect } from "react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type PalliativeService = {
  _id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export function ServiceManagement() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<PalliativeService[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })

  // Fetch services when component mounts
  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://api.thegpdn.org/api/admin/fetchPalliativeServices')
      const data = await response.json()
      if (data.success) {
        setServices(data.data)
      } else {
        toast.error('Failed to fetch services')
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Error fetching services')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('https://api.thegpdn.org/api/admin/addPalliativeService', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Service created successfully')
        setOpen(false)
        setFormData({
          name: "",
          description: ""
        })
        fetchServices()
      } else {
        toast.error('Failed to create service')
      }
    } catch (error) {
      toast.error('Error creating service')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await fetch('https://api.thegpdn.org/api/admin/removePalliativeService', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ serviceId })
        })
        const data = await response.json()
        if (data.success) {
          toast.success('Service deleted successfully')
          fetchServices()
        } else {
          toast.error('Failed to delete service')
        }
      } catch (error) {
        console.error('Error deleting service:', error)
        toast.error('Error deleting service')
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center py-4">
        <h2 className="text-2xl font-bold">Palliative Services</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Service</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Service"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length > 0 ? (
              services.map((service) => (
                <TableRow key={service._id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(service._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  {loading ? "Loading..." : "No services found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
