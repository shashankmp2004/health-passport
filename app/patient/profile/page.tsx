"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, Heart, AlertTriangle, Users, Camera, Edit3, Save, X } from "lucide-react"

export default function PatientProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1985-03-15",
    gender: "Female",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    emergencyContact: "John Johnson",
    emergencyPhone: "+1 (555) 987-6543",
    emergencyRelation: "Spouse",
    bloodType: "O+",
    allergies: "Penicillin, Shellfish",
    medicalConditions: "Hypertension, Type 2 Diabetes",
    currentMedications: "Metformin 500mg, Lisinopril 10mg",
    insuranceProvider: "Blue Cross Blue Shield",
    insuranceId: "BC123456789",
    primaryPhysician: "Dr. Michael Chen",
    physicianPhone: "+1 (555) 234-5678",
  })

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to backend
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data if needed
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and medical details</p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="medical">Medical Info</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Contacts</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" />
                  <AvatarFallback className="text-lg">SJ</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={profileData.gender} disabled={!isEditing}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-4 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, address: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, city: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profileData.state}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, state: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={profileData.zipCode}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, zipCode: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-600" />
                <span>Medical Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select value={profileData.bloodType} disabled={!isEditing}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryPhysician">Primary Physician</Label>
                  <Input
                    id="primaryPhysician"
                    value={profileData.primaryPhysician}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, primaryPhysician: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="physicianPhone">Physician Phone</Label>
                  <Input
                    id="physicianPhone"
                    value={profileData.physicianPhone}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, physicianPhone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies" className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                    Allergies
                  </Label>
                  <Textarea
                    id="allergies"
                    value={profileData.allergies}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, allergies: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="List any known allergies..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalConditions">Medical Conditions</Label>
                  <Textarea
                    id="medicalConditions"
                    value={profileData.medicalConditions}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, medicalConditions: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="List any chronic conditions or diagnoses..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentMedications">Current Medications</Label>
                  <Textarea
                    id="currentMedications"
                    value={profileData.currentMedications}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, currentMedications: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="List current medications and dosages..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-orange-600" />
                <span>Emergency Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Phone Number</Label>
                  <Input
                    id="emergencyPhone"
                    value={profileData.emergencyPhone}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, emergencyPhone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyRelation">Relationship</Label>
                  <Select value={profileData.emergencyRelation} disabled={!isEditing}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Child">Child</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isEditing && (
                <Button variant="outline" className="w-full bg-transparent">
                  <Users className="w-4 h-4 mr-2" />
                  Add Another Emergency Contact
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    value={profileData.insuranceProvider}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, insuranceProvider: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceId">Insurance ID</Label>
                  <Input
                    id="insuranceId"
                    value={profileData.insuranceId}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, insuranceId: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <Button variant="outline" className="w-full bg-transparent">
                  Upload Insurance Card
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
