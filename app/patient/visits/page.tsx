import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, FileText, Plus } from "lucide-react"

export default function PatientVisits() {
  const upcomingVisits = [
    {
      id: 1,
      doctor: "Dr. James Wilson",
      specialty: "Cardiology",
      date: "2025-01-20",
      time: "2:00 PM",
      location: "Heart Center, Room 205",
      type: "Follow-up",
      status: "confirmed",
    },
    {
      id: 2,
      doctor: "Dr. Sarah Martinez",
      specialty: "Endocrinology",
      date: "2025-01-25",
      time: "9:00 AM",
      location: "Diabetes Clinic, Room 102",
      type: "Lab Review",
      status: "confirmed",
    },
  ]

  const pastVisits = [
    {
      id: 3,
      doctor: "Dr. James Wilson",
      specialty: "Cardiology",
      date: "2024-12-15",
      time: "2:30 PM",
      location: "Heart Center, Room 205",
      type: "Routine Checkup",
      status: "completed",
      notes: "Blood pressure stable, continue current medication",
    },
    {
      id: 4,
      doctor: "Dr. Sarah Martinez",
      specialty: "Endocrinology",
      date: "2024-11-20",
      time: "10:00 AM",
      location: "Diabetes Clinic, Room 102",
      type: "Quarterly Review",
      status: "completed",
      notes: "HbA1c improved to 6.8%, excellent progress",
    },
    {
      id: 5,
      doctor: "Dr. Michael Brown",
      specialty: "General Practice",
      date: "2024-10-10",
      time: "11:30 AM",
      location: "Main Clinic, Room 301",
      type: "Annual Physical",
      status: "completed",
      notes: "Overall health good, recommended lifestyle modifications",
    },
  ]

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

      {/* Upcoming Visits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Upcoming Visits</span>
          </CardTitle>
          <CardDescription>Your scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingVisits.map((visit) => (
              <div key={visit.id} className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{visit.doctor}</h3>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {visit.specialty}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{new Date(visit.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{visit.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{visit.location}</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <Badge className="bg-green-100 text-green-800">{visit.type}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Badge className="bg-green-600 text-white">{visit.status.toUpperCase()}</Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
