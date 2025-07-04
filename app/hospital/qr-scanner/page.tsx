"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QrCode, Camera, User, FileText, CheckCircle, Scan } from "lucide-react"

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedPatient, setScannedPatient] = useState<any>(null)
  const [scanHistory, setScanHistory] = useState([
    {
      id: "HP-2024-789123",
      name: "Sarah Johnson",
      scanTime: "2024-12-30 14:30",
      status: "success",
    },
    {
      id: "HP-2024-654789",
      name: "Michael Chen",
      scanTime: "2024-12-30 13:15",
      status: "success",
    },
    {
      id: "HP-2024-321456",
      name: "Emma Williams",
      scanTime: "2024-12-30 12:45",
      status: "success",
    },
  ])

  const handleStartScan = () => {
    setIsScanning(true)
    // Simulate scanning process - in real app, this would use camera API
    setTimeout(() => {
      // Mock scan of a Health Passport ID
      const scannedId = "HP-A28B3-T9I1L" // This would come from QR code
      fetchPatientData(scannedId)
    }, 2000)
  }

  const fetchPatientData = async (healthPassportId: string) => {
    try {
      const response = await fetch(`/api/patients/search?healthPassportId=${healthPassportId}`)

      if (response.ok) {
        const data = await response.json()
        if (data.patient) {
          setScannedPatient({
            id: data.patient.healthPassportId,
            name: `${data.patient.personalInfo.firstName} ${data.patient.personalInfo.lastName}`,
            age: data.patient.personalInfo.age || 'N/A',
            bloodType: data.patient.personalInfo.bloodType,
            emergencyContact: data.patient.personalInfo.phone,
            conditions: data.patient.medicalHistory?.map((h: any) => h.condition) || [],
            allergies: data.patient.allergies || [],
            lastVisit: data.patient.visits?.[0]?.date || 'No visits',
            riskLevel: data.patient.riskLevel || 'Low',
          })
          
          // Add to scan history
          const newScan = {
            id: healthPassportId,
            name: `${data.patient.personalInfo.firstName} ${data.patient.personalInfo.lastName}`,
            scanTime: new Date().toLocaleString(),
            status: "success",
          }
          setScanHistory([newScan, ...scanHistory.slice(0, 4)])
        } else {
          alert('Patient not found')
        }
      } else {
        console.error('Failed to fetch patient data')
        alert('Patient not found or access denied')
      }
    } catch (error) {
      console.error('Error scanning QR code:', error)
      alert('Error scanning QR code')
    } finally {
      setIsScanning(false)
    }
  }

  const handleStopScan = () => {
    setIsScanning(false)
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">QR Code Scanner</h1>
          <p className="text-gray-600">Scan patient QR codes for instant access to medical records</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Scanner Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              <span>QR Code Scanner</span>
            </CardTitle>
            <CardDescription>Position the patient's QR code within the scanner frame</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Scanner Area */}
              <div className="relative">
                <div className="w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {isScanning ? (
                    <div className="text-center text-white">
                      <div className="animate-pulse">
                        <Scan className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg font-medium">Scanning...</p>
                        <p className="text-sm opacity-75">Position QR code in the frame</p>
                      </div>

                      {/* Scanning overlay */}
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-lg">
                        <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-blue-500"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-blue-500"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-blue-500"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-blue-500"></div>
                      </div>

                      {/* Scanning line */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Camera className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-lg font-medium">Camera Ready</p>
                      <p className="text-sm">Click "Start Scanning" to begin</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Scanner Controls */}
              <div className="flex space-x-4">
                {!isScanning ? (
                  <Button onClick={handleStartScan} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <QrCode className="w-4 h-4 mr-2" />
                    Start Scanning
                  </Button>
                ) : (
                  <Button onClick={handleStopScan} variant="destructive" className="flex-1">
                    Stop Scanning
                  </Button>
                )}
                <Button variant="outline">
                  <Camera className="w-4 h-4 mr-2" />
                  Switch Camera
                </Button>
              </div>

              {/* Scanner Status */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Scanner Status: Ready</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">Camera permissions granted. Ready to scan QR codes.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scanned Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-green-600" />
              <span>Patient Information</span>
            </CardTitle>
            <CardDescription>Details from the most recent QR code scan</CardDescription>
          </CardHeader>
          <CardContent>
            {scannedPatient ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Scan Successful</span>
                  </div>
                  <p className="text-sm text-green-600">Patient record accessed successfully</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{scannedPatient.name}</h3>
                    <p className="text-gray-600">Patient ID: {scannedPatient.id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Age:</span>
                      <p>{scannedPatient.age} years</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Blood Type:</span>
                      <p>{scannedPatient.bloodType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Emergency Contact:</span>
                      <p>{scannedPatient.emergencyContact}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Last Visit:</span>
                      <p>{new Date(scannedPatient.lastVisit).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Medical Conditions:</span>
                    <div className="flex space-x-1 mt-1">
                      {scannedPatient.conditions.map((condition: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Allergies:</span>
                    <div className="flex space-x-1 mt-1">
                      {scannedPatient.allergies.map((allergy: string, index: number) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700">Risk Level:</span>
                    <Badge
                      className={
                        scannedPatient.riskLevel === "Low"
                          ? "bg-green-100 text-green-800"
                          : scannedPatient.riskLevel === "Moderate"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {scannedPatient.riskLevel}
                    </Badge>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <FileText className="w-4 h-4 mr-2" />
                    View Full Record
                  </Button>
                  <Button variant="outline">Emergency Info</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No patient scanned yet</p>
                <p className="text-sm text-gray-500">Scan a QR code to view patient information</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scan History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>History of recently scanned patient QR codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scanHistory.map((scan, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{scan.name}</p>
                    <p className="text-sm text-gray-600">{scan.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{scan.scanTime}</p>
                  <Badge className="bg-green-100 text-green-800 text-xs">{scan.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Scanning Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">How to Scan</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Click "Start Scanning" to activate the camera</li>
                <li>2. Position the patient's QR code within the frame</li>
                <li>3. Hold steady until the code is recognized</li>
                <li>4. Patient information will appear automatically</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">Troubleshooting</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ensure good lighting conditions</li>
                <li>• Keep the QR code flat and unobstructed</li>
                <li>• Try switching cameras if available</li>
                <li>• Contact IT support if camera issues persist</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}