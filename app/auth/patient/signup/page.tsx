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
    <div className="min-h-screen flex bg-background selection:bg-black selection:text-white">
      {/* Left Side - Typography Banner */}
      <div className="hidden lg:flex lg:w-1/3 bg-accent border-r-4 border-black p-12 flex-col justify-between brutal-enter">
        <div>
          <Link href="/" className="inline-flex items-center text-black font-black uppercase border-2 border-black bg-white px-4 py-2 hover:bg-black hover:text-white transition-colors shadow-brutal-sm mb-12">
            &lt;- Back to Home
          </Link>

          <div className="mb-12">
            <h1 className="text-7xl font-display font-black mb-8 uppercase tracking-tighter leading-none break-words">
              CREATE<br />
              YOUR<br />
              ACCOUNT_
            </h1>

            <div className="space-y-6 font-bold text-xl border-l-8 border-black pl-6">
              <div className="flex items-center gap-4">
                <span className="bg-black text-white px-2 py-1">[X]</span>
                <span>SECURE ENCRYPTION</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-black text-white px-2 py-1">[X]</span>
                <span>INSTANT QR ACCESS</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-black text-white px-2 py-1">[X]</span>
                <span>AI HEALTH INSIGHTS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-4 border-black pt-6">
          <p className="font-black text-2xl uppercase">INITIATING SETUP.</p>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-2/3 flex items-center justify-center p-8 bg-white brutal-enter delay-100 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Mobile back button */}
          <div className="lg:hidden mb-10">
            <Link href="/" className="inline-flex items-center text-black font-black uppercase border-2 border-black bg-accent px-4 py-2 hover:bg-black hover:text-white transition-colors shadow-brutal-sm">
              &lt;- Back to Home
            </Link>
          </div>

          <div className="mb-10 lg:hidden">
            <h1 className="text-5xl font-display font-black uppercase tracking-tighter leading-none">
              CREATE<br />ACCOUNT_
            </h1>
          </div>

          <Card className="border-4 border-black shadow-brutal-lg rounded-none bg-white p-8">
            <CardContent className="p-0">
              <div className="mb-8 border-b-4 border-black pb-6">
                <h2 className="text-3xl font-display font-black text-black mb-2 uppercase tracking-tight">Register Details</h2>
                <p className="font-bold text-gray-700 bg-primary/30 inline-block px-2 py-1 mb-2">OBTAIN UNIQUE HEALTH PASSPORT.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="firstName" className="text-sm font-black uppercase text-black">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="JOHN"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="h-14 border-4 border-black rounded-none uppercase text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="lastName" className="text-sm font-black uppercase text-black">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="DOE"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="h-14 border-4 border-black rounded-none uppercase text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-black uppercase text-black">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="JOHN.DOE@EXAMPLE.COM"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-14 border-4 border-black rounded-none uppercase text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="aadharNumber" className="text-sm font-black uppercase text-black">
                    Aadhar Number
                  </Label>
                  <div className="relative">
                    <Input
                      id="aadharNumber"
                      type="text"
                      placeholder="XXXX-XXXX-XXXX"
                      value={formData.aadharNumber}
                      onChange={handleAadharChange}
                      className={`h-14 border-4 border-black rounded-none uppercase font-mono text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none pr-12 focus:ring-0 ${
                        isValidAadhar === false ? 'bg-red-100' : 'bg-white'
                      }`}
                      maxLength={14}
                      required
                    />
                    {isValidAadhar !== null && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        {isValidAadhar ? (
                          <div className="font-black text-xl text-green-600">✓</div>
                        ) : (
                          <div className="font-black text-xl text-red-600">✗</div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className={`text-xs font-bold uppercase ${
                    isValidAadhar === false ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {isValidAadhar === false 
                      ? '!! ENTER 12-DIGIT AADHAR !!'
                      : 'FORMAT: XXXX-XXXX-XXXX'
                    }
                  </p>
                </div>

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
                  <p className="text-xs font-bold uppercase text-gray-600">
                    MINIMUM 6 CHARACTERS
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="dateOfBirth" className="text-sm font-black uppercase text-black">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className="h-14 border-4 border-black rounded-none uppercase text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="bloodType" className="text-sm font-black uppercase text-black">
                      Blood Type
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("bloodType", value)}>
                      <SelectTrigger className="h-14 border-4 border-black rounded-none uppercase text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white">
                        <SelectValue placeholder="SELECT" />
                      </SelectTrigger>
                      <SelectContent className="border-4 border-black rounded-none shadow-brutal-lg">
                        <SelectItem value="A+" className="font-bold cursor-pointer">A+</SelectItem>
                        <SelectItem value="A-" className="font-bold cursor-pointer">A-</SelectItem>
                        <SelectItem value="B+" className="font-bold cursor-pointer">B+</SelectItem>
                        <SelectItem value="B-" className="font-bold cursor-pointer">B-</SelectItem>
                        <SelectItem value="AB+" className="font-bold cursor-pointer">AB+</SelectItem>
                        <SelectItem value="AB-" className="font-bold cursor-pointer">AB-</SelectItem>
                        <SelectItem value="O+" className="font-bold cursor-pointer">O+</SelectItem>
                        <SelectItem value="O-" className="font-bold cursor-pointer">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phoneNumber" className="text-sm font-black uppercase text-black">
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="h-14 border-4 border-black rounded-none uppercase font-mono text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white"
                    required
                  />
                </div>

                <div className="flex items-center space-x-3 bg-gray-100 p-3 border-2 border-black">
                  <Checkbox
                    id="agreeToTerms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    className="border-2 border-black rounded-none shadow-none w-6 h-6 data-[state=checked]:bg-black data-[state=checked]:text-white"
                    required
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm font-bold uppercase cursor-pointer">
                    I AGREE TO THE{" "}
                    <Link href="/terms" className="text-black underline hover:text-primary">
                      TERMS
                    </Link>{" "}
                    AND{" "}
                    <Link href="/privacy" className="text-black underline hover:text-primary">
                      PRIVACY POLICY
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-16 bg-accent hover:bg-accent text-black border-4 border-black uppercase font-black text-xl brutal-active"
                  disabled={!agreeToTerms}
                >
                  CREATE ACCOUNT -&gt;
                </Button>

                <div className="text-center border-t-4 border-black pt-6">
                  <p className="text-sm font-bold uppercase">
                    ALREADY HAVE AN ACCOUNT?{" "}
                    <Link href="/auth/patient/login" className="text-black bg-primary px-2 py-1 ml-2 border-2 border-black hover:bg-black hover:text-white transition-colors">
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
