"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Search, Filter, Download, Eye, Edit, Calendar, User, Activity, Plus, RefreshCw, CheckCircle, Clock } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PatientRecords() {
  const [patientRecords, setPatientRecords] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("")
  const { data: session, status } = useSession()
  const router = useRouter()

  // Handler functions for View and Edit buttons
  const handleViewPatient = (healthPassportId: string) => {
    console.log('Attempting to view patient with ID:', healthPassportId)
    console.log('Available patient records:', patientRecords.map(r => ({ 
      id: r.healthPassportId, 
      name: r.name, 
      addedAt: r.addedAt || r.lastUpdate 
    })))
    router.push(`/hospital/patient-details/${healthPassportId}`)
  }

  const handleEditPatient = (healthPassportId: string) => {
    console.log('Attempting to edit patient with ID:', healthPassportId)
    console.log('Available patient records:', patientRecords.map(r => ({ 
      id: r.healthPassportId, 
      name: r.name, 
      addedAt: r.addedAt || r.lastUpdate 
    })))
    router.push(`/hospital/patient-edit/${healthPassportId}`)
  }

  const handleExportPatient = async (patient: any) => {
    try {
      const patientData = {
        healthPassportId: patient.healthPassportId,
        name: patient.name,
        personalInfo: patient.personalInfo || {},
        medicalHistory: patient.medicalHistory || {},
        visits: patient.visits || [],
        vitals: patient.vitals || [],
        exportDate: new Date().toISOString(),
        exportedBy: session?.user?.email || 'Hospital Staff'
      }
      
      const blob = new Blob([JSON.stringify(patientData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `patient-${patient.healthPassportId}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting patient data:', error)
      alert('Error exporting patient data. Please try again.')
    }
  }

  // Function to calculate time remaining for 24-hour access
  const calculateTimeRemaining = (records: any[]) => {
    if (records.length === 0) return ""
    
    // Find the earliest record (will expire first)
    const earliestRecord = records.reduce((earliest, current) => {
      const currentTime = new Date(current.lastUpdate || current.lastVisit)
      const earliestTime = new Date(earliest.lastUpdate || earliest.lastVisit)
      return currentTime < earliestTime ? current : earliest
    })
    
    const addedTime = new Date(earliestRecord.lastUpdate || earliestRecord.lastVisit)
    const expiryTime = new Date(addedTime.getTime() + 24 * 60 * 60 * 1000) // 24 hours later
    const now = new Date()
    const timeLeft = expiryTime.getTime() - now.getTime()
    
    if (timeLeft <= 0) return "Expired"
    
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m remaining`
    } else {
      return `${minutesLeft}m remaining`
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session || (session.user.role !== 'hospital' && session.user.role !== 'doctor')) {
      router.push('/auth/hospital/login')
      return
    }

    fetchPatientRecords()
    
    // Check if redirected from add patient page
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('justAdded') === 'true') {
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
      // Clean up URL parameter
      window.history.replaceState({}, '', '/hospital/patient-records')
    }
  }, [session, status, router])

  // Refresh data when the page becomes visible (e.g., after navigating back from add patient)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session) {
        fetchPatientRecords()
      }
    }

    const handleFocus = () => {
      if (session) {
        fetchPatientRecords()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [session])

  const fetchPatientRecords = async () => {
    try {
      const response = await fetch('/api/hospitals/patient-records')
      if (response.ok) {
        const result = await response.json()
        console.log('Patient records API response:', {
          success: result.success,
          recordsCount: result.data?.patientRecords?.length || 0,
          totalPatients: result.data?.statistics?.total || 0
        })
        
        const records = result.data?.patientRecords || []
        setPatientRecords(records)
        setRecentActivity(result.data?.recentActivity || [])
        setTimeRemaining(calculateTimeRemaining(records))
      } else {
        console.error('Failed to fetch patient records:', response.status, response.statusText)
        // Still set empty arrays to show proper empty state
        setPatientRecords([])
        setRecentActivity([])
      }
    } catch (error) {
      console.error('Error fetching patient records:', error)
      // Still set empty arrays to show proper empty state
      setPatientRecords([])
      setRecentActivity([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4 w-64"></div>
          <div className="h-4 bg-gray-300 rounded mb-6 w-96"></div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patient Records</h1>
          <p className="text-gray-600">Comprehensive patient record management and access</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => {
              setLoading(true)
              fetchPatientRecords()
            }}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Records
          </Button>
          <Button 
            onClick={() => router.push('/hospital/add-patient')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Patient successfully added to hospital records!</span>
            <span className="text-green-600">The patient should now appear in your records below.</span>
          </div>
        </div>
      )}

      {/* 24-Hour Access Warning */}
      {patientRecords.length > 0 && timeRemaining && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-800">24-Hour Access Period</span>
            <span className="text-amber-600">
              {timeRemaining === "Expired" 
                ? "Access to patient records has expired. Please add patients again to renew access."
                : `Access to patient records expires in: ${timeRemaining}`
              }
            </span>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search by patient name, ID, or condition..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all-records" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-records">All Records</TabsTrigger>
          <TabsTrigger value="active">Active Patients</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="high-risk">High Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="all-records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>All Patient Records</span>
              </CardTitle>
              <CardDescription>Complete list of patient records in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientRecords.length > 0 ? (
                  patientRecords.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-lg">{record.name}</h3>
                              <Badge variant="outline">{record.age} years</Badge>
                              <Badge
                                className={
                                  record.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                }
                              >
                                {record.status}
                              </Badge>
                              <Badge
                                className={
                                  record.riskLevel === "Low"
                                    ? "bg-green-100 text-green-800"
                                    : record.riskLevel === "Moderate"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }
                              >
                                {record.riskLevel} Risk
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                              <div>
                                <span className="font-medium">Patient ID:</span> {record.id}
                              </div>
                              <div>
                                <span className="font-medium">Last Visit:</span>{" "}
                                {new Date(record.lastVisit).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Records:</span> {record.recordsCount} documents
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-700">Conditions:</span>
                              <div className="flex space-x-1">
                                {record.conditions?.map((condition: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {condition}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="text-xs text-gray-500">Last updated: {record.lastUpdate}</div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleViewPatient(record.healthPassportId)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditPatient(record.healthPassportId)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleExportPatient(record)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No patient records found</p>
                    <p className="text-sm text-gray-500 mb-2">Patient records will appear here once they are added</p>
                    <p className="text-xs text-amber-600 mb-6">Note: Access to patient records expires after 24 hours</p>
                    <Button 
                      onClick={() => router.push('/hospital/add-patient')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Patient
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span>Active Patients</span>
              </CardTitle>
              <CardDescription>Patients with recent activity or ongoing treatment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientRecords.filter((record) => record.status === "Active").length > 0 ? (
                  patientRecords
                    .filter((record) => record.status === "Active")
                    .map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-green-600" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-lg">{record.name}</h3>
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                                <div>
                                  <span className="font-medium">Patient ID:</span> {record.id}
                                </div>
                                <div>
                                  <span className="font-medium">Last Visit:</span>{" "}
                                  {new Date(record.lastVisit).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">Records:</span> {record.recordsCount} documents
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">Conditions:</span>
                                <div className="flex space-x-1">
                                  {record.conditions?.map((condition: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {condition}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleViewPatient(record.healthPassportId)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditPatient(record.healthPassportId)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No active patients found</p>
                    <p className="text-sm text-gray-500 mb-2">Active patients will appear here</p>
                    <p className="text-xs text-amber-600 mb-6">Records expire after 24 hours</p>
                    <Button 
                      onClick={() => router.push('/hospital/add-patient')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Patient
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Latest updates and changes to patient records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              activity.type === "lab"
                                ? "bg-blue-100"
                                : activity.type === "prescription"
                                  ? "bg-green-100"
                                  : "bg-purple-100"
                            }`}
                          >
                            <FileText
                              className={`w-5 h-5 ${
                                activity.type === "lab"
                                  ? "text-blue-600"
                                  : activity.type === "prescription"
                                    ? "text-green-600"
                                    : "text-purple-600"
                              }`}
                            />
                          </div>

                          <div>
                            <h3 className="font-medium">{activity.patientName}</h3>
                            <p className="text-sm text-gray-600">{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.patientId}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-500">{activity.timestamp}</p>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No recent activity</p>
                    <p className="text-sm text-gray-500 mb-2">Recent patient activity will appear here</p>
                    <p className="text-xs text-amber-600 mb-6">Records expire after 24 hours</p>
                    <Button 
                      onClick={() => router.push('/hospital/add-patient')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Patient
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high-risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-red-600" />
                <span>High Risk Patients</span>
              </CardTitle>
              <CardDescription>Patients requiring special attention and monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientRecords.filter((record) => record.riskLevel === "High").length > 0 ? (
                  patientRecords
                    .filter((record) => record.riskLevel === "High")
                    .map((record) => (
                      <div key={record.id} className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-red-600" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-lg">{record.name}</h3>
                                <Badge className="bg-red-600 text-white">High Risk</Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                                <div>
                                  <span className="font-medium">Patient ID:</span> {record.id}
                                </div>
                                <div>
                                  <span className="font-medium">Last Visit:</span>{" "}
                                  {new Date(record.lastVisit).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">Records:</span> {record.recordsCount} documents
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">Conditions:</span>
                                <div className="flex space-x-1">
                                  {record.conditions?.map((condition: string, index: number) => (
                                    <Badge key={index} variant="destructive" className="text-xs">
                                      {condition}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">
                              <Eye className="w-4 h-4 mr-2" />
                              Priority View
                            </Button>
                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 bg-transparent">
                              Alert Team
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No high-risk patients found</p>
                    <p className="text-sm text-gray-500 mb-2">High-risk patients will be displayed here for priority monitoring</p>
                    <p className="text-xs text-amber-600 mb-6">Records expire after 24 hours</p>
                    <Button 
                      onClick={() => router.push('/hospital/add-patient')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Patient
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{patientRecords.length}</p>
                <p className="text-sm text-gray-600">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {patientRecords.filter((r) => r.status === "Active").length}
                </p>
                <p className="text-sm text-gray-600">Active Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {patientRecords.filter((r) => r.riskLevel === "High").length}
                </p>
                <p className="text-sm text-gray-600">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{recentActivity.length}</p>
                <p className="text-sm text-gray-600">Recent Updates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
