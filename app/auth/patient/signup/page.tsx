"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PatientSignup() {
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isValidAadhar, setIsValidAadhar] = useState<boolean | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    bloodType: "",
    aadharNumber: "",
    phoneNumber: "",
    password: "",
  })
  const router = useRouter()

  // Format Aadhar number as user types (XXXX-XXXX-XXXX)
  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '')
    
    // Auto-format to XXXX-XXXX-XXXX pattern
    if (value.length <= 4) {
      value = value
    } else if (value.length <= 8) {
      value = `${value.slice(0, 4)}-${value.slice(4)}`
    } else if (value.length <= 12) {
      value = `${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`
    }
    
    setFormData((prev) => ({ ...prev, aadharNumber: value }))
    
    // Validate Aadhar number (12 digits)
    const digitsOnly = value.replace(/[^0-9]/g, '')
    if (digitsOnly.length === 0) {
      setIsValidAadhar(null)
    } else {
      setIsValidAadhar(digitsOnly.length === 12)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate Aadhar number
    const aadharDigits = formData.aadharNumber.replace(/[^0-9]/g, '')
    if (aadharDigits.length !== 12) {
      alert("Please enter a valid 12-digit Aadhar number")
      return
    }
    
    // Validate password length
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long")
      return
    }
    
    // Validate phone number (basic validation)
    if (formData.phoneNumber.length < 10) {
      alert("Please enter a valid phone number")
      return
    }

    if (!agreeToTerms) {
      alert("Please agree to the terms and conditions")
      return
    }

    try {
      const response = await fetch('/api/patients/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          bloodType: formData.bloodType,
          aadharNumber: formData.aadharNumber,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Registration failed')
        return
      }

      // Registration successful
      console.log("Registration successful:", data)
      
      // Show registration success with QR code info
      const successMessage = `Registration successful! Your Health Passport ID is: ${data.patient.healthPassportId}`;
      const qrMessage = data.qrCode 
        ? "\n\nYour health QR code has been generated and will be available in your dashboard."
        : "\n\nNote: QR code generation is pending and will be available shortly in your dashboard.";
      
      alert(successMessage + qrMessage);
      
      // Store QR code info in localStorage for dashboard access
      if (data.qrCode) {
        localStorage.setItem('patientQRCode', JSON.stringify(data.qrCode));
      }
      
      // Redirect to login page
      router.push("/auth/patient/login")
      
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-12 flex-col justify-between">
        <div>
          <Link href="/" className="inline-flex items-center text-white hover:text-gray-300 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="mb-12">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
              <div className="w-8 h-8 bg-red-500 rounded-full"></div>
              <div className="w-6 h-6 bg-blue-500 rounded-full -ml-2"></div>
              <div className="w-4 h-4 bg-green-500 rounded-full -ml-1"></div>
            </div>

            <h1 className="text-4xl font-bold mb-8">
              Create Your
              <br />
              Health Account
            </h1>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">Secure data encryption</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">Instant QR access</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">AI health insights</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
            <div className="w-8 h-8 bg-pink-500 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm">@healthpassport</p>
            <p className="text-sm text-gray-400">hello@healthpassport.com</p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
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
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HealthPassport</span>
            </div>
          </div>

          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Health Passport</h2>
                <p className="text-gray-600">Register with your personal details to get your unique Health Passport ID and secure access to your medical records.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="h-10 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="h-10 border-2 border-gray-200 rounded-lg focus:border-blue-500"
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
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-10 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aadharNumber" className="text-sm font-medium text-gray-700">
                    Aadhar Number
                  </Label>
                  <div className="relative">
                    <Input
                      id="aadharNumber"
                      type="text"
                      placeholder="XXXX-XXXX-XXXX"
                      value={formData.aadharNumber}
                      onChange={handleAadharChange}
                      className={`h-10 border-2 rounded-lg focus:border-blue-500 pr-10 ${
                        isValidAadhar === null 
                          ? 'border-gray-200' 
                          : isValidAadhar 
                            ? 'border-green-500' 
                            : 'border-red-500'
                      }`}
                      maxLength={14}
                      required
                    />
                    {isValidAadhar !== null && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {isValidAadhar ? (
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        ) : (
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✗</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className={`text-xs ${
                    isValidAadhar === false ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {isValidAadhar === false 
                      ? 'Please enter a valid 12-digit Aadhar number'
                      : 'Enter your 12-digit Aadhar number'
                    }
                  </p>
                </div>

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
                      className="h-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className="h-10 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodType" className="text-sm font-medium text-gray-700">
                      Blood Type
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("bloodType", value)}>
                      <SelectTrigger className="h-10 border-2 border-gray-200 rounded-lg focus:border-blue-500">
                        <SelectValue placeholder="Select" />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="h-10 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Enter your 10-digit mobile number
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    required
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                    I agree to the{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  disabled={!agreeToTerms}
                >
                  Create Health Passport Account
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/auth/patient/login" className="text-blue-600 hover:text-blue-700 font-medium">
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
