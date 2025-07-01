"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import {
  Server,
  Database,
  Wifi,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Download,
} from "lucide-react"

export default function SystemHealth() {
  const systemMetrics = [
    {
      name: "Server Uptime",
      value: "99.9%",
      status: "healthy",
      icon: Server,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Database Performance",
      value: "95%",
      status: "healthy",
      icon: Database,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Network Connectivity",
      value: "98.5%",
      status: "healthy",
      icon: Wifi,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Security Status",
      value: "Secure",
      status: "healthy",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ]

  const performanceData = [
    { time: "00:00", cpu: 45, memory: 62, disk: 78, network: 34 },
    { time: "04:00", cpu: 52, memory: 68, disk: 82, network: 41 },
    { time: "08:00", cpu: 78, memory: 85, disk: 88, network: 67 },
    { time: "12:00", cpu: 85, memory: 92, disk: 91, network: 78 },
    { time: "16:00", cpu: 82, memory: 88, disk: 89, network: 72 },
    { time: "20:00", cpu: 65, memory: 75, disk: 85, network: 55 },
  ]

  const uptimeData = [
    { date: "Jan 1", uptime: 99.9 },
    { date: "Jan 2", uptime: 99.8 },
    { date: "Jan 3", uptime: 100 },
    { date: "Jan 4", uptime: 99.7 },
    { date: "Jan 5", uptime: 99.9 },
    { date: "Jan 6", uptime: 100 },
    { date: "Jan 7", uptime: 99.8 },
  ]

  const services = [
    {
      name: "Patient Management System",
      status: "running",
      uptime: "99.9%",
      lastCheck: "2 minutes ago",
      responseTime: "120ms",
    },
    {
      name: "Electronic Health Records",
      status: "running",
      uptime: "99.8%",
      lastCheck: "1 minute ago",
      responseTime: "95ms",
    },
    {
      name: "Appointment Scheduler",
      status: "running",
      uptime: "100%",
      lastCheck: "30 seconds ago",
      responseTime: "85ms",
    },
    {
      name: "Billing System",
      status: "warning",
      uptime: "98.5%",
      lastCheck: "5 minutes ago",
      responseTime: "250ms",
    },
    {
      name: "Laboratory Information System",
      status: "running",
      uptime: "99.7%",
      lastCheck: "1 minute ago",
      responseTime: "110ms",
    },
    {
      name: "Pharmacy Management",
      status: "running",
      uptime: "99.9%",
      lastCheck: "2 minutes ago",
      responseTime: "130ms",
    },
  ]

  const alerts = [
    {
      id: 1,
      type: "warning",
      message: "High CPU usage detected on Server 2",
      timestamp: "2024-01-15 14:30",
      severity: "medium",
    },
    {
      id: 2,
      type: "info",
      message: "Scheduled maintenance completed successfully",
      timestamp: "2024-01-15 13:00",
      severity: "low",
    },
    {
      id: 3,
      type: "warning",
      message: "Database backup took longer than usual",
      timestamp: "2024-01-15 12:15",
      severity: "medium",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle className="w-4 h-4" />
      case "warning":
        return <AlertTriangle className="w-4 h-4" />
      case "error":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Health Monitor</h1>
          <p className="text-gray-600">Monitor hospital IT infrastructure and system performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric, index) => (
          <Card key={index} className={metric.bgColor}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
                <div className={`p-3 rounded-full bg-white ${metric.color}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Uptime (Last 7 Days)</CardTitle>
                <CardDescription>Daily uptime percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={uptimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[99, 100]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="uptime"
                      stroke="#10b981"
                      fill="#d1fae5"
                      name="Uptime %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>Current system resource utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Disk Usage</span>
                    <span>82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Network Usage</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics (Last 24 Hours)</CardTitle>
              <CardDescription>System performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="CPU %"
                  />
                  <Line
                    type="monotone"
                    dataKey="memory"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Memory %"
                  />
                  <Line
                    type="monotone"
                    dataKey="disk"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Disk %"
                  />
                  <Line
                    type="monotone"
                    dataKey="network"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Network %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid gap-4">
            {services.map((service, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                        {getStatusIcon(service.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-gray-600">
                          Last checked: {service.lastCheck} • Response time: {service.responseTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">Uptime: {service.uptime}</p>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent system notifications and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-full ${
                      alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {alert.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-600">{alert.timestamp}</p>
                    </div>
                    <Badge variant={alert.severity === 'medium' ? 'destructive' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>Upcoming and recent maintenance activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Database Backup</h3>
                      <p className="text-sm text-gray-600">Scheduled: Daily at 2:00 AM</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Security Updates</h3>
                      <p className="text-sm text-gray-600">Scheduled: Weekly on Sundays</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Server Maintenance</h3>
                      <p className="text-sm text-gray-600">Scheduled: First Monday of each month</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
