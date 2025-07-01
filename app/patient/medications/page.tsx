import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pill, Clock, AlertCircle, CheckCircle, Plus, Calendar } from "lucide-react"

export default function PatientMedications() {
  const currentMedications = [
    {
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      prescribedBy: "Dr. James Wilson",
      startDate: "2020-03-15",
      indication: "Hypertension",
      nextDose: "8:00 AM",
      adherence: 95,
    },
    {
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      prescribedBy: "Dr. Sarah Martinez",
      startDate: "2019-08-22",
      indication: "Type 2 Diabetes",
      nextDose: "6:00 PM",
      adherence: 98,
    },
    {
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily (evening)",
      prescribedBy: "Dr. James Wilson",
      startDate: "2021-01-10",
      indication: "High Cholesterol",
      nextDose: "9:00 PM",
      adherence: 92,
    },
  ]

  const medicationHistory = [
    {
      name: "Hydrochlorothiazide",
      dosage: "25mg",
      frequency: "Once daily",
      prescribedBy: "Dr. James Wilson",
      startDate: "2020-01-15",
      endDate: "2020-03-15",
      reason: "Switched to Lisinopril for better BP control",
    },
    {
      name: "Glipizide",
      dosage: "5mg",
      frequency: "Twice daily",
      prescribedBy: "Dr. Sarah Martinez",
      startDate: "2019-06-10",
      endDate: "2019-08-22",
      reason: "Switched to Metformin due to hypoglycemia episodes",
    },
  ]

  const upcomingRefills = [
    {
      medication: "Lisinopril 10mg",
      daysLeft: 5,
      pharmacy: "CVS Pharmacy",
      refillsRemaining: 2,
    },
    {
      medication: "Metformin 500mg",
      daysLeft: 12,
      pharmacy: "Walgreens",
      refillsRemaining: 1,
    },
    {
      medication: "Atorvastatin 20mg",
      daysLeft: 8,
      pharmacy: "CVS Pharmacy",
      refillsRemaining: 3,
    },
  ]

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medications</h1>
          <p className="text-gray-600">Manage your current medications and track adherence</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Current Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5 text-blue-600" />
            <span>Current Medications</span>
          </CardTitle>
          <CardDescription>Your active prescriptions and dosing schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentMedications.map((medication, index) => (
              <div key={index} className="p-4 border rounded-lg bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{medication.name}</h3>
                    <p className="text-gray-600">
                      {medication.dosage} - {medication.frequency}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                    <Badge variant="outline">{medication.adherence}% adherence</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Prescribed by:</span>
                    <p className="text-gray-600">{medication.prescribedBy}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Started:</span>
                    <p className="text-gray-600">{new Date(medication.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Indication:</span>
                    <p className="text-gray-600">{medication.indication}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Next dose:</span>
                    <p className="text-blue-600 font-medium">{medication.nextDose}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${medication.adherence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">Adherence</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Mark Taken
                    </Button>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medication Reminders & Refills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span>Today's Reminders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Lisinopril 10mg</p>
                    <p className="text-sm text-gray-600">8:00 AM - Taken</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Metformin 500mg</p>
                    <p className="text-sm text-gray-600">8:00 AM - Taken</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Metformin 500mg</p>
                    <p className="text-sm text-gray-600">6:00 PM - Upcoming</p>
                  </div>
                </div>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  Mark Taken
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Atorvastatin 20mg</p>
                    <p className="text-sm text-gray-600">9:00 PM - Upcoming</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refill Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>Refill Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingRefills.map((refill, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg ${
                    refill.daysLeft <= 7 ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{refill.medication}</p>
                      <p className="text-sm text-gray-600">{refill.pharmacy}</p>
                      <p className="text-sm text-gray-600">{refill.refillsRemaining} refills remaining</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${refill.daysLeft <= 7 ? "text-red-600" : "text-yellow-600"}`}>
                        {refill.daysLeft} days left
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className={
                          refill.daysLeft <= 7 ? "border-red-300 text-red-700" : "border-yellow-300 text-yellow-700"
                        }
                      >
                        Request Refill
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medication History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span>Medication History</span>
          </CardTitle>
          <CardDescription>Previously prescribed medications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medicationHistory.map((medication, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{medication.name}</h3>
                    <p className="text-gray-600">
                      {medication.dosage} - {medication.frequency}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-gray-200 text-gray-800">
                    Discontinued
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                  <div>
                    <span className="font-medium">Prescribed by:</span> {medication.prescribedBy}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {new Date(medication.startDate).toLocaleDateString()}{" "}
                    - {new Date(medication.endDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-700">Reason for discontinuation:</span>
                  <p className="text-gray-600">{medication.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
