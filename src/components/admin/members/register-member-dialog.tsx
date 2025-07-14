"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
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
import { PlusIcon } from "@radix-ui/react-icons"
import { toast } from "react-hot-toast"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
// Select imports removed as they were unused

export function RegisterMemberDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    bio: "",
    countryOfPractice: "",
    medicalQualification: "",
    yearOfGraduation: new Date().getFullYear(),
    hasFormalTrainingInPalliativeCare: false,
    medicalRegistrationAuthority: "",
    medicalRegistrationNumber: "",
    affiliatedPalliativeAssociations: "",
    specialInterestsInPalliativeCare: "",
    password: "gpdn@123", // Default password
    imageURL: ""
  })
  
  const [profileImage, setProfileImage] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create FormData to send file along with other data
      const submitFormData = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "hasFormalTrainingInPalliativeCare") {
          submitFormData.append(key, String(value))
        } else {
          submitFormData.append(key, value as string)
        }
      })
      
      // Add profile image if selected
      if (profileImage) {
        submitFormData.append('file', profileImage)
      }
      
      // Send the request with FormData
      const response = await fetch("https://api.thegpdn.org/api/user/Register", {
        method: "POST",
        body: submitFormData,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to register member")
      }

      toast.success("Member registered successfully")
      setOpen(false)
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        bio: "",
        countryOfPractice: "",
        medicalQualification: "",
        yearOfGraduation: new Date().getFullYear(),
        hasFormalTrainingInPalliativeCare: false,
        medicalRegistrationAuthority: "",
        medicalRegistrationNumber: "",
        affiliatedPalliativeAssociations: "",
        specialInterestsInPalliativeCare: "",
        password: "gpdn@123",
        imageURL: ""
      })
      setProfileImage(null)
      
      // Refresh the page to show the new member
      router.refresh()
    } catch (error) {
      toast.error("Failed to register member")
      console.error("Error registering member:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Register Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Member</DialogTitle>
          <DialogDescription>
            Register a new healthcare professional to the GPDN network.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name*</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number*</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Enter phone number with country code"
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief professional bio"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="countryOfPractice">Country of Practice*</Label>
                <Input
                  id="countryOfPractice"
                  value={formData.countryOfPractice}
                  onChange={(e) => setFormData({ ...formData, countryOfPractice: e.target.value })}
                  placeholder="Enter country"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="medicalQualification">Medical Qualification*</Label>
                <Input
                  id="medicalQualification"
                  value={formData.medicalQualification}
                  onChange={(e) => setFormData({ ...formData, medicalQualification: e.target.value })}
                  placeholder="E.g., MBBS, MD"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="yearOfGraduation">Year of Graduation*</Label>
                <Input
                  id="yearOfGraduation"
                  type="number"
                  value={formData.yearOfGraduation}
                  onChange={(e) => setFormData({ ...formData, yearOfGraduation: parseInt(e.target.value) })}
                  min="1950"
                  max={new Date().getFullYear()}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label className="mb-2">Formal Training in Palliative Care</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasFormalTraining" 
                    checked={formData.hasFormalTrainingInPalliativeCare}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, hasFormalTrainingInPalliativeCare: !!checked })
                    }
                  />
                  <label
                    htmlFor="hasFormalTraining"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Yes, I have formal training
                  </label>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="medicalRegistrationAuthority">Medical Registration Authority*</Label>
                <Input
                  id="medicalRegistrationAuthority"
                  value={formData.medicalRegistrationAuthority}
                  onChange={(e) => setFormData({ ...formData, medicalRegistrationAuthority: e.target.value })}
                  placeholder="E.g., Medical Council of India"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="medicalRegistrationNumber">Registration Number*</Label>
                <Input
                  id="medicalRegistrationNumber"
                  value={formData.medicalRegistrationNumber}
                  onChange={(e) => setFormData({ ...formData, medicalRegistrationNumber: e.target.value })}
                  placeholder="Enter registration number"
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="affiliatedPalliativeAssociations">Affiliated Palliative Associations</Label>
              <Input
                id="affiliatedPalliativeAssociations"
                value={formData.affiliatedPalliativeAssociations}
                onChange={(e) => setFormData({ ...formData, affiliatedPalliativeAssociations: e.target.value })}
                placeholder="Enter affiliated associations"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="specialInterestsInPalliativeCare">Special Interests in Palliative Care</Label>
              <Input
                id="specialInterestsInPalliativeCare"
                value={formData.specialInterestsInPalliativeCare}
                onChange={(e) => setFormData({ ...formData, specialInterestsInPalliativeCare: e.target.value })}
                placeholder="E.g., Pain management, pediatric palliative care"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="profileImage">Profile Image</Label>
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setProfileImage(file);
                    // Create a preview URL
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, imageURL: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {formData.imageURL && (
                <div className="mt-2">
                  <p className="text-sm mb-1">Preview:</p>
                  <Image 
                    src={formData.imageURL} 
                    alt="Profile preview" 
                    width={128}
                    height={128}
                    className="rounded-md border object-contain" 
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}