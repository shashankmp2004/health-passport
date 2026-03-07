"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Bell, Shield, Smartphone, Mail, Download, Trash2, Eye, EyeOff } from "lucide-react"

export default function PatientSettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    appointments: true,
    medications: true,
    labResults: true,
    emergencyAlerts: true,
  })

  const [privacy, setPrivacy] = useState({
    shareWithProviders: true,
    shareWithFamily: false,
    anonymousData: true,
    marketingEmails: false,
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  return (
    <div className="p-6 md:p-8 space-y-8 bg-white min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight">Settings</h1>
          <p className="text-xl font-bold mt-2 uppercase border-l-4 border-black pl-3 bg-secondary/20 inline-block pr-4 py-1">
            Manage your account preferences and privacy settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="flex flex-wrap h-auto w-full justify-start gap-2 bg-transparent p-0 mb-8 border-b-4 border-black pb-4">
          <TabsTrigger 
            value="notifications"
            className="border-4 border-black rounded-none font-black uppercase text-sm px-6 py-3 data-[state=active]:bg-secondary data-[state=active]:text-black data-[state=active]:translate-x-1 data-[state=active]:-translate-y-1 data-[state=active]:shadow-brutal-sm transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] bg-white"
          >Notifications</TabsTrigger>
          <TabsTrigger 
            value="privacy"
            className="border-4 border-black rounded-none font-black uppercase text-sm px-6 py-3 data-[state=active]:bg-green-200 data-[state=active]:text-black data-[state=active]:translate-x-1 data-[state=active]:-translate-y-1 data-[state=active]:shadow-brutal-sm transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] bg-white"
          >Privacy</TabsTrigger>
          <TabsTrigger 
            value="security"
            className="border-4 border-black rounded-none font-black uppercase text-sm px-6 py-3 data-[state=active]:bg-destructive data-[state=active]:text-black data-[state=active]:translate-x-1 data-[state=active]:-translate-y-1 data-[state=active]:shadow-brutal-sm transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] bg-white"
          >Security</TabsTrigger>
          <TabsTrigger 
            value="data"
            className="border-4 border-black rounded-none font-black uppercase text-sm px-6 py-3 data-[state=active]:bg-purple-200 data-[state=active]:text-black data-[state=active]:translate-x-1 data-[state=active]:-translate-y-1 data-[state=active]:shadow-brutal-sm transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] bg-white"
          >Data & Export</TabsTrigger>
          <TabsTrigger 
            value="account"
            className="border-4 border-black rounded-none font-black uppercase text-sm px-6 py-3 data-[state=active]:bg-blue-200 data-[state=active]:text-black data-[state=active]:translate-x-1 data-[state=active]:-translate-y-1 data-[state=active]:shadow-brutal-sm transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] bg-white"
          >Account</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-secondary/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Bell className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription className="font-bold uppercase text-black">Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              {/* Notification Methods */}
              <div>
                <h3 className="font-black uppercase tracking-wider text-xl mb-6 flex items-center bg-gray-100 px-3 py-1 border-2 border-black -rotate-1 w-fit">
                  Notification Methods
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border-4 border-black bg-secondary/10 hover:shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1">
                    <div className="flex items-center space-x-4">
                      <div className="bg-secondary p-2 border-2 border-black">
                         <Mail className="w-6 h-6 text-black" strokeWidth={3} />
                      </div>
                      <div>
                        <p className="font-black uppercase text-lg">Email Notifications</p>
                        <p className="font-bold text-sm">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                      className="border-2 border-black data-[state=checked]:bg-secondary shadow-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border-4 border-black bg-secondary/10 hover:shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1">
                    <div className="flex items-center space-x-4">
                      <div className="bg-secondary p-2 border-2 border-black">
                         <Smartphone className="w-6 h-6 text-black" strokeWidth={3} />
                      </div>
                      <div>
                        <p className="font-black uppercase text-lg">SMS Notifications</p>
                        <p className="font-bold text-sm">Receive notifications via text message</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, sms: checked }))}
                      className="border-2 border-black data-[state=checked]:bg-secondary shadow-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border-4 border-black bg-secondary/10 hover:shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1">
                    <div className="flex items-center space-x-4">
                      <div className="bg-secondary p-2 border-2 border-black">
                        <Bell className="w-6 h-6 text-black" strokeWidth={3} />
                      </div>
                      <div>
                        <p className="font-black uppercase text-lg">Push Notifications</p>
                        <p className="font-bold text-sm">Receive push notifications in your browser</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                      className="border-2 border-black data-[state=checked]:bg-secondary shadow-none"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Types */}
              <div className="pt-8 mt-8 border-t-4 border-black border-dashed">
                <h3 className="font-black uppercase tracking-wider text-xl mb-6 flex items-center bg-gray-100 px-3 py-1 border-2 border-black -rotate-1 w-fit">
                   Notification Types
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border-l-8 border-black bg-gray-50 hover:bg-white hover:shadow-brutal-sm transition-all">
                    <div>
                      <p className="font-black uppercase text-lg">Appointment Reminders</p>
                      <p className="font-bold text-sm">Get reminded about upcoming appointments</p>
                    </div>
                    <Switch
                      checked={notifications.appointments}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, appointments: checked }))}
                      className="border-2 border-black data-[state=checked]:bg-secondary shadow-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border-l-8 border-black bg-gray-50 hover:bg-white hover:shadow-brutal-sm transition-all">
                    <div>
                      <p className="font-black uppercase text-lg">Medication Reminders</p>
                      <p className="font-bold text-sm">Get reminded to take your medications</p>
                    </div>
                    <Switch
                      checked={notifications.medications}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, medications: checked }))}
                      className="border-2 border-black data-[state=checked]:bg-secondary shadow-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border-l-8 border-black bg-gray-50 hover:bg-white hover:shadow-brutal-sm transition-all">
                    <div>
                      <p className="font-black uppercase text-lg">Lab Results</p>
                      <p className="font-bold text-sm">Get notified when lab results are available</p>
                    </div>
                    <Switch
                      checked={notifications.labResults}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, labResults: checked }))}
                      className="border-2 border-black data-[state=checked]:bg-secondary shadow-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border-l-8 border-destructive bg-destructive/10 hover:bg-destructive/20 hover:shadow-brutal-sm transition-all">
                    <div>
                      <p className="font-black uppercase text-lg text-black">Emergency Alerts</p>
                      <p className="font-bold text-sm">Critical health alerts and emergencies</p>
                    </div>
                    <Switch
                      checked={notifications.emergencyAlerts}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, emergencyAlerts: checked }))}
                      className="border-2 border-black data-[state=checked]:bg-destructive shadow-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-green-200/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Shield className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Privacy Settings</span>
              </CardTitle>
              <CardDescription className="font-bold uppercase text-black">Control who can access your health information</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border-4 border-black bg-green-200/10 hover:shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1">
                  <div>
                    <p className="font-black uppercase text-lg">Share with Healthcare Providers</p>
                    <p className="font-bold text-sm">
                      Allow authorized healthcare providers to access your records
                    </p>
                  </div>
                  <Switch
                    checked={privacy.shareWithProviders}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, shareWithProviders: checked }))}
                    className="border-2 border-black data-[state=checked]:bg-green-200 shadow-none"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border-4 border-black bg-green-200/10 hover:shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1">
                  <div>
                    <p className="font-black uppercase text-lg">Share with Family Members</p>
                    <p className="font-bold text-sm">Allow designated family members to view your health data</p>
                  </div>
                  <Switch
                    checked={privacy.shareWithFamily}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, shareWithFamily: checked }))}
                    className="border-2 border-black data-[state=checked]:bg-green-200 shadow-none"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border-4 border-black bg-green-200/10 hover:shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1">
                  <div>
                    <p className="font-black uppercase text-lg">Anonymous Data for Research</p>
                    <p className="font-bold text-sm">Contribute anonymized data to medical research</p>
                  </div>
                  <Switch
                    checked={privacy.anonymousData}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, anonymousData: checked }))}
                    className="border-2 border-black data-[state=checked]:bg-green-200 shadow-none"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border-4 border-black bg-green-200/10 hover:shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1">
                  <div>
                    <p className="font-black uppercase text-lg">Marketing Communications</p>
                    <p className="font-bold text-sm">Receive marketing emails and promotional content</p>
                  </div>
                  <Switch
                    checked={privacy.marketingEmails}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, marketingEmails: checked }))}
                    className="border-2 border-black data-[state=checked]:bg-green-200 shadow-none"
                  />
                </div>
              </div>

              <div className="pt-8 mt-8 border-t-4 border-black border-dashed">
                <h3 className="font-black uppercase tracking-wider text-xl mb-6 flex items-center bg-gray-100 px-3 py-1 border-2 border-black -rotate-1 w-fit">
                   Data Retention
                </h3>
                <div className="space-y-4">
                  <div className="grid gap-2 max-w-sm">
                    <Label htmlFor="dataRetention" className="font-black uppercase tracking-wider text-xs">Data Retention Period</Label>
                    <Select defaultValue="indefinite">
                      <SelectTrigger className="h-12 border-4 border-black rounded-none text-black font-bold focus:ring-0 focus:ring-offset-0 disabled:opacity-50 disabled:bg-gray-100 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-4 border-black rounded-none shadow-brutal-sm">
                        <SelectItem value="1year" className="font-bold cursor-pointer focus:bg-green-200 focus:text-black">1 Year</SelectItem>
                        <SelectItem value="5years" className="font-bold cursor-pointer focus:bg-green-200 focus:text-black">5 Years</SelectItem>
                        <SelectItem value="10years" className="font-bold cursor-pointer focus:bg-green-200 focus:text-black">10 Years</SelectItem>
                        <SelectItem value="indefinite" className="font-bold cursor-pointer focus:bg-green-200 focus:text-black">Indefinite</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm font-bold mt-1">How long to keep your health records</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-destructive/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Shield className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription className="font-bold uppercase text-black">Manage your account security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              {/* Change Password */}
              <div>
                <h3 className="font-black uppercase tracking-wider text-xl mb-6 flex items-center bg-gray-100 px-3 py-1 border-2 border-black -rotate-1 w-fit">
                   Change Password
                </h3>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="font-black uppercase tracking-wider text-xs">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-shadow focus-within:shadow-[4px_4px_0px_#000] pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5 text-black" /> : <Eye className="h-5 w-5 text-black" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="font-black uppercase tracking-wider text-xs">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                         className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-shadow focus-within:shadow-[4px_4px_0px_#000] pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5 text-black" /> : <Eye className="h-5 w-5 text-black" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="font-black uppercase tracking-wider text-xs">Confirm New Password</Label>
                    <Input 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="Confirm new password" 
                        className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-shadow focus-within:shadow-[4px_4px_0px_#000]"
                    />
                  </div>

                  <Button className="h-12 border-4 border-black rounded-none shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all bg-destructive text-black font-black uppercase tracking-wider w-full mt-4">
                     Update Password
                  </Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="pt-8 mt-8 border-t-4 border-black border-dashed">
                <h3 className="font-black uppercase tracking-wider text-xl mb-6 flex items-center bg-gray-100 px-3 py-1 border-2 border-black -rotate-1 w-fit">
                   Two-Factor Authentication
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-4 border-black bg-white shadow-[4px_4px_0px_#000] gap-4">
                    <div>
                      <p className="font-black uppercase text-lg">SMS Authentication</p>
                      <p className="font-bold text-sm">Receive verification codes via SMS</p>
                    </div>
                    <Button className="h-10 border-4 border-black rounded-none shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all bg-secondary text-black font-black uppercase tracking-wider w-full sm:w-auto">
                        Enable
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-4 border-black bg-white shadow-[4px_4px_0px_#000] gap-4">
                    <div>
                      <p className="font-black uppercase text-lg">Authenticator App</p>
                      <p className="font-bold text-sm">Use an authenticator app for verification</p>
                    </div>
                    <Button className="h-10 border-4 border-black rounded-none shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all bg-secondary text-black font-black uppercase tracking-wider w-full sm:w-auto">
                        Setup
                    </Button>
                  </div>
                </div>
              </div>

              {/* Login Sessions */}
              <div className="pt-8 mt-8 border-t-4 border-black border-dashed">
                <h3 className="font-black uppercase tracking-wider text-xl mb-6 flex items-center bg-gray-100 px-3 py-1 border-2 border-black -rotate-1 w-fit">
                   Active Sessions
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-4 border-black bg-green-200/20 gap-4">
                    <div>
                      <p className="font-black uppercase text-lg flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-black"></span>
                          Current Session
                      </p>
                      <p className="font-bold text-sm mt-1">Chrome on Windows • Current location</p>
                      <p className="text-xs font-bold uppercase mt-1 px-2 py-0.5 bg-black text-white inline-block">Last active: Now</p>
                    </div>
                    <Button disabled className="h-10 border-4 border-black rounded-none bg-gray-200 text-gray-500 font-black uppercase tracking-wider w-full sm:w-auto opacity-100 cursor-not-allowed">
                      Current
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-4 border-black bg-white gap-4">
                    <div>
                      <p className="font-black uppercase text-lg">Mobile App</p>
                      <p className="font-bold text-sm mt-1">iPhone • New York, NY</p>
                      <p className="text-xs font-bold uppercase mt-1 px-2 py-0.5 border-2 border-black inline-block">Last active: 2 hours ago</p>
                    </div>
                    <Button className="h-10 border-4 border-black rounded-none shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all bg-white hover:bg-red-500 hover:text-white text-black font-black uppercase tracking-wider w-full sm:w-auto">
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-purple-200/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Download className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Data Management</span>
              </CardTitle>
              <CardDescription className="font-bold uppercase text-black">Export, backup, or delete your health data</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              {/* Data Export */}
              <div>
                <h3 className="font-black uppercase tracking-wider text-xl mb-6 flex items-center bg-gray-100 px-3 py-1 border-2 border-black -rotate-1 w-fit">
                   Export Your Data
                </h3>
                <div className="space-y-4">
                  <div className="p-4 border-4 border-black bg-purple-200/10 hover:shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-black uppercase text-lg">Complete Health Record</p>
                        <p className="font-bold text-sm">Download all your health data in PDF format</p>
                      </div>
                      <Button className="h-10 border-4 border-black rounded-none shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all bg-white text-black font-black uppercase tracking-wider w-full sm:w-auto group">
                        <Download className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform" strokeWidth={3} />
                        Export PDF
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border-4 border-black bg-purple-200/10 hover:shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-black uppercase text-lg">Raw Data (JSON)</p>
                        <p className="font-bold text-sm">Download machine-readable data for personal use</p>
                      </div>
                      <Button className="h-10 border-4 border-black rounded-none shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all bg-white text-black font-black uppercase tracking-wider w-full sm:w-auto group">
                        <Download className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform" strokeWidth={3} />
                        Export JSON
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border-4 border-black bg-purple-200/10 hover:shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-black uppercase text-lg">Medical Documents</p>
                        <p className="font-bold text-sm">Download all uploaded documents and reports</p>
                      </div>
                      <Button className="h-10 border-4 border-black rounded-none shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all bg-white text-black font-black uppercase tracking-wider w-full sm:w-auto group">
                        <Download className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform" strokeWidth={3} />
                        Export Files
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Backup */}
              <div className="pt-8 mt-8 border-t-4 border-black border-dashed">
                <h3 className="font-black uppercase tracking-wider text-xl mb-6 flex items-center bg-gray-100 px-3 py-1 border-2 border-black -rotate-1 w-fit">
                   Automatic Backup
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border-4 border-black bg-white shadow-[4px_4px_0px_#000]">
                    <div>
                      <p className="font-black uppercase text-lg">Cloud Backup</p>
                      <p className="font-bold text-sm">Automatically backup your data to secure cloud storage</p>
                    </div>
                    <Switch defaultChecked className="border-2 border-black data-[state=checked]:bg-purple-200 shadow-none" />
                  </div>

                  <div className="grid gap-2 max-w-sm pt-4">
                    <Label htmlFor="backupFrequency" className="font-black uppercase tracking-wider text-xs">Backup Frequency</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger className="h-12 border-4 border-black rounded-none text-black font-bold focus:ring-0 focus:ring-offset-0 disabled:opacity-50 disabled:bg-gray-100 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-4 border-black rounded-none shadow-brutal-sm">
                        <SelectItem value="daily" className="font-bold cursor-pointer focus:bg-purple-200 focus:text-black">Daily</SelectItem>
                        <SelectItem value="weekly" className="font-bold cursor-pointer focus:bg-purple-200 focus:text-black">Weekly</SelectItem>
                        <SelectItem value="monthly" className="font-bold cursor-pointer focus:bg-purple-200 focus:text-black">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-blue-200/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Settings className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Account Management</span>
              </CardTitle>
              <CardDescription className="font-bold uppercase text-black">Manage your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              {/* Account Information */}
              <div>
                <h3 className="font-black uppercase tracking-wider text-xl mb-6 flex items-center bg-gray-100 px-3 py-1 border-2 border-black -rotate-1 w-fit">
                   Account Information
                </h3>
                <div className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="accountEmail" className="font-black uppercase tracking-wider text-xs">Email Address</Label>
                    <Input 
                      id="accountEmail" 
                      type="email" 
                      defaultValue="sarah.johnson@email.com" 
                      className="h-12 border-4 border-black rounded-none text-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-shadow focus-within:shadow-[4px_4px_0px_#000]" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="font-black uppercase tracking-wider text-xs">Timezone</Label>
                    <Select defaultValue="est">
                      <SelectTrigger className="h-12 border-4 border-black rounded-none text-black font-bold focus:ring-0 focus:ring-offset-0 disabled:opacity-50 disabled:bg-gray-100 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-4 border-black rounded-none shadow-brutal-sm">
                        <SelectItem value="est" className="font-bold cursor-pointer hover:bg-blue-200 focus:bg-blue-200 focus:text-black">Eastern Time (EST)</SelectItem>
                        <SelectItem value="cst" className="font-bold cursor-pointer hover:bg-blue-200 focus:bg-blue-200 focus:text-black">Central Time (CST)</SelectItem>
                        <SelectItem value="mst" className="font-bold cursor-pointer hover:bg-blue-200 focus:bg-blue-200 focus:text-black">Mountain Time (MST)</SelectItem>
                        <SelectItem value="pst" className="font-bold cursor-pointer hover:bg-blue-200 focus:bg-blue-200 focus:text-black">Pacific Time (PST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="font-black uppercase tracking-wider text-xs">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="h-12 border-4 border-black rounded-none text-black font-bold focus:ring-0 focus:ring-offset-0 disabled:opacity-50 disabled:bg-gray-100 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-4 border-black rounded-none shadow-brutal-sm">
                        <SelectItem value="en" className="font-bold cursor-pointer focus:bg-blue-200 focus:text-black">English</SelectItem>
                        <SelectItem value="es" className="font-bold cursor-pointer focus:bg-blue-200 focus:text-black">Spanish</SelectItem>
                        <SelectItem value="fr" className="font-bold cursor-pointer focus:bg-blue-200 focus:text-black">French</SelectItem>
                        <SelectItem value="de" className="font-bold cursor-pointer focus:bg-blue-200 focus:text-black">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-8 mt-8 border-t-4 border-black border-dashed">
                <h3 className="font-black uppercase tracking-wider text-xl mb-6 flex items-center bg-red-500 text-white px-3 py-1 border-2 border-black rotate-1 w-fit">
                   Danger Zone
                </h3>
                <div className="space-y-4">
                  <div className="p-4 border-4 border-black bg-white hover:shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-black uppercase text-lg text-red-600">Deactivate Account</p>
                        <p className="font-bold text-sm">Temporarily disable your account</p>
                      </div>
                      <Button variant="outline" className="h-10 border-4 border-black rounded-none bg-white text-black hover:bg-red-100 font-black uppercase tracking-wider w-full sm:w-auto shadow-brutal-sm hover:translate-x-1 transition-all">
                        Deactivate
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border-4 border-black bg-red-100 hover:shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-black uppercase text-lg text-red-600">Delete Account</p>
                        <p className="font-bold text-sm">Permanently delete your account and all data</p>
                      </div>
                      <Button className="h-10 border-4 border-black rounded-none bg-red-500 text-white hover:bg-red-600 font-black uppercase tracking-wider w-full sm:w-auto shadow-brutal-sm hover:translate-x-1 transition-all">
                        <Trash2 className="w-4 h-4 mr-2" strokeWidth={3} />
                        Delete Account
                      </Button>
                    </div>
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
