"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"

export default function DebugPatientAccess() {
  const [patientId, setPatientId] = useState("HP-RT4W5-1IXYS")
  const [debugResult, setDebugResult] = useState<any>(null)
  const [hospitalRecords, setHospitalRecords] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const { data: session } = useSession()

  const checkPatientStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/debug/patient?patientId=${patientId}`)
      const result = await response.json()
      setDebugResult(result)
    } catch (error) {
      console.error('Debug error:', error)
      setDebugResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const checkHospitalRecords = async () => {
    try {
      const response = await fetch('/api/hospitals/patient-records')
      const result = await response.json()
      setHospitalRecords(result)
    } catch (error) {
      console.error('Hospital records error:', error)
      setHospitalRecords({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  useEffect(() => {
    if (session) {
      checkPatientStatus()
      checkHospitalRecords()
    }
  }, [session])

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Please log in to debug patient access.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Patient Access Issue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Current user: {session.user.email} ({session.user.role})</p>
          
          <div>
            <Label htmlFor="patientId">Patient ID to Debug</Label>
            <div className="flex space-x-2">
              <Input
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="HP-RT4W5-1IXYS"
              />
              <Button onClick={checkPatientStatus} disabled={loading}>
                {loading ? 'Checking...' : 'Debug Patient'}
              </Button>
            </div>
          </div>

          <Button onClick={checkHospitalRecords} variant="outline">
            Refresh Hospital Records
          </Button>
        </CardContent>
      </Card>

      {debugResult && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Debug Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {debugResult.debug && (
                <div>
                  <h4 className="font-semibold">Summary:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Patient exists: {debugResult.debug.patient ? '✅ Yes' : '❌ No'}</li>
                    <li>Notifications: {debugResult.debug.notifications}</li>
                    <li>Hospital records: {debugResult.debug.hospitalRecords}</li>
                    <li>Approved notifications: {debugResult.debug.approvedNotifications}</li>
                  </ul>
                </div>
              )}
              
              <details>
                <summary className="cursor-pointer font-semibold">Full Debug Data</summary>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto mt-2">
                  {JSON.stringify(debugResult, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}

      {hospitalRecords && (
        <Card>
          <CardHeader>
            <CardTitle>Hospital Patient Records API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hospitalRecords.data && (
                <div>
                  <h4 className="font-semibold">Summary:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Total patient records: {hospitalRecords.data.patientRecords?.length || 0}</li>
                    <li>Active patients: {hospitalRecords.data.statistics?.active || 0}</li>
                    <li>Recent activities: {hospitalRecords.data.recentActivity?.length || 0}</li>
                    {hospitalRecords.data.debug && (
                      <>
                        <li>Hospital records in DB: {hospitalRecords.data.debug.hospitalRecordsCount}</li>
                        <li>Patients found in DB: {hospitalRecords.data.debug.patientsFoundInDb}</li>
                      </>
                    )}
                  </ul>
                  
                  {hospitalRecords.data.patientRecords?.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium">Patient Records Found:</h5>
                      {hospitalRecords.data.patientRecords.map((record: any, index: number) => (
                        <div key={index} className="text-sm bg-gray-50 p-2 rounded mt-1">
                          <strong>{record.name}</strong> (ID: {record.healthPassportId})
                          <br />Status: {record.status}, Risk: {record.riskLevel}
                          <br />Last visit: {record.lastVisit ? new Date(record.lastVisit).toLocaleString() : 'None'}
                          {record.isOrphaned && <span className="text-orange-600"> [Orphaned Record]</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <details>
                <summary className="cursor-pointer font-semibold">Full Hospital Records Data</summary>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto mt-2">
                  {JSON.stringify(hospitalRecords, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
