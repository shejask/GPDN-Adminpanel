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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import toast from "react-hot-toast"
import { Admin } from "./columns"

interface Role {
  _id: string
  role: string
  capabilities: string[]
}

interface EditAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  admin: Admin
}

export function EditAdminDialog({ open, onOpenChange, admin }: EditAdminDialogProps) {
  const [fullName, setFullName] = useState(admin.fullName)
  const [email, setEmail] = useState(admin.email)
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState(admin.phoneNumber)
  const [roleId, setRoleId] = useState(admin.role?._id || "") // Add optional chaining and default to empty string
  const [roles, setRoles] = useState<Role[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setFullName(admin.fullName)
      setEmail(admin.email)
      setPassword("") // Reset password field
      setPhoneNumber(admin.phoneNumber)
      setRoleId(admin.role?._id || "") // Add optional chaining here too
      fetchRoles()
    }
  }, [open, admin])

  const fetchRoles = async () => {
    try {
      const response = await fetch('https://api.thegpdn.org/api/admin/fetchRole')
      const result = await response.json()
      if (result.status === 200) { // Changed to check status
        setRoles(result.data) // Access nested data
      } else {
        toast.error("Failed to fetch roles")
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error("Error fetching roles")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !phoneNumber || !roleId) {
      toast.error("All fields are required")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('https://api.thegpdn.org/api/admin/editAdmin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: admin._id,
          fullName,
          email,
          phoneNumber,
          password,
          role : roleId
        }),
      })

    //   685355f2f8ce707f8fddbeea

      const result = await response.json()
      if (result.status === 200) { // Changed to check status
        toast.success("Admin updated successfully")
        // Dispatch event instead of reloading page
        window.dispatchEvent(new CustomEvent('adminUpdated'))
        onOpenChange(false)
      } else {
        toast.error(result.message || "Failed to update admin")
      }
    } catch (error) {
      console.error('Error updating admin:', error)
      toast.error("Error updating admin")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Admin</DialogTitle>
          <DialogDescription>
            Update the admin user details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder="Leave empty to keep current password"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">
                Phone
              </Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role._id} value={role._id}>
                      {role.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}