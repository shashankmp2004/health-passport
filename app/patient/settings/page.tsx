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
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and privacy settings</p>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data & Export</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Methods */}
              <div>
                <h3 className="font-medium mb-4">Notification Methods</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-gray-600">Receive notifications via text message</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, sms: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                    />
                  </div>
                </div>
              </div>

              {/* Notification Types */}
              <div className="pt-6 border-t">
                <h3 className="font-medium mb-4">Notification Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Appointment Reminders</p>
                      <p className="text-sm text-gray-600">Get reminded about upcoming appointments</p>
                    </div>
                    <Switch
                      checked={notifications.appointments}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, appointments: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Medication Reminders</p>
                      <p className="text-sm text-gray-600">Get reminded to take your medications</p>
                    </div>
                    <Switch
                      checked={notifications.medications}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, medications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Lab Results</p>
                      <p className="text-sm text-gray-600">Get notified when lab results are available</p>
                    </div>
                    <Switch
                      checked={notifications.labResults}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, labResults: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Emergency Alerts</p>
                      <p className="text-sm text-gray-600">Critical health alerts and emergencies</p>
                    </div>
                    <Switch
                      checked={notifications.emergencyAlerts}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, emergencyAlerts: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Privacy Settings</span>
              </CardTitle>
              <CardDescription>Control who can access your health information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Share with Healthcare Providers</p>
                    <p className="text-sm text-gray-600">
                      Allow authorized healthcare providers to access your records
                    </p>
                  </div>
                  <Switch
                    checked={privacy.shareWithProviders}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, shareWithProviders: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Share with Family Members</p>
                    <p className="text-sm text-gray-600">Allow designated family members to view your health data</p>
                  </div>
                  <Switch
                    checked={privacy.shareWithFamily}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, shareWithFamily: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Anonymous Data for Research</p>
                    <p className="text-sm text-gray-600">Contribute anonymized data to medical research</p>
                  </div>
                  <Switch
                    checked={privacy.anonymousData}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, anonymousData: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Communications</p>
                    <p className="text-sm text-gray-600">Receive marketing emails and promotional content</p>
                  </div>
                  <Switch
                    checked={privacy.marketingEmails}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, marketingEmails: checked }))}
                  />
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-medium mb-4">Data Retention</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dataRetention">Data Retention Period</Label>
                    <Select defaultValue="indefinite">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="5years">5 Years</SelectItem>
                        <SelectItem value="10years">10 Years</SelectItem>
                        <SelectItem value="indefinite">Indefinite</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-600 mt-1">How long to keep your health records</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-red-600" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>Manage your account security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div>
                <h3 className="font-medium mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                  </div>

                  <Button className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="pt-6 border-t">
                <h3 className="font-medium mb-4">Two-Factor Authentication</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Authentication</p>
                      <p className="text-sm text-gray-600">Receive verification codes via SMS</p>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Authenticator App</p>
                      <p className="text-sm text-gray-600">Use an authenticator app for verification</p>
                    </div>
                    <Button variant="outline">Setup</Button>
                  </div>
                </div>
              </div>

              {/* Login Sessions */}
              <div className="pt-6 border-t">
                <h3 className="font-medium mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-gray-600">Chrome on Windows • Current location</p>
                      <p className="text-xs text-gray-500">Last active: Now</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Current
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Mobile App</p>
                      <p className="text-sm text-gray-600">iPhone • New York, NY</p>
                      <p className="text-xs text-gray-500">Last active: 2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-purple-600" />
                <span>Data Management</span>
              </CardTitle>
              <CardDescription>Export, backup, or delete your health data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Export */}
              <div>
                <h3 className="font-medium mb-4">Export Your Data</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Complete Health Record</p>
                        <p className="text-sm text-gray-600">Download all your health data in PDF format</p>
                      </div>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Raw Data (JSON)</p>
                        <p className="text-sm text-gray-600">Download machine-readable data for personal use</p>
                      </div>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export JSON
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Medical Documents</p>
                        <p className="text-sm text-gray-600">Download all uploaded documents and reports</p>
                      </div>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Files
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Backup */}
              <div className="pt-6 border-t">
                <h3 className="font-medium mb-4">Automatic Backup</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cloud Backup</p>
                      <p className="text-sm text-gray-600">Automatically backup your data to secure cloud storage</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-600" />
                <span>Account Management</span>
              </CardTitle>
              <CardDescription>Manage your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Information */}
              <div>
                <h3 className="font-medium mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="accountEmail">Email Address</Label>
                    <Input id="accountEmail" type="email" defaultValue="sarah.johnson@email.com" className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="est">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                        <SelectItem value="cst">Central Time (CST)</SelectItem>
                        <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t">
                <h3 className="font-medium mb-4 text-red-600">Danger Zone</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-800">Deactivate Account</p>
                        <p className="text-sm text-red-600">Temporarily disable your account</p>
                      </div>
                      <Button variant="outline" className="border-red-300 text-red-700 bg-transparent">
                        Deactivate
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-800">Delete Account</p>
                        <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
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
