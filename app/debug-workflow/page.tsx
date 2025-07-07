"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"

export default function DebugWorkflow() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [patientHealthPassportId, setPatientHealthPassportId] = useState("")
  const { data: session } = useSession()

  const addResult = (title: string, data: any, success: boolean = true) => {
    setResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      title,
      success,
      data: typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    }])
  }

  const testHospitalPatientRecords = async () => {
    setLoading(true)
    addResult("Testing Hospital Patient Records", "Starting test...")
    
    try {
      const response = await fetch('/api/hospitals/patient-records')
      const data = await response.json()
      
      if (response.ok) {
        addResult("Hospital Patient Records - SUCCESS", {
          totalRecords: data.data.patientRecords.length,
          statistics: data.data.statistics,
          debug: data.data.debug,
          records: data.data.patientRecords.map((r: any) => ({
            healthPassportId: r.healthPassportId,
            name: r.name,
            status: r.status,
            addedToHospital: r.addedToHospital,
            lastUpdate: r.lastUpdate
          }))
        })
      } else {
        addResult("Hospital Patient Records - FAILED", data, false)
      }
    } catch (error) {
      addResult("Hospital Patient Records - ERROR", error, false)
    }
    
    setLoading(false)
  }

  const testDebugHospitalRecords = async () => {
    setLoading(true)
    addResult("Testing Debug Hospital Records", "Starting test...")
    
    try {
      const response = await fetch('/api/debug/hospital-patient-records')
      const data = await response.json()
      
      if (response.ok) {
        addResult("Debug Hospital Records - SUCCESS", data.data)
      } else {
        addResult("Debug Hospital Records - FAILED", data, false)
      }
    } catch (error) {
      addResult("Debug Hospital Records - ERROR", error, false)
    }
    
    setLoading(false)
  }

  const testAccessRequests = async () => {
    setLoading(true)
    addResult("Testing Access Requests", "Starting test...")
    
    try {
      const response = await fetch('/api/hospitals/access-requests')
      const data = await response.json()
      
      if (response.ok) {
        addResult("Access Requests - SUCCESS", {
          totalRequests: data.data.requests.length,
          counts: data.data.counts,
          requests: data.data.requests.map((r: any) => ({
            id: r.id,
            patientHealthPassportId: r.patientHealthPassportId,
            status: r.status,
            requestedAt: r.requestedAt,
            respondedAt: r.respondedAt
          }))
        })
      } else {
        addResult("Access Requests - FAILED", data, false)
      }
    } catch (error) {
      addResult("Access Requests - ERROR", error, false)
    }
    
    setLoading(false)
  }

  const testSendAccessRequest = async () => {
    if (!patientHealthPassportId.trim()) {
      addResult("Send Access Request - ERROR", "Please enter a patient health passport ID", false)
      return
    }

    setLoading(true)
    addResult("Testing Send Access Request", `Requesting access for patient: ${patientHealthPassportId}`)
    
    try {
      const response = await fetch('/api/hospitals/request-patient-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientHealthPassportId: patientHealthPassportId.trim(),
          requestReason: 'Testing workflow from debug page'
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addResult("Send Access Request - SUCCESS", data)
      } else {
        addResult("Send Access Request - FAILED", data, false)
      }
    } catch (error) {
      addResult("Send Access Request - ERROR", error, false)
    }
    
    setLoading(false)
  }

  const runFullTest = async () => {
    setResults([])
    addResult("Full Workflow Test", "Starting comprehensive test...")
    
    await testHospitalPatientRecords()
    await testDebugHospitalRecords()
    await testAccessRequests()
    
    addResult("Full Test Complete", "Check results above")
  }

  const clearResults = () => {
    setResults([])
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Please log in to debug the workflow.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hospital-Patient Approval Workflow Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Badge variant={session.user.role === 'hospital' ? 'default' : 'secondary'}>
              Role: {session.user.role}
            </Badge>
            <Badge variant="outline">
              ID: {session.user.id}
            </Badge>
            <Badge variant="outline">
              Email: {session.user.email}
            </Badge>
          </div>
          
          <p>This page helps debug the hospital-patient access request workflow.</p>
        </CardContent>
      </Card>

      {session.user.role === 'hospital' && (
        <Card>
          <CardHeader>
            <CardTitle>Hospital Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={testHospitalPatientRecords}
                disabled={loading}
                variant="outline"
              >
                Test Patient Records
              </Button>
              <Button 
                onClick={testDebugHospitalRecords}
                disabled={loading}
                variant="outline"
              >
                Test Debug Info
              </Button>
              <Button 
                onClick={testAccessRequests}
                disabled={loading}
                variant="outline"
              >
                Test Access Requests
              </Button>
              <Button 
                onClick={runFullTest}
                disabled={loading}
              >
                Run Full Test
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient Health Passport ID</Label>
              <div className="flex space-x-2">
                <Input
                  id="patientId"
                  value={patientHealthPassportId}
                  onChange={(e) => setPatientHealthPassportId(e.target.value)}
                  placeholder="Enter patient health passport ID..."
                />
                <Button 
                  onClick={testSendAccessRequest}
                  disabled={loading || !patientHealthPassportId.trim()}
                >
                  Send Access Request
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Test Results</span>
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear Results
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-gray-500">No test results yet. Run a test above.</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-auto">
              {results.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.title}
                    </h4>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  <pre className="text-sm bg-white p-2 rounded border overflow-auto max-h-40">
                    {result.data}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>As Hospital:</strong> Send access request to a patient using their health passport ID</li>
            <li><strong>As Patient:</strong> Log in and check notifications page</li>
            <li><strong>As Patient:</strong> Approve the access request</li>
            <li><strong>As Hospital:</strong> Log back in and check patient records page</li>
            <li><strong>Verify:</strong> The approved patient should now appear in hospital patient records</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
