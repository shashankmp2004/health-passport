"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Building2,
  Bell,
  Shield,
  Key,
  CreditCard,
  HelpCircle,
  Save,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Plus,
} from "lucide-react"

export default function HospitalSettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    weeklyReports: true,
    systemUpdates: true,
  })

  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    sessionTimeout: "30",
    passwordExpiry: "90",
    ipWhitelist: true,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Hospital Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API & Integration</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Hospital Information</span>
              </CardTitle>
              <CardDescription>Update your hospital's basic information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospital-name">Hospital Name</Label>
                  <Input id="hospital-name" defaultValue="General Hospital" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital-id">Hospital ID</Label>
                  <Input id="hospital-id" defaultValue="GH-2024-001" disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" defaultValue="123 Medical Center Drive, Healthcare City, HC 12345" rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" defaultValue="contact@generalhospital.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license">Medical License Number</Label>
                  <Input id="license" defaultValue="ML-123456789" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accreditation">Accreditation Status</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Accredited
                    </Badge>
                    <span className="text-sm text-gray-600">Valid until Dec 2025</span>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>Configure how you want to receive alerts and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-gray-600">Receive critical alerts via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Alerts</Label>
                    <p className="text-sm text-gray-600">Receive urgent notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notifications.smsAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, smsAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-600">Browser and mobile app notifications</p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-gray-600">Weekly analytics and summary reports</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Updates</Label>
                    <p className="text-sm text-gray-600">Notifications about system maintenance and updates</p>
                  </div>
                  <Switch
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, systemUpdates: checked })}
                  />
                </div>
              </div>

              <Button className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>Manage security policies and access controls for your hospital</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Require 2FA for all staff logins</p>
                  </div>
                  <Switch
                    checked={security.twoFactorAuth}
                    onCheckedChange={(checked) => setSecurity({ ...security, twoFactorAuth: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                  <Input
                    id="password-expiry"
                    type="number"
                    value={security.passwordExpiry}
                    onChange={(e) => setSecurity({ ...security, passwordExpiry: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>IP Whitelist</Label>
                    <p className="text-sm text-gray-600">Restrict access to approved IP addresses</p>
                  </div>
                  <Switch
                    checked={security.ipWhitelist}
                    onCheckedChange={(checked) => setSecurity({ ...security, ipWhitelist: checked })}
                  />
                </div>
              </div>

              <Button className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Update Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API & Integration */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>API Keys & Integration</span>
              </CardTitle>
              <CardDescription>Manage API keys and third-party integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary API Key</Label>
                  <div className="flex space-x-2">
                    <Input type={showApiKey ? "text" : "password"} value="hpk_live_1234567890abcdef" readOnly />
                    <Button variant="outline" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate Key
                  </Button>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Key
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Webhook Endpoints</h4>
                <div className="space-y-2">
                  <Input placeholder="https://your-hospital.com/webhooks/healthpassport" />
                  <Button variant="outline" className="w-full bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Webhook
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">System Integrations</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">EHR System</h5>
                          <p className="text-sm text-gray-600">Epic MyChart</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Connected
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Lab System</h5>
                          <p className="text-sm text-gray-600">LabCorp Connect</p>
                        </div>
                        <Badge variant="outline">Not Connected</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Pharmacy</h5>
                          <p className="text-sm text-gray-600">CVS Health API</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Connected
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Imaging</h5>
                          <p className="text-sm text-gray-600">PACS Integration</p>
                        </div>
                        <Badge variant="outline">Not Connected</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Billing & Subscription</span>
              </CardTitle>
              <CardDescription>Manage your subscription and billing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Enterprise Plan</h4>
                    <p className="text-sm text-gray-600">Unlimited patients, advanced analytics</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">$299</p>
                    <p className="text-sm text-gray-600">per month</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <CreditCard className="w-5 h-5" />
                    <span>•••• •••• •••• 4242</span>
                    <Badge variant="outline">Expires 12/25</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Billing Address</Label>
                  <div className="p-3 border rounded-lg">
                    <p>General Hospital</p>
                    <p>123 Medical Center Drive</p>
                    <p>Healthcare City, HC 12345</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline">Update Payment Method</Button>
                  <Button variant="outline">Download Invoice</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Usage Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">1,247</p>
                      <p className="text-sm text-gray-600">Active Patients</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">45,678</p>
                      <p className="text-sm text-gray-600">API Calls</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">2.3TB</p>
                      <p className="text-sm text-gray-600">Data Storage</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support */}
        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5" />
                <span>Support & Help</span>
              </CardTitle>
              <CardDescription>Get help and access support resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Documentation</h4>
                    <p className="text-sm text-gray-600 mb-3">Access comprehensive guides and API documentation</p>
                    <Button variant="outline" className="w-full bg-transparent">
                      View Docs
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Contact Support</h4>
                    <p className="text-sm text-gray-600 mb-3">Get help from our technical support team</p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Open Ticket
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Training Resources</h4>
                    <p className="text-sm text-gray-600 mb-3">Video tutorials and training materials</p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Watch Videos
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">System Status</h4>
                    <p className="text-sm text-gray-600 mb-3">Check current system status and uptime</p>
                    <Button variant="outline" className="w-full bg-transparent">
                      View Status
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Recent Support Tickets</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">API Integration Issue</p>
                      <p className="text-sm text-gray-600">Ticket #12345 - Opened 2 days ago</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      In Progress
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">QR Scanner Not Working</p>
                      <p className="text-sm text-gray-600">Ticket #12344 - Opened 5 days ago</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Resolved
                    </Badge>
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
