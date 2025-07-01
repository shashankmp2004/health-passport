"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

export default function HospitalAppointments() {
  const [selectedDate, setSelectedDate] = useState("2024-01-15")
  const [searchTerm, setSearchTerm] = useState("")

  const appointments = [
    {
      id: 1,
      patientName: "Sarah Johnson",
      patientId: "P001234",
      time: "09:00 AM",
      duration: "30 min",
      department: "Cardiology",
      doctor: "Dr. Michael Chen",
      room: "Room 201",
      type: "Follow-up",
      status: "confirmed",
      phone: "+1 (555) 123-4567",
      notes: "Regular checkup for hypertension",
    },
    {
      id: 2,
      patientName: "Robert Davis",
      patientId: "P001235",
      time: "09:30 AM",
      duration: "45 min",
      department: "Orthopedics",
      doctor: "Dr. Sarah Wilson",
      room: "Room 305",
      type: "Consultation",
      status: "pending",
      phone: "+1 (555) 234-5678",
      notes: "Knee pain evaluation",
    },
    {
      id: 3,
      patientName: "Emily Brown",
      patientId: "P001236",
      time: "10:15 AM",
      duration: "60 min",
      department: "Surgery",
      doctor: "Dr. James Miller",
      room: "OR 3",
      type: "Pre-op",
      status: "confirmed",
      phone: "+1 (555) 345-6789",
      notes: "Pre-operative consultation for gallbladder surgery",
    },
    {
      id: 4,
      patientName: "Michael Wilson",
      patientId: "P001237",
      time: "11:00 AM",
      duration: "30 min",
      department: "Pediatrics",
      doctor: "Dr. Lisa Anderson",
      room: "Room 102",
      type: "Vaccination",
      status: "cancelled",
      phone: "+1 (555) 456-7890",
      notes: "Annual vaccination schedule",
    },
    {
      id: 5,
      patientName: "Jennifer Taylor",
      patientId: "P001238",
      time: "02:00 PM",
      duration: "30 min",
      department: "Dermatology",
      doctor: "Dr. David Lee",
      room: "Room 401",
      type: "Screening",
      status: "confirmed",
      phone: "+1 (555) 567-8901",
      notes: "Skin cancer screening",
    },
  ]

  const upcomingAppointments = [
    {
      date: "2024-01-16",
      count: 28,
      departments: ["Cardiology", "Orthopedics", "Surgery"],
    },
    {
      date: "2024-01-17",
      count: 32,
      departments: ["Emergency", "Pediatrics", "Neurology"],
    },
    {
      date: "2024-01-18",
      count: 25,
      departments: ["Oncology", "Radiology", "Cardiology"],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-gray-600">Manage hospital appointments and scheduling</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>Create a new appointment for a patient</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientSearch">Patient</Label>
                <Input id="patientSearch" placeholder="Search patient by name or ID" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate">Date</Label>
                  <Input id="appointmentDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointmentTime">Time</Label>
                  <Input id="appointmentTime" type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="dermatology">Dermatology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-chen">Dr. Michael Chen</SelectItem>
                    <SelectItem value="dr-wilson">Dr. Sarah Wilson</SelectItem>
                    <SelectItem value="dr-miller">Dr. James Miller</SelectItem>
                    <SelectItem value="dr-anderson">Dr. Lisa Anderson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Schedule</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all-dept">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-dept">All Departments</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
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

          {/* Today's Appointments */}
          <div className="grid gap-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-center">
                        <Clock className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-sm font-medium">{appointment.time}</span>
                        <span className="text-xs text-gray-500">{appointment.duration}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{appointment.patientName}</h3>
                          <Badge variant="outline" className="text-xs">
                            {appointment.patientId}
                          </Badge>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1 capitalize">{appointment.status}</span>
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {appointment.doctor}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {appointment.room}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {appointment.phone}
                          </div>
                          <div>
                            <Badge variant="outline" className="text-xs">
                              {appointment.type}
                            </Badge>
                          </div>
                        </div>
                        {appointment.notes && <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          <div className="grid gap-6">
            {upcomingAppointments.map((day, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span>
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">{day.count} appointments</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {day.departments.map((dept, deptIndex) => (
                      <Badge key={deptIndex} variant="outline">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Calendar</CardTitle>
              <CardDescription>Monthly view of all scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Calendar view coming soon</p>
                <p className="text-sm text-gray-500">Interactive calendar for appointment management</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Appointments</span>
                    <span className="font-semibold">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confirmed</span>
                    <span className="font-semibold text-green-600">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold text-yellow-600">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cancelled</span>
                    <span className="font-semibold text-red-600">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Department Load</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cardiology</span>
                    <span className="font-semibold">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Orthopedics</span>
                    <span className="font-semibold">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Surgery</span>
                    <span className="font-semibold">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pediatrics</span>
                    <span className="font-semibold">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dermatology</span>
                    <span className="font-semibold">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Export Today's Schedule
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Send Reminders
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
