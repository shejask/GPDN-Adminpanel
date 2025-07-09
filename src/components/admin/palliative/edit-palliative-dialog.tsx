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
import { Palliative } from "./columns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EditPalliativeDialogProps {
  palliative: Palliative
}

export function EditPalliativeDialog({ palliative }: EditPalliativeDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    _id: palliative._id,
    name: palliative.name,
    state: palliative.state,
    country: palliative.country,
    serviceId: palliative.serviceId,
    contactDetails: palliative.contactDetails
  })
  
  const [services, setServices] = useState<Array<{ _id: string; name: string }>>([])  
  
  // Fetch services when component mounts
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('https://api.thegpdn.org/api/palliative/fetchServices')
        const data = await response.json()
        if (data.success) {
          // Map the service data to match the expected format
          const mappedServices = data.data.map((item: { _id: string; service: string }) => ({
            _id: item._id,
            name: item.service // Use 'service' field as the name
          }))
          setServices(mappedServices)
        } else {
          toast.error('Failed to fetch services')
        }
      } catch (error) {
        console.error('Error fetching services:', error)
        toast.error('Error fetching services')
      }
    }

    fetchServices()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('https://api.thegpdn.org/api/admin/editPalliative', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Palliative unit updated successfully')
        setOpen(false)
        window.location.reload()
      } else {
        toast.error('Failed to update palliative unit')
      }
    } catch (error) {
      toast.error('Error updating palliative unit')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Palliative Unit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="service">Service</Label>
            <Select 
              value={formData.serviceId}
              onValueChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  serviceId: value
                }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services && services.map((service) => (
                  <SelectItem 
                    key={service._id} 
                    value={service._id}
                  >
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactDetails">Contact Details</Label>
            <Input
              id="contactDetails"
              value={formData.contactDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, contactDetails: e.target.value }))}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Unit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}