"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, Users, Calendar, Clock, Activity, Download, Filter, RefreshCw } from "lucide-react"

export default function HospitalAnalytics() {
  const patientFlowData = [
    { month: "Jan", admissions: 245, discharges: 230, occupancy: 85 },
    { month: "Feb", admissions: 267, discharges: 255, occupancy: 88 },
    { month: "Mar", admissions: 289, discharges: 275, occupancy: 92 },
    { month: "Apr", admissions: 301, discharges: 290, occupancy: 89 },
    { month: "May", admissions: 278, discharges: 285, occupancy: 87 },
    { month: "Jun", admissions: 295, discharges: 288, occupancy: 90 },
  ]

  const departmentData = [
    { name: "Emergency", patients: 1250, color: "#ef4444" },
    { name: "Cardiology", patients: 890, color: "#3b82f6" },
    { name: "Orthopedics", patients: 675, color: "#10b981" },
    { name: "Pediatrics", patients: 540, color: "#f59e0b" },
    { name: "Surgery", patients: 420, color: "#8b5cf6" },
    { name: "Other", patients: 325, color: "#6b7280" },
  ]

  const waitTimeData = [
    { hour: "6AM", emergency: 15, outpatient: 8, surgery: 45 },
    { hour: "8AM", emergency: 25, outpatient: 12, surgery: 60 },
    { hour: "10AM", emergency: 35, outpatient: 18, surgery: 75 },
    { hour: "12PM", emergency: 45, outpatient: 25, surgery: 90 },
    { hour: "2PM", emergency: 40, outpatient: 22, surgery: 85 },
    { hour: "4PM", emergency: 30, outpatient: 15, surgery: 70 },
    { hour: "6PM", emergency: 20, outpatient: 10, surgery: 55 },
    { hour: "8PM", emergency: 18, outpatient: 8, surgery: 50 },
  ]

  const resourceUtilizationData = [
    { resource: "ICU Beds", used: 45, total: 50, percentage: 90 },
    { resource: "OR Rooms", used: 12, total: 15, percentage: 80 },
    { resource: "Ventilators", used: 28, total: 35, percentage: 80 },
    { resource: "CT Scanners", used: 3, total: 4, percentage: 75 },
    { resource: "MRI Machines", used: 2, total: 3, percentage: 67 },
  ]

  const kpiData = [
    {
      title: "Total Patients",
      value: "4,125",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Avg Length of Stay",
      value: "3.2 days",
      change: "-0.3 days",
      trend: "down",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Bed Occupancy",
      value: "87%",
      change: "+2.1%",
      trend: "up",
      icon: Activity,
      color: "text-orange-600",
    },
    {
      title: "Avg Wait Time",
      value: "28 min",
      change: "-5 min",
      trend: "down",
      icon: Clock,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Hospital performance metrics and insights</p>
        </div>
        <div className="flex space-x-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <div className="flex items-center mt-1">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${kpi.color}`}>
                  <kpi.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patient Flow</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Admissions vs Discharges</CardTitle>
                <CardDescription>Monthly comparison of patient flow</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={patientFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="admissions" fill="#3b82f6" name="Admissions" />
                    <Bar dataKey="discharges" fill="#10b981" name="Discharges" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bed Occupancy Rate</CardTitle>
                <CardDescription>Monthly occupancy percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={patientFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="occupancy" stroke="#f59e0b" fill="#fef3c7" name="Occupancy %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Flow Analysis</CardTitle>
              <CardDescription>Detailed patient admission and discharge patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={patientFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="admissions" stroke="#3b82f6" strokeWidth={3} name="Admissions" />
                  <Line type="monotone" dataKey="discharges" stroke="#10b981" strokeWidth={3} name="Discharges" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Distribution by Department</CardTitle>
                <CardDescription>Current patient load across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="patients"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Statistics</CardTitle>
                <CardDescription>Patient count by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentData.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dept.color }} />
                        <span className="font-medium">{dept.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{dept.patients}</span>
                        <span className="text-sm text-gray-500 ml-1">patients</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization</CardTitle>
              <CardDescription>Current usage of hospital resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {resourceUtilizationData.map((resource, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{resource.resource}</span>
                      <span className="text-sm text-gray-600">
                        {resource.used}/{resource.total} ({resource.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          resource.percentage >= 90
                            ? "bg-red-500"
                            : resource.percentage >= 80
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${resource.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Average Wait Times by Hour</CardTitle>
              <CardDescription>Wait times across different services throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={waitTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="emergency" stroke="#ef4444" strokeWidth={2} name="Emergency (min)" />
                  <Line type="monotone" dataKey="outpatient" stroke="#3b82f6" strokeWidth={2} name="Outpatient (min)" />
                  <Line type="monotone" dataKey="surgery" stroke="#10b981" strokeWidth={2} name="Surgery (min)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
