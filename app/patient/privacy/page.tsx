"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Eye, Users, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export default function PatientPrivacy() {
  const [privacySettings, setPrivacySettings] = useState({
    shareWithProviders: true,
    shareWithFamily: false,
    anonymousResearch: true,
    marketingEmails: false,
    dataAnalytics: true,
    thirdPartySharing: false,
  })

  const accessLogs = [
    {
      id: 1,
      accessor: "Dr. Michael Chen",
      role: "Primary Care Physician",
      action: "Viewed Medical History",
      timestamp: "2024-01-15 10:30 AM",
      authorized: true,
    },
    {
      id: 2,
      accessor: "Nurse Sarah Wilson",
      role: "Registered Nurse",
      action: "Updated Vitals",
      timestamp: "2024-01-15 09:15 AM",
      authorized: true,
    },
    {
      id: 3,
      accessor: "Lab Technician",
      role: "Laboratory Staff",
      action: "Added Lab Results",
      timestamp: "2024-01-14 02:45 PM",
      authorized: true,
    },
    {
      id: 4,
      accessor: "Unknown User",
      role: "External",
      action: "Attempted Access",
      timestamp: "2024-01-14 11:22 PM",
      authorized: false,
    },
  ]

  const dataSharing = [
    {
      organization: "Mayo Clinic Research",
      purpose: "Diabetes Research Study",
      dataTypes: ["Blood glucose readings", "Medication adherence"],
      status: "Active",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
    {
      organization: "CDC Health Survey",
      purpose: "Public Health Statistics",
      dataTypes: ["Demographics", "Vaccination records"],
      status: "Pending Approval",
      startDate: "2024-02-01",
      endDate: "2024-06-30",
    },
  ]

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Privacy & Security</h1>
          <p className="text-gray-600">Control who can access your health information and how it's used</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Shield className="w-4 h-4 mr-1" />
          Secure
        </Badge>
      </div>

      <Tabs defaultValue="privacy" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="privacy">Privacy Settings</TabsTrigger>
          <TabsTrigger value="access">Access Logs</TabsTrigger>
          <TabsTrigger value="sharing">Data Sharing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span>Data Visibility Settings</span>
              </CardTitle>
              <CardDescription>Control who can view and access your health information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Healthcare Providers</p>
                    <p className="text-sm text-gray-600">
                      Allow authorized healthcare providers to access your complete medical records
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.shareWithProviders}
                    onCheckedChange={(checked) =>
                      setPrivacySettings((prev) => ({ ...prev, shareWithProviders: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Family Members</p>
                    <p className="text-sm text-gray-600">
                      Allow designated family members to view your health information
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.shareWithFamily}
                    onCheckedChange={(checked) => setPrivacySettings((prev) => ({ ...prev, shareWithFamily: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Anonymous Research</p>
                    <p className="text-sm text-gray-600">Contribute anonymized data to medical research and studies</p>
                  </div>
                  <Switch
                    checked={privacySettings.anonymousResearch}
                    onCheckedChange={(checked) =>
                      setPrivacySettings((prev) => ({ ...prev, anonymousResearch: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Marketing Communications</p>
                    <p className="text-sm text-gray-600">Receive marketing emails and promotional health content</p>
                  </div>
                  <Switch
                    checked={privacySettings.marketingEmails}
                    onCheckedChange={(checked) => setPrivacySettings((prev) => ({ ...prev, marketingEmails: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Data Analytics</p>
                    <p className="text-sm text-gray-600">Allow analysis of your data to improve healthcare services</p>
                  </div>
                  <Switch
                    checked={privacySettings.dataAnalytics}
                    onCheckedChange={(checked) => setPrivacySettings((prev) => ({ ...prev, dataAnalytics: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Third-Party Sharing</p>
                    <p className="text-sm text-gray-600">Share data with third-party applications and services</p>
                  </div>
                  <Switch
                    checked={privacySettings.thirdPartySharing}
                    onCheckedChange={(checked) =>
                      setPrivacySettings((prev) => ({ ...prev, thirdPartySharing: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span>Access History</span>
              </CardTitle>
              <CardDescription>View who has accessed your health information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {log.authorized ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{log.accessor}</p>
                        <p className="text-sm text-gray-600">{log.role}</p>
                        <p className="text-sm text-gray-500">{log.action}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{log.timestamp}</p>
                      <Badge
                        variant={log.authorized ? "default" : "destructive"}
                        className={log.authorized ? "bg-green-100 text-green-800" : ""}
                      >
                        {log.authorized ? "Authorized" : "Blocked"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-orange-600" />
                <span>Data Sharing Agreements</span>
              </CardTitle>
              <CardDescription>Manage your participation in research studies and data sharing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataSharing.map((agreement, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{agreement.organization}</h3>
                      <Badge
                        variant={agreement.status === "Active" ? "default" : "secondary"}
                        className={
                          agreement.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {agreement.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{agreement.purpose}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {agreement.dataTypes.map((type, typeIndex) => (
                        <Badge key={typeIndex} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {agreement.startDate} - {agreement.endDate}
                      </span>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 bg-transparent">
                          Revoke Access
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-red-600" />
                <span>Security Overview</span>
              </CardTitle>
              <CardDescription>Your account security status and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Security Score */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-green-800">Security Score: Excellent</h3>
                    <p className="text-sm text-green-600">Your account is well protected</p>
                  </div>
                  <div className="text-2xl font-bold text-green-700">95/100</div>
                </div>
              </div>

              {/* Security Features */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Strong Password</p>
                      <p className="text-sm text-gray-600">Password meets security requirements</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Email Verification</p>
                      <p className="text-sm text-gray-600">Email address is verified</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Data Encryption</p>
                      <p className="text-sm text-gray-600">All data is encrypted at rest and in transit</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>

              {/* Security Recommendations */}
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-4 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                  Security Recommendations
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-medium text-yellow-800">Enable Two-Factor Authentication</p>
                    <p className="text-sm text-yellow-600">Protect your account with an additional verification step</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-blue-800">Review Access Permissions</p>
                    <p className="text-sm text-blue-600">Regularly review who has access to your health information</p>
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
