"use client"

import { useState, useEffect } from "react"
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
import { Role } from "./columns"

const capabilities = [
  { id: "thread-management", label: "Thread Management", value: "thread management" },
  { id: "resource-management", label: "Resource Management", value: "resource management" },
  { id: "palliative-management", label: "Palliative Unit Management", value: "palliative unit management" },
  { id: "admins-management", label: "Admins Management", value: "admins management" },
  { id: "news-blogs-management", label: "News & Blogs Management", value: "News & blogs management" },
  { id: "members-management", label: "Members Management", value: "members management" },
]

interface EditRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role
}

export function EditRoleDialog({ open, onOpenChange, role }: EditRoleDialogProps) {
  const [roleName, setRoleName] = useState(role.role)
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>(role.capabilities)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update state when role prop changes
  useEffect(() => {
    if (open) {
      setRoleName(role.role)
      setSelectedCapabilities(role.capabilities)
    }
  }, [open, role])

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
      const response = await fetch("https://api.thegpdn.org/api/admin/editRole", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: role._id,
          role: roleName,
          capabilities: selectedCapabilities,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Role updated successfully")
        // Dispatch event to refresh the roles list
        window.dispatchEvent(new CustomEvent('roleUpdated'))
        onOpenChange(false)
      } else {
        toast.error(data.message || "Failed to update role")
      }
    } catch (error) {
      console.error("Error updating role:", error)
      toast.error("An error occurred while updating the role")
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
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role name and capabilities
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
              {isSubmitting ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}