"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Eye, EyeOff, Hospital } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HospitalSignup() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    facilityName: "",
    facilityType: "",
    adminFirstName: "",
    adminLastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    licenseNumber: "",
    description: "",
  })
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate signup
    router.push("/hospital/dashboard")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Hospital className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">HealthPassport</span>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Register Healthcare Facility</CardTitle>
            <CardDescription>Join HealthPassport to provide better patient care</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facilityName">Facility Name</Label>
                  <Input
                    id="facilityName"
                    placeholder="Enter facility name"
                    value={formData.facilityName}
                    onChange={(e) => handleInputChange("facilityName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facilityType">Facility Type</Label>
                  <Select onValueChange={(value) => handleInputChange("facilityType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="urgent-care">Urgent Care</SelectItem>
                      <SelectItem value="specialty">Specialty Practice</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminFirstName">Admin First Name</Label>
                  <Input
                    id="adminFirstName"
                    placeholder="Enter admin first name"
                    value={formData.adminFirstName}
                    onChange={(e) => handleInputChange("adminFirstName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminLastName">Admin Last Name</Label>
                  <Input
                    id="adminLastName"
                    placeholder="Enter admin last name"
                    value={formData.adminLastName}
                    onChange={(e) => handleInputChange("adminLastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter facility email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    placeholder="Enter license number"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter facility address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your facility"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Register Facility
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already registered?{" "}
                <Link href="/auth/hospital/login" className="text-green-600 hover:text-green-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
