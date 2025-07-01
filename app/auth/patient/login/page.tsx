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
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/patient/dashboard")
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
              Sign in &<br />
              Sign up Page
            </h1>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">Fully auto-layout</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">Clean design</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">Secure authentication</span>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h2>
                <p className="text-gray-600">Please login to continue to your account.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jonas.kahnwald@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    required
                  />
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
                  <span className="text-gray-500">or</span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-200 rounded-lg hover:bg-gray-50 bg-transparent"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
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
