"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, FileText, Plus } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PatientVisits() {
  const [loading, setLoading] = useState(true)
  const [visitsData, setVisitsData] = useState<any>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'patient') {
      router.push('/auth/patient/login')
      return
    }

    fetchVisits()
  }, [session, status, router])

  const fetchVisits = async () => {
    try {
      const response = await fetch('/api/patients/visits')
      if (response.ok) {
        const result = await response.json()
        setVisitsData(result.data)
      } else {
        console.error('Failed to fetch visits')
      }
    } catch (error) {
      console.error('Error fetching visits:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4 w-64"></div>
          <div className="h-4 bg-gray-300 rounded mb-6 w-96"></div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const pastVisits = visitsData?.pastVisits || []
  const upcomingVisits = visitsData?.upcomingVisits || []

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medical Visits</h1>
          <p className="text-gray-600">Manage your appointments and visit history</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Visit
        </Button>
      </div>

      {/* Past Visits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span>Visit History</span>
          </CardTitle>
          <CardDescription>Your completed appointments and visit records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastVisits.map((visit) => (
              <div key={visit.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{visit.doctor}</h3>
                      <Badge variant="outline">{visit.specialty}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(visit.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{visit.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{visit.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary">{visit.type}</Badge>
                      <Badge className="bg-gray-100 text-gray-800">{visit.status.toUpperCase()}</Badge>
                    </div>

                    {visit.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <strong>Notes:</strong> {visit.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" size="sm">
                      View Report
                    </Button>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
