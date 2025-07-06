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
import { ArrowLeft, User, Save, X, Plus, AlertTriangle, CheckCircle, RefreshCw, FileText } from "lucide-react"
import { useSession } from "next-auth/react"
import { AddRecordModal } from "@/components/add-record-modal"

export default function PatientEdit() {
  const params = useParams()
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [editedPatient, setEditedPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [hasChanges, setHasChanges] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'condition' | 'allergy' | 'medication' | 'procedure' | 'lab' | 'immunization' | 'vitals'>('condition')
  const [modalTitle, setModalTitle] = useState("")
  const { data: session } = useSession()

  // Check for changes whenever editedPatient is updated
  useEffect(() => {
    if (patient && editedPatient) {
      const hasChanged = JSON.stringify(patient) !== JSON.stringify(editedPatient)
      setHasChanges(hasChanged)
    }
  }, [patient, editedPatient])

  // Add keyboard shortcut for saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (!saving && hasChanges) {
          handleSave()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [saving, hasChanges])

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
              setError("Access denied. This patient is not in your accessible records.")
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
    setSuccessMessage("")

    try {
      // Validate required fields
      if (!editedPatient.personalInfo?.firstName || !editedPatient.personalInfo?.lastName) {
        setError("First name and last name are required.")
        return
      }

      // Create the update payload
      const updatePayload = {
        personalInfo: editedPatient.personalInfo,
        medicalHistory: editedPatient.medicalHistory
      }

      console.log('Saving patient data:', updatePayload)

      // Call the API endpoint
      const response = await fetch(`/api/patients/${editedPatient.healthPassportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload)
      })

      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      console.log('Response headers:', Array.from(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = 'Failed to update patient';
        try {
          const responseText = await response.text();
          console.log('Error response text:', responseText);
          
          // Try to parse as JSON
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
          console.error('Failed to parse error response as JSON:', jsonError);
        }
        throw new Error(errorMessage)
      }

      let result;
      try {
        const responseText = await response.text();
        console.log('Success response text:', responseText);
        console.log('Response text length:', responseText.length);
        
        if (!responseText || responseText.trim() === '') {
          throw new Error('Server returned empty response');
        }
        
        result = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse success response as JSON:', jsonError);
        throw new Error('Invalid response from server');
      }
      
      // Update the original patient data
      setPatient(result.patient)
      setEditedPatient(JSON.parse(JSON.stringify(result.patient)))
      
      setSuccessMessage("Patient information updated successfully!")
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
      
    } catch (error) {
      console.error('Error saving patient:', error)
      setError(error instanceof Error ? error.message : 'Error saving patient information. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave? All changes will be lost.")) {
        router.back()
      }
    } else {
      router.back()
    }
  }

  const updatePersonalInfo = (field: string, value: string | object) => {
    setEditedPatient((prev: any) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }))
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

  const removeAllergy = (index: number) => {
    setEditedPatient((prev: any) => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        allergies: prev.medicalHistory.allergies.filter((_: any, i: number) => i !== index)
      }
    }))
  }

  const openModal = (type: 'condition' | 'allergy' | 'medication' | 'procedure' | 'lab' | 'immunization' | 'vitals', title: string) => {
    setModalType(type)
    setModalTitle(title)
    setModalOpen(true)
  }

  const handleModalSave = (data: any) => {
    const fieldMapping = {
      condition: 'conditions',
      allergy: 'allergies', 
      medication: 'medications',
      procedure: 'procedures',
      lab: 'labResults',
      immunization: 'immunizations',
      vitals: 'vitalSigns'
    }

    const field = fieldMapping[modalType]
    
    setEditedPatient((prev: any) => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        [field]: [
          ...(prev.medicalHistory?.[field] || []),
          {
            ...data,
            id: Date.now().toString() // Add temporary ID
          }
        ]
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
          <Button 
            variant="outline" 
            onClick={() => {
              if (confirm("Are you sure you want to reset all changes? This will discard any unsaved modifications.")) {
                setEditedPatient(JSON.parse(JSON.stringify(patient)))
                setError("")
                setSuccessMessage("")
              }
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Changes
          </Button>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {editedPatient.personalInfo?.firstName} {editedPatient.personalInfo?.lastName}
                    </h2>
                    <p className="text-gray-600">Health Passport ID: {editedPatient.healthPassportId}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">Editing Mode</Badge>
                      {hasChanges && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Unsaved Changes
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Last Updated: {patient?.lastUpdated ? new Date(patient.lastUpdated).toLocaleString() : 'Never'}</p>
                  {patient?.updatedBy && <p>By: {patient.updatedBy}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form Tabs */}
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="medical">Medical History</TabsTrigger>
              <TabsTrigger value="procedures">Procedures</TabsTrigger>
              <TabsTrigger value="labs">Lab Results</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                  <CardDescription>Update patient's basic information and contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={editedPatient.personalInfo?.firstName || ''}
                        onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                        placeholder="Enter first name"
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={editedPatient.personalInfo?.lastName || ''}
                        onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                        placeholder="Enter last name"
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={editedPatient.personalInfo?.dateOfBirth ? new Date(editedPatient.personalInfo.dateOfBirth).toISOString().split('T')[0] : ''}
                        onChange={(e) => updatePersonalInfo('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Input
                        id="gender"
                        value={editedPatient.personalInfo?.gender || ''}
                        onChange={(e) => updatePersonalInfo('gender', e.target.value)}
                        placeholder="Enter gender"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={editedPatient.personalInfo?.phone || ''}
                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedPatient.personalInfo?.email || ''}
                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={editedPatient.personalInfo?.address || ''}
                      onChange={(e) => updatePersonalInfo('address', e.target.value)}
                      placeholder="Enter full address"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContact"
                        value={editedPatient.personalInfo?.emergencyContact?.name || ''}
                        onChange={(e) => updatePersonalInfo('emergencyContact', { 
                          ...editedPatient.personalInfo?.emergencyContact, 
                          name: e.target.value 
                        })}
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                      <Input
                        id="emergencyPhone"
                        value={editedPatient.personalInfo?.emergencyContact?.phone || ''}
                        onChange={(e) => updatePersonalInfo('emergencyContact', { 
                          ...editedPatient.personalInfo?.emergencyContact, 
                          phone: e.target.value 
                        })}
                        placeholder="Emergency contact phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relationship">Relationship</Label>
                      <Input
                        id="relationship"
                        value={editedPatient.personalInfo?.emergencyContact?.relationship || ''}
                        onChange={(e) => updatePersonalInfo('emergencyContact', { 
                          ...editedPatient.personalInfo?.emergencyContact, 
                          relationship: e.target.value 
                        })}
                        placeholder="Relationship"
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
                    <Button size="sm" onClick={() => openModal('condition', 'Add Medical Condition')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedPatient.medicalHistory?.conditions?.map((condition: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-lg">{condition.name}</span>
                              <Badge variant={condition.severity === 'Severe' ? 'destructive' : condition.severity === 'Moderate' ? 'default' : 'secondary'}>
                                {condition.severity}
                              </Badge>
                              {condition.status && (
                                <Badge variant="outline">{condition.status}</Badge>
                              )}
                            </div>
                            {condition.diagnosedDate && (
                              <p className="text-sm text-gray-600">
                                Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                              </p>
                            )}
                            {condition.notes && (
                              <p className="text-sm text-gray-700 mt-1">{condition.notes}</p>
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
                      </div>
                    )) || <p className="text-gray-500 text-center py-8">No conditions recorded</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Allergies</CardTitle>
                  <CardDescription>Manage patient's allergies and reactions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Known Allergies</h4>
                    <Button size="sm" onClick={() => openModal('allergy', 'Add Allergy')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Allergy
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedPatient.medicalHistory?.allergies?.map((allergy: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-lg">{allergy.name}</span>
                              <Badge variant={allergy.severity === 'Severe' ? 'destructive' : allergy.severity === 'Moderate' ? 'default' : 'secondary'}>
                                {allergy.severity}
                              </Badge>
                            </div>
                            {allergy.reaction && (
                              <p className="text-sm text-gray-700">Reaction: {allergy.reaction}</p>
                            )}
                            {allergy.discoveredDate && (
                              <p className="text-sm text-gray-600">
                                Discovered: {new Date(allergy.discoveredDate).toLocaleDateString()}
                              </p>
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
                      </div>
                    )) || <p className="text-gray-500 text-center py-8">No allergies recorded</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Medications</CardTitle>
                  <CardDescription>Manage current prescriptions and medications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Active Medications</h4>
                    <Button size="sm" onClick={() => openModal('medication', 'Add Medication')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedPatient.medicalHistory?.medications?.map((medication: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-lg">{medication.name}</span>
                              <Badge variant={medication.status === 'Active' ? 'default' : 'secondary'}>
                                {medication.status || 'Active'}
                              </Badge>
                            </div>
                            {medication.dosage && (
                              <p className="text-sm text-gray-700">Dosage: {medication.dosage}</p>
                            )}
                            {medication.frequency && (
                              <p className="text-sm text-gray-700">Frequency: {medication.frequency}</p>
                            )}
                            {medication.prescribedBy && (
                              <p className="text-sm text-gray-600">Prescribed by: {medication.prescribedBy}</p>
                            )}
                            {medication.startDate && (
                              <p className="text-sm text-gray-600">
                                Started: {new Date(medication.startDate).toLocaleDateString()}
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
                                  medications: prev.medicalHistory?.medications?.filter((_: any, i: number) => i !== index) || []
                                }
                              }))
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )) || <p className="text-gray-500 text-center py-8">No medications recorded</p>}
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
                    <Button size="sm" onClick={() => openModal('immunization', 'Add Immunization')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Immunization
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedPatient.medicalHistory?.immunizations?.map((immunization: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-lg">{immunization.name}</span>
                              <Badge variant="default">{immunization.status || 'Complete'}</Badge>
                            </div>
                            {immunization.dateAdministered && (
                              <p className="text-sm text-gray-600">
                                Administered: {new Date(immunization.dateAdministered).toLocaleDateString()}
                              </p>
                            )}
                            {immunization.manufacturer && (
                              <p className="text-sm text-gray-700">Manufacturer: {immunization.manufacturer}</p>
                            )}
                            {immunization.lotNumber && (
                              <p className="text-sm text-gray-700">Lot Number: {immunization.lotNumber}</p>
                            )}
                            {immunization.administeredBy && (
                              <p className="text-sm text-gray-600">Administered by: {immunization.administeredBy}</p>
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
                      </div>
                    )) || <p className="text-gray-500 text-center py-8">No immunizations recorded</p>}
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
                    <Button size="sm" onClick={() => openModal('procedure', 'Add Medical Procedure')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Procedure
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedPatient.medicalHistory?.procedures?.map((procedure: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-lg">{procedure.name}</span>
                              <Badge variant={procedure.status === 'Completed' ? 'default' : procedure.status === 'Scheduled' ? 'secondary' : 'outline'}>
                                {procedure.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              {procedure.date && (
                                <p>Date: {new Date(procedure.date).toLocaleDateString()}</p>
                              )}
                              {procedure.surgeon && (
                                <p>Surgeon: {procedure.surgeon}</p>
                              )}
                              {procedure.hospital && (
                                <p>Facility: {procedure.hospital}</p>
                              )}
                            </div>
                            {procedure.description && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Description:</p>
                                <p className="text-sm text-gray-600">{procedure.description}</p>
                              </div>
                            )}
                            {procedure.outcome && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Outcome/Notes:</p>
                                <p className="text-sm text-gray-600">{procedure.outcome}</p>
                              </div>
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
                      </div>
                    )) || <p className="text-gray-500 text-center py-8">No procedures recorded</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="labs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Laboratory Results</CardTitle>
                  <CardDescription>Manage lab test results and diagnostic reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Lab Results History</h4>
                    <Button size="sm" onClick={() => openModal('lab', 'Add Lab Result')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lab Result
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedPatient.medicalHistory?.labResults?.map((lab: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-lg">{lab.testName}</span>
                              <Badge 
                                variant={lab.status === 'Critical' ? 'destructive' : lab.status === 'Abnormal' ? 'secondary' : 'default'}
                              >
                                {lab.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              {lab.date && (
                                <p>Date: {new Date(lab.date).toLocaleDateString()}</p>
                              )}
                              {lab.orderedBy && (
                                <p>Ordered by: {lab.orderedBy}</p>
                              )}
                            </div>
                            {lab.results && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Results:</p>
                                <p className="text-sm text-gray-900 font-medium">{lab.results}</p>
                              </div>
                            )}
                            {lab.referenceRange && (
                              <div className="mt-1">
                                <p className="text-sm text-gray-600">Reference Range: {lab.referenceRange}</p>
                              </div>
                            )}
                            {lab.notes && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Notes:</p>
                                <p className="text-sm text-gray-600">{lab.notes}</p>
                              </div>
                            )}
                            {lab.attachments && lab.attachments.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Attached Files:</p>
                                <div className="space-y-2">
                                  {lab.attachments.map((file: any, fileIndex: number) => (
                                    <div
                                      key={fileIndex}
                                      className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                                        <span className="text-xs text-gray-500">
                                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => window.open(file.url, '_blank')}
                                          className="h-8 px-2 text-blue-600 hover:text-blue-700"
                                        >
                                          View
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = file.url;
                                            link.download = file.name;
                                            link.click();
                                          }}
                                          className="h-8 px-2 text-green-600 hover:text-green-700"
                                        >
                                          Download
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
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
                      </div>
                    )) || <p className="text-gray-500 text-center py-8">No lab results recorded</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Vital Signs Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Vital Signs</CardTitle>
                  <CardDescription>Record patient's vital signs and measurements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Recent Vital Signs</h4>
                    <Button size="sm" onClick={() => openModal('vitals', 'Add Vital Signs')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vital Signs
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editedPatient.medicalHistory?.vitalSigns?.map((vitals: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium">Vital Signs Record</span>
                              <Badge variant="outline">
                                {vitals.date ? new Date(vitals.date).toLocaleDateString() : 'No date'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                              {vitals.bloodPressure && (
                                <div>
                                  <span className="font-medium">BP:</span> {vitals.bloodPressure}
                                </div>
                              )}
                              {vitals.heartRate && (
                                <div>
                                  <span className="font-medium">HR:</span> {vitals.heartRate} BPM
                                </div>
                              )}
                              {vitals.temperature && (
                                <div>
                                  <span className="font-medium">Temp:</span> {vitals.temperature}
                                </div>
                              )}
                              {vitals.weight && (
                                <div>
                                  <span className="font-medium">Weight:</span> {vitals.weight}
                                </div>
                              )}
                              {vitals.height && (
                                <div>
                                  <span className="font-medium">Height:</span> {vitals.height}
                                </div>
                              )}
                            </div>
                            {vitals.recordedBy && (
                              <p className="text-xs text-gray-600 mt-1">Recorded by: {vitals.recordedBy}</p>
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
                                  vitalSigns: prev.medicalHistory?.vitalSigns?.filter((_: any, i: number) => i !== index) || []
                                }
                              }))
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )) || <p className="text-gray-500 text-center py-8">No vital signs recorded</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Add Record Modal */}
      <AddRecordModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
        type={modalType}
        title={modalTitle}
      />

      {/* Floating Save Button */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 shadow-lg h-12 px-6 rounded-full"
            size="lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
