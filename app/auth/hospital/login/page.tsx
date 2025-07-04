"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Eye, EyeOff, Hospital, Stethoscope } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HealthcareProviderLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [doctorUsername, setDoctorUsername] = useState("")
  const [password, setPassword] = useState("")
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)
  const router = useRouter()

  const handleHospitalLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (username.length < 3) {
      alert("Username must be at least 3 characters long")
      return
    }
    
    if (password.length < 6) {
      alert("Password must be at least 6 characters long")
      return
    }

    try {
      const { signIn } = await import('next-auth/react')
      
      const result = await signIn('hospital', {
        email: username, // Using username as email for hospital login
        password,
        redirect: false
      })
      
      if (result?.error) {
        alert('Invalid credentials. Please check your email and password.')
        return
      }
      
      if (result?.ok) {
        console.log("Hospital login successful, redirecting to dashboard")
        // Redirect to hospital dashboard
        router.push("/hospital/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert('An error occurred during login. Please try again.')
    }
  }

  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (doctorUsername.length < 3) {
      alert("Username must be at least 3 characters long")
      return
    }
    
    if (password.length < 6) {
      alert("Password must be at least 6 characters long")
      return
    }

    try {
      const { signIn } = await import('next-auth/react')
      
      const result = await signIn('doctor', {
        email: doctorUsername, // Using username as email for doctor login
        password,
        redirect: false
      })
      
      if (result?.error) {
        alert('Invalid credentials. Please check your email and password.')
        return
      }
      
      if (result?.ok) {
        console.log("Doctor login successful, redirecting to hospital dashboard")
        // Redirect to hospital dashboard (doctors use hospital portal)
        router.push("/hospital/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert('An error occurred during login. Please try again.')
    }
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
              Portal Access
            </h1>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">Secure patient data access</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">QR code scanning</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">AI-powered insights</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm">@healthpassport_provider</p>
            <p className="text-sm text-gray-400">provider@healthpassport.com</p>
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
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Hospital className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HealthPassport</span>
            </div>
          </div>

          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Healthcare Provider Sign In</h2>
                <p className="text-gray-600">Choose your login type and enter your credentials to access the provider dashboard.</p>
              </div>

              <Tabs defaultValue="hospital" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="hospital" className="flex items-center space-x-2">
                    <Hospital className="w-4 h-4" />
                    <span>Hospital</span>
                  </TabsTrigger>
                  <TabsTrigger value="doctor" className="flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4" />
                    <span>Doctor</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="hospital">
                  <form onSubmit={handleHospitalLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Hospital Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@hospital.com"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-12 border-2 border-gray-200 rounded-lg focus:border-green-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hospital-password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="hospital-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hospital-keepLoggedIn"
                        checked={keepLoggedIn}
                        onCheckedChange={(checked) => setKeepLoggedIn(checked as boolean)}
                      />
                      <Label htmlFor="hospital-keepLoggedIn" className="text-sm text-gray-600">
                        Keep me logged in
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                    >
                      Sign In as Hospital
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Need to register your facility?{" "}
                        <Link href="/auth/hospital/signup" className="text-green-600 hover:text-green-700 font-medium">
                          Register here
                        </Link>
                      </p>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="doctor">
                  <form onSubmit={handleDoctorLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="doctorEmail" className="text-sm font-medium text-gray-700">
                        Doctor Email
                      </Label>
                      <Input
                        id="doctorEmail"
                        type="email"
                        placeholder="doctor@hospital.com"
                        value={doctorUsername}
                        onChange={(e) => setDoctorUsername(e.target.value)}
                        className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctor-password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="doctor-password"
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
                        id="doctor-keepLoggedIn"
                        checked={keepLoggedIn}
                        onCheckedChange={(checked) => setKeepLoggedIn(checked as boolean)}
                      />
                      <Label htmlFor="doctor-keepLoggedIn" className="text-sm text-gray-600">
                        Keep me logged in
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      Sign In as Doctor
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Need to register as a doctor?{" "}
                        <Link href="/auth/doctor/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                          Register here
                        </Link>
                      </p>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
