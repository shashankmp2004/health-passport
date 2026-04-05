"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, FileText, Plus } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PatientVisits() {
  const [loading, setLoading] = useState(true)
  const [visitsData, setVisitsData] = useState<any>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || (session.user.role !== 'patient' && session.user.role !== 'admin')) {
      router.push('/auth/patient/login')
      return
    }

    fetchVisits()
  }, [session, status, router])

  const fetchVisits = async () => {
    try {
      const response = await fetch('/api/patients/visits')
      if (response.ok) {
        const result = await response.json()
        setVisitsData(result.data)
      } else {
        console.error('Failed to fetch visits')
      }
    } catch (error) {
      console.error('Error fetching visits:', error)
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
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-white border-4 border-black shadow-brutal-sm"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const pastVisits = visitsData?.pastVisits || []
  const upcomingVisits = visitsData?.upcomingVisits || []

  return (
    <div className="p-6 md:p-8 space-y-8 bg-secondary min-h-screen selection:bg-black selection:text-white pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 brutal-enter">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mix-blend-multiply">Medical Visits</h1>
          <p className="text-black font-bold text-lg border-l-4 border-black pl-3 mt-2 bg-white/50 inline-block pr-3">Manage your appointments and visit history</p>
        </div>
        <Button className="h-12 bg-primary text-black hover:bg-black hover:text-white border-4 border-black rounded-none font-black text-base uppercase transition-colors shadow-brutal-sm hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-lg group">
          <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" strokeWidth={3} />
          Schedule Visit
        </Button>
      </div>

      {pastVisits.length > 0 || upcomingVisits.length > 0 ? (
        <>
          {/* Upcoming Visits */}
          {upcomingVisits.length > 0 && (
            <div className="space-y-4 brutal-enter delay-100">
               <h2 className="text-2xl font-black uppercase tracking-wider mix-blend-multiply border-b-4 border-black pb-2">Upcoming Appointments</h2>
               <div className="grid grid-cols-1 gap-6">
                 {upcomingVisits.map((visit: any) => (
                    <Card key={visit.id} className="border-4 border-black rounded-none shadow-brutal-sm hover:shadow-brutal-lg hover:-translate-y-1 transition-all bg-secondary relative overflow-hidden">
                       <CardContent className="p-0">
                         <div className="flex flex-col md:flex-row h-full">
                           <div className="bg-white border-b-4 md:border-b-0 md:border-r-4 border-black p-6 flex flex-col items-center justify-center min-w-[150px] space-y-2 relative">
                              <div className="absolute top-0 right-0 w-8 h-8 bg-black">
                                 <div className="w-8 h-8 bg-secondary rounded-tr-full"></div>
                              </div>
                              <Calendar className="w-8 h-8 text-black" strokeWidth={3} />
                              <div className="font-black text-3xl uppercase">{new Date(visit.date).getDate()}</div>
                              <div className="font-bold uppercase text-sm">{new Date(visit.date).toLocaleString('default', { month: 'short' })}</div>
                           </div>
                           <div className="p-6 flex-1 flex flex-col justify-between">
                              <div>
                                 <div className="flex items-start justify-between mb-4">
                                     <div>
                                        <h3 className="font-black text-2xl uppercase tracking-tighter mb-1">{visit.doctor}</h3>
                                        <Badge className="bg-black text-white hover:bg-black rounded-none font-black uppercase tracking-wider text-xs px-3 py-1 shadow-brutal-sm">{visit.specialty}</Badge>
                                     </div>
                                     <Badge className="bg-white text-black border-2 border-black hover:bg-white rounded-none font-black uppercase tracking-wider text-xs px-3 py-1 shadow-brutal-sm rotate-2">{visit.type}</Badge>
                                 </div>
                                 <div className="flex flex-wrap gap-4 text-sm font-bold uppercase mb-4">
                                    <div className="flex items-center space-x-2 bg-white border-2 border-black px-3 py-1 -rotate-1 shadow-brutal-sm">
                                      <Clock className="w-4 h-4 text-black" strokeWidth={3} />
                                      <span>{visit.time}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-white border-2 border-black px-3 py-1 rotate-1 shadow-brutal-sm">
                                      <MapPin className="w-4 h-4 text-black" strokeWidth={3} />
                                      <span>{visit.location}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex space-x-3 mt-4">
                                 <Button className="flex-1 border-4 border-black rounded-none bg-white text-black hover:bg-black hover:text-white uppercase font-black tracking-wider transition-colors shadow-brutal-sm">Reschedule</Button>
                                 <Button className="flex-1 border-4 border-black rounded-none bg-destructive text-white hover:bg-black hover:text-white uppercase font-black tracking-wider transition-colors shadow-brutal-sm">Cancel</Button>
                              </div>
                           </div>
                         </div>
                       </CardContent>
                    </Card>
                 ))}
               </div>
            </div>
          )}

          {/* Past Visits */}
          <div className="space-y-4 brutal-enter delay-200">
             <h2 className="text-2xl font-black uppercase tracking-wider mix-blend-multiply border-b-4 border-black pb-2 mt-8">Visit History</h2>
             <div className="grid grid-cols-1 gap-6">
                {pastVisits.map((visit: any) => (
                  <Card key={visit.id} className="border-4 border-black rounded-none shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all bg-white relative overflow-hidden group">
                     {visit.status === 'completed' && (
                        <div className="absolute top-4 right-4 bg-green-200 border-2 border-black rounded-full w-4 h-4 shadow-brutal-sm animate-pulse z-10"></div>
                     )}
                     <CardContent className="p-0">
                       <div className="flex flex-col md:flex-row h-full">
                         <div className="bg-gray-100 border-b-4 md:border-b-0 md:border-r-4 border-black p-4 md:p-6 flex flex-col justify-center min-w-[200px] space-y-3 group-hover:bg-primary/20 transition-colors">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-5 h-5 text-black" strokeWidth={3} />
                              <span className="font-bold font-mono text-sm">{new Date(visit.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-5 h-5 text-black" strokeWidth={3} />
                              <span className="font-bold font-mono text-sm">{visit.time}</span>
                            </div>
                            <Badge className="self-start bg-black text-white hover:bg-black rounded-none font-black uppercase text-xs px-2 shadow-brutal-sm">{visit.status}</Badge>
                         </div>
                         <div className="p-4 md:p-6 flex-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex-1">
                               <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                  <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter">{visit.doctor}</h3>
                                  <Badge className="w-fit bg-primary text-black border-2 border-black hover:bg-primary rounded-none font-bold uppercase text-[10px] px-2 shadow-brutal-sm">{visit.specialty}</Badge>
                               </div>
                               <div className="flex items-center space-x-2 text-sm font-bold uppercase text-gray-600 mb-3">
                                  <MapPin className="w-4 h-4 text-black" strokeWidth={3} />
                                  <span>{visit.location}</span>
                               </div>
                               {visit.notes && (
                                  <div className="text-sm font-medium border-l-4 border-black pl-3 bg-gray-50 py-2 pr-2">
                                     <strong className="uppercase font-black block text-xs mb-1">Notes:</strong> {visit.notes}
                                  </div>
                               )}
                            </div>
                            
                            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                              <Button className="flex-1 md:flex-none border-4 border-black rounded-none bg-white text-black hover:bg-black hover:text-white uppercase font-black text-xs tracking-wider transition-colors shadow-brutal-sm">
                                View Report
                              </Button>
                              <Button className="flex-1 md:flex-none border-4 border-black rounded-none bg-green-200 text-black hover:bg-black hover:text-white uppercase font-black text-xs tracking-wider transition-colors shadow-brutal-sm group">
                                <Download className="w-4 h-4 mr-2 group-hover:animate-bounce" strokeWidth={3} /> Download
                              </Button>
                            </div>
                         </div>
                       </div>
                     </CardContent>
                  </Card>
                ))}
             </div>
          </div>
        </>
      ) : (
        <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white mt-8">
           <CardContent className="p-12 text-center">
              <FileText className="w-24 h-24 mx-auto mb-6 text-black opacity-20" strokeWidth={2} />
              <h2 className="text-3xl font-black uppercase tracking-wider mb-2">No Visits Recorded</h2>
              <p className="text-gray-500 font-bold uppercase">You have no upcoming or past appointments.</p>
              <Button className="mt-8 h-12 bg-primary text-black hover:bg-black hover:text-white border-4 border-black rounded-none font-black text-base uppercase transition-colors shadow-brutal-sm hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-lg">
                Schedule Your First Visit
              </Button>
           </CardContent>
        </Card>
      )}
    </div>
  )
}
