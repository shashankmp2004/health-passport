"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  QrCode,
  FileText,
  Activity,
  Heart,
  Calendar,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function HospitalDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [recentPatients, setRecentPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || (session.user.role !== 'hospital' && session.user.role !== 'doctor')) {
      router.push('/auth/hospital/login')
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/hospitals/dashboard')
      if (response.ok) {
        const result = await response.json()
        setDashboardData(result.data)
        setRecentPatients(result.data.recentPatients || [])
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

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return
    }

    try {
      const response = await fetch(`/api/patients/search?query=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const result = await response.json()
        if (result.data && result.data.length > 0) {
          setSelectedPatient(result.data[0]) // Select the first matching patient
        } else {
          // No patient found
          setSelectedPatient(null)
          console.log('No patient found with that query')
        }
      } else {
        console.error('Failed to search for patient')
        setSelectedPatient(null)
      }
    } catch (error) {
      console.error('Error searching for patient:', error)
      setSelectedPatient(null)
    }
  }

  return (
    <div className="p-6 space-y-8 bg-secondary min-h-screen font-sans selection:bg-black selection:text-white pb-32">
      {/* Header */}
      <div className="bg-secondary border-4 border-black shadow-brutal-lg p-6 md:p-8 brutal-enter flex flex-col md:flex-row items-start md:items-center justify-between hover:-translate-y-1 hover:-translate-x-1 transition-transform">
        <div className="mb-4 md:mb-0">
          <Badge className="mb-4 bg-white text-black border-2 border-black uppercase font-black px-3 py-1 text-xs shadow-brutal-sm">
            * SECURE ENVIRONMENT *
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black uppercase tracking-tighter mix-blend-multiply leading-none mb-2">Provider Dashboard</h1>
          <p className="text-black font-bold text-lg border-l-4 border-black pl-4 mt-2 bg-white/50 pr-4 py-1 flex items-center">
             Access patient records and manage healthcare data
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-white border-4 border-black p-3 shadow-brutal-sm rotate-1 hover:rotate-0 transition-transform">
          <div className="w-4 h-4 bg-green-500 border-2 border-black animate-pulse"></div>
          <span className="text-black font-black uppercase text-sm md:text-base">Authenticated Provider</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Search */}
        <div className="lg:col-span-1 brutal-enter delay-100">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm hover:shadow-brutal-lg transition-all h-full bg-white">
            <CardHeader className="border-b-4 border-black bg-primary/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl md:text-3xl uppercase">
                <Search className="w-8 h-8" strokeWidth={3} />
                <span>Patient Search</span>
              </CardTitle>
              <CardDescription className="text-black font-bold border-l-4 border-black pl-3 ml-1 mt-2">Search by ID, name, or QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-3">
                <label className="text-sm font-black uppercase tracking-wider">Patient ID or Name</label>
                <Input
                  className="border-4 border-black rounded-none h-14 text-lg font-bold shadow-brutal-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black focus:shadow-brutal-lg transition-shadow"
                  placeholder="HP-2024-789123 or Sarah Johnson"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                className="w-full h-14 bg-black text-white hover:bg-primary hover:text-black border-4 border-black rounded-none font-black text-lg uppercase transition-colors"
              >
                <Search className="w-5 h-5 mr-3" strokeWidth={3} />
                Search Records
              </Button>

              <div className="pt-6 border-t-4 border-black border-dashed">
                <h3 className="font-black text-xl mb-4 uppercase">Recent Patients</h3>
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-4 border-4 border-black bg-white hover:-translate-y-1 hover:-translate-x-1 shadow-brutal-sm hover:shadow-brutal-lg cursor-pointer transition-all flex justify-between items-center"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className="flex-1">
                        <p className="font-black text-lg uppercase truncate mb-1">{patient.name}</p>
                        <p className="text-sm font-bold bg-gray-100 border-2 border-black inline-block px-2 mb-1">{patient.id}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase mt-1">Last visit: {patient.lastVisit}</p>
                      </div>
                      <div className="w-8 h-8 bg-black flex items-center justify-center shrink-0">
                         <Search className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                    </div>
                  ))}
                  {recentPatients.length === 0 && (
                     <div className="text-center py-6 border-4 border-black border-dashed text-gray-400 font-bold uppercase">
                        No Recent Patients
                     </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Record */}
        <div className="lg:col-span-2 brutal-enter delay-200">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm hover:shadow-brutal-lg transition-all h-full bg-white flex flex-col">
            <CardHeader className="border-b-4 border-black bg-accent pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl md:text-3xl uppercase">
                <Users className="w-8 h-8" strokeWidth={3} />
                <span>Patient Record</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              {selectedPatient ? (
                <Tabs defaultValue="overview" className="w-full flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-3 bg-white border-b-4 border-black rounded-none h-auto p-0 z-10">
                    <TabsTrigger value="overview" className="border-r-4 border-black rounded-none font-black uppercase text-sm md:text-base py-4 data-[state=active]:bg-black data-[state=active]:text-white transition-colors">Overview</TabsTrigger>
                    <TabsTrigger value="history" className="border-r-4 border-black rounded-none font-black uppercase text-sm md:text-base py-4 data-[state=active]:bg-black data-[state=active]:text-white transition-colors">History</TabsTrigger>
                    <TabsTrigger value="ai-summary" className="rounded-none font-black uppercase text-sm md:text-base py-4 data-[state=active]:bg-secondary data-[state=active]:text-black transition-colors flex items-center justify-center gap-2">
                        <Activity className="w-4 h-4 hidden md:block" />
                        AI Summary
                    </TabsTrigger>
                  </TabsList>

                  <div className="p-6 md:p-8 flex-1 bg-white">
                     <TabsContent value="overview" className="space-y-6 mt-0">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div>
                           <div className="inline-block bg-primary text-black border-4 border-black px-4 py-2 border-dashed shadow-brutal-sm mb-6 -rotate-1">
                              <h3 className="font-black text-xl md:text-3xl uppercase truncate">{selectedPatient.name}</h3>
                           </div>
                           
                           <div className="space-y-4">
                             <div className="flex flex-col border-b-4 border-black pb-3">
                               <span className="text-gray-500 font-bold uppercase text-xs mb-1">Patient ID:</span>
                               <span className="font-mono text-black font-black text-lg">{selectedPatient.id}</span>
                             </div>
                             <div className="flex flex-col border-b-4 border-black pb-3">
                               <span className="text-gray-500 font-bold uppercase text-xs mb-1">Age:</span>
                               <span className="font-black text-lg">{selectedPatient.age} YEARS</span>
                             </div>
                             <div className="flex flex-col border-b-4 border-black pb-3">
                               <span className="text-gray-500 font-bold uppercase text-xs mb-1">Blood Type:</span>
                               <span className="font-black text-lg text-red-600 drop-shadow-[1px_1px_0px_#000]">{selectedPatient.bloodType}</span>
                             </div>
                             <div className="flex justify-between items-center bg-gray-100 p-3 border-4 border-black">
                               <span className="text-gray-500 font-bold uppercase text-xs">Risk Level:</span>
                               <Badge className="bg-destructive border-2 border-black text-white font-black uppercase shadow-brutal-sm rounded-none text-xs">
                                 {selectedPatient.riskLevel}
                               </Badge>
                             </div>
                           </div>
                         </div>

                         <div>
                           <h4 className="font-black text-xl uppercase mb-4 border-l-4 border-black pl-3">Current Conditions</h4>
                           <div className="flex flex-wrap gap-2 mb-8">
                             {selectedPatient.conditions.map((condition: string, index: number) => (
                               <Badge key={index} className="bg-white text-black border-2 border-black font-bold uppercase shadow-brutal-sm rounded-none hover:bg-gray-100 transition-colors">
                                 {condition}
                               </Badge>
                             ))}
                             {selectedPatient.conditions.length === 0 && <span className="text-gray-400 font-bold italic">N/A</span>}
                           </div>

                           {selectedPatient.vitals && (
                             <>
                               <h4 className="font-black text-xl uppercase mb-4 border-l-4 border-black pl-3 mt-6">Recent Vitals</h4>
                               <div className="grid grid-cols-2 gap-4">
                                 <div className="p-4 bg-secondary border-4 border-black shadow-brutal-sm text-center">
                                   <div className="text-black font-bold uppercase text-xs mb-2 border-b-2 border-black pb-1">B.P.</div>
                                   <div className="font-black text-2xl">{selectedPatient.vitals.bloodPressure}</div>
                                 </div>
                                 <div className="p-4 bg-primary border-4 border-black shadow-brutal-sm text-center">
                                   <div className="text-black font-bold uppercase text-xs mb-2 border-b-2 border-black pb-1">H.R.</div>
                                   <div className="font-black text-2xl">{selectedPatient.vitals.heartRate} <span className="text-sm">BPM</span></div>
                                 </div>
                               </div>
                             </>
                           )}
                         </div>
                       </div>
                     </TabsContent>

                     <TabsContent value="history" className="space-y-8 mt-0">
                       {selectedPatient.medications && (
                         <div className="relative">
                           <div className="absolute top-0 right-0 w-max bg-accent text-black font-black uppercase text-2xl rotate-3 opacity-10 pointer-events-none">MEDS</div>
                           <h4 className="font-black text-2xl uppercase mb-4 border-l-4 border-black pl-4">Medications</h4>
                           <ul className="space-y-3 relative z-10">
                             {selectedPatient.medications.map((med: string, index: number) => (
                               <li key={index} className="text-lg font-bold p-4 border-4 border-black bg-white shadow-brutal-sm uppercase hover:-translate-y-1 transition-transform">
                                 {med}
                               </li>
                             ))}
                             {selectedPatient.medications.length === 0 && <span className="text-gray-400 font-bold uppercase block py-4 border-b-4 border-dashed border-black">NONE RECORDED</span>}
                           </ul>
                         </div>
                       )}

                       {selectedPatient.allergies && (
                         <div className="relative">
                           <div className="absolute top-0 right-0 w-max bg-destructive text-white font-black uppercase text-2xl -rotate-3 opacity-10 pointer-events-none">ALLERGIES</div>
                           <h4 className="font-black text-2xl uppercase mt-8 mb-4 border-l-4 border-black pl-4 text-red-600">Allergies</h4>
                           <div className="flex flex-wrap gap-3 relative z-10">
                             {selectedPatient.allergies.map((allergy: string, index: number) => (
                               <Badge key={index} className="bg-destructive text-white border-2 border-black font-black text-lg uppercase rounded-none py-2 px-4 shadow-[2px_2px_0px_#000]">
                                 {allergy}
                               </Badge>
                             ))}
                             {selectedPatient.allergies.length === 0 && <span className="text-gray-400 font-bold uppercase block py-4 border-b-4 border-dashed border-black">NO KNOWN ALLERGIES</span>}
                           </div>
                         </div>
                       )}
                     </TabsContent>

                     <TabsContent value="ai-summary" className="mt-0 h-full flex flex-col">
                       {selectedPatient.aiSummary ? (
                         <div className="p-6 md:p-8 bg-black text-white border-4 border-black rounded-none relative flex-1">
                           <h4 className="font-display font-black text-4xl mb-6 flex items-center space-x-4 uppercase border-b-4 border-white border-dashed pb-4">
                             <Activity className="w-10 h-10 text-secondary" strokeWidth={3} />
                             <span className="text-secondary drop-shadow-[2px_2px_0px_#000]">AI Analysis</span>
                           </h4>
                           <p className="font-mono text-sm md:text-base leading-relaxed tracking-wide text-gray-100">
                              {"> "} {selectedPatient.aiSummary}
                           </p>
                           <div className="absolute bottom-4 right-4 bg-white text-black font-black text-xs uppercase px-2 py-1 rotate-2">
                              AUTOGENERATED
                           </div>
                         </div>
                       ) : (
                          <div className="flex-1 flex flex-col items-center justify-center py-20 border-4 border-black border-dashed bg-gray-50">
                             <Activity className="w-16 h-16 text-gray-300 mb-4" />
                             <p className="font-black text-2xl uppercase text-gray-400 mb-2">No AI Summary Available</p>
                          </div>
                       )}
                     </TabsContent>
                  </div>
                </Tabs>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 bg-gray-50">
                  <div className="w-32 h-32 border-4 border-black border-dashed rounded-full flex items-center justify-center mb-6 bg-white shrink-0 shadow-brutal-sm">
                     <Search className="w-12 h-12 text-black" strokeWidth={3} />
                  </div>
                  <p className="font-black text-2xl uppercase text-center mb-2 px-6">Select a Record</p>
                  <p className="text-gray-500 font-bold text-center px-6">Search for a patient to view their records.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 brutal-enter delay-300">
        <Card className="border-4 border-black rounded-none shadow-brutal-sm hover:shadow-brutal-lg hover:-translate-y-1 transition-all bg-white relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-32 h-32 text-black" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col h-full">
              <div className="w-12 h-12 bg-blue-500 border-4 border-black flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-1">Patients Today</p>
              <p className="text-5xl font-black text-black">
                {dashboardData?.statistics?.patientsToday || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-4 border-black rounded-none shadow-brutal-sm hover:shadow-brutal-lg hover:-translate-y-1 transition-all bg-destructive relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:opacity-30 transition-opacity">
            <AlertTriangle className="w-32 h-32 text-black" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col h-full">
              <div className="w-12 h-12 bg-black border-4 border-white flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-black mb-1 border-b-2 border-black inline-block w-max">Critical Alerts</p>
              <p className="text-5xl font-black text-black drop-shadow-[2px_2px_0px_#fff]">
                {dashboardData?.statistics?.criticalAlerts || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-4 border-black rounded-none shadow-brutal-sm hover:shadow-brutal-lg hover:-translate-y-1 transition-all bg-secondary relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:opacity-30 transition-opacity">
            <Clock className="w-32 h-32 text-black" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col h-full">
              <div className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-black" strokeWidth={3} />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-black mb-1">Pending Results</p>
              <p className="text-5xl font-black text-black">
                {dashboardData?.statistics?.pendingResults || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-4 border-black rounded-none shadow-brutal-sm hover:shadow-brutal-lg hover:-translate-y-1 transition-all bg-green-200 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:opacity-30 transition-opacity">
            <TrendingUp className="w-32 h-32 text-black" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col h-full">
              <div className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-black" strokeWidth={3} />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-black mb-1">System Uptime</p>
              <p className="text-4xl lg:text-5xl font-black text-black">
                {dashboardData?.statistics?.systemUptime || '99.9%'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-4 border-black rounded-none shadow-brutal-lg bg-white brutal-enter delay-400">
        <CardHeader className="border-b-4 border-black bg-black text-white p-6">
          <CardTitle className="font-display font-black text-3xl uppercase">Management Tools</CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-secondary/50">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <Button 
               className="h-32 flex flex-col space-y-4 bg-white text-black border-4 border-black hover:bg-primary hover:text-black shadow-brutal-sm rounded-none hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-lg transition-all"
               onClick={() => router.push('/hospital/add-patient')}
            >
              <Users className="w-10 h-10" strokeWidth={2.5} />
              <span className="font-black text-lg uppercase tracking-wider">Add Patient</span>
            </Button>
            <Button className="h-32 flex flex-col space-y-4 bg-white text-black border-4 border-black hover:bg-accent hover:text-black shadow-brutal-sm rounded-none hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-lg transition-all">
              <FileText className="w-10 h-10" strokeWidth={2.5} />
              <span className="font-black text-lg uppercase tracking-wider">New Record</span>
            </Button>
            <Button className="h-32 flex flex-col space-y-4 bg-white text-black border-4 border-black hover:bg-destructive hover:text-white shadow-brutal-sm rounded-none hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-lg transition-all">
              <Heart className="w-10 h-10" strokeWidth={2.5} />
              <span className="font-black text-lg uppercase tracking-wider text-center">Emergency<br/>Access</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
