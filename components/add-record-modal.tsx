import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, X } from "lucide-react"

interface AddRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  type: 'condition' | 'allergy' | 'medication' | 'procedure' | 'lab' | 'immunization' | 'vitals'
  title: string
}

export function AddRecordModal({ isOpen, onClose, onSave, type, title }: AddRecordModalProps) {
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<any>({})
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({})
      setErrors({})
      setUploadedFiles([])
      setUploading(false)
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: any = {}
    
    // Check for name or testName depending on type
    const nameField = type === 'lab' ? 'testName' : 'name'
    if (!formData[nameField]) {
      newErrors.name = `${nameField === 'testName' ? 'Test name' : 'Name'} is required`
    }
    
    // Type-specific validations
    if (type === 'vitals') {
      if (!formData.bloodPressure && !formData.heartRate && !formData.temperature) {
        newErrors.general = 'At least one vital sign measurement is required'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      // Add default values based on type
      const dataWithDefaults = {
        ...formData,
        date: formData.date || new Date().toISOString(),
        id: Date.now().toString(), // Temporary ID for frontend
        attachments: uploadedFiles // Include uploaded files
      }
      
      onSave(dataWithDefaults)
      setFormData({})
      setErrors({})
      setUploadedFiles([])
      setUploading(false)
      onClose()
    }
  }

  const handleCancel = () => {
    setFormData({})
    setErrors({})
    setUploadedFiles([])
    setUploading(false)
    onClose()
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newUploadedFiles: any[] = []

    try {
      for (const file of Array.from(files)) {
        // Validate file type and size
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
        if (!validTypes.includes(file.type)) {
          setErrors((prev: any) => ({ ...prev, upload: 'Only PDF, JPG, and PNG files are allowed' }))
          continue
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          setErrors((prev: any) => ({ ...prev, upload: 'File size must be less than 10MB' }))
          continue
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'lab-report')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const result = await response.json()
        newUploadedFiles.push({
          id: Date.now() + Math.random(),
          name: file.name,
          url: result.secure_url,
          public_id: result.public_id,
          type: file.type,
          size: file.size
        })
      }

      setUploadedFiles((prev) => [...prev, ...newUploadedFiles])
      setErrors((prev: any) => ({ ...prev, upload: '' }))
    } catch (error) {
      console.error('Upload error:', error)
      setErrors((prev: any) => ({ ...prev, upload: 'Failed to upload file. Please try again.' }))
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const removeFile = async (fileToRemove: any) => {
    try {
      // Optionally delete from Cloudinary
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: fileToRemove.public_id })
      })
    } catch (error) {
      console.error('Error deleting file:', error)
    }

    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileToRemove.id))
  }

  const renderFields = () => {
    switch (type) {
      case 'condition':
        return (
          <div className="space-y-4">
            {errors.general && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{errors.general}</div>
            )}
            <div>
              <Label htmlFor="name">Condition Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter condition name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={formData.severity || 'Moderate'} onValueChange={(value) => updateField('severity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mild">Mild</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="diagnosedDate">Diagnosed Date</Label>
              <Input
                id="diagnosedDate"
                type="date"
                value={formData.diagnosedDate || ''}
                onChange={(e) => updateField('diagnosedDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status || 'Active'} onValueChange={(value) => updateField('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Additional notes"
                rows={3}
              />
            </div>
          </div>
        )

      case 'allergy':
        return (
          <div className="space-y-4">
            {errors.general && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{errors.general}</div>
            )}
            <div>
              <Label htmlFor="name">Allergy Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter allergy name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={formData.severity || 'Moderate'} onValueChange={(value) => updateField('severity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mild">Mild</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reaction">Typical Reaction</Label>
              <Input
                id="reaction"
                value={formData.reaction || ''}
                onChange={(e) => updateField('reaction', e.target.value)}
                placeholder="Describe typical reaction"
              />
            </div>
            <div>
              <Label htmlFor="discoveredDate">Discovered Date</Label>
              <Input
                id="discoveredDate"
                type="date"
                value={formData.discoveredDate || ''}
                onChange={(e) => updateField('discoveredDate', e.target.value)}
              />
            </div>
          </div>
        )

      case 'medication':
        return (
          <div className="space-y-4">
            {errors.general && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{errors.general}</div>
            )}
            <div>
              <Label htmlFor="name">Medication Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter medication name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={formData.dosage || ''}
                  onChange={(e) => updateField('dosage', e.target.value)}
                  placeholder="e.g., 10mg"
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={formData.frequency || ''}
                  onChange={(e) => updateField('frequency', e.target.value)}
                  placeholder="e.g., Twice daily"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="prescribedBy">Prescribed By</Label>
              <Input
                id="prescribedBy"
                value={formData.prescribedBy || ''}
                onChange={(e) => updateField('prescribedBy', e.target.value)}
                placeholder="Prescribing doctor"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => updateField('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status || 'Active'} onValueChange={(value) => updateField('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Discontinued">Discontinued</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 'procedure':
        return (
          <div className="space-y-4">
            {errors.general && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{errors.general}</div>
            )}
            <div>
              <Label htmlFor="name">Procedure Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter procedure name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="surgeon">Surgeon/Physician</Label>
                <Input
                  id="surgeon"
                  value={formData.surgeon || ''}
                  onChange={(e) => updateField('surgeon', e.target.value)}
                  placeholder="Enter surgeon name"
                />
              </div>
              <div>
                <Label htmlFor="hospital">Facility</Label>
                <Input
                  id="hospital"
                  value={formData.hospital || ''}
                  onChange={(e) => updateField('hospital', e.target.value)}
                  placeholder="Enter hospital/facility"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date || ''}
                onChange={(e) => updateField('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status || 'Completed'} onValueChange={(value) => updateField('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Procedure description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="outcome">Outcome/Notes</Label>
              <Textarea
                id="outcome"
                value={formData.outcome || ''}
                onChange={(e) => updateField('outcome', e.target.value)}
                placeholder="Outcome and notes"
                rows={2}
              />
            </div>
          </div>
        )

      case 'lab':
        return (
          <div className="space-y-4">
            {errors.general && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{errors.general}</div>
            )}
            <div>
              <Label htmlFor="testName">Test Name *</Label>
              <Input
                id="testName"
                value={formData.testName || ''}
                onChange={(e) => updateField('testName', e.target.value)}
                placeholder="Enter test name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Test Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => updateField('date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="orderedBy">Ordered By</Label>
                <Input
                  id="orderedBy"
                  value={formData.orderedBy || ''}
                  onChange={(e) => updateField('orderedBy', e.target.value)}
                  placeholder="Ordering physician"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="results">Results</Label>
              <Textarea
                id="results"
                value={formData.results || ''}
                onChange={(e) => updateField('results', e.target.value)}
                placeholder="Enter test results"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="referenceRange">Reference Range</Label>
                <Input
                  id="referenceRange"
                  value={formData.referenceRange || ''}
                  onChange={(e) => updateField('referenceRange', e.target.value)}
                  placeholder="Normal range"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status || 'Normal'} onValueChange={(value) => updateField('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Abnormal">Abnormal</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Additional notes"
                rows={2}
              />
            </div>
            
            {/* File Upload Section for Lab Records */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Lab Report Files (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('lab-file-upload')?.click()}
                  disabled={uploading}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
                </Button>
              </div>
              
              <input
                id="lab-file-upload"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {errors.upload && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{errors.upload}</div>
              )}
              
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Uploaded Files:</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Supported formats: PDF, JPG, PNG. Maximum file size: 10MB per file.
              </p>
            </div>
          </div>
        )

      case 'immunization':
        return (
          <div className="space-y-4">
            {errors.general && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{errors.general}</div>
            )}
            <div>
              <Label htmlFor="name">Vaccine Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter vaccine name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateAdministered">Date Administered</Label>
                <Input
                  id="dateAdministered"
                  type="date"
                  value={formData.dateAdministered || ''}
                  onChange={(e) => updateField('dateAdministered', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="administeredBy">Administered By</Label>
                <Input
                  id="administeredBy"
                  value={formData.administeredBy || ''}
                  onChange={(e) => updateField('administeredBy', e.target.value)}
                  placeholder="Healthcare provider"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer || ''}
                  onChange={(e) => updateField('manufacturer', e.target.value)}
                  placeholder="Vaccine manufacturer"
                />
              </div>
              <div>
                <Label htmlFor="lotNumber">Lot Number</Label>
                <Input
                  id="lotNumber"
                  value={formData.lotNumber || ''}
                  onChange={(e) => updateField('lotNumber', e.target.value)}
                  placeholder="Lot number"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status || 'Complete'} onValueChange={(value) => updateField('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Complete">Complete</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'vitals':
        return (
          <div className="space-y-4">
            {errors.general && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{errors.general}</div>
            )}
            <div>
              <Label htmlFor="date">Date & Time</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date || ''}
                onChange={(e) => updateField('date', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bloodPressure">Blood Pressure</Label>
                <Input
                  id="bloodPressure"
                  value={formData.bloodPressure || ''}
                  onChange={(e) => updateField('bloodPressure', e.target.value)}
                  placeholder="e.g., 120/80"
                />
              </div>
              <div>
                <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
                <Input
                  id="heartRate"
                  type="number"
                  value={formData.heartRate || ''}
                  onChange={(e) => updateField('heartRate', e.target.value)}
                  placeholder="e.g., 72"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  value={formData.temperature || ''}
                  onChange={(e) => updateField('temperature', e.target.value)}
                  placeholder="e.g., 98.6°F or 37°C"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  value={formData.weight || ''}
                  onChange={(e) => updateField('weight', e.target.value)}
                  placeholder="e.g., 150 lbs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={formData.height || ''}
                  onChange={(e) => updateField('height', e.target.value)}
                  placeholder="e.g., 5'8&quot;"
                />
              </div>
              <div>
                <Label htmlFor="recordedBy">Recorded By</Label>
                <Input
                  id="recordedBy"
                  value={formData.recordedBy || ''}
                  onChange={(e) => updateField('recordedBy', e.target.value)}
                  placeholder="Healthcare provider"
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Fill in the details below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {renderFields()}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={(type !== 'vitals' && !formData.name && !formData.testName) || (type === 'vitals' && !formData.bloodPressure && !formData.heartRate && !formData.temperature)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
