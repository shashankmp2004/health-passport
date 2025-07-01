"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Plus, Search, Filter, MoreHorizontal, Phone, Mail, Clock, UserCheck, UserX, Edit } from "lucide-react"

export default function StaffManagement() {
  const [searchTerm, setSearchTerm] = useState("")

  const staff = [
    {
      id: 1,
      name: "Dr. Michael Chen",
      role: "Cardiologist",
      department: "Cardiology",
      email: "m.chen@hospital.com",
      phone: "+1 (555) 234-5678",
      status: "active",
      shift: "Day Shift",
      experience: "15 years",
      specialization: "Interventional Cardiology",
      avatar: "/placeholder.svg?height=40&width=40",
      schedule: "Mon-Fri 8AM-6PM",
      lastLogin: "2024-01-15 09:30 AM",
    },
    {
      id: 2,
      name: "Dr. Sarah Wilson",
      role: "Orthopedic Surgeon",
      department: "Orthopedics",
      email: "s.wilson@hospital.com",
      phone: "+1 (555) 345-6789",
      status: "active",
      shift: "Day Shift",
      experience: "12 years",
      specialization: "Joint Replacement",
      avatar: "/placeholder.svg?height=40&width=40",
      schedule: "Tue-Sat 7AM-5PM",
      lastLogin: "2024-01-15 08:15 AM",
    },
    {
      id: 3,
      name: "Nurse Jennifer Taylor",
      role: "Registered Nurse",
      department: "ICU",
      email: "j.taylor@hospital.com",
      phone: "+1 (555) 456-7890",
      status: "active",
      shift: "Night Shift",
      experience: "8 years",
      specialization: "Critical Care",
      avatar: "/placeholder.svg?height=40&width=40",
      schedule: "Mon-Wed-Fri 7PM-7AM",
      lastLogin: "2024-01-14 11:45 PM",
    },
    {
      id: 4,
      name: "Dr. James Miller",
      role: "Emergency Physician",
      department: "Emergency",
      email: "j.miller@hospital.com",
      phone: "+1 (555) 567-8901",
      status: "on-leave",
      shift: "Rotating",
      experience: "10 years",
      specialization: "Emergency Medicine",
      avatar: "/placeholder.svg?height=40&width=40",
      schedule: "Rotating 12-hour shifts",
      lastLogin: "2024-01-10 06:30 PM",
    },
    {
      id: 5,
      name: "Nurse Robert Davis",
      role: "Charge Nurse",
      department: "General Ward",
      email: "r.davis@hospital.com",
      phone: "+1 (555) 678-9012",
      status: "active",
      shift: "Day Shift",
      experience: "20 years",
      specialization: "General Medicine",
      avatar: "/placeholder.svg?height=40&width=40",
      schedule: "Mon-Fri 6AM-6PM",
      lastLogin: "2024-01-15 10:00 AM",
    },
    {
      id: 6,
      name: "Dr. Lisa Anderson",
      role: "Pediatrician",
      department: "Pediatrics",
      email: "l.anderson@hospital.com",
      phone: "+1 (555) 789-0123",
      status: "inactive",
      shift: "Day Shift",
      experience: "7 years",
      specialization: "Child Development",
      avatar: "/placeholder.svg?height=40&width=40",
      schedule: "Mon-Thu 9AM-5PM",
      lastLogin: "2024-01-05 02:15 PM",
    },
  ]

  const departments = [
    { name: "Cardiology", staff: 12, active: 11, onLeave: 1 },
    { name: "Emergency", staff: 25, active: 22, onLeave: 3 },
    { name: "ICU", staff: 18, active: 16, onLeave: 2 },
    { name: "Orthopedics", staff: 8, active: 7, onLeave: 1 },
    { name: "Pediatrics", staff: 10, active: 8, onLeave: 2 },
    { name: "General Ward", staff: 30, active: 28, onLeave: 2 },
  ]

  const shifts = [
    { name: "Day Shift", time: "6AM - 6PM", staff: 45, coverage: 95 },
    { name: "Night Shift", time: "6PM - 6AM", staff: 32, coverage: 85 },
    { name: "Weekend", time: "Sat-Sun", staff: 28, coverage: 90 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "on-leave":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <UserCheck className="w-4 h-4" />
      case "on-leave":
        return <Clock className="w-4 h-4" />
      case "inactive":
        return <UserX className="w-4 h-4" />
      default:
        return null
    }
  }

  const filteredStaff = staff.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="text-gray-600">Manage hospital staff, schedules, and departments</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>Enter details for the new staff member</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter last name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Add Staff</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="staff" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="staff">Staff Directory</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search staff members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select defaultValue="all-status">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-status">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all-dept">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-dept">All Departments</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Staff List */}
          <div className="grid gap-4">
            {filteredStaff.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{member.name}</h3>
                          <Badge className={getStatusColor(member.status)}>
                            {getStatusIcon(member.status)}
                            <span className="ml-1 capitalize">{member.status.replace("-", " ")}</span>
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Role:</span> {member.role}
                          </div>
                          <div>
                            <span className="font-medium">Department:</span> {member.department}
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {member.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {member.phone}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mt-2">
                          <div>
                            <span className="font-medium">Experience:</span> {member.experience}
                          </div>
                          <div>
                            <span className="font-medium">Shift:</span> {member.shift}
                          </div>
                          <div>
                            <span className="font-medium">Last Login:</span> {member.lastLogin}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
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

        <TabsContent value="departments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{dept.name}</span>
                    <Badge className="bg-blue-100 text-blue-800">{dept.staff} staff</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Staff</span>
                      <span className="font-semibold text-green-600">{dept.active}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">On Leave</span>
                      <span className="font-semibold text-yellow-600">{dept.onLeave}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(dept.active / dept.staff) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Staffing Level</span>
                      <span>{Math.round((dept.active / dept.staff) * 100)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <div className="grid gap-6">
            {shifts.map((shift, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>{shift.name}</span>
                    </div>
                    <Badge
                      className={`${shift.coverage >= 90 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {shift.coverage}% Coverage
                    </Badge>
                  </CardTitle>
                  <CardDescription>{shift.time}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Assigned Staff</p>
                      <p className="text-2xl font-bold">{shift.staff}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Schedule
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit Shifts
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Staff Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Staff</span>
                    <span className="font-semibold">103</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active</span>
                    <span className="font-semibold text-green-600">92</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">On Leave</span>
                    <span className="font-semibold text-yellow-600">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inactive</span>
                    <span className="font-semibold text-red-600">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Department Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">General Ward</span>
                    <span className="font-semibold">30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Emergency</span>
                    <span className="font-semibold">25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ICU</span>
                    <span className="font-semibold">18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cardiology</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Others</span>
                    <span className="font-semibold">18</span>
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
                    Export Staff List
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Generate Schedule
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Staff Performance
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Attendance Report
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
