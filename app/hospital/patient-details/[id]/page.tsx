"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Heart, Activity, FileText, Calendar, Phone, AlertTriangle, Edit, Download, Clock } from "lucide-react"
import { useSession } from "next-auth/react"

export default function PatientDetails() {
  const params = useParams()
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRemaining, setTimeRemaining] = useState("")
  const { data: session } = useSession()

  useEffect(() => {
    if (params.id) {
      fetchPatientDetails(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    // Update time remaining every minute
    const interval = setInterval(() => {
      if (patient) {
        calculateTimeRemaining()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [patient])

  const calculateTimeRemaining = () => {
    if (!patient || !patient.addedAt) return

    const addedTime = new Date(patient.addedAt)
    const expiryTime = new Date(addedTime.getTime() + 24 * 60 * 60 * 1000) // 24 hours later
    const now = new Date()
    const timeLeft = expiryTime.getTime() - now.getTime()

    if (timeLeft <= 0) {
      setTimeRemaining("Expired")
      return
    }

    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

    if (hoursLeft > 0) {
      setTimeRemaining(`${hoursLeft}h ${minutesLeft}m remaining`)
    } else {
      setTimeRemaining(`${minutesLeft}m remaining`)
    }
  }

  const fetchPatientDetails = async (healthPassportId: string) => {
    console.log('fetchPatientDetails called with healthPassportId:', healthPassportId)
    setLoading(true)
    setError("")

    try {
      // First, get the patient data from the search API
      console.log('Fetching patient search data...')
      const response = await fetch(`/api/patients/search?healthPassportId=${healthPassportId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Patient search response:', data)
        if (data.patient) {
          // Check if we have access to this patient via hospital records
          try {
            console.log('Checking hospital access...')
            const hospitalResponse = await fetch('/api/hospitals/patient-records')
            
            if (!hospitalResponse.ok) {
              console.error('Hospital response not OK:', hospitalResponse.status, hospitalResponse.statusText)
              setError("Unable to verify access to patient records. Please try again.")
              return
            }
            
            const hospitalData = await hospitalResponse.json()
            console.log('Hospital data response:', {
              success: hospitalData?.success,
              patientsCount: hospitalData?.data?.patientRecords?.length || 0,
              patients: hospitalData?.data?.patientRecords?.map((p: any) => ({
                id: p.healthPassportId,
                name: p.name,
                addedAt: p.lastUpdate || p.lastVisit
              })) || []
            })
            
            // Check if the API call was successful and we have patient records
            if (!hospitalData?.success || !hospitalData?.data?.patientRecords) {
              console.log('No patient records found or API call failed')
              setError("Unable to access patient records. Please ensure the patient is added to your hospital records.")
              return
            }
            
            // Add proper null checking for hospitalData.data.patientRecords
            const hasAccess = hospitalData.data.patientRecords.some((p: any) => p.healthPassportId === healthPassportId)
            console.log('Access check result:', hasAccess, 'for healthPassportId:', healthPassportId)
            
            if (!hasAccess) {
              setError("Access denied. This patient is not in your accessible records or access has expired.")
              return
            }

            // Get the hospital record details for access time
            const hospitalRecord = hospitalData.data.patientRecords.find((p: any) => p.healthPassportId === healthPassportId)
            
            const patientData = {
              ...data.patient,
              addedAt: hospitalRecord?.lastUpdate || hospitalRecord?.lastVisit || new Date().toISOString(),
              accessExpiresAt: hospitalRecord?.accessExpiresAt
            }
            
            setPatient(patientData)
            calculateTimeRemaining()
          } catch (hospitalError) {
            console.error('Error checking hospital access:', hospitalError)
            setError("Error verifying access to patient records. Please try again.")
            return
          }
        } else {
          setError('Patient not found')
        }
      } else {
        setError('Patient not found or access denied')
      }
    } catch (error) {
      console.error('Error fetching patient details:', error)
      setError('Error loading patient details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/hospital/patient-edit/${params.id}`)
  }

  const handleExport = () => {
    if (!patient) return
    
    const patientData = {
      healthPassportId: patient.healthPassportId,
      name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
      personalInfo: patient.personalInfo,
      medicalHistory: patient.medicalHistory,
      visits: patient.visits,
      vitals: patient.vitals,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(patientData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `patient-${patient.healthPassportId}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading patient details...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-600 mb-2">Access Error</h3>
              <p className="text-red-500">{error}</p>
              <Button 
                onClick={() => router.push('/hospital/patient-records')}
                className="mt-4"
              >
                Return to Patient Records
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Patient Details</h1>
            <p className="text-gray-600">Viewing complete patient information</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
            <Edit className="w-4 h-4 mr-2" />
            Edit Patient
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* 24-Hour Access Warning */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-amber-600" />
          <div>
            <span className="text-sm font-medium text-amber-800">24-Hour Access: </span>
            <span className="text-sm text-amber-700">{timeRemaining}</span>
          </div>
        </div>
      </div>

      {patient && (
        <>
          {/* Patient Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{patient.personalInfo.firstName} {patient.personalInfo.lastName}</h2>
                    <p className="text-gray-600">Health Passport ID: {patient.healthPassportId}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="outline">{patient.personalInfo.age} years old</Badge>
                      <Badge variant="outline">Blood Type: {patient.personalInfo.bloodType}</Badge>
                      <Badge 
                        className={
                          patient.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                          patient.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }
                      >
                        {patient.riskLevel || 'Low'} Risk
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="medical">Medical History</TabsTrigger>
              <TabsTrigger value="procedures">Procedures</TabsTrigger>
              <TabsTrigger value="labs">Lab Results</TabsTrigger>
              <TabsTrigger value="visits">Visits</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Full Name:</span>
                      <span>{patient.personalInfo.firstName} {patient.personalInfo.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date of Birth:</span>
                      <span>{patient.personalInfo.dateOfBirth || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span>{patient.personalInfo.gender || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span>{patient.personalInfo.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Type:</span>
                      <Badge variant="outline">{patient.personalInfo.bloodType}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="w-5 h-5" />
                      <span>Health Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-gray-600 block mb-2">Active Conditions ({patient.medicalHistory?.conditions?.length || 0}):</span>
                      <div className="flex flex-wrap gap-2">
                        {patient.medicalHistory?.conditions?.slice(0, 4).map((condition: any, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {condition.name}
                          </Badge>
                        )) || <span className="text-gray-500">None recorded</span>}
                        {patient.medicalHistory?.conditions?.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{patient.medicalHistory.conditions.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-2">Known Allergies ({patient.medicalHistory?.allergies?.length || 0}):</span>
                      <div className="flex flex-wrap gap-2">
                        {patient.medicalHistory?.allergies?.slice(0, 4).map((allergy: any, index: number) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {allergy.name}
                          </Badge>
                        )) || <span className="text-gray-500">None recorded</span>}
                        {patient.medicalHistory?.allergies?.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{patient.medicalHistory.allergies.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-2">Current Medications ({patient.medicalHistory?.medications?.length || 0}):</span>
                      <div className="flex flex-wrap gap-2">
                        {patient.medicalHistory?.medications?.slice(0, 4).map((medication: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {medication.name}
                          </Badge>
                        )) || <span className="text-gray-500">None recorded</span>}
                        {patient.medicalHistory?.medications?.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{patient.medicalHistory.medications.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-2">Recent Procedures ({patient.medicalHistory?.procedures?.length || 0}):</span>
                      <div className="flex flex-wrap gap-2">
                        {patient.medicalHistory?.procedures?.slice(0, 3).map((procedure: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {procedure.name}
                          </Badge>
                        )) || <span className="text-gray-500">None recorded</span>}
                        {patient.medicalHistory?.procedures?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{patient.medicalHistory.procedures.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-2">Recent Lab Results ({patient.medicalHistory?.labResults?.length || 0}):</span>
                      <div className="flex flex-wrap gap-2">
                        {patient.medicalHistory?.labResults?.slice(0, 3).map((lab: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {lab.testName} - {lab.status || 'Normal'}
                          </Badge>
                        )) || <span className="text-gray-500">None available</span>}
                        {patient.medicalHistory?.labResults?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{patient.medicalHistory.labResults.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-2">Current Medications:</span>
                      <div className="flex flex-wrap gap-2">
                        {patient.medicalHistory?.medications?.map((medication: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {medication.name}
                          </Badge>
                        )) || <span className="text-gray-500">None recorded</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-2">Immunizations:</span>
                      <div className="flex flex-wrap gap-2">
                        {patient.medicalHistory?.immunizations?.slice(0, 3).map((immunization: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {immunization.name}
                          </Badge>
                        )) || <span className="text-gray-500">None recorded</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Conditions</CardTitle>
                    <CardDescription>Current and past medical conditions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {patient.medicalHistory?.conditions?.length > 0 ? (
                      <div className="space-y-3">
                        {patient.medicalHistory.conditions.map((condition: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">{condition.name}</span>
                              {condition.severity && (
                                <Badge variant={condition.severity === 'High' ? 'destructive' : condition.severity === 'Moderate' ? 'secondary' : 'outline'}>
                                  {condition.severity}
                                </Badge>
                              )}
                            </div>
                            {condition.diagnosedDate && (
                              <p className="text-sm text-gray-600">Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}</p>
                            )}
                            {condition.doctor && (
                              <p className="text-sm text-gray-600">Doctor: {condition.doctor}</p>
                            )}
                            {condition.notes && (
                              <p className="text-sm text-gray-700 mt-1">{condition.notes}</p>
                            )}
                            {condition.status && (
                              <Badge className="mt-2" variant={condition.status === 'Active' ? 'default' : 'secondary'}>
                                {condition.status}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No conditions recorded</p>
                    )}
                  </CardContent>
                </Card>

                {/* Allergies */}
                <Card>
                  <CardHeader>
                    <CardTitle>Allergies</CardTitle>
                    <CardDescription>Known allergies and reactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {patient.medicalHistory?.allergies?.length > 0 ? (
                      <div className="space-y-3">
                        {patient.medicalHistory.allergies.map((allergy: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">{allergy.name}</span>
                              {allergy.severity && (
                                <Badge variant={allergy.severity === 'Severe' ? 'destructive' : 'secondary'}>
                                  {allergy.severity}
                                </Badge>
                              )}
                            </div>
                            {allergy.reaction && (
                              <p className="text-sm text-gray-600">Reaction: {allergy.reaction}</p>
                            )}
                            {allergy.dateIdentified && (
                              <p className="text-sm text-gray-600">Identified: {new Date(allergy.dateIdentified).toLocaleDateString()}</p>
                            )}
                            {allergy.notes && (
                              <p className="text-sm text-gray-700 mt-1">{allergy.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No allergies recorded</p>
                    )}
                  </CardContent>
                </Card>

                {/* Medications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Medications</CardTitle>
                    <CardDescription>Active prescriptions and dosages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {patient.medicalHistory?.medications?.length > 0 ? (
                      <div className="space-y-3">
                        {patient.medicalHistory.medications.map((medication: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">{medication.name}</span>
                              {medication.status && (
                                <Badge variant={medication.status === 'Active' ? 'default' : 'secondary'}>
                                  {medication.status}
                                </Badge>
                              )}
                            </div>
                            {medication.dosage && (
                              <p className="text-sm text-gray-600">Dosage: {medication.dosage}</p>
                            )}
                            {medication.frequency && (
                              <p className="text-sm text-gray-600">Frequency: {medication.frequency}</p>
                            )}
                            {medication.prescribedBy && (
                              <p className="text-sm text-gray-600">Prescribed by: {medication.prescribedBy}</p>
                            )}
                            {medication.startDate && (
                              <p className="text-sm text-gray-600">Started: {new Date(medication.startDate).toLocaleDateString()}</p>
                            )}
                            {medication.notes && (
                              <p className="text-sm text-gray-700 mt-1">{medication.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No medications recorded</p>
                    )}
                  </CardContent>
                </Card>

                {/* Immunizations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Immunizations</CardTitle>
                    <CardDescription>Vaccination history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {patient.medicalHistory?.immunizations?.length > 0 ? (
                      <div className="space-y-3">
                        {patient.medicalHistory.immunizations.map((immunization: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">{immunization.name}</span>
                              {immunization.status && (
                                <Badge variant="outline">{immunization.status}</Badge>
                              )}
                            </div>
                            {immunization.dateAdministered && (
                              <p className="text-sm text-gray-600">Administered: {new Date(immunization.dateAdministered).toLocaleDateString()}</p>
                            )}
                            {immunization.nextDueDate && (
                              <p className="text-sm text-gray-600">Next due: {new Date(immunization.nextDueDate).toLocaleDateString()}</p>
                            )}
                            {immunization.provider && (
                              <p className="text-sm text-gray-600">Provider: {immunization.provider}</p>
                            )}
                            {immunization.lotNumber && (
                              <p className="text-sm text-gray-600">Lot #: {immunization.lotNumber}</p>
                            )}
                            {immunization.notes && (
                              <p className="text-sm text-gray-700 mt-1">{immunization.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No immunizations recorded</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="procedures" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Procedures</CardTitle>
                  <CardDescription>Surgical procedures and medical interventions</CardDescription>
                </CardHeader>
                <CardContent>
                  {patient.medicalHistory?.procedures?.length > 0 ? (
                    <div className="space-y-4">
                      {patient.medicalHistory.procedures.map((procedure: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-lg">{procedure.name}</h4>
                            {procedure.status && (
                              <Badge variant={procedure.status === 'Completed' ? 'default' : 'secondary'}>
                                {procedure.status}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              {procedure.date && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Date:</strong> {new Date(procedure.date).toLocaleDateString()}
                                </p>
                              )}
                              {procedure.surgeon && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Surgeon:</strong> {procedure.surgeon}
                                </p>
                              )}
                              {procedure.hospital && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Hospital:</strong> {procedure.hospital}
                                </p>
                              )}
                              {procedure.type && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Type:</strong> {procedure.type}
                                </p>
                              )}
                            </div>
                            <div>
                              {procedure.complications && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Complications:</strong> {procedure.complications}
                                </p>
                              )}
                              {procedure.outcome && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Outcome:</strong> {procedure.outcome}
                                </p>
                              )}
                              {procedure.followUpRequired && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Follow-up Required:</strong> {procedure.followUpRequired ? 'Yes' : 'No'}
                                </p>
                              )}
                            </div>
                          </div>
                          {procedure.description && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-700">
                                <strong>Description:</strong> {procedure.description}
                              </p>
                            </div>
                          )}
                          {procedure.notes && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-700">
                                <strong>Notes:</strong> {procedure.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No procedures recorded</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="labs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Laboratory Results</CardTitle>
                  <CardDescription>Recent and historical lab test results</CardDescription>
                </CardHeader>
                <CardContent>
                  {patient.medicalHistory?.labResults?.length > 0 ? (
                    <div className="space-y-4">
                      {patient.medicalHistory.labResults.map((lab: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-lg">{lab.testName}</h4>
                            <div className="text-right">
                              {lab.status && (
                                <Badge variant={lab.status === 'Abnormal' ? 'destructive' : 'default'} className="mb-1">
                                  {lab.status}
                                </Badge>
                              )}
                              {lab.date && (
                                <p className="text-sm text-gray-600">{new Date(lab.date).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                          
                          {lab.results && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">Results:</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Object.entries(lab.results).map(([key, value]: [string, any]) => (
                                  <div key={key} className="p-2 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-600 uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                    <p className="font-semibold">
                                      {value?.value || value} 
                                      {value?.unit && <span className="text-gray-600 ml-1">{value.unit}</span>}
                                    </p>
                                    {value?.referenceRange && (
                                      <p className="text-xs text-gray-500">Ref: {value.referenceRange}</p>
                                    )}
                                    {value?.flag && (
                                      <Badge variant={value.flag === 'H' ? 'destructive' : value.flag === 'L' ? 'secondary' : 'outline'} className="text-xs mt-1">
                                        {value.flag === 'H' ? 'High' : value.flag === 'L' ? 'Low' : value.flag}
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {lab.orderedBy && (
                            <p className="text-sm text-gray-600 mt-3">
                              <strong>Ordered by:</strong> {lab.orderedBy}
                            </p>
                          )}
                          {lab.labName && (
                            <p className="text-sm text-gray-600">
                              <strong>Lab:</strong> {lab.labName}
                            </p>
                          )}
                          {lab.notes && (
                            <p className="text-sm text-gray-700 mt-2">
                              <strong>Notes:</strong> {lab.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No lab results available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visits" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Visit History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.visits?.length > 0 ? (
                    <div className="space-y-3">
                      {patient.visits.map((visit: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{visit.hospital || 'Hospital Visit'}</h4>
                              <p className="text-sm text-gray-600">{new Date(visit.date).toLocaleDateString()}</p>
                            </div>
                            <Badge variant="outline">{visit.type || 'General'}</Badge>
                          </div>
                          {visit.reason && (
                            <p className="text-sm text-gray-700 mb-2">Reason: {visit.reason}</p>
                          )}
                          {visit.diagnosis && (
                            <p className="text-sm text-gray-700 mb-2">Diagnosis: {visit.diagnosis}</p>
                          )}
                          {visit.doctor && (
                            <p className="text-sm text-gray-600">Doctor: {visit.doctor}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No visits recorded</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vitals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Vital Signs</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.vitals?.length > 0 ? (
                    <div className="space-y-4">
                      {patient.vitals.map((vital: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium">Vital Signs Reading</h4>
                            <span className="text-sm text-gray-600">
                              {new Date(vital.date || vital.recordedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {vital.bloodPressure && (
                              <div className="text-center p-3 bg-gray-50 rounded">
                                <p className="text-xs text-gray-600">Blood Pressure</p>
                                <p className="font-semibold">{vital.bloodPressure}</p>
                              </div>
                            )}
                            {vital.heartRate && (
                              <div className="text-center p-3 bg-gray-50 rounded">
                                <p className="text-xs text-gray-600">Heart Rate</p>
                                <p className="font-semibold">{vital.heartRate} bpm</p>
                              </div>
                            )}
                            {vital.temperature && (
                              <div className="text-center p-3 bg-gray-50 rounded">
                                <p className="text-xs text-gray-600">Temperature</p>
                                <p className="font-semibold">{vital.temperature}°F</p>
                              </div>
                            )}
                            {vital.weight && (
                              <div className="text-center p-3 bg-gray-50 rounded">
                                <p className="text-xs text-gray-600">Weight</p>
                                <p className="font-semibold">{vital.weight} lbs</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No vital signs recorded</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
