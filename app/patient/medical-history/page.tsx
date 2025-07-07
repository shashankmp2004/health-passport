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

    if (!session || session.user.role !== 'patient') {
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
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4 w-64"></div>
          <div className="h-4 bg-gray-300 rounded mb-6 w-96"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-300 rounded-lg"></div>
            <div className="h-96 bg-gray-300 rounded-lg"></div>
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
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medical History</h1>
          <p className="text-gray-600">Complete overview of your medical records and health history</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export History
        </Button>
      </div>

      <Tabs defaultValue="conditions" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="procedures">Procedures</TabsTrigger>
          <TabsTrigger value="labs">Lab Results</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="immunizations">Immunizations</TabsTrigger>
        </TabsList>

        <TabsContent value="conditions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-600" />
                <span>Medical Conditions</span>
              </CardTitle>
              <CardDescription>Your current and past medical conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conditions.length > 0 ? (
                  conditions.map((condition: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{condition.name || condition.condition}</h3>
                        <div className="flex space-x-2">
                          <Badge
                            className={
                              condition.status === "Active" || condition.status === "ongoing" 
                                ? "bg-red-100 text-red-800" 
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {condition.status}
                          </Badge>
                          {condition.severity && <Badge variant="outline">{condition.severity}</Badge>}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Diagnosed:</span>{" "}
                        {new Date(condition.diagnosedDate || condition.date).toLocaleDateString()}
                      </div>
                      <p className="text-sm text-gray-700">{condition.description || condition.notes}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No medical conditions recorded</p>
                    <p className="text-sm">Your medical conditions will be added by healthcare providers</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procedures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Procedures & Tests</span>
              </CardTitle>
              <CardDescription>Medical procedures and diagnostic tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {procedures.length > 0 ? (
                  procedures.map((procedure: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{procedure.procedure || procedure.name}</h3>
                        <Badge
                          className={
                            procedure.result === "Normal"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {procedure.result}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">Date:</span> {new Date(procedure.date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Provider:</span> {procedure.provider}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {procedure.location}
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Notes:</span> {procedure.notes}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No procedures recorded</p>
                    <p className="text-sm">Your medical procedures will be added by healthcare providers</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span>Laboratory Results</span>
              </CardTitle>
              <CardDescription>Recent lab test results and values</CardDescription>
            </CardHeader>
            <CardContent>
              {labResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Test</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Result</th>
                        <th className="text-left p-2">Reference Range</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labResults.map((lab: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{lab.test}</td>
                          <td className="p-2 text-gray-600">{new Date(lab.date).toLocaleDateString()}</td>
                          <td className="p-2 font-semibold">{lab.result}</td>
                          <td className="p-2 text-gray-600">{lab.range}</td>
                          <td className="p-2">
                            <Badge
                              className={
                                lab.status === "Normal" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }
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
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No lab results available</p>
                  <p className="text-sm">Your lab results will be added by healthcare providers</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allergies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span>Allergies & Adverse Reactions</span>
              </CardTitle>
              <CardDescription>Known allergies and adverse drug reactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allergies.length > 0 ? (
                  allergies.map((allergy: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg bg-red-50 border-red-200">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-red-800">{allergy.allergen || allergy.name}</h3>
                        <div className="flex space-x-2">
                          <Badge className="bg-red-600 text-white">{allergy.severity}</Badge>
                          <Badge variant="outline" className="border-red-300 text-red-700">
                            {allergy.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-red-700 mb-2">
                        <span className="font-medium">Reaction:</span> {allergy.reaction}
                      </div>
                      <div className="text-sm text-red-700">
                        <span className="font-medium">Notes:</span> {allergy.notes}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No allergies recorded</p>
                    <p className="text-sm">Your allergy information will be added by healthcare providers</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="immunizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="w-5 h-5 text-purple-600" />
                <span>Immunization History</span>
              </CardTitle>
              <CardDescription>Vaccination records and immunization history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {immunizations.length > 0 ? (
                  immunizations.map((immunization: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{immunization.vaccine}</h3>
                        <Badge className="bg-purple-100 text-purple-800">{immunization.dose}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Date:</span> {new Date(immunization.date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Provider:</span> {immunization.provider}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No immunizations recorded</p>
                    <p className="text-sm">Your vaccination history will be added by healthcare providers</p>
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
