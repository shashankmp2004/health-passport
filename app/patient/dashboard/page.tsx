'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Calendar, FileText, Activity, AlertTriangle, CheckCircle, QrCode } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function PatientDashboard() {
  const [open, setOpen] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Custom Welcome Card - Top Section */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div
            className="relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-6 flex items-center justify-between cursor-pointer"
            onClick={() => setOpen(true)}
          >
            {/* Decorative blurred circles */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-16 right-0 w-64 h-32 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="z-10 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back, Sarah!</h1>
              <p className="text-blue-100 text-base md:text-lg">Your health summary for today</p>
            </div>
            <div className="z-10 flex flex-col items-center ml-8">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-xl flex items-center justify-center shadow-lg mb-2">
                <QrCode className="w-10 h-10 md:w-12 md:h-12 text-gray-800" />
              </div>
              <p className="text-xs text-blue-100">Your Health ID</p>
              <p className="text-xs font-mono tracking-wide">HP-2024-789123</p>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-lg p-0 bg-transparent border-0 shadow-none flex items-center justify-center">
          <style>{`
            .flip-card {
              perspective: 1200px;
            }
            .flip-inner {
              transition: transform 0.5s cubic-bezier(0.4,0.2,0.2,1);
              transform-style: preserve-3d;
              position: relative;
              width: 100%;
              height: 220px;
            }
            .flip-inner.flipped {
              transform: rotateY(180deg);
            }
            .flip-front, .flip-back {
              position: absolute;
              width: 100%;
              height: 100%;
              top: 0;
              left: 0;
              backface-visibility: hidden;
              border-radius: 1rem;
            }
            .flip-back {
              transform: rotateY(180deg);
              z-index: 2;
            }
          `}</style>
          <div className="rounded-2xl overflow-hidden w-full bg-white" style={{boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)'}}>
            <div className="bg-blue-700 text-white text-center py-5 text-2xl font-extrabold tracking-wide uppercase" style={{letterSpacing: '0.04em'}}>HEALTH PASSPORT</div>
            <div className="flip-card w-full h-[220px] flex items-center justify-center">
              <div className={`flip-inner ${isFlipped ? 'flipped' : ''}`}>
                {/* Front Side */}
                <div className="flip-front flex flex-row items-center px-8 py-8 w-full h-full bg-white rounded-2xl">
                  {/* Avatar with gray circle background */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src="/placeholder-user.jpg" alt="Ramesh" />
                        <AvatarFallback>R</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  {/* Details */}
                  <div className="flex-1 min-w-0 pl-8">
                    <div className="font-bold text-xl text-blue-800 mb-2">Ramesh</div>
                    <div className="text-base text-black mb-1"><span className="font-semibold">ABHA Number:</span> XXXXX</div>
                    <div className="text-base text-black mb-1"><span className="font-semibold">Date of Birth:</span> XX/XX/XXX</div>
                    <div className="text-base text-black"><span className="font-semibold">Gender:</span> MALE</div>
                  </div>
                  {/* QR Code */}
                  <div className="flex flex-col items-center flex-shrink-0 pl-8 cursor-pointer" onClick={() => setIsFlipped(true)}>
                    <div className="bg-gray-100 rounded-md flex items-center justify-center" style={{width: '110px', height: '110px'}}>
                      <QrCode className="w-24 h-24 text-black" />
                    </div>
                    <span className="text-xs text-gray-500 mt-2">Click to enlarge</span>
                  </div>
                </div>
                {/* Back Side (Enlarged QR) */}
                <div className="flip-back flex flex-col items-center justify-center bg-white rounded-2xl cursor-pointer" onClick={() => setIsFlipped(false)}>
                  <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{width: '180px', height: '180px'}}>
                    <QrCode className="w-40 h-40 text-black" />
                  </div>
                  <span className="text-sm text-gray-500 mt-4">Click to go back</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-3">
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
