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
  const [loading, setLoading] = useState(true)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'patient') {
      router.push('/auth/patient/login')
      return
    }

    fetchDashboardData()
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

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-24 bg-gray-300 rounded-2xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
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
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Custom Welcome Card - Top Section */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div
            className="relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-6 flex items-center justify-between cursor-pointer"
            onClick={() => setOpen(true)}
          >
            {/* Decorative blurred circles */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-16 right-0 w-64 h-32 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="z-10 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back, {patientName}!</h1>
              <p className="text-blue-100 text-base md:text-lg">Your health summary for today</p>
            </div>
            <div className="z-10 flex flex-col items-center ml-8">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-xl flex items-center justify-center shadow-lg mb-2">
                <QrCode className="w-10 h-10 md:w-12 md:h-12 text-gray-800" />
              </div>
              <p className="text-xs text-blue-100">Your Health ID</p>
              <p className="text-xs font-mono tracking-wide">{healthPassportId}</p>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-lg p-0 bg-transparent border-0 shadow-none flex items-center justify-center">
          <DialogTitle className="sr-only">Health Passport Card</DialogTitle>
          <div className="rounded-2xl overflow-hidden w-full bg-white" style={{boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)'}}>
            <div className="bg-blue-700 text-white text-center py-5 text-2xl font-extrabold tracking-wide uppercase" style={{letterSpacing: '0.04em'}}>HEALTH PASSPORT</div>
            <div className="flip-card w-full h-[220px] flex items-center justify-center">
              <div className={`transition-transform duration-500 transform-gpu preserve-3d relative w-full h-full ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front Side */}
                <div className={`absolute w-full h-full top-0 left-0 backface-hidden rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}>
                  <div className="flex flex-row items-center px-8 py-8 w-full h-full bg-white rounded-2xl">
                    {/* Avatar with gray circle background */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center">
                        <Avatar className="w-24 h-24">
                          <AvatarImage 
                            src={patientData?.profilePicture || "/placeholder-user.jpg"} 
                            alt={patientData?.name || "Patient"} 
                          />
                          <AvatarFallback>
                            {patientData?.name ? patientData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'P'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    {/* Details */}
                    <div className="flex-1 min-w-0 pl-8">
                      <div className="font-bold text-xl text-blue-800 mb-2">
                        {patientData ? `${patientData.name}` : 'Loading...'}
                      </div>
                      <div className="text-base text-black mb-1">
                        <span className="font-semibold">Health Passport ID:</span> {healthPassportId}
                      </div>
                      <div className="text-base text-black mb-1">
                        <span className="font-semibold">Date of Birth:</span>{' '}
                        {patientData?.dateOfBirth 
                          ? new Date(patientData.dateOfBirth).toLocaleDateString() 
                          : 'Not provided'
                        }
                      </div>
                      <div className="text-base text-black">
                        <span className="font-semibold">Email:</span>{' '}
                        {patientData?.email || 'Not provided'}
                      </div>
                    </div>
                    {/* QR Code */}
                    <div className="flex flex-col items-center flex-shrink-0 pl-8 cursor-pointer" onClick={() => setIsFlipped(true)}>
                      <div className="bg-gray-100 rounded-md flex items-center justify-center" style={{width: '110px', height: '110px'}}>
                        <QrCode className="w-24 h-24 text-black" />
                      </div>
                      <span className="text-xs text-gray-500 mt-2">Click to enlarge</span>
                    </div>
                  </div>
                </div>
                {/* Back Side (Enlarged QR) */}
                <div className={`absolute w-full h-full top-0 left-0 backface-hidden rounded-2xl cursor-pointer rotate-y-180 ${isFlipped ? '' : 'rotate-y-180'}`} onClick={() => setIsFlipped(false)}>
                  <div className="flex flex-col items-center justify-center bg-white rounded-2xl h-full">
                    <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{width: '180px', height: '180px'}}>
                      <QrCode className="w-40 h-40 text-black" />
                    </div>
                    <span className="text-sm text-gray-500 mt-4">Click to go back</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Health Score</p>
                <p className="text-xl font-bold text-green-600">
                  {dashboardData?.statistics?.healthScore || 85}/100
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Checkup</p>
                <p className="text-sm font-semibold">
                  {dashboardData?.recentVisits?.[0]?.date ? 
                    new Date(dashboardData.recentVisits[0].date).toLocaleDateString() : 
                    'No visits yet'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Medications</p>
                <p className="text-xl font-bold text-orange-600">
                  {dashboardData?.statistics?.activeMedications || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentVisits?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentVisits.map((visit: any, index: number) => (
                    <div key={visit.id || index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Hospital Visit</p>
                        <p className="text-sm text-gray-600">{visit.diagnosis}</p>
                        <p className="text-xs text-gray-500">Treatment: {visit.treatment}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(visit.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                  <p className="text-sm">Your medical visits and updates will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Health Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-600" />
              <span>Health Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patientData?.bloodType && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium text-red-800">Blood Type</p>
                  <p className="text-sm text-red-600">{patientData.bloodType}</p>
                </div>
              )}
              {dashboardData?.statistics?.totalVisits > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-blue-800">Total Visits</p>
                  <p className="text-sm text-blue-600">{dashboardData.statistics.totalVisits}</p>
                </div>
              )}
              {dashboardData?.statistics?.totalDocuments > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-800">Documents</p>
                  <p className="text-sm text-green-600">{dashboardData.statistics.totalDocuments}</p>
                </div>
              )}
              {(!patientData?.bloodType && !dashboardData?.statistics?.totalVisits && !dashboardData?.statistics?.totalDocuments) && (
                <div className="text-center py-4 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No health information yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Medications */}
      {dashboardData?.currentMedications?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Medications</CardTitle>
            <CardDescription>Medications prescribed by your doctors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.currentMedications.map((medication: any, index: number) => (
                <div key={medication.id || index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{medication.name}</h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{medication.dosage}</p>
                  <p className="text-xs text-gray-500">Frequency: {medication.frequency}</p>
                  <p className="text-xs text-gray-500">
                    Started: {new Date(medication.startDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Documents */}
      {dashboardData?.recentDocuments?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Latest medical documents uploaded by healthcare providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.recentDocuments.map((document: any, index: number) => (
                <div key={document.id || index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-medium">{document.fileName}</h3>
                      <p className="text-sm text-gray-600">{document.fileType}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(document.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <Heart className="w-6 h-6" />
              <span className="text-sm">Log Vitals</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Book Appointment</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <FileText className="w-6 h-6" />
              <span className="text-sm">View Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <QrCode className="w-6 h-6" />
              <span className="text-sm">Share Health ID</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
