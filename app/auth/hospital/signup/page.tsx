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
    <div className="min-h-screen flex bg-background selection:bg-black selection:text-white">
      {/* Left Side - Typography Banner */}
      <div className="hidden lg:flex lg:w-1/3 bg-secondary border-r-4 border-black p-12 flex-col justify-between brutal-enter">
        <div>
          <Link href="/" className="inline-flex items-center text-black font-black uppercase border-2 border-black bg-white px-4 py-2 hover:bg-black hover:text-white transition-colors shadow-brutal-sm mb-12">
            &lt;- Back to Home
          </Link>

          <div className="mb-12">
            <h1 className="text-7xl font-display font-black mb-8 uppercase tracking-tighter leading-none break-words">
              REGISTER<br />
              FACILITY_
            </h1>

            <div className="space-y-6 font-bold text-xl border-l-8 border-black pl-6">
              <div className="flex items-center gap-4">
                <span className="bg-black text-white px-2 py-1">[X]</span>
                <span>VERIFY FACILITY</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-black text-white px-2 py-1">[X]</span>
                <span>PATIENT ACCESS</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-black text-white px-2 py-1">[X]</span>
                <span>HIPAA CORE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-4 border-black pt-6">
          <p className="font-black text-2xl uppercase">PROVIDER NETWORK.</p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-2/3 flex items-center justify-center p-8 bg-white brutal-enter delay-100 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Mobile back button */}
          <div className="lg:hidden mb-10">
            <Link href="/" className="inline-flex items-center text-black font-black uppercase border-2 border-black bg-secondary px-4 py-2 hover:bg-black hover:text-white transition-colors shadow-brutal-sm">
              &lt;- Back to Home
            </Link>
          </div>

          <div className="mb-10 lg:hidden">
            <h1 className="text-5xl font-display font-black uppercase tracking-tighter leading-none">
              REGISTER_
            </h1>
          </div>

          <Card className="border-4 border-black shadow-brutal-lg rounded-none bg-white p-8">
            <CardContent className="p-0">
              <div className="mb-8 border-b-4 border-black pb-6">
                <h2 className="text-3xl font-display font-black text-black mb-2 uppercase tracking-tight">Facility Details</h2>
                <p className="font-bold text-gray-700 bg-primary/30 inline-block px-2 py-1 mb-2">JOIN HEALTHPASSPORT NETWORK.</p>
              </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="facilityName" className="text-sm font-black uppercase text-black">
                    Facility Name
                  </Label>
                  <Input
                    id="facilityName"
                    placeholder="CITY GENERAL HOSPITAL"
                    value={formData.facilityName}
                    onChange={(e) => handleInputChange("facilityName", e.target.value)}
                    className="h-14 border-4 border-black rounded-none uppercase text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="facilityType" className="text-sm font-black uppercase text-black">
                    Facility Type
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("facilityType", value)}>
                    <SelectTrigger className="h-14 border-4 border-black rounded-none uppercase text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white">
                      <SelectValue placeholder="SELECT TYPE" />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-black rounded-none shadow-brutal-lg">
                      <SelectItem value="hospital" className="font-bold cursor-pointer">HOSPITAL</SelectItem>
                      <SelectItem value="clinic" className="font-bold cursor-pointer">CLINIC</SelectItem>
                      <SelectItem value="urgent-care" className="font-bold cursor-pointer">URGENT CARE</SelectItem>
                      <SelectItem value="specialty" className="font-bold cursor-pointer">SPECIALTY</SelectItem>
                      <SelectItem value="laboratory" className="font-bold cursor-pointer">LABORATORY</SelectItem>
                      <SelectItem value="pharmacy" className="font-bold cursor-pointer">PHARMACY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="adminFirstName" className="text-sm font-black uppercase text-black">
                    Admin First Name
                  </Label>
                  <Input
                    id="adminFirstName"
                    placeholder="JOHN"
                    value={formData.adminFirstName}
                    onChange={(e) => handleInputChange("adminFirstName", e.target.value)}
                    className="h-14 border-4 border-black rounded-none uppercase text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="adminLastName" className="text-sm font-black uppercase text-black">
                    Admin Last Name
                  </Label>
                  <Input
                    id="adminLastName"
                    placeholder="SMITH"
                    value={formData.adminLastName}
                    onChange={(e) => handleInputChange("adminLastName", e.target.value)}
                    className="h-14 border-4 border-black rounded-none uppercase text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-black uppercase text-black">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ADMIN@HOSPITAL.COM"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-14 border-4 border-black rounded-none uppercase text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-black uppercase text-black">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="h-14 border-4 border-black rounded-none uppercase text-lg font-mono transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="licenseNumber" className="text-sm font-black uppercase text-black">
                  License Number
                </Label>
                <Input
                  id="licenseNumber"
                  placeholder="HL-2024-12345"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                  className="h-14 border-4 border-black rounded-none uppercase text-lg font-mono transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-black uppercase text-black">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="CREATE PASSWORD"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="h-14 border-4 border-black rounded-none text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none pr-12 bg-white"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-12 border-0 shadow-none hover:bg-transparent hover:translate-x-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="font-black underline uppercase text-xs">{showPassword ? "HIDE" : "SHOW"}</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm font-black uppercase text-black">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="CONFIRM PASSWORD"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="h-14 border-4 border-black rounded-none text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="address" className="text-sm font-black uppercase text-black">
                  Address
                </Label>
                <Textarea
                  id="address"
                  placeholder="123 MEDICAL CENTER BLVD, CITY, STATE"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="min-h-[100px] border-4 border-black rounded-none text-lg uppercase transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-16 bg-secondary hover:bg-secondary text-black border-4 border-black uppercase font-black text-xl brutal-active"
              >
                REGISTER FACILITY -&gt;
              </Button>

              <div className="text-center border-t-4 border-black pt-6">
                <p className="text-sm font-bold uppercase">
                  ALREADY REGISTERED?{" "}
                  <Link href="/auth/hospital/login" className="text-black bg-primary px-2 py-1 ml-2 border-2 border-black hover:bg-black hover:text-white transition-colors">
                    SIGN IN
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
