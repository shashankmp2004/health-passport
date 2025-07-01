"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, User, Calendar, Phone, MapPin, FileText, QrCode } from "lucide-react"

export default function PatientSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const mockPatients = [
    {
      id: "HP-2024-789123",
      name: "Sarah Johnson",
      age: 39,
      gender: "Female",
      phone: "+1 (555) 123-4567",
      email: "sarah.johnson@email.com",
      address: "123 Main St, City, State 12345",
      lastVisit: "2024-12-15",
      conditions: ["Hypertension", "Type 2 Diabetes"],
      riskLevel: "Moderate",
    },
    {
      id: "HP-2024-654789",
      name: "Michael Chen",
      age: 45,
      gender: "Male",
      phone: "+1 (555) 987-6543",
      email: "michael.chen@email.com",
      address: "456 Oak Ave, City, State 12345",
      lastVisit: "2024-12-20",
      conditions: ["Asthma"],
      riskLevel: "Low",
    },
    {
      id: "HP-2024-321456",
      name: "Emma Williams",
      age: 28,
      gender: "Female",
      phone: "+1 (555) 456-7890",
      email: "emma.williams@email.com",
      address: "789 Pine St, City, State 12345",
      lastVisit: "2024-12-18",
      conditions: ["Migraine"],
      riskLevel: "Low",
    },
  ]

  const handleSearch = () => {
    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => {
      if (searchQuery.trim()) {
        const results = mockPatients.filter(
          (patient) =>
            patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
      setIsSearching(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patient Search</h1>
          <p className="text-gray-600">Search for patients by ID, name, or contact information</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <QrCode className="w-4 h-4 mr-2" />
          Scan QR Code
        </Button>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-blue-600" />
            <span>Patient Lookup</span>
          </CardTitle>
          <CardDescription>Enter patient ID, name, email, or phone number to search</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Patient</Label>
              <Input
                id="search"
                placeholder="HP-2024-789123, Sarah Johnson, or sarah@email.com"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isSearching} className="bg-blue-600 hover:bg-blue-700">
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {/* Advanced Search Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <Label htmlFor="ageRange">Age Range</Label>
              <select id="ageRange" className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                <option value="">Any Age</option>
                <option value="0-18">0-18 years</option>
                <option value="19-35">19-35 years</option>
                <option value="36-50">36-50 years</option>
                <option value="51-65">51-65 years</option>
                <option value="65+">65+ years</option>
              </select>
            </div>
            <div>
              <Label htmlFor="condition">Medical Condition</Label>
              <select id="condition" className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                <option value="">Any Condition</option>
                <option value="diabetes">Diabetes</option>
                <option value="hypertension">Hypertension</option>
                <option value="asthma">Asthma</option>
                <option value="heart-disease">Heart Disease</option>
              </select>
            </div>
            <div>
              <Label htmlFor="riskLevel">Risk Level</Label>
              <select id="riskLevel" className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                <option value="">Any Risk Level</option>
                <option value="low">Low Risk</option>
                <option value="moderate">Moderate Risk</option>
                <option value="high">High Risk</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>Found {searchResults.length} patient(s) matching your search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((patient) => (
                <div key={patient.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{patient.name}</h3>
                          <Badge variant="outline">
                            {patient.age} years, {patient.gender}
                          </Badge>
                          <Badge
                            className={
                              patient.riskLevel === "Low"
                                ? "bg-green-100 text-green-800"
                                : patient.riskLevel === "Moderate"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {patient.riskLevel} Risk
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Patient ID:</span>
                            <span className="font-mono text-blue-600">{patient.id}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{patient.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>{patient.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{patient.address}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">Conditions:</span>
                          <div className="flex space-x-1">
                            {patient.conditions.map((condition: string, index: number) => (
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
                        <FileText className="w-4 h-4 mr-2" />
                        View Records
                      </Button>
                      <Button variant="outline" size="sm">
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Searches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Searches</CardTitle>
          <CardDescription>Your recently accessed patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockPatients.slice(0, 3).map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-gray-600">{patient.id}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{new Date(patient.lastVisit).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
              <User className="w-6 h-6" />
              <span className="text-sm">New Patient</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <FileText className="w-6 h-6" />
              <span className="text-sm">Emergency Access</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <Search className="w-6 h-6" />
              <span className="text-sm">Advanced Search</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
