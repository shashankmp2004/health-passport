"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Eye, EyeOff, Stethoscope } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DoctorSignup() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    specialty: "",
    hospitalAffiliation: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  })
  const [isValidLicense, setIsValidLicense] = useState<boolean | null>(null)
  const router = useRouter()

  // Format Medical License Number as user types (ML-XXXXXXX format)
  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^0-9A-Z-]/g, '')
    
    // Auto-format to ML-XXXXXXX pattern
    if (value.length <= 2) {
      value = value
    } else if (value.length <= 10) {
      if (!value.startsWith('ML-')) {
        value = 'ML-' + value.replace('ML', '')
      }
    }
    
    // Limit to 10 characters total (ML-XXXXXXX)
    if (value.length > 10) {
      value = value.slice(0, 10)
    }
    
    setFormData({ ...formData, licenseNumber: value })
    
    // Validate format in real-time
    const licenseRegex = /^ML-[A-Z0-9]{7}$/
    if (value.length === 0) {
      setIsValidLicense(null)
    } else {
      setIsValidLicense(licenseRegex.test(value))
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert("Please enter your full name")
      return
    }
    
    if (!formData.email.includes("@")) {
      alert("Please enter a valid email address")
      return
    }
    
    if (formData.phone.length < 10) {
      alert("Please enter a valid phone number")
      return
    }
    
    const licenseRegex = /^ML-[A-Z0-9]{7}$/
    if (!licenseRegex.test(formData.licenseNumber)) {
      alert("Please enter a valid Medical License Number (format: ML-XXXXXXX)")
      return
    }
    
    if (!formData.specialty) {
      alert("Please select your medical specialty")
      return
    }
    
    if (!formData.hospitalAffiliation.trim()) {
      alert("Please enter your hospital affiliation")
      return
    }
    
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long")
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    
    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions")
      return
    }
    
    // Here you would typically make an API call to register
    console.log("Doctor registration:", formData)
    
    // Redirect to login page
    router.push("/auth/doctor/login")
  }

  const specialties = [
    "Cardiology",
    "Dermatology", 
    "Emergency Medicine",
    "Family Medicine",
    "Internal Medicine",
    "Neurology",
    "Oncology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery",
    "Other"
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-blue-800 text-white p-12 flex-col justify-between">
        <div>
          <Link href="/" className="inline-flex items-center text-white hover:text-gray-300 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="mb-12">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
              <Stethoscope className="w-8 h-8 text-blue-600" />
            </div>

            <h1 className="text-4xl font-bold mb-8">
              Join Our
              <br />
              Medical Network
            </h1>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">Verified Medical Professionals</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">Secure Patient Data Access</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">Streamlined Workflow</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">HIPAA Compliant Platform</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
            <div className="w-8 h-8 bg-cyan-500 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm">@healthpassport_doctor</p>
            <p className="text-sm text-gray-400">doctor@healthpassport.com</p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
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
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HealthPassport</span>
            </div>
          </div>

          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Registration</h2>
                <p className="text-gray-600">Register to join our medical professional network.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@hospital.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    required
                  />
                </div>

                {/* Medical License */}
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber" className="text-sm font-medium text-gray-700">
                    Medical License Number
                  </Label>
                  <div className="relative">
                    <Input
                      id="licenseNumber"
                      type="text"
                      placeholder="ML-ABC1234"
                      value={formData.licenseNumber}
                      onChange={handleLicenseChange}
                      className={`h-12 border-2 rounded-lg focus:border-blue-500 pr-10 ${
                        isValidLicense === null 
                          ? 'border-gray-200' 
                          : isValidLicense 
                            ? 'border-green-500' 
                            : 'border-red-500'
                      }`}
                      maxLength={10}
                      required
                    />
                    {isValidLicense !== null && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {isValidLicense ? (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✗</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className={`text-xs ${
                    isValidLicense === false ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {isValidLicense === false 
                      ? 'Invalid format. Use: ML-XXXXXXX (e.g., ML-ABC1234)'
                      : 'Enter your medical license number (e.g., ML-ABC1234)'
                    }
                  </p>
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <Label htmlFor="specialty" className="text-sm font-medium text-gray-700">
                    Medical Specialty
                  </Label>
                  <Select value={formData.specialty} onValueChange={(value) => handleInputChange("specialty", value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-500">
                      <SelectValue placeholder="Select your specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hospital Affiliation */}
                <div className="space-y-2">
                  <Label htmlFor="hospitalAffiliation" className="text-sm font-medium text-gray-700">
                    Hospital Affiliation
                  </Label>
                  <Input
                    id="hospitalAffiliation"
                    type="text"
                    placeholder="General Hospital"
                    value={formData.hospitalAffiliation}
                    onChange={(e) => handleInputChange("hospitalAffiliation", e.target.value)}
                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    required
                  />
                </div>

                {/* Password */}
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
                      className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-500 pr-12"
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-500 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Register as Doctor
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/auth/doctor/login" className="text-blue-600 hover:text-blue-700 font-medium">
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
