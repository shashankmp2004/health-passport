"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QrCode, Shield, Heart, Calendar, User, MapPin } from "lucide-react"
import Image from "next/image"

interface HealthPassportCardProps {
  patientName?: string
  patientId?: string
  bloodType?: string
  emergencyContact?: string
  lastVisit?: string
  location?: string
  avatar?: string
  className?: string
}

export function HealthPassportCard({
  patientName = "Sarah Johnson",
  patientId = "HP-2024-001234",
  bloodType = "O+",
  emergencyContact = "+1 (555) 123-4567",
  lastVisit = "Dec 15, 2024",
  location = "City General Hospital",
  avatar = "/placeholder-user.jpg",
  className = ""
}: HealthPassportCardProps) {
  return (
    <Card className={`w-full max-w-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white border-0 shadow-2xl overflow-hidden ${className}`}>
      <div className="relative p-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full -translate-y-12"></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          {/* Left Section - Patient Info */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-3 border-white/30 shadow-lg">
                <Image
                  src={avatar}
                  alt={patientName}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">{patientName}</h3>
              <p className="text-blue-100 text-sm font-medium">{patientId}</p>
              <div className="flex items-center space-x-3 text-sm">
                <Badge variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/20">
                  <Heart className="w-3 h-3 mr-1" />
                  {bloodType}
                </Badge>
                <span className="text-blue-100">{emergencyContact}</span>
              </div>
            </div>
          </div>

          {/* Center Section - Health Status */}
          <div className="px-6 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-200" />
                <span className="text-sm text-blue-100">Last Visit</span>
              </div>
              <p className="text-white font-semibold">{lastVisit}</p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <MapPin className="w-4 h-4 text-blue-200" />
                <span className="text-sm text-blue-100">{location}</span>
              </div>
            </div>
          </div>

          {/* Right Section - QR Code */}
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <QrCode className="w-12 h-12 text-gray-800" />
            </div>
            <p className="text-xs text-blue-100 mt-2">Scan to Access</p>
          </div>
        </div>

        {/* Bottom Section - Health Metrics */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="flex justify-between items-center text-sm">
            <div className="text-center">
              <p className="text-blue-100">Blood Pressure</p>
              <p className="text-white font-semibold">120/80</p>
            </div>
            <div className="text-center">
              <p className="text-blue-100">Heart Rate</p>
              <p className="text-white font-semibold">72 BPM</p>
            </div>
            <div className="text-center">
              <p className="text-blue-100">Temperature</p>
              <p className="text-white font-semibold">98.6°F</p>
            </div>
            <div className="text-center">
              <p className="text-blue-100">Weight</p>
              <p className="text-white font-semibold">140 lbs</p>
            </div>
          </div>
        </div>

        {/* Health Passport Branding */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-2 opacity-60">
            <Heart className="w-4 h-4" />
            <span className="text-xs font-medium">HealthPassport</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
