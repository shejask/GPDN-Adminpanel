"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import toast from "react-hot-toast"

const capabilities = [
  { id: "thread-management", label: "Thread Management", value: "thread management" },
  { id: "resource-management", label: "Resource Management", value: "resource management" },
  { id: "palliative-management", label: "Palliative Unit Management", value: "palliative unit management" },
  { id: "admins-management", label: "Admins Management", value: "admins management" },
  { id: "news-blogs-management", label: "News & Blogs Management", value: "News & blogs management" },
  { id: "members-management", label: "Members Management", value: "members management" },
]

interface CreateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRoleDialog({ open, onOpenChange }: CreateRoleDialogProps) {
  const [roleName, setRoleName] = useState("")
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roleName) {
      toast.error("Role name is required")
      return
    }

    if (selectedCapabilities.length === 0) {
      toast.error("Select at least one capability")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("https://api.thegpdn.org/api/admin/addRole", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: roleName,
          capabilities: selectedCapabilities,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Role created successfully")
        // Dispatch event to refresh the roles list
        window.dispatchEvent(new CustomEvent('roleUpdated'))
        // Reset form and close dialog
        setRoleName("")
        setSelectedCapabilities([])
        onOpenChange(false)
      } else {
        toast.error(data.message || "Failed to create role")
      }
    } catch (error) {
      console.error("Error creating role:", error)
      toast.error("An error occurred while creating the role")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCapability = (value: string) => {
    setSelectedCapabilities(prev =>
      prev.includes(value)
        ? prev.filter(cap => cap !== value)
        : [...prev, value]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Add a new role with specific capabilities
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role-name" className="text-right">
                Role Name
              </Label>
              <Input
                id="role-name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Editor, Moderator"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Capabilities
              </Label>
              <div className="col-span-3 space-y-2">
                {capabilities.map((capability) => (
                  <div key={capability.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={capability.id}
                      checked={selectedCapabilities.includes(capability.value)}
                      onCheckedChange={() => toggleCapability(capability.value)}
                    />
                    <Label htmlFor={capability.id}>{capability.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}