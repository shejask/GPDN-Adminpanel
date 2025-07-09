"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CreatePalliativeDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    country: "",
    services: "",
    contactDetails: ""
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
      const response = await fetch('https://api.thegpdn.org/api/palliative/addPalliativeUnit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Palliative unit created successfully')
        setOpen(false)
        window.location.reload()
      } else {
        toast.error('Failed to create palliative unit')
      }
    } catch (error) {
      toast.error('Error creating palliative unit')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Palliative Unit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Palliative Unit</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new palliative unit.
          </DialogDescription>
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
              value={formData.services}
              onValueChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  services: value
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
            {loading ? "Creating..." : "Create Unit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}