"use client"

import { useState } from "react"
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

export default function HospitalDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  const recentPatients = [
    {
      id: "HP-2024-789123",
      name: "Sarah Johnson",
      lastVisit: "2024-06-15",
      conditions: ["Hypertension", "Type 2 Diabetes"],
    },
    {
      id: "HP-2024-654789",
      name: "Michael Chen",
      lastVisit: "2024-06-20",
      conditions: ["Asthma"],
    },
    {
      id: "HP-2024-321456",
      name: "Emma Williams",
      lastVisit: "2024-06-18",
      conditions: ["Migraine"],
    },
  ]

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient)
  }

  const handleSearch = () => {
    // Simulate search - in real app, this would search the database
    const mockPatient = {
      id: "HP-2024-789123",
      name: "Sarah Johnson",
      age: 39,
      bloodType: "O+",
      phone: "+1 (555) 123-4567",
      email: "sarah.johnson@email.com",
      address: "123 Main St, City, State 12345",
      emergencyContact: "+1 (555) 987-6543",
      conditions: ["Hypertension", "Type 2 Diabetes"],
      riskLevel: "Moderate",
      lastVisit: "2024-06-15",
      vitals: {
        bloodPressure: "125/82",
        heartRate: "72",
        temperature: "98.6°F",
        weight: "165 lbs",
      },
      medications: ["Lisinopril 10mg daily", "Metformin 500mg twice daily"],
      allergies: ["Penicillin", "Shellfish"],
      aiSummary:
        "39-year-old female with well-controlled Type 2 diabetes and hypertension. Recent HbA1c of 6.8% indicates good glycemic control. Blood pressure readings have been stable on current medication regimen. Patient is compliant with medications and follows up regularly. Recommend continued current treatment plan with routine monitoring.",
    }
    setSelectedPatient(mockPatient)
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Provider Dashboard</h1>
            <p className="text-gray-600">Access patient records and manage healthcare data</p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Authenticated Provider</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Search */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Patient Search</span>
              </CardTitle>
              <CardDescription>Search by ID, name, or QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Patient ID or Name</label>
                <Input
                  placeholder="HP-2024-789123 or Sarah Johnson"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleSearch} className="w-full bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Search Records
              </Button>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3">Recent Patients</h3>
                <div className="space-y-2">
                  {recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-gray-600">{patient.id}</p>
                          <p className="text-xs text-gray-500">Last visit: {patient.lastVisit}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Record */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Patient Record</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPatient ? (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="history">Medical History</TabsTrigger>
                    <TabsTrigger value="ai-summary">AI Summary</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{selectedPatient.name}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Patient ID:</span>
                            <span className="font-mono text-blue-600">{selectedPatient.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Age:</span>
                            <span>{selectedPatient.age} years old</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Blood Type:</span>
                            <span>{selectedPatient.bloodType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Risk Level:</span>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              {selectedPatient.riskLevel}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Current Conditions</h4>
                        <div className="space-y-1">
                          {selectedPatient.conditions.map((condition: string, index: number) => (
                            <Badge key={index} variant="outline" className="mr-1">
                              {condition}
                            </Badge>
                          ))}
                        </div>

                        {selectedPatient.vitals && (
                          <>
                            <h4 className="font-medium mt-4 mb-2">Recent Vitals</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="p-2 bg-gray-50 rounded">
                                <div className="text-gray-600">BP</div>
                                <div className="font-semibold">{selectedPatient.vitals.bloodPressure}</div>
                              </div>
                              <div className="p-2 bg-gray-50 rounded">
                                <div className="text-gray-600">HR</div>
                                <div className="font-semibold">{selectedPatient.vitals.heartRate} bpm</div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4">
                    {selectedPatient.medications && (
                      <div>
                        <h4 className="font-medium mb-2">Medications</h4>
                        <ul className="space-y-1">
                          {selectedPatient.medications.map((med: string, index: number) => (
                            <li key={index} className="text-sm p-2 bg-blue-50 rounded">
                              {med}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedPatient.allergies && (
                      <div>
                        <h4 className="font-medium mb-2">Allergies</h4>
                        <div className="flex space-x-2">
                          {selectedPatient.allergies.map((allergy: string, index: number) => (
                            <Badge key={index} variant="destructive">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="ai-summary" className="space-y-4">
                    {selectedPatient.aiSummary && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                        <h4 className="font-medium mb-2 flex items-center space-x-2">
                          <Activity className="w-4 h-4" />
                          <span>AI-Generated Summary</span>
                        </h4>
                        <p className="text-sm leading-relaxed">{selectedPatient.aiSummary}</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Search for a patient to view their records</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">127</p>
                <p className="text-sm text-gray-600">Patients Today</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">23</p>
                <p className="text-sm text-gray-600">Critical Alerts</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">89</p>
                <p className="text-sm text-gray-600">Pending Results</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">98.7%</p>
                <p className="text-sm text-gray-600">System Uptime</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <QrCode className="w-6 h-6" />
              <span className="text-sm">Scan QR Code</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <FileText className="w-6 h-6" />
              <span className="text-sm">New Record</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Schedule Visit</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <Heart className="w-6 h-6" />
              <span className="text-sm">Emergency Access</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
