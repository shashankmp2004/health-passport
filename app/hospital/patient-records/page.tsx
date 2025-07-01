import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Search, Filter, Download, Eye, Edit, Calendar, User, Activity } from "lucide-react"

export default function PatientRecords() {
  const patientRecords = [
    {
      id: "HP-2024-789123",
      name: "Sarah Johnson",
      age: 39,
      lastVisit: "2024-12-15",
      recordsCount: 24,
      status: "Active",
      riskLevel: "Moderate",
      conditions: ["Hypertension", "Type 2 Diabetes"],
      lastUpdate: "2024-12-15 14:30",
    },
    {
      id: "HP-2024-654789",
      name: "Michael Chen",
      age: 45,
      lastVisit: "2024-12-20",
      recordsCount: 18,
      status: "Active",
      riskLevel: "Low",
      conditions: ["Asthma"],
      lastUpdate: "2024-12-20 10:15",
    },
    {
      id: "HP-2024-321456",
      name: "Emma Williams",
      age: 28,
      lastVisit: "2024-12-18",
      recordsCount: 12,
      status: "Active",
      riskLevel: "Low",
      conditions: ["Migraine"],
      lastUpdate: "2024-12-18 16:45",
    },
    {
      id: "HP-2024-987654",
      name: "Robert Davis",
      age: 62,
      lastVisit: "2024-11-30",
      recordsCount: 45,
      status: "Inactive",
      riskLevel: "High",
      conditions: ["Heart Disease", "Diabetes", "Hypertension"],
      lastUpdate: "2024-11-30 09:20",
    },
  ]

  const recentActivity = [
    {
      patientId: "HP-2024-789123",
      patientName: "Sarah Johnson",
      action: "Lab results uploaded",
      timestamp: "2024-12-30 14:30",
      type: "lab",
    },
    {
      patientId: "HP-2024-654789",
      patientName: "Michael Chen",
      action: "Prescription updated",
      timestamp: "2024-12-30 13:15",
      type: "prescription",
    },
    {
      patientId: "HP-2024-321456",
      patientName: "Emma Williams",
      action: "Visit notes added",
      timestamp: "2024-12-30 12:45",
      type: "visit",
    },
  ]

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patient Records</h1>
          <p className="text-gray-600">Comprehensive patient record management and access</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Records
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FileText className="w-4 h-4 mr-2" />
            New Record
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search by patient name, ID, or condition..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all-records" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-records">All Records</TabsTrigger>
          <TabsTrigger value="active">Active Patients</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="high-risk">High Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="all-records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>All Patient Records</span>
              </CardTitle>
              <CardDescription>Complete list of patient records in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientRecords.map((record) => (
                  <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{record.name}</h3>
                            <Badge variant="outline">{record.age} years</Badge>
                            <Badge
                              className={
                                record.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }
                            >
                              {record.status}
                            </Badge>
                            <Badge
                              className={
                                record.riskLevel === "Low"
                                  ? "bg-green-100 text-green-800"
                                  : record.riskLevel === "Moderate"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {record.riskLevel} Risk
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                            <div>
                              <span className="font-medium">Patient ID:</span> {record.id}
                            </div>
                            <div>
                              <span className="font-medium">Last Visit:</span>{" "}
                              {new Date(record.lastVisit).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Records:</span> {record.recordsCount} documents
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-700">Conditions:</span>
                            <div className="flex space-x-1">
                              {record.conditions.map((condition, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="text-xs text-gray-500">Last updated: {record.lastUpdate}</div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span>Active Patients</span>
              </CardTitle>
              <CardDescription>Patients with recent activity or ongoing treatment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientRecords
                  .filter((record) => record.status === "Active")
                  .map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-green-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-lg">{record.name}</h3>
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                              <div>
                                <span className="font-medium">Patient ID:</span> {record.id}
                              </div>
                              <div>
                                <span className="font-medium">Last Visit:</span>{" "}
                                {new Date(record.lastVisit).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Records:</span> {record.recordsCount} documents
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700">Conditions:</span>
                              <div className="flex space-x-1">
                                {record.conditions.map((condition, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {condition}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Latest updates and changes to patient records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === "lab"
                              ? "bg-blue-100"
                              : activity.type === "prescription"
                                ? "bg-green-100"
                                : "bg-purple-100"
                          }`}
                        >
                          <FileText
                            className={`w-5 h-5 ${
                              activity.type === "lab"
                                ? "text-blue-600"
                                : activity.type === "prescription"
                                  ? "text-green-600"
                                  : "text-purple-600"
                            }`}
                          />
                        </div>

                        <div>
                          <h3 className="font-medium">{activity.patientName}</h3>
                          <p className="text-sm text-gray-600">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.patientId}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">{activity.timestamp}</p>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high-risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-red-600" />
                <span>High Risk Patients</span>
              </CardTitle>
              <CardDescription>Patients requiring special attention and monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientRecords
                  .filter((record) => record.riskLevel === "High")
                  .map((record) => (
                    <div key={record.id} className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-red-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-lg">{record.name}</h3>
                              <Badge className="bg-red-600 text-white">High Risk</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                              <div>
                                <span className="font-medium">Patient ID:</span> {record.id}
                              </div>
                              <div>
                                <span className="font-medium">Last Visit:</span>{" "}
                                {new Date(record.lastVisit).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Records:</span> {record.recordsCount} documents
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700">Conditions:</span>
                              <div className="flex space-x-1">
                                {record.conditions.map((condition, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">
                                    {condition}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            <Eye className="w-4 h-4 mr-2" />
                            Priority View
                          </Button>
                          <Button variant="outline" size="sm" className="border-red-300 text-red-700 bg-transparent">
                            Alert Team
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{patientRecords.length}</p>
                <p className="text-sm text-gray-600">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {patientRecords.filter((r) => r.status === "Active").length}
                </p>
                <p className="text-sm text-gray-600">Active Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {patientRecords.filter((r) => r.riskLevel === "High").length}
                </p>
                <p className="text-sm text-gray-600">High Risk</p>
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
                <p className="text-2xl font-bold text-purple-600">{recentActivity.length}</p>
                <p className="text-sm text-gray-600">Recent Updates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
