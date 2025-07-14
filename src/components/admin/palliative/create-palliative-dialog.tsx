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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export function CreatePalliativeDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    country: "",
    services: [] as string[],
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
        // Reset form
        setFormData({
          name: "",
          state: "",
          country: "",
          services: [],
          contactDetails: ""
        })
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
            <Label htmlFor="services">Services</Label>
            <div className="border rounded-md p-3 min-h-[40px]">
              {/* Selected services display */}
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.services.map((serviceId) => {
                  const service = services.find(s => s._id === serviceId)
                  if (!service) return null
                  return (
                    <Badge key={serviceId} variant="secondary" className="flex items-center gap-1">
                      {service.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            services: prev.services.filter(id => id !== serviceId)
                          }))
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )
                })}
                {formData.services.length === 0 && (
                  <span className="text-sm text-muted-foreground">No services selected</span>
                )}
              </div>
              
              {/* Available services checkboxes */}
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {services.map((service) => (
                  <div key={service._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={service._id}
                      checked={formData.services.includes(service._id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            services: [...prev.services, service._id]
                          }))
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            services: prev.services.filter(id => id !== service._id)
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={service._id} className="text-sm font-normal cursor-pointer">
                      {service.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
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