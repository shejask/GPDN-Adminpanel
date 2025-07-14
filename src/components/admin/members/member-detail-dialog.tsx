"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Member } from "./columns"
import { CalendarIcon, MapPinIcon, PhoneIcon, MailIcon, BookOpenIcon, ClipboardCheckIcon, BuildingIcon, UserIcon } from "lucide-react"

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Get user initials for avatar fallback
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Get registration status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'approved':
      return 'default'
    case 'pending':
      return 'outline'
    case 'decline':
      return 'destructive'
    default:
      return 'secondary'
  }
}

interface MemberDetailDialogProps {
  member: Member | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MemberDetailDialog({ member, isOpen, onOpenChange }: MemberDetailDialogProps) {
  if (!member) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Member Details
            <Badge variant={getStatusVariant(member.registrationStatus)}>
              {member.registrationStatus.charAt(0).toUpperCase() + member.registrationStatus.slice(1)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Complete profile information for this healthcare professional
          </DialogDescription>
        </DialogHeader>

        {/* Profile header */}
        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
          <Avatar className="h-20 w-20 border-2 border-primary/10">
            <AvatarImage src={member.imageURL} alt={member.fullName} />
            <AvatarFallback className="text-lg">{getInitials(member.fullName)}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold">{member.fullName}</h3>
            <div className="flex flex-col md:flex-row gap-2 md:items-center mt-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MailIcon className="h-3.5 w-3.5" />
                <span className="text-sm">{member.email}</span>
              </div>
              <div className="hidden md:block text-muted-foreground">•</div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <PhoneIcon className="h-3.5 w-3.5" />
                <span className="text-sm">{member.phoneNumber}</span>
              </div>
            </div>
            {member.countryOfPractice && (
              <div className="flex items-center gap-1 text-muted-foreground mt-1 justify-center md:justify-start">
                <MapPinIcon className="h-3.5 w-3.5" />
                <span className="text-sm">{member.countryOfPractice}</span>
              </div>
            )}
          </div>
        </div>

        {/* Member details tabs */}
        <Tabs defaultValue="profile" className="w-full mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="medical">Medical Information</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4 mt-4">
            {/* Bio */}
            {member.bio && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    Biography
                  </h4>
                  <p className="text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Registration Info */}
            <Card>
              <CardContent className="pt-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  Registration Information
                </h4>
                <div className="grid hidden grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Member ID</p>
                    <p  className="font-medium">{member._id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Registration Date</p>
                    <p className="font-medium">{formatDate(member.createdAt)}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant={getStatusVariant(member.registrationStatus)}>
                      {member.registrationStatus.charAt(0).toUpperCase() + member.registrationStatus.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="medical" className="space-y-4 mt-4">
            {/* Medical Qualifications */}
            <Card>
              <CardContent className="pt-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
                  Medical Qualifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Qualification</p>
                    <p className="font-medium">{member.medicalQualification || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Year of Graduation</p>
                    <p className="font-medium">{member.yearOfGraduation || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Formal Training in Palliative Care</p>
                    <Badge variant={member.hasFormalTrainingInPalliativeCare ? "default" : "outline"}>
                      {member.hasFormalTrainingInPalliativeCare ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration Details */}
            <Card>
              <CardContent className="pt-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <ClipboardCheckIcon className="h-4 w-4 text-muted-foreground" />
                  Registration Details
                </h4>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Medical Registration Authority</p>
                    <p className="font-medium">{member.medicalRegistrationAuthority || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Medical Registration Number</p>
                    <p className="font-medium">{member.medicalRegistrationNumber || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Affiliations & Interests */}
            <Card>
              <CardContent className="pt-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                  Affiliations & Interests
                </h4>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Affiliated Palliative Associations</p>
                    <p className="font-medium">{member.affiliatedPalliativeAssociations || 'None specified'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Special Interests in Palliative Care</p>
                    <p className="font-medium">{member.specialInterestsInPalliativeCare || 'None specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
