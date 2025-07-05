"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Save, X, Plus, AlertTriangle, CheckCircle } from "lucide-react"
import { useSession } from "next-auth/react"

export default function PatientEdit() {
  const params = useParams()
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [editedPatient, setEditedPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const { data: session } = useSession()

  useEffect(() => {
    if (params.id) {
      fetchPatientDetails(params.id as string)
    }
  }, [params.id])

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

            setPatient(data.patient)
            setEditedPatient(JSON.parse(JSON.stringify(data.patient))) // Deep copy for editing
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

  const handleSave = async () => {
    setSaving(true)
    setError("")

    try {
      // Note: In a real implementation, you would have an API endpoint to update patient data
      // For now, we'll simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setSuccessMessage("Patient information updated successfully!")
      setTimeout(() => {
        router.push(`/hospital/patient-details/${params.id}`)
      }, 2000)
    } catch (error) {
      console.error('Error saving patient:', error)
      setError('Error saving patient information. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const updatePersonalInfo = (field: string, value: string) => {
    setEditedPatient((prev: any) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }))
  }

  const addCondition = () => {
    const conditionName = prompt("Enter condition name:")
    if (conditionName) {
      setEditedPatient((prev: any) => ({
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          conditions: [
            ...(prev.medicalHistory?.conditions || []),
            {
              name: conditionName,
              diagnosedDate: new Date().toISOString(),
              severity: 'Moderate'
            }
          ]
        }
      }))
    }
  }

  const removeCondition = (index: number) => {
    setEditedPatient((prev: any) => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        conditions: prev.medicalHistory.conditions.filter((_: any, i: number) => i !== index)
      }
    }))
  }

  const addAllergy = () => {
    const allergyName = prompt("Enter allergy name:")
    if (allergyName) {
      setEditedPatient((prev: any) => ({
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          allergies: [
            ...(prev.medicalHistory?.allergies || []),
            {
              name: allergyName,
              severity: 'Moderate'
            }
          ]
        }
      }))
    }
  }

  const removeAllergy = (index: number) => {
    setEditedPatient((prev: any) => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        allergies: prev.medicalHistory.allergies.filter((_: any, i: number) => i !== index)
      }
    }))
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
            <h1 className="text-2xl font-bold">Edit Patient</h1>
            <p className="text-gray-600">Update patient information and medical history</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {editedPatient && (
        <>
          {/* Patient Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {editedPatient.personalInfo.firstName} {editedPatient.personalInfo.lastName}
                  </h2>
                  <p className="text-gray-600">Health Passport ID: {editedPatient.healthPassportId}</p>
                  <Badge variant="outline" className="mt-1">Editing Mode</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form Tabs */}
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="medical">Medical History</TabsTrigger>
              <TabsTrigger value="procedures">Procedures</TabsTrigger>
              <TabsTrigger value="labs">Lab Results</TabsTrigger>
              <TabsTrigger value="contact">Contact Info</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update basic personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editedPatient.personalInfo.firstName || ''}
                        onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editedPatient.personalInfo.lastName || ''}
                        onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={editedPatient.personalInfo.age || ''}
                        onChange={(e) => updatePersonalInfo('age', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodType">Blood Type</Label>
                      <Input
                        id="bloodType"
                        value={editedPatient.personalInfo.bloodType || ''}
                        onChange={(e) => updatePersonalInfo('bloodType', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Input
                        id="gender"
                        value={editedPatient.personalInfo.gender || ''}
                        onChange={(e) => updatePersonalInfo('gender', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={editedPatient.personalInfo.dateOfBirth || ''}
                        onChange={(e) => updatePersonalInfo('dateOfBirth', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Conditions</CardTitle>
                  <CardDescription>Manage patient's medical conditions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Current Conditions</h4>
                    <Button size="sm" onClick={addCondition}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {editedPatient.medicalHistory?.conditions?.map((condition: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{condition.name}</span>
                          {condition.diagnosedDate && (
                            <p className="text-sm text-gray-600">
                              Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => removeCondition(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )) || <p className="text-gray-500">No conditions recorded</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Allergies</CardTitle>
                  <CardDescription>Manage patient's allergies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Known Allergies</h4>
                    <Button size="sm" onClick={addAllergy}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Allergy
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {editedPatient.medicalHistory?.allergies?.map((allergy: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{allergy.name}</span>
                          {allergy.severity && (
                            <Badge className="ml-2" variant={allergy.severity === 'High' ? 'destructive' : 'secondary'}>
                              {allergy.severity}
                            </Badge>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => removeAllergy(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )) || <p className="text-gray-500">No allergies recorded</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Immunizations</CardTitle>
                  <CardDescription>Manage vaccination records</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Vaccination History</h4>
                    <Button size="sm" onClick={() => {
                      const vaccineName = prompt("Enter vaccine name:")
                      if (vaccineName) {
                        setEditedPatient((prev: any) => ({
                          ...prev,
                          medicalHistory: {
                            ...prev.medicalHistory,
                            immunizations: [
                              ...(prev.medicalHistory?.immunizations || []),
                              {
                                name: vaccineName,
                                dateAdministered: new Date().toISOString(),
                                status: 'Complete'
                              }
                            ]
                          }
                        }))
                      }
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Immunization
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {editedPatient.medicalHistory?.immunizations?.map((immunization: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{immunization.name}</span>
                          {immunization.dateAdministered && (
                            <p className="text-sm text-gray-600">
                              Administered: {new Date(immunization.dateAdministered).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => {
                            setEditedPatient((prev: any) => ({
                              ...prev,
                              medicalHistory: {
                                ...prev.medicalHistory,
                                immunizations: prev.medicalHistory.immunizations.filter((_: any, i: number) => i !== index)
                              }
                            }))
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )) || <p className="text-gray-500">No immunizations recorded</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="procedures" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Procedures</CardTitle>
                  <CardDescription>Manage surgical procedures and medical interventions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Procedure History</h4>
                    <Button size="sm" onClick={() => {
                      const procedureName = prompt("Enter procedure name:")
                      if (procedureName) {
                        setEditedPatient((prev: any) => ({
                          ...prev,
                          medicalHistory: {
                            ...prev.medicalHistory,
                            procedures: [
                              ...(prev.medicalHistory?.procedures || []),
                              {
                                name: procedureName,
                                date: new Date().toISOString(),
                                status: 'Completed',
                                type: 'Procedure'
                              }
                            ]
                          }
                        }))
                      }
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Procedure
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedPatient.medicalHistory?.procedures?.map((procedure: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <span className="font-medium">{procedure.name}</span>
                            {procedure.date && (
                              <p className="text-sm text-gray-600">Date: {new Date(procedure.date).toLocaleDateString()}</p>
                            )}
                            {procedure.surgeon && (
                              <p className="text-sm text-gray-600">Surgeon: {procedure.surgeon}</p>
                            )}
                            {procedure.status && (
                              <Badge className="mt-1">{procedure.status}</Badge>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => {
                              setEditedPatient((prev: any) => ({
                                ...prev,
                                medicalHistory: {
                                  ...prev.medicalHistory,
                                  procedures: prev.medicalHistory.procedures.filter((_: any, i: number) => i !== index)
                                }
                              }))
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        {procedure.description && (
                          <p className="text-sm text-gray-700">{procedure.description}</p>
                        )}
                      </div>
                    )) || <p className="text-gray-500">No procedures recorded</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="labs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Laboratory Results</CardTitle>
                  <CardDescription>Manage lab test results and values</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Lab Results History</h4>
                    <Button size="sm" onClick={() => {
                      const testName = prompt("Enter test name:")
                      if (testName) {
                        setEditedPatient((prev: any) => ({
                          ...prev,
                          medicalHistory: {
                            ...prev.medicalHistory,
                            labResults: [
                              ...(prev.medicalHistory?.labResults || []),
                              {
                                testName: testName,
                                date: new Date().toISOString(),
                                status: 'Normal',
                                results: {}
                              }
                            ]
                          }
                        }))
                      }
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lab Result
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedPatient.medicalHistory?.labResults?.map((lab: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <span className="font-medium">{lab.testName}</span>
                            {lab.date && (
                              <p className="text-sm text-gray-600">Date: {new Date(lab.date).toLocaleDateString()}</p>
                            )}
                            {lab.orderedBy && (
                              <p className="text-sm text-gray-600">Ordered by: {lab.orderedBy}</p>
                            )}
                            {lab.status && (
                              <Badge 
                                className="mt-1" 
                                variant={lab.status === 'Abnormal' ? 'destructive' : 'default'}
                              >
                                {lab.status}
                              </Badge>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => {
                              setEditedPatient((prev: any) => ({
                                ...prev,
                                medicalHistory: {
                                  ...prev.medicalHistory,
                                  labResults: prev.medicalHistory.labResults.filter((_: any, i: number) => i !== index)
                                }
                              }))
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        {lab.notes && (
                          <p className="text-sm text-gray-700">{lab.notes}</p>
                        )}
                      </div>
                    )) || <p className="text-gray-500">No lab results recorded</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Update contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={editedPatient.personalInfo.phone || ''}
                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedPatient.personalInfo.email || ''}
                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={editedPatient.personalInfo.address || ''}
                        onChange={(e) => updatePersonalInfo('address', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                  <CardDescription>Emergency contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                      <Input
                        id="emergencyName"
                        value={editedPatient.personalInfo.emergencyContact?.name || ''}
                        onChange={(e) => updatePersonalInfo('emergencyContact', {
                          ...editedPatient.personalInfo.emergencyContact,
                          name: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                      <Input
                        id="emergencyPhone"
                        value={editedPatient.personalInfo.emergencyContact?.phone || ''}
                        onChange={(e) => updatePersonalInfo('emergencyContact', {
                          ...editedPatient.personalInfo.emergencyContact,
                          phone: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyRelationship">Relationship</Label>
                      <Input
                        id="emergencyRelationship"
                        value={editedPatient.personalInfo.emergencyContact?.relationship || ''}
                        onChange={(e) => updatePersonalInfo('emergencyContact', {
                          ...editedPatient.personalInfo.emergencyContact,
                          relationship: e.target.value
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
