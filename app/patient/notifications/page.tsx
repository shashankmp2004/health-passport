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
      return <Badge className="bg-gray-200 text-gray-600 border-2 border-black rounded-none font-black uppercase shadow-brutal-sm">Expired</Badge>
    }
    
    switch (status) {
      case 'pending':
        return <Badge className="bg-secondary text-black border-2 border-black rounded-none font-black uppercase shadow-brutal-sm">Pending Response</Badge>
      case 'approved':
        return <Badge className="bg-green-200 text-black border-2 border-black rounded-none font-black uppercase shadow-brutal-sm">Approved</Badge>
      case 'denied':
        return <Badge className="bg-destructive text-white border-2 border-black rounded-none font-black uppercase shadow-brutal-sm">Denied</Badge>
      default:
        return <Badge className="bg-white text-black border-2 border-black rounded-none font-black uppercase shadow-brutal-sm">{status}</Badge>
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
      <div className="p-6 md:p-8 space-y-8 bg-secondary min-h-screen">
        <div className="animate-pulse">
          <div className="h-12 bg-white border-4 border-black mb-4 w-64 shadow-brutal-sm"></div>
          <div className="h-6 bg-white border-2 border-black mb-8 w-96 max-w-full"></div>
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-white border-4 border-black shadow-brutal-sm"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-secondary min-h-screen selection:bg-black selection:text-white pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 brutal-enter">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mix-blend-multiply">Access Requests</h1>
          <p className="text-black font-bold text-lg border-l-4 border-black pl-3 mt-2 bg-white/50 inline-block pr-3">Manage hospital access requests to your medical records</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-secondary text-black border-4 border-black rounded-none font-black uppercase tracking-wider text-sm px-4 py-2 shadow-brutal-sm">
            {counts.pending} Pending
          </Badge>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="p-6 bg-white border-4 border-black shadow-brutal-sm brutal-enter delay-100">
        <div className="flex items-start space-x-4">
          <div className="bg-primary/20 p-2 border-2 border-black -rotate-6">
             <Shield className="w-8 h-8 text-black" strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Your Privacy is Protected</h3>
            <p className="text-base font-bold text-gray-800 border-l-4 border-black pl-3 bg-gray-50 border-dashed py-2 pr-2">
              Hospitals must request your permission before accessing your medical records. 
              You have full control over who can see your information and for how long. 
              <span className="bg-secondary px-1 ml-1 border-2 border-black text-black">Approved access automatically expires after 24 hours.</span>
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full brutal-enter delay-200">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-14 bg-white border-4 border-black rounded-none p-0 shadow-brutal-sm gap-0">
          <TabsTrigger value="pending" className="data-[state=active]:bg-secondary data-[state=active]:text-black rounded-none border-r-4 border-b-4 md:border-b-0 border-black font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">
            Pending ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-none border-r-0 md:border-r-4 border-b-4 md:border-b-0 border-black font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">
            All ({counts.total})
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-green-200 data-[state=active]:text-black rounded-none border-r-4 border-black font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">
            Approved ({counts.approved})
          </TabsTrigger>
          <TabsTrigger value="denied" className="data-[state=active]:bg-destructive data-[state=active]:text-black rounded-none font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">
            Denied ({counts.denied})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-secondary/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Bell className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Pending Access Requests</span>
              </CardTitle>
              <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1 uppercase">
                Hospitals requesting access to your medical records
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {notifications.filter(n => n.status === 'pending' && !n.isExpired).length > 0 ? (
                  notifications
                    .filter(n => n.status === 'pending' && !n.isExpired)
                    .map((notification) => (
                      <div key={notification.id} className="p-6 bg-white border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 border-b-4 border-black pb-4 gap-4">
                          <div className="flex items-start space-x-4">
                            <div className="bg-secondary p-3 border-4 border-black">
                               <Hospital className="w-8 h-8 text-black" strokeWidth={3} />
                            </div>
                            <div>
                              <h3 className="font-black text-2xl uppercase tracking-tighter">{notification.hospital.name}</h3>
                              <p className="text-base font-bold bg-gray-50 border-l-4 border-black pl-2 pr-2 py-1 mt-1 inline-block">{notification.message}</p>
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(notification.status, notification.isExpired)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-bold uppercase mb-6 bg-gray-50 border-4 border-black p-4">
                          <div>
                            <span className="text-gray-500 text-[10px] mb-1 flex items-center"><User className="w-3 h-3 mr-1" /> REQUESTED BY</span>
                            <span className="text-black">{notification.requestedBy?.name || 'Hospital Staff'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-[10px] mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1" /> RECEIVED</span>
                            <span className="text-black">{new Date(notification.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="bg-secondary/20 -m-4 p-4 border-l-4 border-r-4 border-black flex flex-col justify-center">
                            <span className="text-black text-[10px] mb-1 flex items-center"><Clock className="w-3 h-3 mr-1" /> EXPIRES IN</span>
                            <span className="text-black font-black text-lg">{getTimeRemaining(notification.expiresAt)}</span>
                          </div>
                          <div className="flex flex-col justify-center pl-4 lg:pl-0 pt-4 lg:pt-0">
                            <span className="text-gray-500 block text-[10px] mb-1">DURATION</span>
                            <span className="text-black">24 hours if approved</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                          <Button
                            className="flex-1 h-12 border-4 border-black rounded-none bg-green-200 text-black hover:bg-black hover:text-white uppercase font-black tracking-wider transition-colors shadow-brutal-sm"
                            onClick={() => handleResponse(notification.id, 'approve')}
                            disabled={responding === notification.id}
                          >
                            {responding === notification.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-3"></div>
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5 mr-2" strokeWidth={3} />
                                Approve Access
                              </>
                            )}
                          </Button>
                          <Button
                            className="flex-1 h-12 border-4 border-black rounded-none bg-white text-black hover:bg-destructive hover:text-black uppercase font-black tracking-wider transition-colors shadow-brutal-sm group"
                            onClick={() => handleResponse(notification.id, 'deny')}
                            disabled={responding === notification.id}
                          >
                            <XCircle className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" strokeWidth={3} />
                            Deny Access
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12 border-4 border-black border-dashed bg-gray-50">
                    <Bell className="w-16 h-16 mx-auto mb-4 text-black opacity-20" strokeWidth={3} />
                    <p className="font-black text-2xl uppercase mb-2">No pending requests</p>
                    <p className="font-bold text-gray-500 uppercase">You'll be notified when hospitals request access</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-primary/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Bell className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>All Access Requests</span>
              </CardTitle>
              <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1 uppercase">Complete history of access requests</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
              {notifications.length > 0 ? (
                <div className="overflow-x-auto p-6 pt-0">
                  <table className="w-full text-left border-collapse mt-6 border-4 border-black">
                    <thead>
                      <tr className="border-b-4 border-black bg-accent">
                        <th className="p-4 font-black uppercase tracking-wider text-sm border-r-4 border-black">Hospital</th>
                        <th className="p-4 font-black uppercase tracking-wider text-sm border-r-4 border-black">Requested</th>
                        <th className="p-4 font-black uppercase tracking-wider text-sm border-r-4 border-black">Status</th>
                        <th className="p-4 font-black uppercase tracking-wider text-sm">Responded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map((notification, index) => (
                        <tr key={index} className="border-b-4 border-black hover:bg-primary/10 transition-colors bg-white">
                          <td className="p-4 font-bold border-r-4 border-black">{notification.hospital.name}</td>
                          <td className="p-4 font-bold border-r-4 border-black font-mono">{new Date(notification.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 border-r-4 border-black">
                            {getStatusBadge(notification.status, notification.isExpired)}
                          </td>
                          <td className="p-4 font-bold text-sm">
                             {notification.respondedAt ? new Date(notification.respondedAt).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 border-t-4 border-black border-dashed bg-gray-50 m-6">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-black opacity-20" strokeWidth={3} />
                  <p className="font-black text-2xl uppercase mb-2">No access requests</p>
                  <p className="font-bold text-gray-500 uppercase">When hospitals request access, they'll appear here</p>
                </div>
              )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-green-200/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <CheckCircle className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Approved Requests</span>
              </CardTitle>
              <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1 uppercase">Access requests you have approved</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {notifications.filter(n => n.status === 'approved').length > 0 ? (
                  notifications
                    .filter(n => n.status === 'approved')
                    .map((notification) => (
                      <div key={notification.id} className="p-5 bg-white border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                          <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter flex items-center">
                            <CheckCircle className="w-6 h-6 mr-3 text-black" strokeWidth={3} />
                            {notification.hospital.name}
                          </h3>
                          <Badge className="bg-green-200 text-black border-4 border-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm">
                            Approved
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold uppercase mb-4 bg-gray-50 border-4 border-black p-3">
                          <div>
                            <span className="text-gray-500 block text-[10px]">APPROVED ON</span> {new Date(notification.respondedAt).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px]">REQUESTED BY</span> {notification.requestedBy?.name}
                          </div>
                        </div>
                        <div className="text-sm font-medium border-l-4 border-black pl-3 bg-gray-50 py-2 pr-2">
                          <span className="uppercase font-black block text-xs mb-1">Reason:</span>
                          {notification.message}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12 border-4 border-black border-dashed bg-gray-50">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-black opacity-20" strokeWidth={3} />
                    <p className="font-black text-2xl uppercase mb-2">No approved requests</p>
                    <p className="font-bold text-gray-500 uppercase">Requests you approve will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="denied" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-destructive/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <XCircle className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Denied Requests</span>
              </CardTitle>
              <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1 uppercase">Access requests you have denied</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {notifications.filter(n => n.status === 'denied').length > 0 ? (
                  notifications
                    .filter(n => n.status === 'denied')
                    .map((notification) => (
                      <div key={notification.id} className="p-5 bg-white border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all opacity-80 hover:opacity-100">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                          <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter flex items-center line-through decoration-2">
                            <XCircle className="w-6 h-6 mr-3 text-black" strokeWidth={3} />
                            {notification.hospital.name}
                          </h3>
                          <Badge className="bg-destructive text-white border-4 border-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm">
                            Denied
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold uppercase mb-4 bg-gray-50 border-4 border-black p-3">
                          <div>
                            <span className="text-gray-500 block text-[10px]">DENIED ON</span> {new Date(notification.respondedAt).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px]">REQUESTED BY</span> {notification.requestedBy?.name}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12 border-4 border-black border-dashed bg-gray-50">
                    <XCircle className="w-16 h-16 mx-auto mb-4 text-black opacity-20" strokeWidth={3} />
                    <p className="font-black text-2xl uppercase mb-2">No denied requests</p>
                    <p className="font-bold text-gray-500 uppercase">Requests you deny will appear here</p>
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
