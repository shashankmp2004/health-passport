"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Droplets, Activity, TrendingUp, Calendar } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function HealthOverview() {
  const [healthData, setHealthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'patient') {
      router.push('/auth/patient/login')
      return
    }

    fetchHealthOverview()
  }, [session, status, router])

  const fetchHealthOverview = async () => {
    try {
      const response = await fetch('/api/patients/health-overview')
      if (response.ok) {
        const result = await response.json()
        setHealthData(result.data)
      } else {
        console.error('Failed to fetch health overview data')
      }
    } catch (error) {
      console.error('Error fetching health overview:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4 w-64"></div>
          <div className="h-4 bg-gray-300 rounded mb-6 w-32"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Helper functions
  const getVitalStatus = (value: number, type: string) => {
    switch (type) {
      case 'bloodSugar':
        if (value < 70) return { status: 'Low', color: 'red' }
        if (value <= 100) return { status: 'Normal', color: 'green' }
        if (value <= 125) return { status: 'Elevated', color: 'yellow' }
        return { status: 'High', color: 'red' }
      case 'heartRate':
        if (value < 60) return { status: 'Low', color: 'yellow' }
        if (value <= 100) return { status: 'Normal', color: 'green' }
        return { status: 'High', color: 'red' }
      case 'bloodPressure':
        // Assuming systolic value
        if (value < 90) return { status: 'Low', color: 'yellow' }
        if (value <= 120) return { status: 'Normal', color: 'green' }
        if (value <= 139) return { status: 'Elevated', color: 'yellow' }
        return { status: 'High', color: 'red' }
      default:
        return { status: 'Normal', color: 'green' }
    }
  }

  const calculateBMI = (weight: number, height: number) => {
    // height in cm, weight in kg
    const heightInM = height / 100
    return (weight / (heightInM * heightInM)).toFixed(1)
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: "Underweight", color: "blue" }
    if (bmi <= 24.9) return { status: "Normal Weight", color: "green" }
    if (bmi <= 29.9) return { status: "Overweight", color: "yellow" }
    return { status: "Obese", color: "red" }
  }
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Health Overview</h1>
          <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Vital Signs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Blood Sugar */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-orange-600" />
                </div>
                <span className="font-medium text-orange-800">Blood Sugar</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthData?.vitals?.bloodSugar ? (
                <>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold text-orange-800">{healthData.vitals.bloodSugar.value}</span>
                    <span className="text-sm text-orange-600">mg/dL</span>
                  </div>
                  <Badge className={`${
                    getVitalStatus(healthData.vitals.bloodSugar.value, 'bloodSugar').color === 'green' 
                      ? 'bg-green-200 text-green-800' 
                      : getVitalStatus(healthData.vitals.bloodSugar.value, 'bloodSugar').color === 'yellow'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-red-200 text-red-800'
                  } hover:bg-current`}>
                    {getVitalStatus(healthData.vitals.bloodSugar.value, 'bloodSugar').status}
                  </Badge>
                </>
              ) : (
                <>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold text-gray-400">--</span>
                    <span className="text-sm text-gray-400">mg/dL</span>
                  </div>
                  <Badge className="bg-gray-200 text-gray-600">No Data</Badge>
                </>
              )}
              <div className="h-16 bg-orange-200/50 rounded-lg flex items-end justify-center">
                <div className="w-full h-8 bg-gradient-to-t from-orange-300 to-orange-200 rounded-lg"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Heart Rate */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-600" />
                </div>
                <span className="font-medium text-red-800">Heart Rate</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthData?.vitals?.heartRate ? (
                <>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold text-red-800">{healthData.vitals.heartRate.value}</span>
                    <span className="text-sm text-red-600">bpm</span>
                  </div>
                  <Badge className={`${
                    getVitalStatus(healthData.vitals.heartRate.value, 'heartRate').color === 'green' 
                      ? 'bg-green-200 text-green-800' 
                      : getVitalStatus(healthData.vitals.heartRate.value, 'heartRate').color === 'yellow'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-red-200 text-red-800'
                  } hover:bg-current`}>
                    {getVitalStatus(healthData.vitals.heartRate.value, 'heartRate').status}
                  </Badge>
                </>
              ) : (
                <>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold text-gray-400">--</span>
                    <span className="text-sm text-gray-400">bpm</span>
                  </div>
                  <Badge className="bg-gray-200 text-gray-600">No Data</Badge>
                </>
              )}
              <div className="h-16 bg-red-200/50 rounded-lg flex items-end justify-center">
                <div className="w-full h-10 bg-gradient-to-t from-red-300 to-red-200 rounded-lg"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blood Pressure */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium text-blue-800">Blood Pressure</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthData?.vitals?.bloodPressure ? (
                <>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold text-blue-800">{healthData.vitals.bloodPressure.systolic}</span>
                    <span className="text-lg font-semibold text-blue-700">/</span>
                    <span className="text-2xl font-bold text-blue-800">{healthData.vitals.bloodPressure.diastolic}</span>
                    <span className="text-sm text-blue-600">mmHg</span>
                  </div>
                  <Badge className={`${
                    getVitalStatus(healthData.vitals.bloodPressure.systolic, 'bloodPressure').color === 'green' 
                      ? 'bg-green-200 text-green-800' 
                      : getVitalStatus(healthData.vitals.bloodPressure.systolic, 'bloodPressure').color === 'yellow'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-red-200 text-red-800'
                  } hover:bg-current`}>
                    {getVitalStatus(healthData.vitals.bloodPressure.systolic, 'bloodPressure').status}
                  </Badge>
                </>
              ) : (
                <>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold text-gray-400">--</span>
                    <span className="text-lg font-semibold text-gray-400">/</span>
                    <span className="text-2xl font-bold text-gray-400">--</span>
                    <span className="text-sm text-gray-400">mmHg</span>
                  </div>
                  <Badge className="bg-gray-200 text-gray-600">No Data</Badge>
                </>
              )}
              <div className="h-16 bg-blue-200/50 rounded-lg flex items-end justify-center">
                <div className="w-full h-12 bg-gradient-to-t from-blue-300 to-blue-200 rounded-lg"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Growth Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Activity Growth</span>
                </CardTitle>
                <Select defaultValue="recent">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {healthData?.activityData?.hasData ? (
                <div className="h-64 bg-gray-50 rounded-lg p-4">
                  {/* Real activity data would be rendered here */}
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-600">Activity data visualization would appear here</p>
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No Activity Data Available</p>
                    <p className="text-sm text-gray-500">Start tracking your activities to see progress charts</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* BMI Calculator & Body Measurements */}
        <div className="space-y-6">
          {/* BMI Calculator */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">BMI Calculator</CardTitle>
                <Select defaultValue="current">
                  <SelectTrigger className="w-24 bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthData?.bodyMeasurements?.height && healthData?.bodyMeasurements?.weight ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-200 text-gray-800 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Height</div>
                      <div className="font-semibold">{healthData.bodyMeasurements.height} cm</div>
                    </div>
                    <div className="bg-blue-200 text-gray-800 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Weight</div>
                      <div className="font-semibold">{healthData.bodyMeasurements.weight} kg</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">
                      {calculateBMI(healthData.bodyMeasurements.weight, healthData.bodyMeasurements.height)}
                    </div>
                    <Badge className={`${
                      getBMIStatus(parseFloat(calculateBMI(healthData.bodyMeasurements.weight, healthData.bodyMeasurements.height))).color === 'green'
                        ? 'bg-green-600 text-white hover:bg-green-600'
                        : getBMIStatus(parseFloat(calculateBMI(healthData.bodyMeasurements.weight, healthData.bodyMeasurements.height))).color === 'yellow'
                        ? 'bg-yellow-600 text-white hover:bg-yellow-600'
                        : getBMIStatus(parseFloat(calculateBMI(healthData.bodyMeasurements.weight, healthData.bodyMeasurements.height))).color === 'blue'
                        ? 'bg-blue-600 text-white hover:bg-blue-600'
                        : 'bg-red-600 text-white hover:bg-red-600'
                    }`}>
                      {getBMIStatus(parseFloat(calculateBMI(healthData.bodyMeasurements.weight, healthData.bodyMeasurements.height))).status}
                    </Badge>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>15</span>
                      <span>18.5</span>
                      <span>25</span>
                      <span>30</span>
                      <span>40</span>
                    </div>
                    <div className="h-2 rounded-full relative" style={{
                      background: 'linear-gradient(to right, #60a5fa 0%, #4ade80 25%, #facc15 50%, #f87171 75%, #ef4444 100%)'
                    }}>
                      <div 
                        className="absolute top-0 w-1 h-2 bg-white rounded-full transform -translate-x-1/2"
                        style={{
                          left: `${Math.min(Math.max((parseFloat(calculateBMI(healthData.bodyMeasurements.weight, healthData.bodyMeasurements.height)) - 15) / 25 * 100, 0), 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Activity className="w-8 h-8" />
                    </div>
                  </div>
                  <p className="text-gray-300 mb-2">No Body Measurements</p>
                  <p className="text-sm text-gray-400">Height and weight data needed for BMI calculation</p>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Body Measurements */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
            <CardHeader>
              <CardTitle className="text-white">Body Measurements</CardTitle>
              <CardDescription className="text-gray-300">
                {healthData?.bodyMeasurements?.lastUpdated 
                  ? `Last updated ${new Date(healthData.bodyMeasurements.lastUpdated).toLocaleDateString()}`
                  : 'No recent measurements'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthData?.bodyMeasurements?.chest || healthData?.bodyMeasurements?.waist || healthData?.bodyMeasurements?.hip ? (
                <>
                  <div className="text-center mb-4">
                    <Badge className="bg-gray-700 text-white">
                      {healthData.bodyMeasurements.bodyShape || 'Body Shape Not Calculated'}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="space-y-4 flex-1">
                      {healthData.bodyMeasurements.chest && (
                        <div className="bg-white text-gray-800 p-3 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Chest (in)</div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold">{healthData.bodyMeasurements.chest}</span>
                          </div>
                        </div>
                      )}

                      {healthData.bodyMeasurements.waist && (
                        <div className="bg-white text-gray-800 p-3 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Waist (in)</div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold">{healthData.bodyMeasurements.waist}</span>
                          </div>
                        </div>
                      )}

                      {healthData.bodyMeasurements.hip && (
                        <div className="bg-white text-gray-800 p-3 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Hip (in)</div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold">{healthData.bodyMeasurements.hip}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <div className="w-24 h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <Activity className="w-8 h-8 mx-auto mb-2" />
                          <span className="text-xs">Body Chart</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Activity className="w-8 h-8" />
                    </div>
                  </div>
                  <p className="text-gray-300 mb-2">No Body Measurements</p>
                  <p className="text-sm text-gray-400">Body measurements need to be recorded by healthcare providers</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
