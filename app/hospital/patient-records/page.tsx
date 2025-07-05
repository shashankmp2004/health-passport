"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Search, Filter, Download, Eye, Edit, Calendar, User, Activity, Plus, RefreshCw, CheckCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PatientRecords() {
  const [patientRecords, setPatientRecords] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

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
        setPatientRecords(result.data.patientRecords || [])
        setRecentActivity(result.data.recentActivity || [])
      } else {
        console.error('Failed to fetch patient records')
      }
    } catch (error) {
      console.error('Error fetching patient records:', error)
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
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
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
                    <p className="text-sm text-gray-500 mb-6">Patient records will appear here once they are added</p>
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
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
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
                    <p className="text-sm text-gray-500 mb-6">Active patients will appear here</p>
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
                    <p className="text-sm text-gray-500 mb-6">Recent patient activity will appear here</p>
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
                    <p className="text-sm text-gray-500 mb-6">High-risk patients will be displayed here for priority monitoring</p>
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
