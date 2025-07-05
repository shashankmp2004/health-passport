"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CheckCircle, XCircle, User, Calendar, RefreshCw, AlertTriangle, Bell } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function AccessRequests() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, denied: 0, expired: 0 })
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'hospital') {
      router.push('/auth/hospital/login')
      return
    }

    fetchAccessRequests()
  }, [session, status, router])

  const fetchAccessRequests = async () => {
    try {
      const response = await fetch('/api/hospitals/access-requests')
      if (response.ok) {
        const result = await response.json()
        setRequests(result.data.requests || [])
        setCounts(result.data.counts || { total: 0, pending: 0, approved: 0, denied: 0, expired: 0 })
      } else {
        console.error('Failed to fetch access requests')
      }
    } catch (error) {
      console.error('Error fetching access requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug/hospital-patient-records')
      if (response.ok) {
        const result = await response.json()
        setDebugInfo(result.data)
        console.log('Debug info:', result.data)
        alert(`Debug Info:
Total Records: ${result.data.totalRecords}
Recent Records (24h): ${result.data.recentRecords}
Check console for detailed info`)
      } else {
        console.error('Failed to fetch debug info')
      }
    } catch (error) {
      console.error('Error fetching debug info:', error)
    }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const timeLeft = expiry.getTime() - now.getTime()

    if (timeLeft <= 0) return "Expired"

    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m remaining`
    } else {
      return `${minutesLeft}m remaining`
    }
  }

  const getStatusBadge = (status: string, isExpired: boolean) => {
    if (isExpired && status === 'pending') {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Expired</Badge>
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Awaiting Response</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case 'denied':
        return <Badge variant="default" className="bg-red-100 text-red-800">Denied</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string, isExpired: boolean) => {
    if (isExpired && status === 'pending') {
      return <AlertTriangle className="w-5 h-5 text-gray-600" />
    }
    
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
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
              <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
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
          <h1 className="text-2xl font-bold">Access Requests</h1>
          <p className="text-gray-600">Monitor patient record access requests and their status</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {counts.pending} Pending
          </Badge>
          <Button 
            variant="outline"
            onClick={() => {
              setLoading(true)
              fetchAccessRequests()
            }}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline"
            onClick={fetchDebugInfo}
            className="bg-yellow-50 text-yellow-800 border-yellow-300"
          >
            Debug Records
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-800">Patient Consent Required</h3>
            <p className="text-sm text-blue-700 mt-1">
              All access requests require patient approval before you can view their medical records. 
              Patients will receive notifications and can approve or deny your requests.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Requests ({counts.total})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({counts.approved})
          </TabsTrigger>
          <TabsTrigger value="denied">
            Denied ({counts.denied})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Pending Requests</span>
              </CardTitle>
              <CardDescription>
                Waiting for patient approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.filter(r => r.status === 'pending' && !r.isExpired).length > 0 ? (
                  requests
                    .filter(r => r.status === 'pending' && !r.isExpired)
                    .map((request) => (
                      <div key={request.id} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            {getStatusIcon(request.status, request.isExpired)}
                            <div>
                              <h3 className="font-semibold text-blue-900">{request.patientName}</h3>
                              <p className="text-sm text-blue-700 mt-1">Patient ID: {request.patientId}</p>
                              {request.requestReason && (
                                <p className="text-sm text-blue-600 mt-1">Reason: {request.requestReason}</p>
                              )}
                            </div>
                          </div>
                          {getStatusBadge(request.status, request.isExpired)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-blue-700">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Sent: {new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Expires: {getTimeRemaining(request.expiresAt)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Duration: {request.accessDuration}h if approved</span>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending requests</p>
                    <p className="text-sm text-gray-500">Add patients to send access requests</p>
                    <Button 
                      onClick={() => router.push('/hospital/add-patient')}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      Add Patient
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Access Requests</CardTitle>
              <CardDescription>Complete history of patient access requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start space-x-3">
                          {getStatusIcon(request.status, request.isExpired)}
                          <div>
                            <h3 className="font-semibold">{request.patientName}</h3>
                            <p className="text-sm text-gray-600">Patient ID: {request.patientId}</p>
                            {request.requestReason && (
                              <p className="text-sm text-gray-500 mt-1">Reason: {request.requestReason}</p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(request.status, request.isExpired)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                        <span>Sent: {new Date(request.createdAt).toLocaleDateString()}</span>
                        {request.respondedAt && (
                          <span>Responded: {new Date(request.respondedAt).toLocaleDateString()}</span>
                        )}
                        <span>Type: {request.type.replace('_', ' ')}</span>
                        {request.status === 'pending' && !request.isExpired && (
                          <span className="text-blue-600">Expires: {getTimeRemaining(request.expiresAt)}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No access requests yet</p>
                    <p className="text-sm text-gray-500">Start by adding patients to send access requests</p>
                    <Button 
                      onClick={() => router.push('/hospital/add-patient')}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      Add Patient
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Approved Requests</span>
              </CardTitle>
              <CardDescription>Patients who approved your access requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.filter(r => r.status === 'approved').length > 0 ? (
                  requests
                    .filter(r => r.status === 'approved')
                    .map((request) => (
                      <div key={request.id} className="p-4 border border-green-200 rounded-lg bg-green-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <h3 className="font-semibold text-green-900">{request.patientName}</h3>
                              <p className="text-sm text-green-700">Patient ID: {request.patientId}</p>
                            </div>
                          </div>
                          {getStatusBadge(request.status, request.isExpired)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-green-700">
                          <span>Approved: {new Date(request.respondedAt).toLocaleDateString()}</span>
                          <span>Access Duration: {request.accessDuration} hours</span>
                          <span>Sent: {new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="mt-3">
                          <Button 
                            size="sm"
                            onClick={() => router.push('/hospital/patient-records')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            View Patient Records
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No approved requests</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="denied" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span>Denied Requests</span>
              </CardTitle>
              <CardDescription>Patients who denied your access requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.filter(r => r.status === 'denied').length > 0 ? (
                  requests
                    .filter(r => r.status === 'denied')
                    .map((request) => (
                      <div key={request.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start space-x-3">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <div>
                              <h3 className="font-semibold text-red-900">{request.patientName}</h3>
                              <p className="text-sm text-red-700">Patient ID: {request.patientId}</p>
                            </div>
                          </div>
                          {getStatusBadge(request.status, request.isExpired)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-red-700">
                          <span>Denied: {new Date(request.respondedAt).toLocaleDateString()}</span>
                          <span>Sent: {new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No denied requests</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
