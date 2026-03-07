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
      <div className="p-6 md:p-8 space-y-8 bg-[#f4f4f0] min-h-screen">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-white border-4 border-black mb-4 w-64 shadow-[4px_4px_0px_#000]"></div>
          <div className="h-6 bg-white border-2 border-black w-96 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-white border-4 border-black shadow-[4px_4px_0px_#000]"></div>
            ))}
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
    <div className="p-6 md:p-8 space-y-8 bg-[#f4f4f0] min-h-screen selection:bg-secondary selection:text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 brutal-enter">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mix-blend-multiply">Vital Signs</h1>
          <p className="text-black font-bold text-lg border-l-4 border-black pl-3 mt-2 bg-white/50 inline-block pr-3">Track and monitor your vital signs and health metrics</p>
        </div>
        <Button className="h-12 bg-secondary text-black hover:bg-black hover:text-white border-4 border-black rounded-none font-black text-base uppercase transition-all shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_#000]">
          <Plus className="w-5 h-5 mr-3" strokeWidth={3} />
          Log Vitals
        </Button>
      </div>

      {/* Current Vitals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 brutal-enter delay-100">
        {currentVitals.map((vital: any, index: number) => {
          const IconComponent = vital.icon
          const bgColors = ["bg-destructive", "bg-[#4ade80]", "bg-secondary", "bg-[#9ca3af]"]
          const bgColor = bgColors[index % bgColors.length]

          return (
            <Card key={index} className={`border-4 border-black rounded-none shadow-brutal-sm hover:shadow-brutal-lg hover:-translate-y-1 transition-all ${bgColor} relative overflow-hidden group`}>
              <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <IconComponent className="w-24 h-24 text-black" strokeWidth={3} />
              </div>
              <CardContent className="p-5 relative z-10">
                <div className="flex items-start justify-between mb-4 border-b-4 border-black pb-4 border-dashed">
                  <div className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center -rotate-3 group-hover:rotate-0 transition-transform">
                    <IconComponent className="w-6 h-6 text-black" strokeWidth={3} />
                  </div>
                  <Badge
                    className={`border-2 border-black rounded-none font-black uppercase text-xs px-2 py-1 shadow-brutal-sm ${
                      vital.status === "Normal" ? "bg-green-200 text-black" : "bg-red-500 text-white"
                    } hover:bg-current`}
                  >
                    {vital.status}
                  </Badge>
                </div>
                <h3 className="font-black uppercase tracking-wider text-xl mb-2">{vital.type}</h3>
                <div className="flex items-baseline space-x-2 mb-4 bg-white/50 px-2 py-1 border-2 border-black w-fit">
                  <span className="text-3xl font-black">{vital.value}</span>
                  <span className="text-sm font-bold uppercase">{vital.unit}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase bg-black text-white px-2 py-0.5 inline-block border-2 border-black">Range: {vital.range}</div>
                  <div className="text-xs font-bold uppercase border-2 border-black px-2 py-0.5 bg-white inline-block">{vital.lastReading}</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="overview" className="w-full brutal-enter delay-200">
        <TabsList className="grid w-full grid-cols-3 h-auto p-0 border-4 border-black bg-white rounded-none shadow-brutal-sm mb-8 relative z-10">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-r-4 border-black data-[state=active]:bg-secondary data-[state=active]:text-black font-black uppercase text-sm md:text-base py-3 px-1 md:px-4"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="history"
             className="rounded-none border-r-4 border-black data-[state=active]:bg-secondary data-[state=active]:text-black font-black uppercase text-sm md:text-base py-3 px-1 md:px-4"
          >
            History
          </TabsTrigger>
          <TabsTrigger 
            value="add"
             className="rounded-none data-[state=active]:bg-secondary data-[state=active]:text-black font-black uppercase text-sm md:text-base py-3 px-1 md:px-4"
          >
            Add Reading
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 outline-none">
          {/* Trends Chart */}
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-blue-200/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <TrendingUp className="w-8 h-8 text-black" strokeWidth={3} />
                <span>Vital Signs Trends</span>
              </CardTitle>
              <CardDescription className="font-bold uppercase text-black">Your vital signs over the past 30 days</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 border-4 border-black border-dashed rounded-none bg-gray-50 p-4 flex items-center justify-center hover:bg-white transition-colors group">
                <div className="text-center">
                  <Activity className="w-16 h-16 mx-auto mb-4 text-black opacity-50 group-hover:opacity-100 transition-opacity group-hover:scale-110" strokeWidth={3} />
                  <p className="font-black text-xl uppercase tracking-wider mb-2">Trends Chart</p>
                  <p className="font-bold text-sm uppercase px-4 py-1 bg-black text-white inline-block border-2 border-black rotate-1">Showing BP, Heart Rate, and Weight</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-[#4ade80] hover:-translate-y-1 transition-transform cursor-default">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="w-12 h-12 bg-white border-4 border-black rounded-none flex items-center justify-center -rotate-3 shadow-[4px_4px_0px_#000]">
                  <TrendingUp className="w-6 h-6 text-black" strokeWidth={3} />
                </div>
                <div>
                  <p className="font-black uppercase text-sm text-black border-b-2 border-transparent hover:border-black inline-block cursor-help" title="Readings This Week">Readings This Week</p>
                  <p className="text-4xl font-black drop-shadow-[2px_2px_0px_#fff]">12</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-[#60a5fa] hover:-translate-y-1 transition-transform cursor-default">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="w-12 h-12 bg-white border-4 border-black rounded-none flex items-center justify-center rotate-3 shadow-[4px_4px_0px_#000]">
                  <Heart className="w-6 h-6 text-black" strokeWidth={3} />
                </div>
                <div>
                  <p className="font-black uppercase text-sm text-black border-b-2 border-transparent hover:border-black inline-block cursor-help" title="Avg Heart Rate">Avg Heart Rate</p>
                  <p className="text-4xl font-black drop-shadow-[2px_2px_0px_#fff]">74 <span className="text-xl">BPM</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-[#d8b4fe] hover:-translate-y-1 transition-transform cursor-default">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="w-12 h-12 bg-white border-4 border-black rounded-none flex items-center justify-center -rotate-3 shadow-[4px_4px_0px_#000]">
                  <Activity className="w-6 h-6 text-black" strokeWidth={3} />
                </div>
                <div>
                  <p className="font-black uppercase text-sm text-black border-b-2 border-transparent hover:border-black inline-block cursor-help" title="Avg Blood Pressure">Avg BP</p>
                  <p className="text-4xl font-black drop-shadow-[2px_2px_0px_#fff]">122/79</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-purple-200/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Calendar className="w-8 h-8 text-black" strokeWidth={3} />
                <span>Vitals History</span>
              </CardTitle>
              <CardDescription className="font-bold uppercase text-black">Complete record of your vital sign measurements</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y-4 divide-black">
                {vitalsHistory.length > 0 ? (
                  vitalsHistory.map((vital: any, index: number) => (
                    <div key={index} className="p-4 md:p-6 hover:bg-purple-200/10 transition-colors group cursor-default">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-[4px_4px_0px_#000]">
                            <Activity className="w-6 h-6 text-black" strokeWidth={3} />
                          </div>
                          <div>
                            <h3 className="font-black uppercase tracking-wider text-lg">{vital.type}</h3>
                            <div className="flex items-center space-x-2 text-sm font-bold bg-black text-white px-2 py-0.5 inline-block border-2 border-black mt-1">
                              <span>{new Date(vital.date).toLocaleDateString()}</span>
                              <span className="mx-1">•</span>
                              <span>{vital.time}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4 border-t-4 border-black sm:border-0 pt-4 sm:pt-0 border-dashed">
                          <div className="text-right">
                            <div className="font-black text-xl mb-1">
                              {vital.value} <span className="text-sm">{vital.unit}</span>
                            </div>
                            <Badge
                              className={`border-2 border-black rounded-none font-black uppercase text-xs px-2 py-1 shadow-brutal-sm ${
                                vital.status === "Normal" ? "bg-green-200 text-black" : "bg-red-500 text-white"
                              }`}
                            >
                              {vital.status}
                            </Badge>
                          </div>

                          <div className="w-10 h-10 border-4 border-black bg-white flex items-center justify-center -rotate-3 shadow-[2px_2px_0px_#000]">
                            {vital.trend === "up" && <TrendingUp className="w-5 h-5 text-red-500" strokeWidth={3} />}
                            {vital.trend === "down" && <TrendingDown className="w-5 h-5 text-green-500" strokeWidth={3} />}
                            {vital.trend === "stable" && <div className="w-4 h-1 bg-black"></div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 px-4 bg-gray-50 border-b-4 border-black">
                    <div className="w-16 h-16 border-4 border-black rounded-none mx-auto mb-4 flex items-center justify-center bg-white -rotate-6 shadow-[4px_4px_0px_#000]">
                      <Activity className="w-8 h-8 text-black" strokeWidth={3} />
                    </div>
                    <p className="font-black text-xl uppercase mb-2">No History</p>
                    <p className="text-sm font-bold uppercase px-4 py-1 border-2 border-black inline-block bg-white shadow-brutal-sm">Record your first vital sign</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-destructive/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Plus className="w-8 h-8 text-black" strokeWidth={3} />
                <span>Add Reading</span>
              </CardTitle>
              <CardDescription className="font-bold uppercase text-black">Record a new vital sign measurement</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleAddVital} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="vitalType" className="font-black uppercase tracking-wider text-xs">Vital Sign Type</Label>
                    <select
                      id="vitalType"
                      className="w-full h-12 border-4 border-black rounded-none text-black font-bold focus:ring-0 focus:outline-none focus:border-black transition-shadow focus-within:shadow-[4px_4px_0px_#000] px-3 bg-white"
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
                    <Label htmlFor="value" className="font-black uppercase tracking-wider text-xs">Value</Label>
                    <Input
                      id="value"
                      placeholder="e.g., 120/80, 72, 165"
                      value={newVital.value}
                      onChange={(e) => setNewVital({ ...newVital, value: e.target.value })}
                      required
                      className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="unit" className="font-black uppercase tracking-wider text-xs">Unit</Label>
                    <Input
                      id="unit"
                      placeholder="e.g., mmHg, bpm, lbs"
                      value={newVital.unit}
                      onChange={(e) => setNewVital({ ...newVital, unit: e.target.value })}
                      required
                      className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="font-black uppercase tracking-wider text-xs">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newVital.date}
                      onChange={(e) => setNewVital({ ...newVital, date: e.target.value })}
                      required
                      className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time" className="font-black uppercase tracking-wider text-xs">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newVital.time}
                      onChange={(e) => setNewVital({ ...newVital, time: e.target.value })}
                      required
                      className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t-4 border-black border-dashed mt-6">
                  <Button type="submit" className="h-12 border-4 border-black rounded-none shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all bg-destructive text-black font-black uppercase tracking-wider w-full sm:w-auto">
                    Save Reading
                  </Button>
                  <Button type="button" variant="outline" className="h-12 border-4 border-black rounded-none bg-white text-black hover:bg-gray-100 font-black uppercase tracking-wider w-full sm:w-auto transition-colors">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Quick Add Buttons */}
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-gray-100 pb-4">
              <CardTitle className="font-black uppercase tracking-wider text-xl">Quick Add</CardTitle>
              <CardDescription className="font-bold text-black uppercase">Common vital signs for quick entry</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-24 border-4 border-black rounded-none bg-white hover:bg-secondary hover:text-black hover:-translate-y-1 hover:translate-x-1 transition-all shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center space-y-2 group">
                  <Heart className="w-8 h-8 text-black group-hover:scale-110 transition-transform" strokeWidth={3} />
                  <span className="font-black uppercase text-xs">Blood Pressure</span>
                </Button>
                <Button variant="outline" className="h-24 border-4 border-black rounded-none bg-white hover:bg-[#4ade80] hover:text-black hover:-translate-y-1 hover:translate-x-1 transition-all shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center space-y-2 group">
                  <Activity className="w-8 h-8 text-black group-hover:scale-110 transition-transform" strokeWidth={3} />
                  <span className="font-black uppercase text-xs">Heart Rate</span>
                </Button>
                <Button variant="outline" className="h-24 border-4 border-black rounded-none bg-white hover:bg-[#60a5fa] hover:text-black hover:-translate-y-1 hover:translate-x-1 transition-all shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center space-y-2 group">
                  <Weight className="w-8 h-8 text-black group-hover:scale-110 transition-transform" strokeWidth={3} />
                  <span className="font-black uppercase text-xs">Weight</span>
                </Button>
                <Button variant="outline" className="h-24 border-4 border-black rounded-none bg-white hover:bg-destructive hover:text-black hover:-translate-y-1 hover:translate-x-1 transition-all shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center space-y-2 group">
                  <Thermometer className="w-8 h-8 text-black group-hover:scale-110 transition-transform" strokeWidth={3} />
                  <span className="font-black uppercase text-xs">Temperature</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
