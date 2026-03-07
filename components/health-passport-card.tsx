"use client"

import { Card } from "@/components/ui/card"
import { QrCode } from "lucide-react"
import Image from "next/image"

interface HealthPassportCardProps {
  patientName?: string
  patientId?: string
  dob?: string
  bloodType?: string
  emergencyContact?: string
  avatar?: string
  className?: string
}

export function HealthPassportCard({
  patientName,
  patientId,
  dob,
  bloodType,
  emergencyContact,
  avatar = "/placeholder-user.jpg",
  className = ""
}: HealthPassportCardProps) {
  return (
    <Card className={`w-full max-w-2xl aspect-video flex flex-col bg-secondary text-black border-4 border-black border-solid rounded-none shadow-brutal-lg overflow-hidden ${className}`}>
      {/* Brutalist Header Block */}
      <div className="border-b-4 border-black px-4 py-2 sm:px-6 sm:py-3 bg-white flex justify-between items-center shrink-0">
        <h2 className="font-display font-black text-xl sm:text-2xl lg:text-3xl uppercase tracking-tighter mix-blend-multiply leading-none">
          Health Passport
        </h2>
        <div className="font-bold border-2 border-black px-2 py-1 bg-primary text-black text-[10px] sm:text-xs uppercase shadow-brutal-sm hidden sm:block">
          CONFIDENTIAL
        </div>
      </div>

      <div className="flex-1 p-3 sm:p-5 flex flex-row gap-3 sm:gap-6 overflow-hidden">
        {/* Left Section - Avatar */}
        <div className="w-[25%] sm:w-[20%] flex flex-col items-center shrink-0">
          <div className="w-full aspect-square border-4 border-black shadow-brutal-sm bg-white overflow-hidden mb-2 sm:mb-4">
            <Image
              src={avatar}
              alt={patientName || 'Patient'}
              width={160}
              height={160}
              className="w-full h-full object-cover grayscale contrast-125 mix-blend-multiply"
            />
          </div>
        </div>

        {/* Center Section - Patient Details */}
        <div className="flex-1 flex flex-col justify-between border-l-4 border-black pl-3 sm:pl-6 overflow-hidden">
          <div className="space-y-1 sm:space-y-3">
             <div className="flex flex-col">
                <span className="font-bold uppercase text-[8px] sm:text-[10px] mb-0.5">Patient Name</span>
                <h3 className="text-sm sm:text-xl lg:text-3xl font-black uppercase leading-none truncate">{patientName || 'UNKNOWN PATIENT'}</h3>
             </div>
             
             <div className="flex flex-col">
                <span className="font-bold uppercase text-[8px] sm:text-[10px] mb-0.5">HP ID</span>
                <p className="text-black font-bold font-mono tracking-wider w-fit bg-white border-2 border-black px-1 py-0.5 sm:px-2 sm:py-1 shadow-brutal-sm text-[10px] sm:text-sm truncate max-w-full">{patientId || 'ID-XXX-XXX'}</p>
             </div>

             <div className="grid grid-cols-2 gap-2 mt-2 sm:mt-4">
                <div className="flex flex-col">
                    <span className="font-bold uppercase text-[8px] sm:text-[10px] mb-0.5">D.O.B.</span>
                    <p className="text-black font-black text-[10px] sm:text-base leading-none">{dob || 'DD/MM/YYYY'}</p>
                </div>
                {bloodType && (
                <div className="flex flex-col">
                    <span className="font-bold uppercase text-[8px] sm:text-[10px] mb-0.5">Blood</span>
                    <p className="font-black text-destructive text-xs sm:text-base leading-none flex items-center">{bloodType}</p>
                </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Section - QR Code */}
        <div className="w-[20%] sm:w-[22%] flex flex-col items-center justify-center shrink-0 border-l-4 border-black pl-3 sm:pl-6">
            <div className="w-full aspect-square border-4 border-black bg-white p-1 sm:p-2 shadow-brutal-sm mb-2 mt-auto">
                <QrCode className="w-full h-full text-black" strokeWidth={1.5} />
            </div>
            <div className="bg-black text-white w-full text-center py-1 font-black text-[8px] sm:text-xs uppercase mt-auto">
                SCAN
            </div>
        </div>
      </div>
    </Card>
  )
}
