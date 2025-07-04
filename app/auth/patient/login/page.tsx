"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PatientLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [healthPassportId, setHealthPassportId] = useState("")
  const [password, setPassword] = useState("")
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)
  const [isValidId, setIsValidId] = useState<boolean | null>(null)
  const router = useRouter()

  // Format Health Passport ID as user types
  const handleHealthPassportIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^0-9A-Z-]/g, '')
    
    // Auto-format to HP-XXXXX-XXXXX pattern
    if (value.length <= 2) {
      value = value
    } else if (value.length <= 8) {
      if (!value.startsWith('HP-')) {
        value = 'HP-' + value.replace('HP', '')
      }
    } else if (value.length <= 13) {
      if (!value.startsWith('HP-')) {
        value = 'HP-' + value.replace('HP', '')
      }
      const parts = value.split('-')
      if (parts.length >= 2 && parts[1].length > 5) {
        value = `${parts[0]}-${parts[1].slice(0, 5)}-${parts[1].slice(5)}`
      }
    }
    
    setHealthPassportId(value)
    
    // Validate format in real-time
    const healthPassportIdRegex = /^HP-[A-Z0-9]{5}-[A-Z0-9]{5}$/
    if (value.length === 0) {
      setIsValidId(null)
    } else {
      setIsValidId(healthPassportIdRegex.test(value))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation for Health Passport ID format
    const healthPassportIdRegex = /^HP-[A-Z0-9]{5}-[A-Z0-9]{5}$/
    if (!healthPassportIdRegex.test(healthPassportId)) {
      alert("Please enter a valid Health Passport ID (format: HP-XXXXX-XXXXX)")
      return
    }
    
    if (password.length < 6) {
      alert("Password must be at least 6 characters long")
      return
    }
    
    try {
      const { signIn } = await import('next-auth/react')
      
      const result = await signIn('patient', {
        healthPassportId,
        password,
        redirect: false
      })
      
      if (result?.error) {
        alert('Invalid credentials. Please check your Health Passport ID and password.')
        return
      }
      
      if (result?.ok) {
        console.log("Login successful, redirecting to patient dashboard")
        router.push("/patient/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert('An error occurred during login. Please try again.')
    }
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
              Patient Portal<br />
              Access
            </h1>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">Secure Health Passport Login</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">Instant Access to Records</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">HIPAA Compliant Security</span>
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

      {/* Right Side - Login Form */}
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
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HealthPassport</span>
            </div>
          </div>

          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Sign In</h2>
                <p className="text-gray-600">Please enter your Health Passport ID and password to access your health records.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="healthPassportId" className="text-sm font-medium text-gray-700">
                    Health Passport ID
                  </Label>
                  <div className="relative">
                    <Input
                      id="healthPassportId"
                      type="text"
                      placeholder="HP-A28B3-T9I1L"
                      value={healthPassportId}
                      onChange={handleHealthPassportIdChange}
                      className={`h-12 border-2 rounded-lg focus:border-blue-500 pr-10 ${
                        isValidId === null 
                          ? 'border-gray-200' 
                          : isValidId 
                            ? 'border-green-500' 
                            : 'border-red-500'
                      }`}
                      maxLength={14}
                      required
                    />
                    {isValidId !== null && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {isValidId ? (
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
                    isValidId === false ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {isValidId === false 
                      ? 'Invalid format. Use: HP-XXXXX-XXXXX (e.g., HP-A28B3-T9I1L)'
                      : 'Enter your unique Health Passport ID (e.g., HP-A28B3-T9I1L)'
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
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="keepLoggedIn"
                    checked={keepLoggedIn}
                    onCheckedChange={(checked) => setKeepLoggedIn(checked as boolean)}
                  />
                  <Label htmlFor="keepLoggedIn" className="text-sm text-gray-600">
                    Keep me logged in
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Sign In
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Need an account?{" "}
                    <Link href="/auth/patient/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                      Create one
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
