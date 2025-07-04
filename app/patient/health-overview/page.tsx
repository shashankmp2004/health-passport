"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Droplets, Activity, TrendingUp, Calendar, ArrowUp, ArrowDown } from "lucide-react"

export default function HealthOverview() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Health Overview</h1>
          <p className="text-gray-600">December 30, 2024</p>
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
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-bold text-orange-800">95</span>
                <span className="text-sm text-orange-600">mg/dL</span>
              </div>
              <Badge className="bg-orange-200 text-orange-800 hover:bg-orange-200">Normal</Badge>
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
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-bold text-red-800">72</span>
                <span className="text-sm text-red-600">bpm</span>
              </div>
              <Badge className="bg-red-200 text-red-800 hover:bg-red-200">Normal</Badge>
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
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-bold text-blue-800">120</span>
                <span className="text-lg font-semibold text-blue-700">/</span>
                <span className="text-2xl font-bold text-blue-800">80</span>
                <span className="text-sm text-blue-600">mmHg</span>
              </div>
              <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-200">Normal</Badge>
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
                <Select defaultValue="jan2021">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jan2021">Jan 2021</SelectItem>
                    <SelectItem value="feb2021">Feb 2021</SelectItem>
                    <SelectItem value="mar2021">Mar 2021</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg p-4">
                <div className="flex items-end justify-between h-full space-x-1">
                  {/* Simulated bar chart */}
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="flex flex-col items-center space-y-1 flex-1">
                      <div className="flex flex-col space-y-1 h-32 justify-end">
                        <div
                          className="bg-red-300 rounded-sm w-full"
                          style={{ height: `${Math.random() * 60 + 20}%` }}
                        ></div>
                        <div
                          className="bg-teal-300 rounded-sm w-full"
                          style={{ height: `${Math.random() * 40 + 10}%` }}
                        ></div>
                        <div
                          className="bg-orange-300 rounded-sm w-full"
                          style={{ height: `${Math.random() * 50 + 15}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 rotate-45 origin-left">{i + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-300 rounded"></div>
                    <span className="text-sm text-gray-600">Aerobics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-teal-300 rounded"></div>
                    <span className="text-sm text-gray-600">Yoga</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-300 rounded"></div>
                    <span className="text-sm text-gray-600">Meditation</span>
                  </div>
                </div>
              </div>
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
                <Select defaultValue="lastweek">
                  <SelectTrigger className="w-24 bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastweek">Last Week</SelectItem>
                    <SelectItem value="lastmonth">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-200 text-gray-800 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Height</div>
                  <div className="font-semibold">170 cm</div>
                </div>
                <div className="bg-blue-200 text-gray-800 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Weight</div>
                  <div className="font-semibold">72 kg</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold mb-2">24.9</div>
                <Badge className="bg-green-600 text-white hover:bg-green-600">You're Healthy</Badge>
              </div>

              <div className="bg-gray-700 rounded-lg p-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>15</span>
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                  <span>40</span>
                </div>
                <div className="h-2 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 rounded-full relative">
                  <div className="absolute top-0 left-1/2 w-1 h-2 bg-white rounded-full transform -translate-x-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Body Measurements */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
            <CardHeader>
              <CardTitle className="text-white">Body Measurements</CardTitle>
              <CardDescription className="text-gray-300">Last checked 2 Days Ago</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <Badge className="bg-gray-700 text-white">Inverted Triangle Body Shape</Badge>
              </div>

              <div className="flex justify-between items-center">
                <div className="space-y-4 flex-1">
                  <div className="bg-white text-gray-800 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Chest (in)</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold">44.5</span>
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white text-gray-800 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Waist (in)</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold">34</span>
                      <ArrowDown className="w-4 h-4 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white text-gray-800 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Hip (in)</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold">42.5</span>
                      <ArrowDown className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <div className="w-24 h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      {/* Human Body PNG Image */}
                      <img
                        src="https://img.pristyncare.com/static_pages/gpPages/fitguy.png"
                        alt="Human Body Measurements"
                        className="w-30 h-35 object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
