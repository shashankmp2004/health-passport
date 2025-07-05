"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, Camera, User, FileText, CheckCircle, Scan, Search, History, Plus } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import CameraQRScanner from '@/components/camera-qr-scanner'

export default function AddPatient() {
  const [isScanning, setIsScanning] = useState(false)
  const [healthId, setHealthId] = useState("")
  const [scannedPatient, setScannedPatient] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [scanHistory, setScanHistory] = useState<any[]>([])
  const [addingToRecords, setAddingToRecords] = useState(false)
  const [addedToRecords, setAddedToRecords] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [requestId, setRequestId] = useState("")
  const [existsInRecords, setExistsInRecords] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const [showCameraScanner, setShowCameraScanner] = useState(false)

  const handleStartScan = () => {
    setShowCameraScanner(true)
    setError("")
  }

  const handleScanSuccess = (scannedValue: string) => {
    setShowCameraScanner(false)
    fetchPatientData(scannedValue, "QR Scan")
  }

  const handleScanError = (err: string) => {
    setShowCameraScanner(false)
    setError(err)
  }

  const handleManualSearch = () => {
    if (!healthId.trim()) {
      setError("Please enter a Health Passport ID")
      return
    }
    fetchPatientData(healthId.trim(), "Manual Entry")
  }

  const fetchPatientData = async (healthPassportId: string, method: string) => {
    setLoading(true)
    setError("")
    setExistsInRecords(false)

    try {
      // First, check if patient exists in our records
      const recordsResponse = await fetch('/api/hospitals/patient-records')
      let existsInHospitalRecords = false
      
      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json()
        existsInHospitalRecords = recordsData.data.patientRecords.some(
          (record: any) => record.healthPassportId === healthPassportId
        )
      }

      // Then fetch patient data
      const response = await fetch(`/api/patients/search?healthPassportId=${healthPassportId}`)

      if (response.ok) {
        const data = await response.json()
        if (data.patient) {
          const patientData = {
            id: data.patient.healthPassportId,
            name: `${data.patient.personalInfo.firstName} ${data.patient.personalInfo.lastName}`,
            age: data.patient.personalInfo.age || 'N/A',
            bloodType: data.patient.personalInfo.bloodType,
            emergencyContact: data.patient.personalInfo.phone,
            conditions: data.patient.medicalHistory?.conditions?.map((c: any) => c.name) || [],
            allergies: data.patient.medicalHistory?.allergies?.map((a: any) => a.name) || [],
            lastVisit: data.patient.visits?.[0]?.date || 'No visits',
            riskLevel: data.patient.riskLevel || 'Low',
            medications: data.patient.medicalHistory?.medications?.map((m: any) => m.name) || [],
            vitals: data.patient.vitals?.[0] || null
          }
          
          setScannedPatient(patientData)
          setExistsInRecords(existsInHospitalRecords)
          
          // Add to scan history
          const newScan = {
            id: healthPassportId,
            name: patientData.name,
            scanTime: new Date().toLocaleString(),
            status: existsInHospitalRecords ? "already_in_records" : "success",
            method: method
          }
          setScanHistory([newScan, ...scanHistory.slice(0, 4)])
          
          // Clear the input
          setHealthId("")
        } else {
          setError('Patient not found with the provided Health Passport ID')
        }
      } else {
        setError('Patient not found or access denied')
      }
    } catch (error) {
      console.error('Error fetching patient data:', error)
      setError('Error accessing patient data. Please try again.')
    } finally {
      setLoading(false)
      setIsScanning(false)
    }
  }

  const handleStopScan = () => {
    setShowCameraScanner(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleManualSearch()
    }
  }

  const handleAddToRecords = async () => {
    if (!scannedPatient) return
    
    setAddingToRecords(true)
    setError("")
    
    try {
      const response = await fetch('/api/hospitals/request-patient-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          healthPassportId: scannedPatient.id,
          requestReason: 'Medical consultation and record access for hospital treatment'
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setRequestSent(true)
        setRequestId(result.data.requestId)
        
        // Show success message and redirect after a delay
        setTimeout(() => {
          router.push('/hospital/patient-records?requestSent=true')
        }, 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to send access request')
      }
    } catch (error) {
      console.error('Error sending access request:', error)
      setError('Error sending access request. Please try again.')
    } finally {
      setAddingToRecords(false)
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Add Patient</h1>
          <p className="text-gray-600">Scan QR code or enter Health Passport ID to access patient records</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">System Ready</span>
        </div>
      </div>

      {/* Patient Consent and Access Policy */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-amber-600 text-sm font-bold">!</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Patient Consent & 24-Hour Access Policy</h3>
            <p className="text-sm text-amber-700 mt-1">
              When you request access to a patient's records, the patient will receive a notification and must <strong>approve your request</strong> before you can access their information. 
              Once approved, you will have access to their medical records for <strong>24 hours</strong> only. 
              After this period expires, the patient will be automatically removed from your accessible records for privacy protection.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Access Methods */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="qr">QR Scanner</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="w-5 h-5" />
                    <span>Health Passport ID</span>
                  </CardTitle>
                  <CardDescription>Enter the patient's Health Passport ID manually</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="healthId">Health Passport ID</Label>
                    <Input
                      id="healthId"
                      placeholder="HP-A28B3-T9I1L"
                      value={healthId}
                      onChange={(e) => setHealthId(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="font-mono"
                    />
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleManualSearch} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search Patient
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <QrCode className="w-5 h-5" />
                    <span>QR Code Scanner</span>
                  </CardTitle>
                  <CardDescription>Scan the patient's QR code for instant access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showCameraScanner ? (
                    <CameraQRScanner
                      isActive={showCameraScanner}
                      onScan={handleScanSuccess}
                      onError={handleScanError}
                      onClose={handleStopScan}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to start scanning</p>
                        </div>
                      </div>
                      <Button onClick={handleStartScan} className="w-full bg-green-600 hover:bg-green-700">
                        <Scan className="w-4 h-4 mr-2" />
                        Start QR Scanner
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>Recent Access</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scanHistory.map((scan, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => fetchPatientData(scan.id, "History")}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{scan.name}</p>
                          <p className="text-xs text-gray-600">{scan.id}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {scan.method}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{scan.scanTime}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Patient Information Display */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Patient Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scannedPatient ? (
                <div className="space-y-6">
                  {/* Patient Header */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Patient Found</span>
                    </div>
                    <h3 className="text-xl font-bold text-green-900">{scannedPatient.name}</h3>
                    <p className="text-green-700">Health Passport ID: {scannedPatient.id}</p>
                  </div>

                  {/* Patient Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span>{scannedPatient.age} years old</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Blood Type:</span>
                          <Badge variant="outline">{scannedPatient.bloodType}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Emergency Contact:</span>
                          <span>{scannedPatient.emergencyContact}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Visit:</span>
                          <span>{new Date(scannedPatient.lastVisit).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Risk Level:</span>
                          <Badge 
                            className={
                              scannedPatient.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                              scannedPatient.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }
                          >
                            {scannedPatient.riskLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Medical Information</h4>
                      
                      {scannedPatient.conditions.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Current Conditions:</p>
                          <div className="flex flex-wrap gap-1">
                            {scannedPatient.conditions.map((condition: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {scannedPatient.allergies.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Allergies:</p>
                          <div className="flex flex-wrap gap-1">
                            {scannedPatient.allergies.map((allergy: string, index: number) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {scannedPatient.vitals && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Recent Vitals:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {scannedPatient.vitals.bloodPressure && (
                              <div className="p-2 bg-gray-50 rounded text-xs">
                                <div className="text-gray-600">Blood Pressure</div>
                                <div className="font-semibold">{scannedPatient.vitals.bloodPressure}</div>
                              </div>
                            )}
                            {scannedPatient.vitals.heartRate && (
                              <div className="p-2 bg-gray-50 rounded text-xs">
                                <div className="text-gray-600">Heart Rate</div>
                                <div className="font-semibold">{scannedPatient.vitals.heartRate} bpm</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-3 pt-4 border-t">
                    {requestSent && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-blue-800 mb-1">
                              📨 Access Request Sent!
                            </h4>
                            <div className="text-sm text-blue-700 space-y-1">
                              <p>An access request has been sent to the patient.</p>
                              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
                                <p className="font-medium">⏳ Waiting for Patient Approval:</p>
                                <p className="text-xs">The patient will receive a notification and can approve or deny your request to access their medical records. You will be notified once they respond.</p>
                              </div>
                              <p className="text-xs text-blue-600">Request ID: {requestId}</p>
                              <p className="text-xs italic">Redirecting to Patient Records...</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {addedToRecords && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-green-800 mb-1">
                              ✅ Patient Added Successfully!
                            </h4>
                            <div className="text-sm text-green-700 space-y-1">
                              <p>The patient has been added to your hospital records.</p>
                              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
                                <p className="font-medium">⏰ 24-Hour Access Policy:</p>
                                <p className="text-xs">You now have 24 hours to access this patient's complete medical records, including conditions, procedures, lab results, allergies, immunizations, and medications. After this period, access will expire automatically for privacy protection.</p>
                              </div>
                              <p className="text-xs italic">Redirecting to Patient Records...</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-3">
                      {existsInRecords ? (
                        <div className="flex items-center justify-center bg-green-100 text-green-800 px-4 py-2 rounded-lg border border-green-200">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Already Present in Records
                        </div>
                      ) : (
                        <Button 
                          onClick={handleAddToRecords}
                          disabled={addingToRecords || addedToRecords || requestSent}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {addingToRecords ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sending Request...
                            </>
                          ) : requestSent ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Request Sent
                            </>
                          ) : addedToRecords ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Added to Records
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Request Access
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => router.push(`/hospital/patient-details/${scannedPatient.id}`)}
                        disabled={!existsInRecords}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {existsInRecords ? 'View Full Records' : 'View Full Records (Access Required)'}
                      </Button>
                      
                      <Button variant="outline">
                        <User className="w-4 h-4 mr-2" />
                        Update Information
                      </Button>
                      
                      <Button variant="outline">
                        Add New Visit
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Patient Selected</h3>
                  <p className="text-gray-500">Scan a QR code or enter a Health Passport ID to view patient information</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
