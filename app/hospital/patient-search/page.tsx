"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setError("")
    
    try {
      // Determine search type based on input
      let searchUrl = '/api/patients/search?'
      
      // Check if it's a health passport ID (starts with HP-)
      if (searchQuery.startsWith('HP-')) {
        searchUrl += `healthPassportId=${encodeURIComponent(searchQuery)}`
      }
      // Check if it's a phone number (contains only digits, spaces, +, -, (), etc.)
      else if (/^[\d\s\+\-\(\)]+$/.test(searchQuery.trim())) {
        searchUrl += `phone=${encodeURIComponent(searchQuery)}`
      }
      // Check if it's an email (contains @)
      else if (searchQuery.includes('@')) {
        searchUrl += `email=${encodeURIComponent(searchQuery)}`
      }
      // Otherwise treat as name
      else {
        searchUrl += `name=${encodeURIComponent(searchQuery)}`
      }

      const response = await fetch(searchUrl)
      if (response.ok) {
        const result = await response.json()
        if (result.patient) {
          // Transform single patient result to array format for display
          const patient = result.patient
          const transformedPatient = {
            id: patient.healthPassportId,
            name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
            age: patient.personalInfo.age || 'N/A',
            gender: patient.personalInfo.gender || 'N/A',
            phone: patient.personalInfo.phone || 'N/A',
            email: patient.personalInfo.email || 'N/A',
            address: `${patient.personalInfo.address?.street || ''} ${patient.personalInfo.address?.city || ''}`.trim() || 'N/A',
            lastVisit: patient.visits?.length > 0 ? patient.visits[patient.visits.length - 1].date : new Date().toISOString(),
            riskLevel: 'Low', // Default, can be enhanced later
            conditions: patient.medicalHistory?.conditions?.map((c: any) => c.name) || []
          }
          setSearchResults([transformedPatient])
        } else {
          setSearchResults([])
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Patient not found')
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setError('Error occurred while searching')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
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
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => router.push('/hospital/add-patient')}
        >
          <QrCode className="w-4 h-4 mr-2" />
          Add Patient
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
                placeholder="HP-2024-789123, Sarah Johnson, sarah@email.com, or +1234567890"
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
        </CardContent>
      </Card>

      {/* Search Results */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-4">
              <Search className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
              <p className="text-sm text-gray-500 mt-2">Please try again or contact support if the issue persists</p>
            </div>
          </CardContent>
        </Card>
      )}

      {searchQuery && searchResults.length === 0 && !error && !isSearching && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-4">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No patients found</h3>
              <p className="text-sm text-gray-500">No patients match your search criteria. Try a different search term.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {searchResults.length > 0 && !error && (
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
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => router.push(`/hospital/patient-details/${patient.id}`)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Records
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
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent searches</p>
              <p className="text-sm text-gray-500">Your recently accessed patients will appear here</p>
            </div>
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
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2 bg-transparent"
              onClick={() => router.push('/hospital/add-patient')}
            >
              <QrCode className="w-6 h-6" />
              <span className="text-sm">Add Patient</span>
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
