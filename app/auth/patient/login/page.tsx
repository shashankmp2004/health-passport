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
    <div className="min-h-screen flex bg-background selection:bg-black selection:text-white">
      {/* Left Side - Typography Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary border-r-4 border-black p-12 flex-col justify-between brutal-enter">
        <div>
          <Link href="/" className="inline-flex items-center text-black font-black uppercase border-2 border-black bg-white px-4 py-2 hover:bg-black hover:text-white transition-colors shadow-brutal-sm mb-12">
            &lt;- Back to Home
          </Link>

          <div className="mb-12">
            <h1 className="text-7xl font-display font-black mb-8 uppercase tracking-tighter leading-none break-words">
              PATIENT<br />
              LOGIN<br />
              PORTAL_
            </h1>

            <div className="space-y-6 font-bold text-xl border-l-8 border-black pl-6">
              <div className="flex items-center gap-4">
                <span className="bg-black text-white px-2 py-1">[X]</span>
                <span>SECURE ACCESS</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-black text-white px-2 py-1">[X]</span>
                <span>INSTANT RECORDS</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-black text-white px-2 py-1">[X]</span>
                <span>HIPAA COMPLIANT</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-4 border-black pt-6">
          <p className="font-black text-2xl uppercase">SYSTEM IS ACTIVE.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white brutal-enter delay-100">
        <div className="w-full max-w-md">
          {/* Mobile back button */}
          <div className="lg:hidden mb-10">
            <Link href="/" className="inline-flex items-center text-black font-black uppercase border-2 border-black bg-primary px-4 py-2 hover:bg-black hover:text-white transition-colors shadow-brutal-sm">
              &lt;- Back to Home
            </Link>
          </div>

          <div className="mb-10 lg:hidden">
            <h1 className="text-5xl font-display font-black uppercase tracking-tighter leading-none">
              PATIENT<br />LOGIN_
            </h1>
          </div>

          <Card className="border-4 border-black shadow-brutal-lg rounded-none bg-white p-8">
            <CardContent className="p-0">
              <div className="mb-8 border-b-4 border-black pb-6">
                <h2 className="text-3xl font-display font-black text-black mb-2 uppercase tracking-tight">Access Records</h2>
                <p className="font-bold text-gray-700 bg-secondary inline-block px-2 py-1 mb-2">PLEASE AUTHENTICATE.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="healthPassportId" className="text-sm font-black uppercase text-black">
                    Health Passport ID
                  </Label>
                  <div className="relative">
                    <Input
                      id="healthPassportId"
                      type="text"
                      placeholder="HP-A28B3-T9I1L"
                      value={healthPassportId}
                      onChange={handleHealthPassportIdChange}
                      className={`h-14 border-4 border-black rounded-none uppercase font-mono text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none pr-12 focus:ring-0 ${
                        isValidId === false ? 'bg-red-100' : 'bg-white'
                      }`}
                      maxLength={14}
                      required
                    />
                    {isValidId !== null && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        {isValidId ? (
                          <div className="font-black text-xl text-green-600">✓</div>
                        ) : (
                          <div className="font-black text-xl text-red-600">✗</div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className={`text-xs font-bold uppercase ${
                    isValidId === false ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {isValidId === false 
                      ? '!! INVALID FORMAT. MUST BE HP-XXXXX-XXXXX !!'
                      : 'FORMAT: HP-XXXXX-XXXXX'
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
                      placeholder="ENTER PASSWORD"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 border-4 border-black rounded-none text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none pr-12 focus:ring-0 bg-white"
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

                <div className="flex items-center space-x-3 bg-gray-100 p-3 border-2 border-black">
                  <Checkbox
                    id="keepLoggedIn"
                    checked={keepLoggedIn}
                    onCheckedChange={(checked) => setKeepLoggedIn(checked as boolean)}
                    className="border-2 border-black rounded-none shadow-none w-6 h-6 data-[state=checked]:bg-black data-[state=checked]:text-white"
                  />
                  <Label htmlFor="keepLoggedIn" className="text-sm font-bold uppercase cursor-pointer">
                    Keep me logged in
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-16 bg-primary hover:bg-primary text-black border-4 border-black uppercase font-black text-xl brutal-active"
                >
                  SIGN IN -&gt;
                </Button>

                <div className="text-center border-t-4 border-black pt-6">
                  <p className="text-sm font-bold uppercase">
                    NO ACCOUNT YET?{" "}
                    <Link href="/auth/patient/signup" className="text-black bg-accent px-2 py-1 ml-2 border-2 border-black hover:bg-black hover:text-white transition-colors">
                      CREATE ONE
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
