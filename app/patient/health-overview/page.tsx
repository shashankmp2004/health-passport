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
      <div className="p-6 md:p-8 space-y-8 bg-secondary min-h-screen">
        <div className="animate-pulse">
          <div className="h-12 bg-white border-4 border-black shadow-brutal-sm mb-4 w-64"></div>
          <div className="h-6 bg-white border-2 border-black mb-8 w-32"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white border-4 border-black shadow-brutal-sm"></div>
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
    <div className="p-6 md:p-8 space-y-8 bg-secondary min-h-screen selection:bg-black selection:text-white pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 brutal-enter">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mix-blend-multiply">Health Overview</h1>
          <p className="text-black font-bold text-lg border-l-4 border-black pl-3 mt-2 bg-white/50 inline-block pr-3">{new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex items-center">
          <Button className="h-12 bg-black text-white hover:bg-primary hover:text-black border-4 border-black rounded-none font-black text-base uppercase transition-colors shadow-brutal-sm hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-lg">
            <Calendar className="w-5 h-5 mr-3" strokeWidth={3} />
            Export Report
          </Button>
        </div>
      </div>

      {/* Vital Signs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 brutal-enter delay-100">
        {/* Blood Sugar */}
        <Card className="border-4 border-black rounded-none shadow-brutal-sm hover:shadow-brutal-lg hover:-translate-y-1 transition-all bg-[#ff9f43] relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:opacity-30 transition-opacity">
            <Droplets className="w-32 h-32 text-black" strokeWidth={3} />
          </div>
          <CardHeader className="pb-3 relative z-10 border-b-4 border-black bg-white/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white border-4 border-black flex items-center justify-center -rotate-3 hover:rotate-0 transition-transform">
                <Droplets className="w-6 h-6 text-black" strokeWidth={3} />
              </div>
              <span className="font-black text-xl uppercase tracking-wider text-black">Blood Sugar</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6 relative z-10">
            <div className="space-y-4">
              {healthData?.vitals?.bloodSugar ? (
                <>
                  <div className="flex items-baseline space-x-2 border-b-4 border-black pb-2 border-dashed">
                    <span className="text-5xl md:text-6xl font-black text-black drop-shadow-[2px_2px_0px_#fff]">{healthData.vitals.bloodSugar.value}</span>
                    <span className="text-lg font-bold text-black uppercase">mg/dL</span>
                  </div>
                  <Badge className={`border-2 border-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm ${
                    getVitalStatus(healthData.vitals.bloodSugar.value, 'bloodSugar').color === 'green' 
                      ? 'bg-green-200 text-black' 
                      : getVitalStatus(healthData.vitals.bloodSugar.value, 'bloodSugar').color === 'yellow'
                      ? 'bg-secondary text-black'
                      : 'bg-destructive text-white'
                  } hover:bg-current`}>
                    {getVitalStatus(healthData.vitals.bloodSugar.value, 'bloodSugar').status}
                  </Badge>
                </>
              ) : (
                <>
                  <div className="flex items-baseline space-x-2 border-b-4 border-black pb-2 border-dashed">
                    <span className="text-5xl md:text-6xl font-black text-black/50">--</span>
                    <span className="text-lg font-bold text-black/50 uppercase">mg/dL</span>
                  </div>
                  <Badge className="border-2 border-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm bg-gray-200 text-black">No Data</Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Heart Rate */}
        <Card className="border-4 border-black rounded-none shadow-brutal-sm hover:shadow-brutal-lg hover:-translate-y-1 transition-all bg-destructive relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:opacity-30 transition-opacity">
            <Heart className="w-32 h-32 text-black" strokeWidth={3} />
          </div>
          <CardHeader className="pb-3 relative z-10 border-b-4 border-black bg-white/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white border-4 border-black flex items-center justify-center rotate-3 hover:rotate-0 transition-transform">
                <Heart className="w-6 h-6 text-black" strokeWidth={3} />
              </div>
              <span className="font-black text-xl uppercase tracking-wider text-black">Heart Rate</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6 relative z-10">
            <div className="space-y-4">
              {healthData?.vitals?.heartRate ? (
                <>
                  <div className="flex items-baseline space-x-2 border-b-4 border-black pb-2 border-dashed">
                    <span className="text-5xl md:text-6xl font-black text-black drop-shadow-[2px_2px_0px_#fff]">{healthData.vitals.heartRate.value}</span>
                    <span className="text-lg font-bold text-black uppercase">bpm</span>
                  </div>
                  <Badge className={`border-2 border-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm ${
                    getVitalStatus(healthData.vitals.heartRate.value, 'heartRate').color === 'green' 
                      ? 'bg-green-200 text-black' 
                      : getVitalStatus(healthData.vitals.heartRate.value, 'heartRate').color === 'yellow'
                      ? 'bg-secondary text-black'
                      : 'bg-black text-white'
                  } hover:bg-current`}>
                    {getVitalStatus(healthData.vitals.heartRate.value, 'heartRate').status}
                  </Badge>
                </>
              ) : (
                <>
                  <div className="flex items-baseline space-x-2 border-b-4 border-black pb-2 border-dashed">
                    <span className="text-5xl md:text-6xl font-black text-black/50">--</span>
                    <span className="text-lg font-bold text-black/50 uppercase">bpm</span>
                  </div>
                  <Badge className="border-2 border-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm bg-gray-200 text-black">No Data</Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Blood Pressure */}
        <Card className="border-4 border-black rounded-none shadow-brutal-sm hover:shadow-brutal-lg hover:-translate-y-1 transition-all bg-primary relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:opacity-30 transition-opacity">
            <Activity className="w-32 h-32 text-black" strokeWidth={3} />
          </div>
          <CardHeader className="pb-3 relative z-10 border-b-4 border-black bg-white/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white border-4 border-black flex items-center justify-center -rotate-3 hover:rotate-0 transition-transform">
                <Activity className="w-6 h-6 text-black" strokeWidth={3} />
              </div>
              <span className="font-black text-xl uppercase tracking-wider text-black">Blood Pressure</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6 relative z-10">
            <div className="space-y-4">
              {healthData?.vitals?.bloodPressure ? (
                <>
                  <div className="flex items-baseline space-x-2 border-b-4 border-black pb-2 border-dashed">
                    <span className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-black drop-shadow-[2px_2px_0px_#fff]">
                      {healthData.vitals.bloodPressure.systolic}/{healthData.vitals.bloodPressure.diastolic}
                    </span>
                    <span className="text-lg font-bold text-black uppercase hidden sm:block">mmHg</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     <span className="text-sm font-bold text-black uppercase block sm:hidden">mmHg</span>
                    <Badge className={`border-2 border-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm ${
                      getVitalStatus(healthData.vitals.bloodPressure.systolic, 'bloodPressure').color === 'green' 
                        ? 'bg-green-200 text-black' 
                        : getVitalStatus(healthData.vitals.bloodPressure.systolic, 'bloodPressure').color === 'yellow'
                        ? 'bg-secondary text-black'
                        : 'bg-destructive text-white'
                    } hover:bg-current`}>
                      {getVitalStatus(healthData.vitals.bloodPressure.systolic, 'bloodPressure').status}
                    </Badge>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-baseline space-x-2 border-b-4 border-black pb-2 border-dashed">
                    <span className="text-5xl md:text-6xl font-black text-black/50">--/--</span>
                    <span className="text-lg font-bold text-black/50 uppercase">mmHg</span>
                  </div>
                  <Badge className="border-2 border-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm bg-gray-200 text-black">No Data</Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 brutal-enter delay-200">
        {/* Activity Growth Chart */}
        <div className="lg:col-span-2">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white h-full">
            <CardHeader className="border-b-4 border-black bg-accent pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                  <TrendingUp className="w-6 h-6" strokeWidth={3} />
                  <span>Activity Growth</span>
                </CardTitle>
                <Select defaultValue="recent">
                  <SelectTrigger className="w-full sm:w-32 border-4 border-black rounded-none h-10 font-bold uppercase shadow-brutal-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-4 border-black rounded-none font-bold">
                    <SelectItem value="recent" className="focus:bg-secondary uppercase">Recent</SelectItem>
                    <SelectItem value="month" className="focus:bg-secondary uppercase">This Month</SelectItem>
                    <SelectItem value="quarter" className="focus:bg-secondary uppercase">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {healthData?.activityData?.hasData ? (
                <div className="h-64 border-4 border-black border-dashed rounded-none p-4 flex items-center justify-center bg-gray-50/50 group hover:border-solid hover:bg-white transition-all">
                  <div className="text-center transition-transform group-hover:scale-110">
                    <TrendingUp className="w-16 h-16 text-black mx-auto mb-4" strokeWidth={3} />
                    <p className="font-black text-xl uppercase tracking-wider">Activity Data Viz</p>
                  </div>
                </div>
              ) : (
                <div className="h-64 border-4 border-black border-dashed rounded-none flex items-center justify-center bg-gray-50/50">
                  <div className="text-center p-6 border-4 border-black translate-y-2 -translate-x-2 shadow-[4px_4px_0px_#000] bg-white max-w-sm">
                    <TrendingUp className="w-12 h-12 text-black mx-auto mb-4" strokeWidth={3} />
                    <p className="font-black text-xl mb-2 uppercase">No Activity Data</p>
                    <p className="font-bold text-sm text-gray-500 uppercase">Start tracking your activities<br/>to generate charts</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* BMI Calculator & Body Measurements */}
        <div className="space-y-8">
          {/* BMI Calculator */}
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-black text-white">
            <CardHeader className="border-b-4 border-white pb-4 bg-accent/20">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display font-black text-2xl uppercase">BMI Calc</CardTitle>
                <Select defaultValue="current">
                  <SelectTrigger className="w-28 border-4 border-white rounded-none h-10 font-bold uppercase bg-transparent text-white focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-4 border-black rounded-none font-bold bg-white text-black">
                    <SelectItem value="current" className="focus:bg-secondary uppercase">Current</SelectItem>
                    <SelectItem value="history" className="focus:bg-secondary uppercase">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {healthData?.bodyMeasurements?.height && healthData?.bodyMeasurements?.weight ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary text-black border-4 border-white p-4 text-center rounded-none -rotate-1 shadow-[2px_2px_0px_#fff]">
                      <div className="text-xs font-black uppercase mb-1 tracking-widest border-b-2 border-black inline-block px-1">Height</div>
                      <div className="font-black text-xl">{healthData.bodyMeasurements.height} <span className="text-sm">CM</span></div>
                    </div>
                    <div className="bg-primary text-black border-4 border-white p-4 text-center rounded-none rotate-1 shadow-[2px_2px_0px_#fff]">
                      <div className="text-xs font-black uppercase mb-1 tracking-widest border-b-2 border-black inline-block px-1">Weight</div>
                      <div className="font-black text-xl">{healthData.bodyMeasurements.weight} <span className="text-sm">KG</span></div>
                    </div>
                  </div>

                  <div className="text-center p-6 border-4 border-white bg-black relative">
                    <div className="absolute top-0 right-0 bg-white text-black font-black uppercase text-xs px-2 py-0.5 border-b-4 border-l-4 border-white">INDEX</div>
                    <div className="text-6xl font-black mb-3 text-white drop-shadow-[2px_2px_0px_#FFC60A]">
                      {calculateBMI(healthData.bodyMeasurements.weight, healthData.bodyMeasurements.height)}
                    </div>
                    <Badge className={`border-2 border-white rounded-none font-black uppercase tracking-wider text-sm px-4 py-1.5 shadow-[2px_2px_0px_#fff] ${
                      getBMIStatus(parseFloat(calculateBMI(healthData.bodyMeasurements.weight, healthData.bodyMeasurements.height))).color === 'green'
                        ? 'bg-green-200 text-black hover:bg-green-200'
                        : getBMIStatus(parseFloat(calculateBMI(healthData.bodyMeasurements.weight, healthData.bodyMeasurements.height))).color === 'yellow'
                        ? 'bg-secondary text-black hover:bg-secondary'
                        : getBMIStatus(parseFloat(calculateBMI(healthData.bodyMeasurements.weight, healthData.bodyMeasurements.height))).color === 'blue'
                        ? 'bg-primary text-black hover:bg-primary'
                        : 'bg-destructive text-white hover:bg-destructive'
                    }`}>
                      {getBMIStatus(parseFloat(calculateBMI(healthData.bodyMeasurements.weight, healthData.bodyMeasurements.height))).status}
                    </Badge>
                  </div>

                  <div className="border-4 border-white bg-gray-100 p-2">
                    <div className="flex justify-between text-[10px] font-black uppercase font-mono mb-2 text-gray-400">
                      <span>15</span>
                      <span>18.5</span>
                      <span>25</span>
                      <span>30</span>
                      <span>40</span>
                    </div>
                    <div className="h-4 rounded-none relative border-2 border-white" style={{
                      background: 'linear-gradient(to right, #4ade80 25%, #FFC60A 50%, #f97316 75%, #ff6b6b 100%)'
                    }}>
                      <div 
                        className="absolute top-0 bottom-0 w-2 bg-white border-2 border-black transform -translate-x-1/2 shadow-brutal-sm"
                        style={{
                          left: `${Math.min(Math.max((parseFloat(calculateBMI(healthData.bodyMeasurements.weight, healthData.bodyMeasurements.height)) - 15) / 25 * 100, 0), 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 border-4 border-white border-dashed p-4">
                  <div className="w-16 h-16 border-4 border-white rounded-none mx-auto mb-4 flex items-center justify-center bg-gray-100 rotate-12">
                    <Activity className="w-8 h-8 text-white" strokeWidth={3} />
                  </div>
                  <p className="font-black text-xl uppercase mb-2">Missing Data</p>
                  <p className="text-xs font-bold uppercase text-gray-400">Height / Weight needed</p>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Body Measurements */}
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black pb-4 bg-primary/20">
              <CardTitle className="font-display font-black text-2xl uppercase">Body Metrics</CardTitle>
              <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1">
                {healthData?.bodyMeasurements?.lastUpdated 
                  ? `UPDATED ${new Date(healthData.bodyMeasurements.lastUpdated).toLocaleDateString()}`
                  : 'NO RECENT MEASUREMENTS'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-white pb-8">
              {healthData?.bodyMeasurements?.chest || healthData?.bodyMeasurements?.waist || healthData?.bodyMeasurements?.hip ? (
                <>
                  <div className="text-center mb-6">
                    <Badge className="bg-black text-white border-2 border-black rounded-none font-black text-base uppercase px-4 py-1.5 shadow-brutal-sm -rotate-2">
                       SHAPE: {healthData.bodyMeasurements.bodyShape || 'N/A'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      {[
                        { label: 'Chest', val: healthData.bodyMeasurements.chest },
                        { label: 'Waist', val: healthData.bodyMeasurements.waist },
                        { label: 'Hip', val: healthData.bodyMeasurements.hip }
                      ].map((m, i) => m.val && (
                        <div key={i} className="bg-white border-4 border-black p-3 rounded-none shadow-brutal-sm transform hover:-translate-y-1 transition-transform group">
                          <div className="text-xs font-black uppercase text-gray-500 mb-1 group-hover:text-black transition-colors">{m.label} <span className="text-[10px]">IN</span></div>
                          <div className="font-black text-2xl">{m.val}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center pl-2">
                      <div className="w-full h-full min-h-32 border-4 border-black border-dashed bg-secondary/30 flex items-center justify-center p-2 text-center group hover:bg-white hover:border-solid transition-colors">
                        <div>
                          <Activity className="w-10 h-10 text-black mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                          <span className="font-black uppercase text-xs">Body<br/>Chart</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 border-4 border-black border-dashed bg-white m-2">
                  <div className="w-16 h-16 border-4 border-black rounded-none mx-auto mb-4 flex items-center justify-center bg-gray-100 -rotate-12">
                    <Activity className="w-8 h-8 text-black" strokeWidth={3} />
                  </div>
                  <p className="font-black text-lg uppercase mb-1">No Metrics</p>
                  <p className="text-xs font-bold uppercase text-gray-500">Record specs to map</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
