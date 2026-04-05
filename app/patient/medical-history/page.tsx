"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Heart, Pill, AlertTriangle, Download } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function MedicalHistory() {
  const [loading, setLoading] = useState(true)
  const [medicalData, setMedicalData] = useState<any>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || (session.user.role !== 'patient' && session.user.role !== 'admin')) {
      router.push('/auth/patient/login')
      return
    }

    fetchMedicalHistory()
  }, [session, status, router])

  const fetchMedicalHistory = async () => {
    try {
      const response = await fetch('/api/patients/medical-history')
      if (response.ok) {
        const result = await response.json()
        setMedicalData(result.data)
      } else {
        console.error('Failed to fetch medical history')
      }
    } catch (error) {
      console.error('Error fetching medical history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 bg-secondary min-h-screen">
        <div className="animate-pulse">
          <div className="h-12 bg-white border-4 border-black mb-4 w-64 shadow-brutal-sm"></div>
          <div className="h-6 bg-white border-2 border-black mb-8 w-96 max-w-full"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-white border-4 border-black shadow-brutal-sm"></div>
            <div className="h-96 bg-white border-4 border-black shadow-brutal-sm"></div>
          </div>
        </div>
      </div>
    )
  }

  const conditions = medicalData?.conditions || []
  const procedures = medicalData?.procedures || []
  const allergies = medicalData?.allergies || []
  const labResults = medicalData?.labResults || []
  const immunizations = medicalData?.immunizations || []

  return (
    <div className="p-6 md:p-8 space-y-8 bg-secondary min-h-screen selection:bg-black selection:text-white pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 brutal-enter">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mix-blend-multiply">Medical History</h1>
          <p className="text-black font-bold text-lg border-l-4 border-black pl-3 mt-2 bg-white/50 inline-block pr-3">Complete overview of your medical records and health history</p>
        </div>
        <Button className="h-12 bg-black text-white hover:bg-secondary hover:text-black border-4 border-black rounded-none font-black text-base uppercase transition-colors shadow-brutal-sm hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-lg">
          <Download className="w-5 h-5 mr-3" strokeWidth={3} />
          Export History
        </Button>
      </div>

      <Tabs defaultValue="conditions" className="w-full brutal-enter delay-100">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto md:h-14 bg-white border-4 border-black rounded-none p-0 shadow-brutal-sm gap-0">
          <TabsTrigger value="conditions" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-none border-r-4 border-black font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">Conditions</TabsTrigger>
          <TabsTrigger value="procedures" className="data-[state=active]:bg-secondary data-[state=active]:text-black rounded-none border-b-4 md:border-b-0 md:border-r-4 border-black font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">Procedures</TabsTrigger>
          <TabsTrigger value="labs" className="data-[state=active]:bg-green-200 data-[state=active]:text-black rounded-none border-r-4 border-black font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">Lab Results</TabsTrigger>
          <TabsTrigger value="allergies" className="data-[state=active]:bg-destructive data-[state=active]:text-black rounded-none border-r-4 border-black font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">Allergies</TabsTrigger>
          <TabsTrigger value="immunizations" className="data-[state=active]:bg-purple-200 data-[state=active]:text-black rounded-none font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">Immunizations</TabsTrigger>
        </TabsList>

        <TabsContent value="conditions" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-primary/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Heart className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Medical Conditions</span>
              </CardTitle>
              <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1 uppercase">Your current and past medical conditions</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {conditions.length > 0 ? (
                  conditions.map((condition: any, index: number) => (
                    <div key={index} className="p-5 bg-white border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all group">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                        <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter">{condition.name || condition.condition}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            className={`border-2 border-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm ${
                              condition.status === "Active" || condition.status === "ongoing" 
                                ? "bg-destructive text-white" 
                                : "bg-gray-200 text-black"
                            }`}
                          >
                            {condition.status}
                          </Badge>
                          {condition.severity && <Badge className="bg-white border-2 border-black text-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm">{condition.severity}</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm font-bold uppercase mb-3 bg-primary/20 px-2 py-1 border-2 border-black -rotate-1 group-hover:rotate-0 transition-transform">
                        <span className="text-black">Diagnosed:</span>{" "}
                        {new Date(condition.diagnosedDate || condition.date).toLocaleDateString()}
                      </div>
                      <p className="text-base font-medium border-l-4 border-black pl-3">{condition.description || condition.notes}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-4 border-black border-dashed bg-gray-50">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-black opacity-20" strokeWidth={3} />
                    <p className="font-black text-2xl uppercase mb-2">No conditions recorded</p>
                    <p className="font-bold text-gray-500 uppercase">Conditions will be added by healthcare providers</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procedures" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-secondary/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <FileText className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Procedures & Tests</span>
              </CardTitle>
              <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1 uppercase">Medical procedures and diagnostic tests</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {procedures.length > 0 ? (
                  procedures.map((procedure: any, index: number) => (
                    <div key={index} className="p-5 bg-white border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                        <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter">{procedure.procedure || procedure.name}</h3>
                        <Badge
                          className={`border-2 border-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm ${
                            procedure.result === "Normal"
                              ? "bg-green-200 text-black"
                              : "bg-secondary text-black"
                          }`}
                        >
                          {procedure.result}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-bold uppercase mb-4 bg-gray-50 border-4 border-black p-3">
                        <div>
                          <span className="text-gray-500 block text-[10px]">DATE</span> {new Date(procedure.date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">PROVIDER</span> {procedure.provider}
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">LOCATION</span> {procedure.location}
                        </div>
                      </div>
                      <div className="text-base font-medium border-l-4 border-black pl-3">
                        <span className="font-black uppercase text-xs block mb-1">Notes:</span> {procedure.notes}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-4 border-black border-dashed bg-gray-50">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-black opacity-20" strokeWidth={3} />
                    <p className="font-black text-2xl uppercase mb-2">No procedures recorded</p>
                    <p className="font-bold text-gray-500 uppercase">Procedures will be added by healthcare providers</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-green-200/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <FileText className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Laboratory Results</span>
              </CardTitle>
              <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1 uppercase">Recent lab test results and values</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {labResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-4 border-black bg-accent">
                        <th className="p-4 font-black uppercase tracking-wider text-sm border-r-4 border-black">Test</th>
                        <th className="p-4 font-black uppercase tracking-wider text-sm border-r-4 border-black">Date</th>
                        <th className="p-4 font-black uppercase tracking-wider text-sm border-r-4 border-black">Result</th>
                        <th className="p-4 font-black uppercase tracking-wider text-sm border-r-4 border-black hidden md:table-cell">Reference Range</th>
                        <th className="p-4 font-black uppercase tracking-wider text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labResults.map((lab: any, index: number) => (
                        <tr key={index} className="border-b-4 border-black hover:bg-secondary/20 transition-colors bg-white">
                          <td className="p-4 font-bold border-r-4 border-black">{lab.test}</td>
                          <td className="p-4 font-bold font-mono border-r-4 border-black">{new Date(lab.date).toLocaleDateString()}</td>
                          <td className="p-4 font-black text-xl border-r-4 border-black">{lab.result}</td>
                          <td className="p-4 font-medium hidden md:table-cell border-r-4 border-black bg-gray-50">{lab.range}</td>
                          <td className="p-4">
                            <Badge
                              className={`border-2 border-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm ${
                                lab.status === "Normal" ? "bg-green-200 text-black" : "bg-destructive text-white"
                              }`}
                            >
                              {lab.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 border-t-4 border-black border-dashed bg-gray-50">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-black opacity-20" strokeWidth={3} />
                  <p className="font-black text-2xl uppercase mb-2">No lab results available</p>
                  <p className="font-bold text-gray-500 uppercase">Results will be added by healthcare providers</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allergies" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-destructive/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <AlertTriangle className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Allergies & Reactions</span>
              </CardTitle>
              <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1 uppercase">Known allergies and adverse drug reactions</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {allergies.length > 0 ? (
                  allergies.map((allergy: any, index: number) => (
                    <div key={index} className="p-5 bg-white border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] group">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                        <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter bg-destructive text-white px-3 py-1 border-2 border-black rotate-1 group-hover:rotate-0 transition-transform">{allergy.allergen || allergy.name}</h3>
                        <div className="flex space-x-2">
                          <Badge className="bg-black text-white border-2 border-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm">{allergy.severity}</Badge>
                          <Badge className="bg-white border-2 border-black text-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm">
                            {allergy.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-base font-bold uppercase border-l-4 border-black pl-3 mb-2">
                        <span className="text-black font-black">Reaction:</span> {allergy.reaction}
                      </div>
                      <div className="text-sm font-medium border-l-4 border-gray-300 pl-3">
                        <span className="text-black font-black uppercase">Notes:</span> {allergy.notes}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-4 border-black border-dashed bg-gray-50">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-black opacity-20" strokeWidth={3} />
                    <p className="font-black text-2xl uppercase mb-2">No allergies recorded</p>
                    <p className="font-bold text-gray-500 uppercase">Information will be added by healthcare providers</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="immunizations" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-purple-200/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Pill className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Immunization History</span>
              </CardTitle>
              <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1 uppercase">Vaccination records and immunization history</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {immunizations.length > 0 ? (
                  immunizations.map((immunization: any, index: number) => (
                    <div key={index} className="p-5 bg-white border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all">
                      <div className="flex items-center justify-between mb-4 border-b-4 border-black pb-3 border-dashed">
                        <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter">{immunization.vaccine}</h3>
                        <Badge className="bg-purple-200 text-black border-2 border-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm">{immunization.dose}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold uppercase bg-gray-50 border-4 border-black p-3">
                        <div>
                          <span className="text-gray-500 block text-[10px]">DATE</span> {new Date(immunization.date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">PROVIDER</span> {immunization.provider}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-4 border-black border-dashed bg-gray-50">
                    <Pill className="w-16 h-16 mx-auto mb-4 text-black opacity-20" strokeWidth={3} />
                    <p className="font-black text-2xl uppercase mb-2">No immunizations recorded</p>
                    <p className="font-bold text-gray-500 uppercase">Vaccination history will be added by healthcare providers</p>
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
