"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hospital, ArrowLeft, Shield, CheckCircle2, Smartphone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HospitalVerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [isResending, setIsResending] = useState(false)
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const router = useRouter()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Get registration data from localStorage
    const storedData = localStorage.getItem('pendingHospitalRegistration')
    if (storedData) {
      setRegistrationData(JSON.parse(storedData))
    } else {
      // Redirect back to signup if no registration data
      router.push("/auth/hospital/signup")
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters
    
    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      alert("Please enter the complete 6-digit OTP")
      return
    }

    setIsVerifying(true)

    try {
      // Simulate API call for OTP verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real app, verify OTP with backend
      console.log("Verifying OTP:", otpString)
      console.log("Hospital registration data:", registrationData)

      // Clear stored registration data
      localStorage.removeItem('pendingHospitalRegistration')

      // Redirect to hospital dashboard
      router.push("/hospital/dashboard")
    } catch (error) {
      alert("Invalid OTP. Please try again.")
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOtp = async () => {
    if (isResending || timeLeft > 0) return

    setIsResending(true)
    
    try {
      // Simulate API call to resend OTP
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log("Resending OTP to:", registrationData?.phone)
      
      // Reset timer and OTP
      setTimeLeft(300)
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
      
      alert("OTP has been resent to your facility's phone number")
    } catch (error) {
      alert("Failed to resend OTP. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const maskedPhone = registrationData?.phone 
    ? registrationData.phone.replace(/(\d{2})(\d{5})(\d+)/, "$1*****$3")
    : "********"

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-900 to-emerald-900 text-white p-12 flex-col justify-between">
        <div>
          <Link href="/auth/hospital/signup" className="inline-flex items-center text-white hover:text-gray-300 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Signup
          </Link>

          <div className="mb-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
              <Shield className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-4xl font-bold mb-8">
              Secure<br />
              Facility Verification
            </h1>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">Healthcare Facility Validation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">Secure Provider Network</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-lg">HIPAA Compliant Process</span>
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

      {/* Right Side - Verification Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile back button */}
          <div className="lg:hidden mb-6">
            <Link href="/auth/hospital/signup" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Signup
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

          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Facility Phone</h2>
                <p className="text-gray-600 mb-2">
                  We've sent a 6-digit verification code to
                </p>
                <p className="text-green-600 font-semibold">
                  {maskedPhone}
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 text-center block">
                    Enter 6-Digit OTP
                  </Label>
                  <div className="flex justify-center space-x-2" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-lg focus:border-green-500"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Code expires in {formatTime(timeLeft)}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                  disabled={isVerifying || otp.join('').length !== 6}
                >
                  {isVerifying ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Activate Facility</span>
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Didn't receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOtp}
                    disabled={timeLeft > 0 || isResending}
                    className="text-green-600 hover:text-green-700 font-medium h-auto p-0"
                  >
                    {isResending ? (
                      "Sending..."
                    ) : timeLeft > 0 ? (
                      `Resend in ${formatTime(timeLeft)}`
                    ) : (
                      "Resend OTP"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
