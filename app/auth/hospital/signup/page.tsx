"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long")
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    
    if (formData.phone.length < 10) {
      alert("Please enter a valid phone number")
      return
    }

    try {
      const response = await fetch('/api/hospitals/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facilityName: formData.facilityName,
          facilityType: formData.facilityType,
          adminFirstName: formData.adminFirstName,
          adminLastName: formData.adminLastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          licenseNumber: formData.licenseNumber,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Registration failed')
        return
      }

      // Registration successful
      console.log("Hospital registration successful:", data)
      alert(`Registration successful! Your Hospital ID is: ${data.hospital.hospitalId}. Please wait for admin verification.`)
      
      // Redirect to login page
      router.push("/auth/hospital/login")
      
    } catch (error) {
      console.error("Registration error:", error)
      alert('An error occurred during registration. Please try again.')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-900 to-green-800 text-white p-12 flex-col justify-between">
        <div>
          <Link href="/" className="inline-flex items-center text-white hover:text-gray-300 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="mb-12">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
              <Hospital className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-4xl font-bold mb-8">
              Healthcare Provider
              <br />
              Registration
            </h1>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">Secure Facility Registration</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">Instant Patient Access</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">HIPAA Compliant System</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            <div className="w-8 h-8 bg-emerald-500 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm">@healthpassport</p>
            <p className="text-sm text-gray-300">Healthcare Provider Network</p>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile back button */}
          <div className="lg:hidden mb-6">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Hospital className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HealthPassport</span>
            </div>
          </div>

          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Register Healthcare Facility</h2>
                <p className="text-gray-600">Join HealthPassport to provide better patient care with secure health data access.</p>
              </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facilityName" className="text-sm font-medium text-gray-700">
                    Facility Name
                  </Label>
                  <Input
                    id="facilityName"
                    placeholder="City General Hospital"
                    value={formData.facilityName}
                    onChange={(e) => handleInputChange("facilityName", e.target.value)}
                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-green-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facilityType" className="text-sm font-medium text-gray-700">
                    Facility Type
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("facilityType", value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 rounded-lg focus:border-green-500">
                      <SelectValue placeholder="Select type" />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminFirstName" className="text-sm font-medium text-gray-700">
                    Admin First Name
                  </Label>
                  <Input
                    id="adminFirstName"
                    placeholder="John"
                    value={formData.adminFirstName}
                    onChange={(e) => handleInputChange("adminFirstName", e.target.value)}
                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-green-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminLastName" className="text-sm font-medium text-gray-700">
                    Admin Last Name
                  </Label>
                  <Input
                    id="adminLastName"
                    placeholder="Smith"
                    value={formData.adminLastName}
                    onChange={(e) => handleInputChange("adminLastName", e.target.value)}
                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-green-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@hospital.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-12 border-2 border-gray-200 rounded-lg focus:border-green-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="h-12 border-2 border-gray-200 rounded-lg focus:border-green-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber" className="text-sm font-medium text-gray-700">
                  License Number
                </Label>
                <Input
                  id="licenseNumber"
                  placeholder="HL-2024-12345"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                  className="h-12 border-2 border-gray-200 rounded-lg focus:border-green-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="h-12 border-2 border-gray-200 rounded-lg focus:border-green-500 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-green-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Address
                </Label>
                <Textarea
                  id="address"
                  placeholder="123 Medical Center Blvd, City, State 12345"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="min-h-[80px] border-2 border-gray-200 rounded-lg focus:border-green-500"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
              >
                Register Facility
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already registered?{" "}
                  <Link href="/auth/hospital/login" className="text-green-600 hover:text-green-700 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
)
}
