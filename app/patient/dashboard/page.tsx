import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Calendar, FileText, Activity, AlertTriangle, CheckCircle, Clock, QrCode } from "lucide-react"

export default function PatientDashboard() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, Sarah!</h1>
            <p className="text-blue-100">Your health summary for today</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-2">
              <QrCode className="w-8 h-8" />
            </div>
            <p className="text-sm text-blue-100">Your Health ID</p>
            <p className="text-xs font-mono">HP-2024-789123</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Health Score</p>
                <p className="text-xl font-bold text-green-600">85/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Checkup</p>
                <p className="text-sm font-semibold">Dec 15, 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Alerts</p>
                <p className="text-xl font-bold text-orange-600">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Visit</p>
                <p className="text-sm font-semibold">Jan 20, 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Blood pressure reading recorded</p>
                    <p className="text-sm text-gray-600">120/80 mmHg - Normal range</p>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Medication reminder completed</p>
                    <p className="text-sm text-gray-600">Metformin 500mg taken</p>
                  </div>
                  <span className="text-sm text-gray-500">8 hours ago</span>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Lab results available</p>
                    <p className="text-sm text-gray-600">HbA1c test results ready for review</p>
                  </div>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Alerts & Upcoming */}
        <div className="space-y-6">
          {/* Health Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span>Health Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-medium text-orange-800">Medication Reminder</p>
                  <p className="text-sm text-orange-600">Take evening medication in 2 hours</p>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium text-red-800">Blood Sugar Check</p>
                  <p className="text-sm text-red-600">Overdue by 3 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Upcoming</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Dr. James Wilson</p>
                    <p className="text-sm text-gray-600">Cardiology Checkup</p>
                    <p className="text-sm text-gray-500">Jan 20, 2025 at 2:00 PM</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Lab Work</p>
                    <p className="text-sm text-gray-600">Quarterly blood panel</p>
                    <p className="text-sm text-gray-500">Jan 25, 2025 at 9:00 AM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Current Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Current Health Conditions</CardTitle>
          <CardDescription>Your active medical conditions and management status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Hypertension</h3>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Monitoring
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">Last reading: 125/82 mmHg</p>
              <p className="text-xs text-gray-500">Managed with Lisinopril 10mg daily</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Type 2 Diabetes</h3>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Controlled
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">Last HbA1c: 6.8%</p>
              <p className="text-xs text-gray-500">Managed with Metformin 500mg twice daily</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">High Cholesterol</h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Improving
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">Last LDL: 145 mg/dL</p>
              <p className="text-xs text-gray-500">Managed with Atorvastatin 20mg daily</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <Heart className="w-6 h-6" />
              <span className="text-sm">Log Vitals</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Book Appointment</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <FileText className="w-6 h-6" />
              <span className="text-sm">View Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <QrCode className="w-6 h-6" />
              <span className="text-sm">Share Health ID</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
