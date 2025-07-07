"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CheckCircle, XCircle, Clock, Hospital, User, Calendar, AlertTriangle, Shield } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PatientNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState<string | null>(null)
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, denied: 0, expired: 0 })
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'patient') {
      router.push('/auth/patient/login')
      return
    }

    fetchNotifications()
  }, [session, status, router])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/patients/notifications')
      if (response.ok) {
        const result = await response.json()
        setNotifications(result.data.notifications || [])
        setCounts(result.data.counts || { total: 0, pending: 0, approved: 0, denied: 0, expired: 0 })
      } else {
        console.error('Failed to fetch notifications')
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async (notificationId: string, action: 'approve' | 'deny', response?: string) => {
    setResponding(notificationId)

    try {
      const apiResponse = await fetch('/api/patients/notifications/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          action,
          response: response || `I ${action} this access request.`
        }),
      })

      if (apiResponse.ok) {
        const result = await apiResponse.json()
        
        // Refresh notifications
        fetchNotifications()
        
        // Show success message
        alert(`Access request ${action}d successfully!`)
      } else {
        const errorData = await apiResponse.json()
        alert(errorData.error || `Failed to ${action} request`)
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error)
      alert(`Error ${action}ing request. Please try again.`)
    } finally {
      setResponding(null)
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
    if (isExpired) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Expired</Badge>
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Pending Response</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case 'denied':
        return <Badge variant="default" className="bg-red-100 text-red-800">Denied</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getNotificationIcon = (type: string, status: string) => {
    switch (type) {
      case 'access_request':
        return status === 'pending' ? 
          <Bell className="w-5 h-5 text-blue-600" /> : 
          <Hospital className="w-5 h-5 text-gray-600" />
      case 'access_granted':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'access_denied':
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
          <p className="text-gray-600">Manage hospital access requests to your medical records</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {counts.pending} Pending
          </Badge>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-800">Your Privacy is Protected</h3>
            <p className="text-sm text-blue-700 mt-1">
              Hospitals must request your permission before accessing your medical records. 
              You have full control over who can see your information and for how long. 
              Approved access automatically expires after 24 hours.
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
                <Bell className="w-5 h-5 text-blue-600" />
                <span>Pending Access Requests</span>
              </CardTitle>
              <CardDescription>
                Hospitals requesting access to your medical records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.filter(n => n.status === 'pending' && !n.isExpired).length > 0 ? (
                  notifications
                    .filter(n => n.status === 'pending' && !n.isExpired)
                    .map((notification) => (
                      <div key={notification.id} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            {getNotificationIcon(notification.type, notification.status)}
                            <div>
                              <h3 className="font-semibold text-blue-900">{notification.hospital.name}</h3>
                              <p className="text-sm text-blue-700 mt-1">{notification.message}</p>
                            </div>
                          </div>
                          {getStatusBadge(notification.status, notification.isExpired)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700 mb-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Requested by: {notification.requestedBy?.name || 'Hospital Staff'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Received: {new Date(notification.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Expires: {getTimeRemaining(notification.expiresAt)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Access Duration: 24 hours if approved</span>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleResponse(notification.id, 'approve')}
                            disabled={responding === notification.id}
                          >
                            {responding === notification.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Access
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                            onClick={() => handleResponse(notification.id, 'deny')}
                            disabled={responding === notification.id}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Deny Access
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending access requests</p>
                    <p className="text-sm text-gray-500">You'll be notified when hospitals request access to your records</p>
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
              <CardDescription>Complete history of access requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type, notification.status)}
                          <div>
                            <h3 className="font-semibold">{notification.hospital.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          </div>
                        </div>
                        {getStatusBadge(notification.status, notification.isExpired)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                        <span>Requested: {new Date(notification.createdAt).toLocaleDateString()}</span>
                        {notification.respondedAt && (
                          <span>Responded: {new Date(notification.respondedAt).toLocaleDateString()}</span>
                        )}
                        <span>Type: {notification.type.replace('_', ' ')}</span>
                        {notification.status === 'pending' && !notification.isExpired && (
                          <span className="text-blue-600">Expires: {getTimeRemaining(notification.expiresAt)}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No access requests yet</p>
                    <p className="text-sm text-gray-500">When hospitals request access to your records, they'll appear here</p>
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
              <CardDescription>Access requests you have approved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.filter(n => n.status === 'approved').length > 0 ? (
                  notifications
                    .filter(n => n.status === 'approved')
                    .map((notification) => (
                      <div key={notification.id} className="p-4 border border-green-200 rounded-lg bg-green-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <h3 className="font-semibold text-green-900">{notification.hospital.name}</h3>
                              <p className="text-sm text-green-700 mt-1">{notification.message}</p>
                            </div>
                          </div>
                          {getStatusBadge(notification.status, notification.isExpired)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-green-700">
                          <span>Approved: {new Date(notification.respondedAt).toLocaleDateString()}</span>
                          <span>Duration: 24 hours</span>
                          <span>Requested by: {notification.requestedBy?.name}</span>
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
              <CardDescription>Access requests you have denied</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.filter(n => n.status === 'denied').length > 0 ? (
                  notifications
                    .filter(n => n.status === 'denied')
                    .map((notification) => (
                      <div key={notification.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start space-x-3">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <div>
                              <h3 className="font-semibold text-red-900">{notification.hospital.name}</h3>
                              <p className="text-sm text-red-700 mt-1">{notification.message}</p>
                            </div>
                          </div>
                          {getStatusBadge(notification.status, notification.isExpired)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-red-700">
                          <span>Denied: {new Date(notification.respondedAt).toLocaleDateString()}</span>
                          <span>Requested by: {notification.requestedBy?.name}</span>
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
