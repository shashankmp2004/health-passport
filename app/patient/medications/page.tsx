"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pill, Clock, AlertCircle, CheckCircle, Plus, Calendar } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PatientMedications() {
  const [loading, setLoading] = useState(true)
  const [medicationData, setMedicationData] = useState<any>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'patient') {
      router.push('/auth/patient/login')
      return
    }

    fetchMedications()
  }, [session, status, router])

  const fetchMedications = async () => {
    try {
      const response = await fetch('/api/patients/medications')
      if (response.ok) {
        const result = await response.json()
        setMedicationData(result.data)
      } else {
        console.error('Failed to fetch medications')
      }
    } catch (error) {
      console.error('Error fetching medications:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 bg-secondary min-h-screen">
        <div className="animate-pulse">
          <div className="h-12 bg-white border-4 border-black shadow-brutal-sm mb-4 w-64"></div>
          <div className="h-6 bg-white border-2 border-black mb-8 w-96 max-w-full"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-white border-4 border-black shadow-brutal-sm"></div>
            <div className="h-96 bg-white border-4 border-black shadow-brutal-sm"></div>
          </div>
        </div>
      </div>
    )
  }

  const currentMedications = medicationData?.currentMedications || []
  const medicationHistory = medicationData?.medicationHistory || []
  const upcomingRefills = medicationData?.upcomingRefills || []

  return (
    <div className="p-6 md:p-8 space-y-8 bg-secondary min-h-screen selection:bg-black selection:text-white pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 brutal-enter">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mix-blend-multiply">Medications</h1>
          <p className="text-black font-bold text-lg border-l-4 border-black pl-3 mt-2 bg-white/50 inline-block pr-3">Manage your current prescriptions and track adherence</p>
        </div>
        <Button className="h-12 bg-primary text-black hover:bg-black hover:text-white border-4 border-black rounded-none font-black text-base uppercase transition-colors shadow-brutal-sm hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-lg group">
          <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" strokeWidth={3} />
          Add Medication
        </Button>
      </div>

      {/* Current Medications */}
      <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white brutal-enter delay-100">
        <CardHeader className="border-b-4 border-black bg-primary/20 pb-4">
          <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
            <Pill className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
            <span>Current Medications</span>
          </CardTitle>
          <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1 uppercase">Your active prescriptions and dosing schedule</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="space-y-6">
            {currentMedications.length > 0 ? (
              currentMedications.map((medication: any, index: number) => (
                <div key={index} className="px-6 py-6 border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all bg-white relative overflow-hidden group">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 border-b-4 border-black pb-4">
                    <div>
                      <h3 className="font-black text-2xl uppercase tracking-tighter mb-1 relative inline-block">
                        <span className="relative z-10">{medication.name}</span>
                        <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/40 -z-10 -rotate-1 group-hover:rotate-0 transition-transform"></span>
                      </h3>
                      <p className="text-black font-bold border-l-4 border-black pl-2 uppercase">
                        {medication.dosage} <span className="mx-2">•</span> {medication.frequency}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       <Badge className="bg-green-200 text-black border-2 border-black hover:bg-green-200 rounded-none font-black uppercase tracking-wider text-xs px-3 py-1 shadow-brutal-sm transform -rotate-2 group-hover:rotate-0 transition-transform">Active</Badge>
                       {medication.adherence && (
                          <Badge className="bg-white text-black border-2 border-black hover:bg-white rounded-none font-black uppercase tracking-wider text-xs px-3 py-1 shadow-brutal-sm">{medication.adherence}% adherence</Badge>
                       )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-bold uppercase mb-6 bg-gray-50 border-4 border-black p-4">
                    <div>
                      <span className="text-gray-500 block text-[10px] mb-1">PRESCRIBED BY</span>
                      <p className="text-black truncate" title={medication.prescribedBy}>{medication.prescribedBy}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] mb-1">STARTED</span>
                      <p className="text-black">{new Date(medication.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] mb-1">INDICATION</span>
                      <p className="text-black truncate" title={medication.indication}>{medication.indication}</p>
                    </div>
                    {medication.nextDose && (
                      <div className="bg-secondary -m-4 p-4 border-l-4 border-black flex flex-col justify-center">
                        <span className="text-black block text-[10px] mb-1">NEXT DOSE</span>
                        <p className="text-black font-black text-lg">{medication.nextDose}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
                    {medication.adherence && (
                       <div className="flex items-center space-x-3 w-full md:w-auto flex-1">
                          <span className="text-xs font-black uppercase whitespace-nowrap">Adherence</span>
                          <div className="w-full bg-gray-200 h-4 border-2 border-black max-w-xs relative overflow-hidden">
                             <div
                                className="bg-green-200 h-full border-r-2 border-black"
                                style={{ width: `${medication.adherence}%` }}
                             ></div>
                          </div>
                       </div>
                    )}
                    <div className="flex space-x-3 w-full md:w-auto">
                       <Button className="flex-1 md:flex-none h-10 border-4 border-black rounded-none bg-white text-black hover:bg-black hover:text-white uppercase font-black tracking-wider transition-colors shadow-brutal-sm">
                          Details
                       </Button>
                       <Button className="flex-1 md:flex-none h-10 border-4 border-black rounded-none bg-primary text-black hover:bg-black hover:text-white uppercase font-black tracking-wider transition-colors shadow-brutal-sm">
                          <CheckCircle className="w-4 h-4 mr-2" strokeWidth={3} /> Mark Taken
                       </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border-4 border-black border-dashed bg-gray-50">
                <Pill className="w-16 h-16 mx-auto mb-4 text-black opacity-20" strokeWidth={3} />
                <p className="font-black text-2xl uppercase mb-2">No active medications</p>
                <p className="font-bold text-gray-500 uppercase">Your medications will be added by healthcare providers</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medication Reminders & Refills */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 brutal-enter delay-200">
        {/* Today's Reminders */}
        <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white h-full">
          <CardHeader className="border-b-4 border-black bg-secondary/20 pb-4">
            <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
              <Clock className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
              <span>Today's Reminders</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-green-200/20 border-4 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_#000] transition-all gap-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-black mt-1" strokeWidth={3} />
                  <div>
                    <p className="font-black text-lg uppercase tracking-tight line-through decoration-4 decoration-black/30">Lisinopril 10mg</p>
                    <p className="text-sm font-bold uppercase border-l-2 border-black pl-2 mt-1">8:00 AM - Taken</p>
                  </div>
                </div>
              </div>

              <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-green-200/20 border-4 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_#000] transition-all gap-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-black mt-1" strokeWidth={3} />
                  <div>
                    <p className="font-black text-lg uppercase tracking-tight line-through decoration-4 decoration-black/30">Metformin 500mg</p>
                    <p className="text-sm font-bold uppercase border-l-2 border-black pl-2 mt-1">8:00 AM - Taken</p>
                  </div>
                </div>
              </div>

              <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-primary/20 border-4 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_#000] transition-all gap-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-6 h-6 text-black mt-1 animate-pulse" strokeWidth={3} />
                  <div>
                    <p className="font-black text-lg uppercase tracking-tight">Metformin 500mg</p>
                    <p className="text-sm font-bold uppercase border-l-2 border-black pl-2 mt-1 bg-secondary inline-block px-1">6:00 PM - Upcoming</p>
                  </div>
                </div>
                <Button className="w-full sm:w-auto mt-2 sm:mt-0 h-10 border-4 border-black rounded-none bg-primary text-black hover:bg-black hover:text-white uppercase font-black tracking-wider transition-colors shadow-brutal-sm group-hover:rotate-2">
                  Mark Taken
                </Button>
              </div>

              <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border-4 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_#000] transition-all gap-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-6 h-6 text-black mt-1" strokeWidth={3} />
                  <div>
                    <p className="font-black text-lg uppercase tracking-tight">Atorvastatin 20mg</p>
                    <p className="text-sm font-bold uppercase border-l-2 border-black pl-2 mt-1 text-gray-600">9:00 PM - Upcoming</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refill Alerts */}
        <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white h-full">
          <CardHeader className="border-b-4 border-black bg-destructive/20 pb-4">
            <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
              <AlertCircle className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
              <span>Refill Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {upcomingRefills.map((refill: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 border-4 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_#000] transition-all group ${
                    refill.daysLeft <= 7 ? "bg-destructive/20" : "bg-secondary/20"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-black text-xl uppercase tracking-tight flex items-center space-x-2">
                         <span>{refill.medication}</span>
                         {refill.daysLeft <= 7 && <span className="bg-destructive text-white text-[10px] px-1 py-0.5 border-2 border-black animate-pulse">URGENT</span>}
                      </p>
                      <div className="text-sm font-bold uppercase mt-2 space-y-1 border-l-4 border-black pl-2">
                         <p className="flex items-center space-x-2 bg-white px-1 border-2 border-black w-fit"><span className="text-[10px] text-gray-500 mr-1">PHARMACY</span> {refill.pharmacy}</p>
                         <p className="flex items-center space-x-2 bg-white px-1 border-2 border-black w-fit"><span className="text-[10px] text-gray-500 mr-1">REMAINING</span> {refill.refillsRemaining}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end w-full sm:w-auto">
                      <p className={`font-black text-lg uppercase mb-3 ${refill.daysLeft <= 7 ? "text-destructive underline decoration-4 decoration-destructive/40 underline-offset-4" : "text-black"}`}>
                        {refill.daysLeft} days left
                      </p>
                      <Button
                        className="w-full sm:w-auto h-10 border-4 border-black rounded-none bg-white text-black hover:bg-black hover:text-white uppercase font-black tracking-wider transition-colors shadow-brutal-sm"
                      >
                        Request Refill
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {upcomingRefills.length === 0 && (
                <div className="text-center py-8 border-4 border-black border-dashed bg-gray-50">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-black opacity-20" strokeWidth={3} />
                  <p className="font-black text-lg uppercase">All Caught Up</p>
                  <p className="font-bold text-gray-500 uppercase text-sm">No imminent refills needed</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medication History */}
      <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white mt-8 brutal-enter delay-300">
        <CardHeader className="border-b-4 border-black bg-gray-100 pb-4">
          <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase opacity-70">
            <Calendar className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
            <span>Medication History</span>
          </CardTitle>
          <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1 uppercase opacity-70">Previously prescribed medications</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {medicationHistory.length > 0 ? (
               medicationHistory.map((medication: any, index: number) => (
                 <div key={index} className="p-5 bg-white border-4 border-black border-dashed opacity-80 hover:opacity-100 transition-opacity">
                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                     <div>
                       <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter line-through decoration-2">{medication.name}</h3>
                       <p className="text-black font-bold uppercase mt-1">
                         {medication.dosage} <span className="mx-2">•</span> {medication.frequency}
                       </p>
                     </div>
                     <Badge className="bg-black text-white hover:bg-black rounded-none font-black uppercase text-xs px-3 py-1 shadow-brutal-sm">
                       Discontinued
                     </Badge>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold uppercase mb-4 bg-gray-50 border-4 border-black p-3">
                     <div>
                       <span className="text-gray-500 block text-[10px]">PRESCRIBED BY</span> {medication.prescribedBy}
                     </div>
                     <div>
                       <span className="text-gray-500 block text-[10px]">DURATION</span> {new Date(medication.startDate).toLocaleDateString()}{" "}
                       - {new Date(medication.endDate).toLocaleDateString()}
                     </div>
                   </div>

                   <div className="text-sm font-medium border-l-4 border-black pl-3 bg-gray-50 py-2 pr-2">
                     <span className="uppercase font-black block text-xs mb-1">Reason for discontinuation:</span>
                     {medication.reason}
                   </div>
                 </div>
               ))
            ) : (
               <div className="text-center py-12 border-4 border-black border-dashed bg-gray-50">
                 <Calendar className="w-16 h-16 mx-auto mb-4 text-black opacity-20" strokeWidth={3} />
                 <p className="font-black text-lg uppercase mb-2">No Past Medications</p>
                 <p className="font-bold text-gray-500 uppercase text-sm">Your discontinued medications will appear here</p>
               </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
