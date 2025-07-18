"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Activity, Thermometer, Weight, Plus, TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PatientVitals() {
  const [loading, setLoading] = useState(true)
  const [vitalsData, setVitalsData] = useState<any>(null)
  const [newVital, setNewVital] = useState({
    type: "",
    value: "",
    unit: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().split(" ")[0].slice(0, 5),
  })
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'patient') {
      router.push('/auth/patient/login')
      return
    }

    fetchVitals()
  }, [session, status, router])

  const fetchVitals = async () => {
    try {
      const response = await fetch('/api/patients/vitals')
      if (response.ok) {
        const result = await response.json()
        setVitalsData(result.data)
      } else {
        console.error('Failed to fetch vitals')
      }
    } catch (error) {
      console.error('Error fetching vitals:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4 w-64"></div>
          <div className="h-4 bg-gray-300 rounded mb-6 w-96"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-300 rounded-lg"></div>
            <div className="h-96 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  const vitalsHistory = vitalsData?.vitalsHistory || []
  const currentVitals = vitalsData?.currentVitals || [
    {
      type: "Blood Pressure",
      value: "No data",
      unit: "mmHg",
      status: "No data",
      range: "< 130/80",
      icon: Activity,
      color: "gray",
      lastReading: "No readings",
    },
    {
      type: "Heart Rate",
      value: "No data",
      unit: "bpm",
      status: "No data",
      range: "60-100",
      icon: Heart,
      color: "gray",
      lastReading: "No readings",
    },
    {
      type: "Weight",
      value: "No data",
      unit: "lbs",
      status: "No data",
      range: "Varies",
      icon: Weight,
      color: "gray",
      lastReading: "No readings",
    },
    {
      type: "Temperature",
      value: "No data",
      unit: "°F",
      status: "No data",
      range: "97.0-99.0",
      icon: Thermometer,
      color: "gray",
      lastReading: "No readings",
    },
  ]

  const handleAddVital = (e: React.FormEvent) => {
    e.preventDefault()
    // Add vital logic here
    console.log("Adding vital:", newVital)
    // Reset form
    setNewVital({
      type: "",
      value: "",
      unit: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().split(" ")[0].slice(0, 5),
    })
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vital Signs</h1>
          <p className="text-gray-600">Track and monitor your vital signs and health metrics</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Log Vitals
        </Button>
      </div>

      {/* Current Vitals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentVitals.map((vital, index) => {
          const IconComponent = vital.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 bg-${vital.color}-100 rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 text-${vital.color}-600`} />
                  </div>
                  <Badge
                    className={vital.status === "Normal" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {vital.status}
                  </Badge>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{vital.type}</h3>
                <div className="flex items-baseline space-x-1 mb-2">
                  <span className="text-2xl font-bold">{vital.value}</span>
                  <span className="text-sm text-gray-600">{vital.unit}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">Range: {vital.range}</div>
                <div className="text-xs text-gray-500">{vital.lastReading}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="add">Add Reading</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Vital Signs Trends</span>
              </CardTitle>
              <CardDescription>Your vital signs over the past 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Trends chart visualization would appear here</p>
                  <p className="text-sm">Showing blood pressure, heart rate, and weight trends</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Readings This Week</p>
                    <p className="text-xl font-bold">12</p>
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
                    <p className="text-sm text-gray-600">Avg Heart Rate</p>
                    <p className="text-xl font-bold">74 bpm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg BP</p>
                    <p className="text-xl font-bold">122/79</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span>Vitals History</span>
              </CardTitle>
              <CardDescription>Complete record of your vital sign measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vitalsHistory.length > 0 ? (
                  vitalsHistory.map((vital: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{vital.type}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>{new Date(vital.date).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{vital.time}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-semibold">
                              {vital.value} {vital.unit}
                            </div>
                            <Badge
                              className={
                                vital.status === "Normal" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }
                            >
                              {vital.status}
                            </Badge>
                          </div>

                          <div className="w-6 h-6 flex items-center justify-center">
                            {vital.trend === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
                            {vital.trend === "down" && <TrendingDown className="w-4 h-4 text-red-600" />}
                            {vital.trend === "stable" && <div className="w-4 h-0.5 bg-gray-400"></div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No vital signs recorded</p>
                    <p className="text-sm">Your vital signs will be added by healthcare providers or you can log them yourself</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Vital Reading</CardTitle>
              <CardDescription>Record a new vital sign measurement</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddVital} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vitalType">Vital Sign Type</Label>
                    <select
                      id="vitalType"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newVital.type}
                      onChange={(e) => setNewVital({ ...newVital, type: e.target.value })}
                      required
                    >
                      <option value="">Select vital sign</option>
                      <option value="Blood Pressure">Blood Pressure</option>
                      <option value="Heart Rate">Heart Rate</option>
                      <option value="Weight">Weight</option>
                      <option value="Temperature">Temperature</option>
                      <option value="Blood Sugar">Blood Sugar</option>
                      <option value="Oxygen Saturation">Oxygen Saturation</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      placeholder="e.g., 120/80, 72, 165"
                      value={newVital.value}
                      onChange={(e) => setNewVital({ ...newVital, value: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      placeholder="e.g., mmHg, bpm, lbs"
                      value={newVital.unit}
                      onChange={(e) => setNewVital({ ...newVital, unit: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newVital.date}
                      onChange={(e) => setNewVital({ ...newVital, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newVital.time}
                      onChange={(e) => setNewVital({ ...newVital, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Save Reading
                  </Button>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Quick Add Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Add</CardTitle>
              <CardDescription>Common vital signs for quick entry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
                  <Heart className="w-6 h-6" />
                  <span className="text-sm">Blood Pressure</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
                  <Activity className="w-6 h-6" />
                  <span className="text-sm">Heart Rate</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
                  <Weight className="w-6 h-6" />
                  <span className="text-sm">Weight</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
                  <Thermometer className="w-6 h-6" />
                  <span className="text-sm">Temperature</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
