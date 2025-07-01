"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Settings,
  Trash2,
  User,
  Activity,
  Heart,
  Zap,
} from "lucide-react"

export default function HospitalAlerts() {
  const [searchTerm, setSearchTerm] = useState("")
  const [alertSettings, setAlertSettings] = useState({
    criticalAlerts: true,
    emergencyAlerts: true,
    systemAlerts: true,
    patientAlerts: true,
    equipmentAlerts: true,
    staffAlerts: false,
  })

  const alerts = [
    {
      id: 1,
      type: "critical",
      title: "Patient Critical Condition",
      message: "Patient John Doe (Room 301) showing critical vital signs",
      timestamp: "2024-01-15 14:30",
      department: "ICU",
      priority: "high",
      status: "active",
      assignedTo: "Dr. Sarah Wilson",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-200",
    },
    {
      id: 2,
      type: "emergency",
      title: "Emergency Room Capacity",
      message: "Emergency room at 95% capacity - consider diverting patients",
      timestamp: "2024-01-15 14:15",
      department: "Emergency",
      priority: "high",
      status: "active",
      assignedTo: "Charge Nurse",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-200",
    },
    {
      id: 3,
      type: "equipment",
      title: "Ventilator Malfunction",
      message: "Ventilator #5 in ICU showing error codes - immediate attention required",
      timestamp: "2024-01-15 13:45",
      department: "ICU",
      priority: "high",
      status: "acknowledged",
      assignedTo: "Biomedical Team",
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50 border-orange-200",
    },
    {
      id: 4,
      type: "system",
      title: "Network Connectivity Issue",
      message: "Intermittent network issues in East Wing affecting patient monitoring",
      timestamp: "2024-01-15 13:20",
      department: "IT",
      priority: "medium",
      status: "in-progress",
      assignedTo: "IT Support",
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 border-yellow-200",
    },
    {
      id: 5,
      type: "patient",
      title: "Medication Due",
      message: "Patient Sarah Johnson (Room 205) - Pain medication due in 15 minutes",
      timestamp: "2024-01-15 13:00",
      department: "General Ward",
      priority: "medium",
      status: "active",
      assignedTo: "Nurse Station 2",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200",
    },
    {
      id: 6,
      type: "staff",
      title: "Staff Shortage Alert",
      message: "Night shift understaffed in Pediatrics - 2 nurses needed",
      timestamp: "2024-01-15 12:30",
      department: "Pediatrics",
      priority: "medium",
      status: "resolved",
      assignedTo: "HR Department",
      icon: User,
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200",
    },
  ]

  const alertStats = [
    { label: "Active Alerts", value: 4, color: "text-red-600" },
    { label: "Acknowledged", value: 1, color: "text-orange-600" },
    { label: "In Progress", value: 1, color: "text-yellow-600" },
    { label: "Resolved Today", value: 12, color: "text-green-600" },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800"
      case "acknowledged":
        return "bg-orange-100 text-orange-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alert Management</h1>
          <p className="text-gray-600">Monitor and manage hospital alerts and notifications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Bell className="w-4 h-4 mr-2" />
            Test Alert
          </Button>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {alertStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <Bell className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search alerts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select defaultValue="all-priority">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-priority">All Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all-dept">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-dept">All Departments</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="general">General Ward</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <div className="space-y-4">
            {filteredAlerts
              .filter((alert) => alert.status === "active")
              .map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${alert.bgColor}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full bg-white ${alert.color}`}>
                          <alert.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{alert.title}</h3>
                            <Badge className={getPriorityColor(alert.priority)}>{alert.priority.toUpperCase()}</Badge>
                            <Badge className={getStatusColor(alert.status)}>
                              {alert.status.replace("-", " ").toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-3">{alert.message}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Department:</span> {alert.department}
                            </div>
                            <div>
                              <span className="font-medium">Assigned to:</span> {alert.assignedTo}
                            </div>
                            <div>
                              <span className="font-medium">Time:</span> {alert.timestamp}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Acknowledge
                        </Button>
                        <Button variant="outline" size="sm">
                          Assign
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 bg-transparent">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="acknowledged" className="space-y-6">
          <div className="space-y-4">
            {filteredAlerts
              .filter((alert) => alert.status === "acknowledged")
              .map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${alert.bgColor}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full bg-white ${alert.color}`}>
                          <alert.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{alert.title}</h3>
                            <Badge className={getPriorityColor(alert.priority)}>{alert.priority.toUpperCase()}</Badge>
                            <Badge className={getStatusColor(alert.status)}>
                              {alert.status.replace("-", " ").toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-3">{alert.message}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Department:</span> {alert.department}
                            </div>
                            <div>
                              <span className="font-medium">Assigned to:</span> {alert.assignedTo}
                            </div>
                            <div>
                              <span className="font-medium">Time:</span> {alert.timestamp}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          Mark In Progress
                        </Button>
                        <Button variant="outline" size="sm" className="text-green-600 bg-transparent">
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-6">
          <div className="space-y-4">
            {filteredAlerts
              .filter((alert) => alert.status === "resolved")
              .map((alert) => (
                <Card key={alert.id} className="opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 rounded-full bg-green-100 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{alert.title}</h3>
                            <Badge className="bg-green-100 text-green-800">RESOLVED</Badge>
                          </div>
                          <p className="text-gray-700 mb-3">{alert.message}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Department:</span> {alert.department}
                            </div>
                            <div>
                              <span className="font-medium">Resolved by:</span> {alert.assignedTo}
                            </div>
                            <div>
                              <span className="font-medium">Time:</span> {alert.timestamp}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Notification Settings</CardTitle>
              <CardDescription>Configure which types of alerts you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Critical Patient Alerts</p>
                    <p className="text-sm text-gray-600">Life-threatening conditions and emergencies</p>
                  </div>
                  <Switch
                    checked={alertSettings.criticalAlerts}
                    onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, criticalAlerts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Emergency Department Alerts</p>
                    <p className="text-sm text-gray-600">Capacity, wait times, and urgent situations</p>
                  </div>
                  <Switch
                    checked={alertSettings.emergencyAlerts}
                    onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, emergencyAlerts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">System Alerts</p>
                    <p className="text-sm text-gray-600">IT issues, network problems, and system maintenance</p>
                  </div>
                  <Switch
                    checked={alertSettings.systemAlerts}
                    onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, systemAlerts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Patient Care Alerts</p>
                    <p className="text-sm text-gray-600">Medication reminders, appointment notifications</p>
                  </div>
                  <Switch
                    checked={alertSettings.patientAlerts}
                    onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, patientAlerts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Equipment Alerts</p>
                    <p className="text-sm text-gray-600">Medical equipment malfunctions and maintenance</p>
                  </div>
                  <Switch
                    checked={alertSettings.equipmentAlerts}
                    onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, equipmentAlerts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Staff Alerts</p>
                    <p className="text-sm text-gray-600">Staffing issues, schedule changes, and HR notifications</p>
                  </div>
                  <Switch
                    checked={alertSettings.staffAlerts}
                    onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, staffAlerts: checked }))}
                  />
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button className="bg-blue-600 hover:bg-blue-700">Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>View historical alert data and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Alert history and analytics</p>
                <p className="text-sm text-gray-500">Historical data and trend analysis coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
