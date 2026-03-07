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
    <div className="min-h-screen flex bg-background selection:bg-black selection:text-white">
      {/* Left Side - Typography Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent border-r-4 border-black p-12 flex-col justify-between brutal-enter">
        <div>
          <Link href="/" className="inline-flex items-center text-black font-black uppercase border-2 border-black bg-white px-4 py-2 hover:bg-black hover:text-white transition-colors shadow-brutal-sm mb-12">
            &lt;- Back to Home
          </Link>

          <div className="mb-12">
            <h1 className="text-7xl font-display font-black mb-8 uppercase tracking-tighter leading-none break-words">
              PROVIDER<br />
              LOGIN<br />
              PORTAL_
            </h1>

            <div className="space-y-6 font-bold text-xl border-l-8 border-black pl-6">
              <div className="flex items-center gap-4">
                <span className="bg-black text-white px-2 py-1">[X]</span>
                <span>DATA ACCESS</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-black text-white px-2 py-1">[X]</span>
                <span>QR SCAN</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-black text-white px-2 py-1">[X]</span>
                <span>AI INSIGHTS</span>
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
            <Link href="/" className="inline-flex items-center text-black font-black uppercase border-2 border-black bg-accent px-4 py-2 hover:bg-black hover:text-white transition-colors shadow-brutal-sm">
              &lt;- Back to Home
            </Link>
          </div>

          <div className="mb-10 lg:hidden">
            <h1 className="text-5xl font-display font-black uppercase tracking-tighter leading-none">
              PROVIDER<br />LOGIN_
            </h1>
          </div>

          <Card className="border-4 border-black shadow-brutal-lg rounded-none bg-white p-8">
            <CardContent className="p-0">
              <div className="mb-8 border-b-4 border-black pb-6">
                <h2 className="text-3xl font-display font-black text-black mb-2 uppercase tracking-tight">Access Dashboard</h2>
                <p className="font-bold text-gray-700 bg-primary/30 inline-block px-2 py-1 mb-2">PLEASE AUTHENTICATE.</p>
              </div>

              <Tabs defaultValue="hospital" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 border-2 border-black rounded-none">
                  <TabsTrigger value="hospital" className="font-bold uppercase rounded-none border-2 border-transparent data-[state=active]:bg-primary data-[state=active]:border-black data-[state=active]:shadow-brutal-sm z-10">
                    Hospital
                  </TabsTrigger>
                  <TabsTrigger value="doctor" className="font-bold uppercase rounded-none border-2 border-transparent data-[state=active]:bg-secondary data-[state=active]:border-black data-[state=active]:shadow-brutal-sm z-10 transition-colors">
                    Doctor
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="hospital">
                  <form onSubmit={handleHospitalLogin} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-black uppercase text-black">
                        Hospital Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ADMIN@HOSPITAL.COM"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-14 border-4 border-black rounded-none uppercase text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="hospital-password" className="text-sm font-black uppercase text-black">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="hospital-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="ENTER PASSWORD"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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

                    <div className="flex items-center space-x-3 bg-gray-100 p-3 border-2 border-black">
                      <Checkbox
                        id="hospital-keepLoggedIn"
                        checked={keepLoggedIn}
                        onCheckedChange={(checked) => setKeepLoggedIn(checked as boolean)}
                        className="border-2 border-black rounded-none shadow-none w-6 h-6 data-[state=checked]:bg-black data-[state=checked]:text-white"
                      />
                      <Label htmlFor="hospital-keepLoggedIn" className="text-sm font-bold uppercase cursor-pointer">
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
                        FACILITY NOT REGISTERED?{" "}
                        <Link href="/auth/hospital/signup" className="text-black bg-accent px-2 py-1 ml-2 border-2 border-black hover:bg-black hover:text-white transition-colors">
                          REGISTER
                        </Link>
                      </p>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="doctor">
                  <form onSubmit={handleDoctorLogin} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="doctorEmail" className="text-sm font-black uppercase text-black">
                        Doctor Email
                      </Label>
                      <Input
                        id="doctorEmail"
                        type="email"
                        placeholder="DOCTOR@HOSPITAL.COM"
                        value={doctorUsername}
                        onChange={(e) => setDoctorUsername(e.target.value)}
                        className="h-14 border-4 border-black rounded-none uppercase text-lg transition-transform focus:translate-x-1 focus:translate-y-1 shadow-brutal-sm focus:shadow-none bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="doctor-password" className="text-sm font-black uppercase text-black">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="doctor-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="ENTER PASSWORD"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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

                    <div className="flex items-center space-x-3 bg-gray-100 p-3 border-2 border-black">
                      <Checkbox
                        id="doctor-keepLoggedIn"
                        checked={keepLoggedIn}
                        onCheckedChange={(checked) => setKeepLoggedIn(checked as boolean)}
                        className="border-2 border-black rounded-none shadow-none w-6 h-6 data-[state=checked]:bg-black data-[state=checked]:text-white"
                      />
                      <Label htmlFor="doctor-keepLoggedIn" className="text-sm font-bold uppercase cursor-pointer">
                        Keep me logged in
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-16 bg-secondary hover:bg-secondary text-black border-4 border-black uppercase font-black text-xl brutal-active"
                    >
                      SIGN IN -&gt;
                    </Button>

                    <div className="text-center border-t-4 border-black pt-6">
                      <p className="text-sm font-bold uppercase">
                        NOT REGISTERED AS DOCTOR?{" "}
                        <Link href="/auth/doctor/signup" className="text-black bg-accent px-2 py-1 ml-2 border-2 border-black hover:bg-black hover:text-white transition-colors">
                          REGISTER
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
