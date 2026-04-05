'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Calendar, FileText, Activity, AlertTriangle, CheckCircle, QrCode } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PatientDashboard() {
  const [open, setOpen] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [patientData, setPatientData] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [qrCodeData, setQrCodeData] = useState<any>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || (session.user.role !== 'patient' && session.user.role !== 'admin')) {
      router.push('/auth/patient/login')
      return
    }

    fetchDashboardData()
    fetchQRCode()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/patients/dashboard')
      if (response.ok) {
        const result = await response.json()
        setDashboardData(result.data)
        setPatientData(result.data.patient)
      } else {
        console.error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQRCode = async () => {
    setQrLoading(true)
    try {
      const response = await fetch('/api/patients/qr-code')
      if (response.ok) {
        const result = await response.json()
        setQrCodeData(result.qrCode)
      } else {
        console.error('Failed to fetch QR code')
      }
    } catch (error) {
      console.error('Error fetching QR code:', error)
    } finally {
      setQrLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-secondary min-h-screen font-sans selection:bg-black selection:text-white">
        <div className="animate-pulse">
          <div className="h-32 bg-white border-4 border-black shadow-brutal-sm mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-white border-4 border-black shadow-brutal-sm"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const patientName = patientData ? 
    patientData.name : 
    'Patient';
  const healthPassportId = session?.user?.healthPassportId || 'HP-XXXXX-XXXXX';

  return (
    <div className="p-6 space-y-8 bg-secondary min-h-screen font-sans selection:bg-black selection:text-white pb-32">
      {/* Custom Welcome Card - Top Section */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div
            className="relative overflow-hidden border-4 border-black shadow-brutal-lg bg-secondary text-black px-6 py-8 md:px-10 flex flex-col md:flex-row items-center justify-between cursor-pointer transition-transform hover:-translate-y-1 hover:-translate-x-1 brutal-enter"
          >
            <div className="z-10 flex-1 text-center md:text-left mb-6 md:mb-0">
              <Badge className="mb-4 bg-white text-black border-2 border-black uppercase font-black px-3 py-1 text-xs shadow-brutal-sm">
                * PATIENT PORTAL *
              </Badge>
              <h1 className="text-4xl md:text-6xl font-display font-black mb-2 uppercase tracking-tighter mix-blend-multiply leading-none">
                WELCOME BACK,<br/>
                <span className="text-white drop-shadow-[2px_2px_0px_#000]">{patientName}!</span>
              </h1>
              <p className="text-black font-bold text-lg border-l-4 border-black pl-4 mt-4 bg-white/50 inline-block pr-4 py-1">
                Your health summary for today
              </p>
            </div>
            
            <div className="z-10 flex flex-col items-center bg-white border-4 border-black p-4 shadow-brutal-sm rotate-2 hover:rotate-0 transition-transform">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white border-4 border-black flex items-center justify-center mb-3">
                {qrCodeData && !qrLoading ? (
                  <img 
                    src={qrCodeData.qrImageUrl} 
                    alt="Patient QR Code" 
                    className="w-full h-full object-contain p-2"
                  />
                ) : qrLoading ? (
                  <div className="font-black uppercase text-sm animate-pulse">LOADING...</div>
                ) : (
                  <QrCode className="w-16 h-16 text-black" />
                )}
              </div>
              <p className="text-xs font-bold uppercase bg-primary text-black px-2 py-1 border-2 border-black w-full text-center mb-1">Health ID</p>
              <p className="text-sm font-black font-mono tracking-wider">{healthPassportId}</p>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-2xl p-0 bg-transparent border-0 shadow-none flex items-center justify-center">
          <DialogTitle className="sr-only">Health Passport Card</DialogTitle>
          <div className="w-full relative preserve-3d">
            <div className="flip-card w-full flex items-center justify-center">
              <div className={`transition-transform duration-500 transform-gpu preserve-3d relative w-full ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front Side */}
                <div className={`w-full backface-hidden ${isFlipped ? 'absolute top-0 left-0 rotate-y-180 opacity-0 pointer-events-none' : ''}`}>
                  <Card className="w-full aspect-video flex flex-col bg-secondary text-black border-4 border-black border-solid rounded-none shadow-brutal-lg overflow-hidden relative">
                     {/* Enlargement Hint Layer */}
                     <div 
                       className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                       onClick={() => setIsFlipped(true)}
                     >
                       <div className="bg-white border-4 border-black px-6 py-3 font-black text-xl uppercase shadow-brutal-lg rotate-3">
                         CLICK TO ENLARGE QR CODE
                       </div>
                     </div>

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
                          <img 
                            src={patientData?.profilePicture || "/placeholder-user.jpg"} 
                            alt={patientData?.name || "Patient"} 
                            className="w-full h-full object-cover grayscale contrast-125 mix-blend-multiply"
                          />
                        </div>
                      </div>

                      {/* Center Section - Patient Details */}
                      <div className="flex-1 flex flex-col justify-between border-l-4 border-black pl-3 sm:pl-6 overflow-hidden">
                        <div className="space-y-1 sm:space-y-3">
                           <div className="flex flex-col">
                              <span className="font-bold uppercase text-[8px] sm:text-[10px] mb-0.5">Patient Name</span>
                              <h3 className="text-sm sm:text-xl lg:text-3xl font-black uppercase leading-none truncate">{patientData ? `${patientData.name}` : 'UNKNOWN PATIENT'}</h3>
                           </div>
                           
                           <div className="flex flex-col">
                              <span className="font-bold uppercase text-[8px] sm:text-[10px] mb-0.5">HP ID</span>
                              <p className="text-black font-bold font-mono tracking-wider w-fit bg-white border-2 border-black px-1 py-0.5 sm:px-2 sm:py-1 shadow-brutal-sm text-[10px] sm:text-sm truncate max-w-full">{healthPassportId}</p>
                           </div>

                           <div className="grid grid-cols-2 gap-2 mt-2 sm:mt-4">
                              <div className="flex flex-col">
                                  <span className="font-bold uppercase text-[8px] sm:text-[10px] mb-0.5">D.O.B.</span>
                                  <p className="text-black font-black text-[10px] sm:text-base leading-none">
                                    {patientData?.dateOfBirth 
                                      ? new Date(patientData.dateOfBirth).toLocaleDateString() 
                                      : 'Not provided'
                                    }
                                  </p>
                              </div>
                              {patientData?.bloodType && (
                              <div className="flex flex-col">
                                  <span className="font-bold uppercase text-[8px] sm:text-[10px] mb-0.5">Blood</span>
                                  <p className="font-black text-destructive text-xs sm:text-base leading-none flex items-center">{patientData.bloodType}</p>
                              </div>
                              )}
                           </div>
                        </div>
                      </div>

                      {/* Right Section - QR Code */}
                      <div className="w-[20%] sm:w-[22%] flex flex-col items-center justify-center shrink-0 border-l-4 border-black pl-3 sm:pl-6">
                          <div className="w-full aspect-square border-4 border-black bg-white p-1 sm:p-2 shadow-brutal-sm mb-2 mt-auto">
                            {qrCodeData && !qrLoading ? (
                              <img 
                                src={qrCodeData.qrImageUrl} 
                                alt="Patient QR Code" 
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <QrCode className="w-full h-full text-black" strokeWidth={1.5} />
                            )}
                          </div>
                          <div className="bg-black text-white w-full text-center py-1 font-black text-[8px] sm:text-xs uppercase mt-auto">
                              SCAN
                          </div>
                      </div>
                    </div>
                  </Card>
                </div>
                
                {/* Back Side (Enlarged QR) */}
                <div 
                  className={`w-full absolute top-0 left-0 backface-hidden rotate-y-180 cursor-pointer ${isFlipped ? '' : 'opacity-0 pointer-events-none'}`} 
                  onClick={() => setIsFlipped(false)}
                >
                  <Card className="w-full aspect-video flex items-center justify-center bg-white border-4 border-black border-solid rounded-none shadow-brutal-lg overflow-hidden relative p-8">
                     <div className="absolute top-4 left-4 font-black uppercase text-xl">
                        SCAN RECORD
                     </div>
                     <div className="absolute top-4 right-4 bg-primary text-black border-2 border-black font-black px-2 py-1 uppercase text-sm shadow-brutal-sm">
                        CONFIDENTIAL
                     </div>
                     <div className="w-64 h-64 border-4 border-black shadow-brutal-sm flex items-center justify-center bg-white p-4">
                       {qrCodeData && !qrLoading ? (
                         <img 
                           src={qrCodeData.qrImageUrl} 
                           alt="Patient QR Code" 
                           className="w-full h-full object-contain"
                         />
                       ) : (
                         <QrCode className="w-full h-full text-black" />
                       )}
                     </div>
                     <div className="absolute bottom-4 right-4 font-bold border-b-2 border-black">
                        CLICK TO FLIP BACK
                     </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white hover:-translate-y-1 hover:shadow-brutal-lg transition-all brutal-enter delay-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-accent border-4 border-black flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold uppercase tracking-wider text-black border-b-2 border-black inline-block mb-1">Health Score</p>
                <p className="text-4xl font-black text-black">
                  {dashboardData?.statistics?.healthScore || 85}<span className="text-xl text-gray-500">/100</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white hover:-translate-y-1 hover:shadow-brutal-lg transition-all brutal-enter delay-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary border-4 border-black flex items-center justify-center">
                <Heart className="w-8 h-8 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold uppercase tracking-wider text-black border-b-2 border-black inline-block mb-1">Last Checkup</p>
                <p className="text-xl font-black">
                  {dashboardData?.recentVisits?.[0]?.date ? 
                    new Date(dashboardData.recentVisits[0].date).toLocaleDateString() : 
                    'NO VISITS YET'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white hover:-translate-y-1 hover:shadow-brutal-lg transition-all brutal-enter delay-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-destructive border-4 border-black flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold uppercase tracking-wider text-black border-b-2 border-black inline-block mb-1">Medications</p>
                <p className="text-4xl font-black text-black">
                  {dashboardData?.statistics?.activeMedications || 0} <span className="text-lg font-bold uppercase">Active</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-3 brutal-enter delay-400">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white h-full">
            <CardHeader className="border-b-4 border-black bg-primary/20">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Activity className="w-8 h-8" strokeWidth={3} />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {dashboardData?.recentVisits?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentVisits.map((visit: any, index: number) => (
                    <div key={visit.id || index} className="flex items-center space-x-6 p-4 border-4 border-black bg-white hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-sm transition-transform cursor-default">
                      <div className="w-4 h-4 bg-black rotate-45 shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-black text-lg uppercase">Hospital Visit</p>
                        <p className="text-lg font-bold bg-yellow-100 inline-block px-2 border-2 border-black my-1">{visit.diagnosis}</p>
                        <p className="text-sm font-bold text-gray-600 uppercase mt-1">Treatment: {visit.treatment}</p>
                      </div>
                      <span className="text-lg font-black bg-black text-white px-3 py-1 border-2 border-black shrink-0">
                        {new Date(visit.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-4 border-black border-dashed bg-gray-50">
                  <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="font-black text-2xl uppercase mb-2">No recent activity</p>
                  <p className="font-bold text-gray-500">Your medical visits and updates will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Health Information */}
        <div className="brutal-enter delay-500">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white h-full">
            <CardHeader className="border-b-4 border-black bg-accent">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Heart className="w-8 h-8" strokeWidth={3} />
                <span>Health Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {patientData?.bloodType && (
                  <div className="p-4 bg-white border-4 border-black shadow-brutal-sm relative">
                    <div className="absolute top-0 right-0 bg-destructive text-white font-black text-xs px-2 py-1 border-l-4 border-b-4 border-black">BLOOD</div>
                    <p className="font-bold uppercase text-gray-500 text-sm mb-1">Blood Type</p>
                    <p className="text-4xl font-black text-red-600 drop-shadow-[2px_2px_0px_#000]">{patientData.bloodType}</p>
                  </div>
                )}
                {dashboardData?.statistics?.totalVisits > 0 && (
                  <div className="p-4 bg-white border-4 border-black shadow-brutal-sm relative">
                    <p className="font-bold uppercase text-gray-500 text-sm mb-1">Total Visits</p>
                    <p className="text-3xl font-black text-blue-600">{dashboardData.statistics.totalVisits}</p>
                  </div>
                )}
                {dashboardData?.statistics?.totalDocuments > 0 && (
                  <div className="p-4 bg-white border-4 border-black shadow-brutal-sm relative">
                    <p className="font-bold uppercase text-gray-500 text-sm mb-1">Documents</p>
                    <p className="text-3xl font-black text-green-600">{dashboardData.statistics.totalDocuments}</p>
                  </div>
                )}
                {(!patientData?.bloodType && !dashboardData?.statistics?.totalVisits && !dashboardData?.statistics?.totalDocuments) && (
                  <div className="text-center py-8 border-4 border-black border-dashed">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="font-bold uppercase text-sm">No info available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Current Medications */}
      {dashboardData?.currentMedications?.length > 0 && (
        <Card className="border-4 border-black rounded-none shadow-brutal-lg bg-white brutal-enter delay-600">
          <CardHeader className="border-b-4 border-black bg-white">
            <CardTitle className="font-display font-black text-3xl uppercase">Current Medications</CardTitle>
            <CardDescription className="font-bold text-black border-l-4 border-black pl-3 ml-1">Prescribed by your active doctors.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.currentMedications.map((medication: any, index: number) => (
                <div key={medication.id || index} className="p-5 border-4 border-black bg-secondary shadow-brutal-sm hover:-translate-y-1 transition-transform">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-black text-xl uppercase pr-4">{medication.name}</h3>
                    <Badge className="bg-white border-2 border-black text-black font-black uppercase shadow-brutal-sm shrink-0">
                      ACTIVE
                    </Badge>
                  </div>
                  <div className="bg-white border-2 border-black p-3 space-y-2">
                    <p className="font-bold text-lg border-b-2 border-black pb-1">{medication.dosage}</p>
                    <p className="text-sm font-bold uppercase text-gray-600">Freq: {medication.frequency}</p>
                    <p className="text-sm font-bold uppercase text-gray-600">
                      Start: {new Date(medication.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Documents */}
      {dashboardData?.recentDocuments?.length > 0 && (
        <Card className="border-4 border-black rounded-none shadow-brutal-lg bg-white brutal-enter delay-700">
          <CardHeader className="border-b-4 border-black">
            <CardTitle className="font-display font-black text-3xl uppercase">Recent Documents</CardTitle>
            <CardDescription className="font-bold text-black border-l-4 border-black pl-3 ml-1">Latest medical documents.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.recentDocuments.map((document: any, index: number) => (
                <div key={document.id || index} className="flex p-4 border-4 border-black bg-white shadow-brutal-sm hover:translate-x-1 transition-transform cursor-pointer">
                  <div className="w-16 h-16 bg-blue-100 border-4 border-black flex items-center justify-center mr-4 shrink-0">
                    <FileText className="w-8 h-8 text-black" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg uppercase truncate mb-1">{document.fileName}</h3>
                    <p className="text-sm font-bold uppercase bg-gray-100 border-2 border-black inline-block px-2 mb-1">{document.fileType}</p>
                    <p className="text-xs font-bold text-gray-500">
                      {new Date(document.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="border-4 border-black rounded-none shadow-brutal-lg bg-white brutal-enter delay-800">
        <CardHeader className="border-b-4 border-black bg-black text-white p-6">
          <CardTitle className="font-display font-black text-3xl uppercase text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-secondary/50">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Button className="h-32 flex flex-col space-y-4 bg-white text-black border-4 border-black hover:bg-primary hover:text-black shadow-brutal-sm rounded-none hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-lg transition-all">
              <Heart className="w-10 h-10" strokeWidth={2.5} />
              <span className="font-black text-lg uppercase tracking-wider">Log Vitals</span>
            </Button>
            <Button className="h-32 flex flex-col space-y-4 bg-white text-black border-4 border-black hover:bg-accent hover:text-black shadow-brutal-sm rounded-none hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-lg transition-all">
              <Calendar className="w-10 h-10" strokeWidth={2.5} />
              <span className="font-black text-lg uppercase tracking-wider text-center">Book Appt.</span>
            </Button>
            <Button className="h-32 flex flex-col space-y-4 bg-white text-black border-4 border-black hover:bg-blue-300 hover:text-black shadow-brutal-sm rounded-none hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-lg transition-all">
              <FileText className="w-10 h-10" strokeWidth={2.5} />
              <span className="font-black text-lg uppercase tracking-wider">Reports</span>
            </Button>
            <Button className="h-32 flex flex-col space-y-4 bg-white text-black border-4 border-black hover:bg-secondary hover:text-black shadow-brutal-sm rounded-none hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-lg transition-all">
              <QrCode className="w-10 h-10" strokeWidth={2.5} />
              <span className="font-black text-lg uppercase tracking-wider">Share ID</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
