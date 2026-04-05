"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, MapPin, Heart, AlertTriangle, Users, Camera, Edit3, Save, X, QrCode, Download, Share2 } from "lucide-react"
import QRGenerator from "@/components/qr-generator"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PatientProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContact: "",
    emergencyPhone: "",
    emergencyRelation: "",
    bloodType: "",
    allergies: "",
    medicalConditions: "",
    currentMedications: "",
    insuranceProvider: "",
    insuranceId: "",
    primaryPhysician: "",
    physicianPhone: "",
  })
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || (session.user.role !== 'patient' && session.user.role !== 'admin')) {
      router.push('/auth/patient/login')
      return
    }

    fetchProfileData()
  }, [session, status, router])

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/patients/profile')
      if (response.ok) {
        const result = await response.json()
        const patient = result.data.patient
        setProfileData({
          firstName: patient.personalInfo?.firstName || "",
          lastName: patient.personalInfo?.lastName || "",
          email: patient.personalInfo?.email || "",
          phone: patient.personalInfo?.phone || "",
          dateOfBirth: patient.personalInfo?.dateOfBirth || "",
          gender: patient.personalInfo?.gender || "",
          address: patient.personalInfo?.address || "",
          city: patient.personalInfo?.city || "",
          state: patient.personalInfo?.state || "",
          zipCode: patient.personalInfo?.zipCode || "",
          emergencyContact: patient.personalInfo?.emergencyContact || "",
          emergencyPhone: patient.personalInfo?.emergencyPhone || "",
          emergencyRelation: patient.personalInfo?.emergencyRelation || "",
          bloodType: patient.personalInfo?.bloodType || "",
          allergies: patient.medicalHistory?.allergies?.join(', ') || "",
          medicalConditions: patient.medicalHistory?.conditions?.map((c: any) => c.name).join(', ') || "",
          currentMedications: patient.medications?.filter((m: any) => !m.endDate || new Date(m.endDate) > new Date())
            .map((m: any) => `${m.name} ${m.dosage}`).join(', ') || "",
          insuranceProvider: patient.insurance?.provider || "",
          insuranceId: patient.insurance?.policyNumber || "",
          primaryPhysician: patient.primaryPhysician?.name || "",
          physicianPhone: patient.primaryPhysician?.phone || "",
        })
      } else {
        console.error('Failed to fetch profile data')
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/patients/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })
      
      if (response.ok) {
        setIsEditing(false)
        // Optionally show success message
      } else {
        console.error('Failed to save profile data')
        // Optionally show error message
      }
    } catch (error) {
      console.error('Error saving profile data:', error)
      // Optionally show error message
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data if needed
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 bg-secondary min-h-screen">
        <div className="animate-pulse">
          <div className="h-12 bg-white border-4 border-black shadow-brutal-sm mb-4 w-48"></div>
          <div className="h-6 bg-white border-2 border-black mb-8 w-96 max-w-full"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-white border-4 border-black shadow-brutal-sm"></div>
            <div className="h-96 bg-white border-4 border-black shadow-brutal-sm"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-secondary min-h-screen selection:bg-black selection:text-white pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 brutal-enter">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mix-blend-multiply">My Profile</h1>
          <p className="text-black font-bold text-lg border-l-4 border-black pl-3 mt-2 bg-white/50 inline-block pr-3">Manage your personal information and medical details</p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          {isEditing ? (
            <>
              <Button onClick={handleCancel} className="flex-1 md:flex-none h-12 border-4 border-black rounded-none bg-white text-black hover:bg-black hover:text-white uppercase font-black tracking-wider transition-colors shadow-brutal-sm">
                <X className="w-5 h-5 mr-2" strokeWidth={3} />
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1 md:flex-none h-12 border-4 border-black rounded-none bg-green-200 text-black hover:bg-black hover:text-white uppercase font-black tracking-wider transition-colors shadow-brutal-sm">
                <Save className="w-5 h-5 mr-2" strokeWidth={3} />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="w-full md:w-auto h-12 border-4 border-black rounded-none bg-primary text-black hover:bg-black hover:text-white uppercase font-black text-base transition-colors shadow-brutal-sm hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-lg group">
              <Edit3 className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" strokeWidth={3} />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full brutal-enter delay-100">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto md:h-14 bg-white border-4 border-black rounded-none p-0 shadow-brutal-sm gap-0">
          <TabsTrigger value="personal" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-none border-r-4 border-black font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">Personal Info</TabsTrigger>
          <TabsTrigger value="medical" className="data-[state=active]:bg-secondary data-[state=active]:text-black rounded-none border-b-4 md:border-b-0 md:border-r-4 border-black font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">Medical Info</TabsTrigger>
          <TabsTrigger value="emergency" className="data-[state=active]:bg-destructive data-[state=active]:text-black rounded-none border-r-4 border-black font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">Emergency</TabsTrigger>
          <TabsTrigger value="insurance" className="data-[state=active]:bg-green-200 data-[state=active]:text-black rounded-none border-r-4 border-black font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">Insurance</TabsTrigger>
          <TabsTrigger value="qr-codes" className="data-[state=active]:bg-purple-200 data-[state=active]:text-black rounded-none font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">QR Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-primary/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <User className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              {/* Profile Picture */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 bg-gray-50 border-4 border-black p-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-black rounded-none shadow-[4px_4px_0px_#000]">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" className="object-cover" />
                    <AvatarFallback className="text-2xl font-black bg-secondary text-black">SJ</AvatarFallback>
                  </Avatar>
                </div>
                {isEditing && (
                  <div className="flex flex-col justify-center h-24">
                    <Button className="h-10 border-4 border-black rounded-none bg-white text-black hover:bg-black hover:text-white uppercase font-black tracking-wider transition-colors shadow-brutal-sm">
                      <Camera className="w-4 h-4 mr-2" strokeWidth={3} />
                      Change Photo
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-black uppercase tracking-wider text-xs">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                    className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-black uppercase tracking-wider text-xs">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                    className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-black uppercase tracking-wider text-xs">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-black uppercase tracking-wider text-xs">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="font-black uppercase tracking-wider text-xs">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                    disabled={!isEditing}
                    className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="font-black uppercase tracking-wider text-xs">Gender</Label>
                  <Select value={profileData.gender} disabled={!isEditing}>
                    <SelectTrigger className="h-12 border-4 border-black rounded-none text-black font-bold focus:ring-0 focus:ring-offset-0 disabled:opacity-50 disabled:bg-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-black rounded-none shadow-brutal-sm">
                      <SelectItem value="Male" className="font-bold cursor-pointer focus:bg-secondary focus:text-black">Male</SelectItem>
                      <SelectItem value="Female" className="font-bold cursor-pointer focus:bg-secondary focus:text-black">Female</SelectItem>
                      <SelectItem value="Other" className="font-bold cursor-pointer focus:bg-secondary focus:text-black">Other</SelectItem>
                      <SelectItem value="Prefer not to say" className="font-bold cursor-pointer focus:bg-secondary focus:text-black">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div className="pt-8 mt-8 border-t-4 border-black border-dashed">
                <h3 className="font-black uppercase tracking-wider text-xl mb-6 flex items-center bg-gray-100 px-3 py-1 border-2 border-black -rotate-1 w-fit">
                  <MapPin className="w-5 h-5 mr-2 text-black" strokeWidth={3} />
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="font-black uppercase tracking-wider text-xs">Street Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, address: e.target.value }))}
                      disabled={!isEditing}
                      className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="font-black uppercase tracking-wider text-xs">City</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, city: e.target.value }))}
                      disabled={!isEditing}
                      className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="font-black uppercase tracking-wider text-xs">State</Label>
                    <Input
                      id="state"
                      value={profileData.state}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, state: e.target.value }))}
                      disabled={!isEditing}
                      className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="font-black uppercase tracking-wider text-xs">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={profileData.zipCode}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, zipCode: e.target.value }))}
                      disabled={!isEditing}
                      className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-secondary/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Heart className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Medical Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bloodType" className="font-black uppercase tracking-wider text-xs">Blood Type</Label>
                  <Select value={profileData.bloodType} disabled={!isEditing}>
                    <SelectTrigger className="h-12 border-4 border-black rounded-none text-black font-bold focus:ring-0 focus:ring-offset-0 disabled:opacity-50 disabled:bg-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-black rounded-none shadow-brutal-sm">
                      <SelectItem value="A+" className="font-bold cursor-pointer focus:bg-secondary focus:text-black">A+</SelectItem>
                      <SelectItem value="A-" className="font-bold cursor-pointer focus:bg-secondary focus:text-black">A-</SelectItem>
                      <SelectItem value="B+" className="font-bold cursor-pointer focus:bg-secondary focus:text-black">B+</SelectItem>
                      <SelectItem value="B-" className="font-bold cursor-pointer focus:bg-secondary focus:text-black">B-</SelectItem>
                      <SelectItem value="AB+" className="font-bold cursor-pointer focus:bg-secondary focus:text-black">AB+</SelectItem>
                      <SelectItem value="AB-" className="font-bold cursor-pointer focus:bg-secondary focus:text-black">AB-</SelectItem>
                      <SelectItem value="O+" className="font-bold cursor-pointer focus:bg-secondary focus:text-black">O+</SelectItem>
                      <SelectItem value="O-" className="font-bold cursor-pointer focus:bg-secondary focus:text-black">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryPhysician" className="font-black uppercase tracking-wider text-xs">Primary Physician</Label>
                  <Input
                    id="primaryPhysician"
                    value={profileData.primaryPhysician}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, primaryPhysician: e.target.value }))}
                    disabled={!isEditing}
                    className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="physicianPhone" className="font-black uppercase tracking-wider text-xs">Physician Phone</Label>
                  <Input
                    id="physicianPhone"
                    value={profileData.physicianPhone}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, physicianPhone: e.target.value }))}
                    disabled={!isEditing}
                    className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                  />
                </div>
              </div>

              <div className="space-y-6 pt-8 mt-8 border-t-4 border-black border-dashed">
                <div className="space-y-2">
                  <Label htmlFor="allergies" className="font-black uppercase tracking-wider text-xs flex items-center bg-secondary w-fit px-2 py-1 mb-2 border-2 border-black rotate-1">
                     <AlertTriangle className="w-4 h-4 mr-2 text-black" strokeWidth={3} />
                     Allergies
                  </Label>
                  <Textarea
                    id="allergies"
                    value={profileData.allergies}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, allergies: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="List any known allergies..."
                    rows={3}
                    className="min-h-[100px] border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000] p-4 resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalConditions" className="font-black uppercase tracking-wider text-xs">Medical Conditions</Label>
                  <Textarea
                    id="medicalConditions"
                    value={profileData.medicalConditions}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, medicalConditions: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="List any chronic conditions or diagnoses..."
                    rows={3}
                    className="min-h-[100px] border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000] p-4 resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentMedications" className="font-black uppercase tracking-wider text-xs">Current Medications</Label>
                  <Textarea
                    id="currentMedications"
                    value={profileData.currentMedications}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, currentMedications: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="List current medications and dosages..."
                    rows={3}
                    className="min-h-[100px] border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000] p-4 resize-y"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-destructive/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Users className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Emergency Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-destructive/5 border-4 border-black p-6 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="font-black uppercase tracking-wider text-xs">Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                    disabled={!isEditing}
                    className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone" className="font-black uppercase tracking-wider text-xs">Phone Number</Label>
                  <Input
                    id="emergencyPhone"
                    value={profileData.emergencyPhone}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, emergencyPhone: e.target.value }))}
                    disabled={!isEditing}
                    className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="emergencyRelation" className="font-black uppercase tracking-wider text-xs">Relationship</Label>
                  <Select value={profileData.emergencyRelation} disabled={!isEditing}>
                    <SelectTrigger className="h-12 border-4 border-black rounded-none text-black font-bold focus:ring-0 focus:ring-offset-0 disabled:opacity-50 disabled:bg-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-black rounded-none shadow-brutal-sm">
                      <SelectItem value="Spouse" className="font-bold cursor-pointer focus:bg-destructive focus:text-white">Spouse</SelectItem>
                      <SelectItem value="Parent" className="font-bold cursor-pointer focus:bg-destructive focus:text-white">Parent</SelectItem>
                      <SelectItem value="Child" className="font-bold cursor-pointer focus:bg-destructive focus:text-white">Child</SelectItem>
                      <SelectItem value="Sibling" className="font-bold cursor-pointer focus:bg-destructive focus:text-white">Sibling</SelectItem>
                      <SelectItem value="Friend" className="font-bold cursor-pointer focus:bg-destructive focus:text-white">Friend</SelectItem>
                      <SelectItem value="Other" className="font-bold cursor-pointer focus:bg-destructive focus:text-white">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isEditing && (
                <Button className="w-full h-12 border-4 border-black border-dashed rounded-none bg-gray-50 text-black hover:bg-gray-100 hover:border-solid hover:shadow-brutal-sm uppercase font-black tracking-wider transition-all">
                  <Users className="w-5 h-5 mr-3" strokeWidth={3} />
                  Add Another Emergency Contact
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-green-200/20 pb-4">
              <CardTitle className="font-display font-black text-2xl uppercase">
                Insurance Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider" className="font-black uppercase tracking-wider text-xs">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    value={profileData.insuranceProvider}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, insuranceProvider: e.target.value }))}
                    disabled={!isEditing}
                    className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceId" className="font-black uppercase tracking-wider text-xs">Insurance ID</Label>
                  <Input
                    id="insuranceId"
                    value={profileData.insuranceId}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, insuranceId: e.target.value }))}
                    disabled={!isEditing}
                    className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black disabled:opacity-50 disabled:bg-gray-100 transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                  />
                </div>
              </div>

              {isEditing && (
                <Button className="w-full h-12 border-4 border-black border-dashed rounded-none bg-gray-50 text-black hover:bg-gray-100 hover:border-solid hover:shadow-brutal-sm uppercase font-black tracking-wider transition-all">
                  Upload Insurance Card
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr-codes" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-purple-200/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <QrCode className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>My QR Codes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              <div className="space-y-8">
                <div className="p-6 bg-purple-200/10 border-4 border-black shadow-[4px_4px_0px_#000]">
                  <h3 className="font-black text-xl uppercase mb-3 inline-block bg-purple-200 px-2 py-1 border-2 border-black -rotate-1">Health Passport QR Code</h3>
                  <p className="text-sm font-bold uppercase border-l-4 border-black pl-3 mb-6 bg-white/50 inline-block pr-4 py-2">
                    Generate secure QR codes for easy access to your medical information during appointments and emergencies.
                  </p>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="h-12 bg-purple-200 text-black hover:bg-black hover:text-white border-4 border-black rounded-none font-black text-base uppercase transition-colors shadow-brutal-sm hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-lg group w-full sm:w-auto">
                        <QrCode className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" strokeWidth={3} />
                        Generate QR Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] border-4 border-black rounded-none shadow-brutal-lg p-0">
                      <DialogHeader className="p-6 border-b-4 border-black bg-purple-200">
                        <DialogTitle className="font-display font-black text-2xl uppercase">Generate QR Code</DialogTitle>
                      </DialogHeader>
                      <div className="p-6">
                         <QRGenerator 
                           patientId="patient-123" // This would be dynamic in real app
                           patientName={`${profileData.firstName} ${profileData.lastName}`}
                           onQRGenerated={(qrData) => {
                             console.log('QR Generated:', qrData)
                           }}
                         />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* QR Code Types Information */}
                <div>
                   <h3 className="font-black text-xl uppercase mb-6 flex items-center gap-3">
                      <span className="w-6 h-1 bg-black hidden sm:block"></span>
                      QR Code Types
                      <span className="flex-1 h-1 bg-black"></span>
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Card className="border-4 border-black rounded-none shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all group overflow-hidden">
                       <CardHeader className="p-4 border-b-4 border-black bg-gray-50 group-hover:bg-secondary transition-colors">
                         <CardTitle className="font-black uppercase text-lg">Full Access QR</CardTitle>
                       </CardHeader>
                       <CardContent className="p-5">
                         <p className="font-bold border-l-4 border-black pl-2 uppercase text-xs mb-4">
                           Complete medical records access for healthcare providers
                         </p>
                         <ul className="text-xs font-bold uppercase space-y-2">
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">Medical history</li>
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">Current medications</li>
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">Allergies & conditions</li>
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">Test results</li>
                         </ul>
                       </CardContent>
                     </Card>
   
                     <Card className="border-4 border-black rounded-none shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all group overflow-hidden">
                       <CardHeader className="p-4 border-b-4 border-black bg-gray-50 group-hover:bg-destructive transition-colors">
                         <CardTitle className="font-black uppercase text-lg group-hover:text-white transition-colors">Emergency QR</CardTitle>
                       </CardHeader>
                       <CardContent className="p-5">
                         <p className="font-bold border-l-4 border-black pl-2 uppercase text-xs mb-4">
                           Critical information for emergency situations
                         </p>
                         <ul className="text-xs font-bold uppercase space-y-2">
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">Blood type</li>
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">Critical allergies</li>
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">Emergency contacts</li>
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">Medical alerts</li>
                         </ul>
                       </CardContent>
                     </Card>
   
                     <Card className="border-4 border-black rounded-none shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all group overflow-hidden">
                       <CardHeader className="p-4 border-b-4 border-black bg-gray-50 group-hover:bg-primary transition-colors">
                         <CardTitle className="font-black uppercase text-lg">Limited Access QR</CardTitle>
                       </CardHeader>
                       <CardContent className="p-5">
                         <p className="font-bold border-l-4 border-black pl-2 uppercase text-xs mb-4">
                           Specific information for appointments
                         </p>
                         <ul className="text-xs font-bold uppercase space-y-2">
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">Basic demographics</li>
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">Relevant conditions</li>
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">Current visit data</li>
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">Insurance info</li>
                         </ul>
                       </CardContent>
                     </Card>
   
                     <Card className="border-4 border-black rounded-none shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all group overflow-hidden">
                       <CardHeader className="p-4 border-b-4 border-black bg-gray-50 group-hover:bg-green-200 transition-colors">
                         <CardTitle className="font-black uppercase text-lg">Temporary QR</CardTitle>
                       </CardHeader>
                       <CardContent className="p-5">
                         <p className="font-bold border-l-4 border-black pl-2 uppercase text-xs mb-4">
                           Time-limited access codes
                         </p>
                         <ul className="text-xs font-bold uppercase space-y-2">
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">24-hour expiration</li>
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">Single-use codes</li>
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">Event-specific data</li>
                           <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-black before:mr-2">Audit trail</li>
                         </ul>
                       </CardContent>
                     </Card>
                   </div>
                </div>

                {/* Security Notice */}
                <div className="p-6 bg-green-200/20 border-4 border-black">
                  <h4 className="font-black text-xl uppercase mb-4 flex items-center bg-green-200 inline-block px-2 py-1 border-2 border-black rotate-1">
                     <AlertTriangle className="w-5 h-5 mr-2 text-black" strokeWidth={3} />
                     Security & Privacy
                  </h4>
                  <ul className="text-sm font-bold uppercase space-y-3 font-mono">
                    <li className="flex items-center before:content-['>'] before:font-black before:mr-2 before:text-green-600">All QR codes are encrypted and secure</li>
                    <li className="flex items-center before:content-['>'] before:font-black before:mr-2 before:text-green-600">Access is logged for security auditing</li>
                    <li className="flex items-center before:content-['>'] before:font-black before:mr-2 before:text-green-600">You can revoke QR codes at any time</li>
                    <li className="flex items-center before:content-['>'] before:font-black before:mr-2 before:text-green-600">Data sharing requires your explicit consent</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
