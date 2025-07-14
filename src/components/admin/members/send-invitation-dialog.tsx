"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { EnvelopeOpenIcon } from "@radix-ui/react-icons"
import { toast } from "react-hot-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Country codes array with country name and dial code
const countryCodes = [
  { code: "+1", country: "United States" },
  { code: "+44", country: "United Kingdom" },
  { code: "+91", country: "India" },
  { code: "+61", country: "Australia" },
  { code: "+86", country: "China" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+81", country: "Japan" },
  { code: "+7", country: "Russia" },
  { code: "+55", country: "Brazil" },
  { code: "+27", country: "South Africa" },
  { code: "+234", country: "Nigeria" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+65", country: "Singapore" },
  { code: "+60", country: "Malaysia" },
  { code: "+64", country: "New Zealand" },
  { code: "+92", country: "Pakistan" },
  { code: "+880", country: "Bangladesh" },
  { code: "+94", country: "Sri Lanka" },
  { code: "+977", country: "Nepal" },
  { code: "+20", country: "Egypt" },
  { code: "+254", country: "Kenya" },
  { code: "+256", country: "Uganda" },
  { code: "+255", country: "Tanzania" },
  { code: "+63", country: "Philippines" },
  { code: "+62", country: "Indonesia" },
  { code: "+84", country: "Vietnam" },
  { code: "+66", country: "Thailand" },
  { code: "+82", country: "South Korea" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+31", country: "Netherlands" },
  { code: "+32", country: "Belgium" },
  { code: "+41", country: "Switzerland" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+45", country: "Denmark" },
  { code: "+358", country: "Finland" },
  { code: "+48", country: "Poland" },
  { code: "+43", country: "Austria" },
  { code: "+36", country: "Hungary" },
  { code: "+30", country: "Greece" },
  { code: "+351", country: "Portugal" },
  { code: "+353", country: "Ireland" },
  { code: "+972", country: "Israel" },
  { code: "+90", country: "Turkey" },
  { code: "+52", country: "Mexico" },
  { code: "+54", country: "Argentina" },
  { code: "+56", country: "Chile" },
  { code: "+57", country: "Colombia" },
  { code: "+58", country: "Venezuela" },
  { code: "+51", country: "Peru" },
  { code: "+593", country: "Ecuador" },
  { code: "+1", country: "Canada" },
]

export function SendInvitationDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+91") // Default to India

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Combine country code with phone number
      const fullPhoneNumber = `${countryCode}${phoneNumber}`
      
      // Send invitation to the provided phone number
      const response = await fetch("https://api.thegpdn.org/api/admin/adminInvitationToUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ number: fullPhoneNumber }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to send invitation")
      }

      toast.success("Invitation sent successfully")
      setOpen(false)
      // Reset form
      setPhoneNumber("")
      setCountryCode("+91") // Reset to default
      
      // Refresh the page
      router.refresh()
    } catch (error) {
      toast.error("Failed to send invitation")
      console.error("Error sending invitation:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <EnvelopeOpenIcon className="mr-2 h-4 w-4" />
          Send Invitation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Invitation</DialogTitle>
          <DialogDescription>
            Send an invitation to a healthcare professional to join the GPDN network.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="countryCode">Country Code*</Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select country code" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {countryCodes.map((country) => (
                    <SelectItem key={`${country.code}-${country.country}`} value={country.code}>
                      {country.country} ({country.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number*</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="9497284858"
                required
                type="tel"
                pattern="[0-9]{10}"
              />
              <p className="text-sm text-muted-foreground">
                Enter a 10-digit phone number without country code.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
