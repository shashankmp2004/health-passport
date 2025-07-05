"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Camera, User, FileText, CheckCircle, Scan, AlertTriangle } from "lucide-react"
import CameraQRScanner from "@/components/camera-qr-scanner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function QRScanner() {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const [scannedPatient, setScannedPatient] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanHistory, setScanHistory] = useState<any[]>([])  // Start with empty history
  
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'hospital') {
      router.push('/auth/hospital/login')
      return
    }
  }, [session, status, router])

  const handleQRScan = async (qrData: string) => {
    setLoading(true)
    setError(null)
    setIsCameraActive(false) // Close camera
    
    try {
      console.log('QR Data received:', qrData)
      console.log('QR Data length:', qrData.length)
      console.log('QR Data starts with:', qrData.substring(0, 50))
      
      // First, try to scan the QR code to get patient data
      const scanResponse = await fetch('/api/qr/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrData: qrData,
          purpose: 'Hospital QR Scan'
        }),
      })

      console.log('Scan response status:', scanResponse.status)

      if (!scanResponse.ok) {
        const errorData = await scanResponse.json()
        console.log('Scan error data:', errorData)
        throw new Error(errorData.error || 'Failed to scan QR code')
      }

      const scanResult = await scanResponse.json()
      console.log('Scan result:', scanResult)
      
      const patientData = scanResult.data?.patient

      if (patientData) {
        setScannedPatient({
          id: patientData.data?.healthPassportId || patientData.id,
          name: `${patientData.data?.personalInfo?.firstName || ''} ${patientData.data?.personalInfo?.lastName || ''}`.trim() || 'Unknown Patient',
          age: patientData.data?.personalInfo?.age || 'N/A',
          bloodType: patientData.data?.personalInfo?.bloodType || 'Unknown',
          emergencyContact: patientData.data?.personalInfo?.phone || 'Not provided',
          conditions: patientData.data?.medicalHistory?.conditions || [],
          allergies: patientData.data?.allergies || [],
          lastVisit: patientData.data?.visits?.[0]?.date || 'No visits',
          riskLevel: patientData.data?.riskLevel || 'Low',
          qrInfo: scanResult.data?.qr
        })
        
        // Add to scan history
        const newScan = {
          id: patientData.data?.healthPassportId || patientData.id,
          name: `${patientData.data?.personalInfo?.firstName || ''} ${patientData.data?.personalInfo?.lastName || ''}`.trim() || 'Unknown Patient',
          scanTime: new Date().toLocaleString(),
          status: "success",
        }
        setScanHistory([newScan, ...scanHistory.slice(0, 4)])
      } else {
        // If no patient data in response, try to parse the QR data directly
        try {
          const directData = JSON.parse(qrData)
          console.log('Direct QR data parsed:', directData)
          
          setScannedPatient({
            id: directData.healthPassportId || 'Unknown ID',
            name: `${directData.personalInfo?.firstName || ''} ${directData.personalInfo?.lastName || ''}`.trim() || 'Unknown Patient',
            age: directData.personalInfo?.age || 'N/A',
            bloodType: directData.personalInfo?.bloodType || 'Unknown',
            emergencyContact: directData.personalInfo?.phone || 'Not provided',
            conditions: directData.medicalHistory?.conditions || [],
            allergies: directData.allergies || [],
            lastVisit: directData.visits?.[0]?.date || 'No visits',
            riskLevel: directData.riskLevel || 'Low'
          })
          
          // Add to scan history
          const newScan = {
            id: directData.healthPassportId || 'Unknown ID',
            name: `${directData.personalInfo?.firstName || ''} ${directData.personalInfo?.lastName || ''}`.trim() || 'Unknown Patient',
            scanTime: new Date().toLocaleString(),
            status: "success",
          }
          setScanHistory([newScan, ...scanHistory.slice(0, 4)])
        } catch (parseError) {
          console.error('Failed to parse QR data directly:', parseError)
          setError('Invalid QR code format')
        }
      }
    } catch (error) {
      console.error('Error scanning QR code:', error)
      setError(error instanceof Error ? error.message : 'Error scanning QR code')
    } finally {
      setLoading(false)
    }
  }

  const handleManualScan = async () => {
    if (!manualInput.trim()) {
      setError('Please enter QR code data')
      return
    }
    
    await handleQRScan(manualInput.trim())
    setManualInput("")
  }

  const handleStartCameraScan = () => {
    setIsCameraActive(true)
    setError(null)
  }

  const handleScanError = (errorMessage: string) => {
    setError(errorMessage)
    setIsCameraActive(false)
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
            <CardDescription>Scan patient QR codes using camera or manual entry</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Camera Scanner */}
              <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                {isCameraActive ? (
                  <div className="text-center text-gray-600">
                    <Camera className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">Camera Active</p>
                    <p className="text-sm">QR scanner is running in overlay mode</p>
                  </div>
                ) : loading ? (
                  <div className="text-center text-gray-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p>Processing QR code...</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <Camera className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">Camera Scanner</p>
                    <p className="text-sm">Click "Start Camera Scan" to begin</p>
                  </div>
                )}
              </div>

              {/* Scanner Controls */}
              <div className="flex space-x-4">
                <Button 
                  onClick={handleStartCameraScan} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={loading || isCameraActive}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {isCameraActive ? 'Camera Active' : 'Start Camera Scan'}
                </Button>
              </div>

              {/* Test Button for Development */}
              <div className="flex space-x-4">
                <Button 
                  onClick={() => {
                    const testData = JSON.stringify({
                      "healthPassportId": "HP-2025-TEST123",
                      "personalInfo": {
                        "firstName": "John",
                        "lastName": "Doe", 
                        "email": "john.doe@test.com",
                        "phone": "+1234567890",
                        "dateOfBirth": "1990-01-15",
                        "bloodType": "O+",
                        "age": 35
                      },
                      "medicalHistory": {
                        "conditions": ["Hypertension", "Diabetes Type 2"]
                      },
                      "allergies": ["Penicillin", "Shellfish"],
                      "visits": [
                        {
                          "date": "2025-01-01",
                          "diagnosis": "Routine checkup",
                          "treatment": "Blood pressure monitoring"
                        }
                      ],
                      "riskLevel": "Moderate"
                    });
                    handleQRScan(testData);
                  }}
                  variant="outline"
                  className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                  disabled={loading}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Test with Sample Data
                </Button>
              </div>

              {/* Manual Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Or enter QR code manually:</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Paste QR code data here..."
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    disabled={loading}
                  />
                  <Button 
                    onClick={handleManualScan}
                    disabled={loading || !manualInput.trim()}
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    Scan
                  </Button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Scan Error</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              )}

              {/* Scanner Status */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Scanner Status: Ready</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">Ready to scan patient QR codes for medical record access.</p>
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
                      <p>{scannedPatient.lastVisit !== 'No visits' ? new Date(scannedPatient.lastVisit).toLocaleDateString() : 'No visits'}</p>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Medical Conditions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {scannedPatient.conditions.length > 0 ? (
                        scannedPatient.conditions.map((condition: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">None reported</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Allergies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {scannedPatient.allergies.length > 0 ? (
                        scannedPatient.allergies.map((allergy: string, index: number) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">None reported</span>
                      )}
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

      {/* Camera QR Scanner Overlay */}
      <CameraQRScanner
        isActive={isCameraActive}
        onScan={handleQRScan}
        onError={handleScanError}
        onClose={() => setIsCameraActive(false)}
      />

      {/* Scan History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>History of recently scanned patient QR codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scanHistory.length > 0 ? (
              scanHistory.map((scan, index) => (
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
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <QrCode className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No scans yet</p>
                <p className="text-sm">Scanned patient records will appear here</p>
              </div>
            )}
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
                <li>1. Click "Start Camera Scan" to activate the camera</li>
                <li>2. Allow camera access when prompted</li>
                <li>3. Position the patient's QR code within the frame</li>
                <li>4. Hold steady until the code is automatically detected</li>
                <li>5. Patient information will appear on the right</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">Troubleshooting</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ensure good lighting conditions</li>
                <li>• Keep the QR code flat and unobstructed</li>
                <li>• Try switching cameras if available</li>
                <li>• Use manual entry if camera scanning fails</li>
                <li>• Contact IT support if camera issues persist</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
