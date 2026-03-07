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
    <div className="p-6 md:p-8 space-y-8 bg-secondary min-h-screen selection:bg-black selection:text-white pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 brutal-enter">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mix-blend-multiply">Privacy & Security</h1>
          <p className="text-black font-bold text-lg border-l-4 border-black pl-3 mt-2 bg-white/50 inline-block pr-3">Control who can access your health information and how it's used</p>
        </div>
        <Badge className="bg-green-200 text-black border-4 border-black rounded-none font-black uppercase tracking-wider text-sm px-4 py-2 shadow-brutal-sm flex items-center">
          <Shield className="w-5 h-5 mr-2" strokeWidth={3} />
          Secure
        </Badge>
      </div>

      <Tabs defaultValue="privacy" className="w-full brutal-enter delay-100">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-14 bg-white border-4 border-black rounded-none p-0 shadow-brutal-sm gap-0">
          <TabsTrigger value="privacy" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-none border-r-4 border-b-4 md:border-b-0 border-black font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">Privacy Settings</TabsTrigger>
          <TabsTrigger value="access" className="data-[state=active]:bg-purple-200 data-[state=active]:text-black rounded-none border-r-0 md:border-r-4 border-b-4 md:border-b-0 border-black font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">Access Logs</TabsTrigger>
          <TabsTrigger value="sharing" className="data-[state=active]:bg-secondary data-[state=active]:text-black rounded-none border-r-4 border-black font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">Data Sharing</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-destructive data-[state=active]:text-black rounded-none font-black uppercase tracking-wider h-12 md:h-full text-xs sm:text-sm">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="privacy" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-primary/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Eye className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Data Visibility Settings</span>
              </CardTitle>
              <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1 uppercase">Control who can view and access your health information</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                {[
                  {
                    id: 'shareWithProviders',
                    title: 'Healthcare Providers',
                    desc: 'Allow authorized healthcare providers to access your complete medical records',
                    bg: 'bg-green-200/20',
                  },
                  {
                    id: 'shareWithFamily',
                    title: 'Family Members',
                    desc: 'Allow designated family members to view your health information',
                    bg: 'bg-purple-200/20',
                  },
                  {
                    id: 'anonymousResearch',
                    title: 'Anonymous Research',
                    desc: 'Contribute anonymized data to medical research and studies',
                    bg: 'bg-secondary/20',
                  },
                  {
                    id: 'marketingEmails',
                    title: 'Marketing Communications',
                    desc: 'Receive marketing emails and promotional health content',
                    bg: 'bg-destructive/20',
                  },
                  {
                    id: 'dataAnalytics',
                    title: 'Data Analytics',
                    desc: 'Allow analysis of your data to improve healthcare services',
                    bg: 'bg-primary/20',
                  },
                  {
                    id: 'thirdPartySharing',
                    title: 'Third-Party Sharing',
                    desc: 'Share data with third-party applications and services',
                    bg: 'bg-blue-200/20',
                  },
                ].map((setting) => (
                  <div key={setting.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all gap-4 ${setting.bg}`}>
                    <div>
                      <p className="font-black text-xl uppercase tracking-tighter mb-1">{setting.title}</p>
                      <p className="text-sm font-bold text-gray-800 border-l-4 border-black pl-2">
                        {setting.desc}
                      </p>
                    </div>
                    <div className="border-4 border-black bg-white p-1 shrink-0">
                      <Switch
                        checked={privacySettings[setting.id as keyof typeof privacySettings]}
                        onCheckedChange={(checked) =>
                          setPrivacySettings((prev) => ({ ...prev, [setting.id]: checked }))
                        }
                        className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-purple-200/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Clock className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Access History</span>
              </CardTitle>
              <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1 uppercase">View who has accessed your health information</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {accessLogs.map((log) => (
                  <div key={log.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all bg-white gap-4 group">
                    <div className="flex items-start md:items-center space-x-4">
                      <div className="flex-shrink-0 bg-gray-100 p-2 border-2 border-black group-hover:rotate-12 transition-transform">
                        {log.authorized ? (
                          <CheckCircle className="w-6 h-6 text-green-500" strokeWidth={3} />
                        ) : (
                          <XCircle className="w-6 h-6 text-destructive" strokeWidth={3} />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-xl uppercase tracking-tighter">{log.accessor}</p>
                        <p className="text-sm font-bold uppercase bg-secondary inline-block px-1 border-2 border-black mb-1 mt-1">{log.role}</p>
                        <p className="text-base font-bold border-l-4 border-black pl-2">{log.action}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t-4 border-black md:border-none border-dashed gap-3 md:gap-2">
                      <p className="text-sm font-black uppercase tracking-wider bg-gray-100 px-2 py-1 border-2 border-black">{log.timestamp}</p>
                      <Badge
                        className={`border-4 border-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm ${
                          log.authorized ? "bg-green-200 text-black" : "bg-destructive text-white"
                        }`}
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

        <TabsContent value="sharing" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-secondary/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Users className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Data Sharing Agreements</span>
              </CardTitle>
              <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1 uppercase">Manage your participation in research studies and data sharing</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {dataSharing.map((agreement, index) => (
                  <div key={index} className="p-5 border-4 border-black bg-white shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all group">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                      <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter group-hover:scale-[1.02] transition-transform origin-left">{agreement.organization}</h3>
                      <Badge
                        className={`border-4 border-black rounded-none font-black uppercase text-sm px-3 py-1 shadow-brutal-sm ${
                          agreement.status === "Active"
                            ? "bg-green-200 text-black"
                            : "bg-secondary text-black"
                        }`}
                      >
                        {agreement.status}
                      </Badge>
                    </div>
                    <p className="text-base font-bold border-l-4 border-black pl-3 mb-4 uppercase">{agreement.purpose}</p>
                    
                    <div className="mb-4">
                      <span className="text-xs font-black uppercase mb-2 block">Data Shared:</span>
                      <div className="flex flex-wrap gap-2">
                        {agreement.dataTypes.map((type, typeIndex) => (
                          <Badge key={typeIndex} className="bg-white text-black border-2 border-black rounded-none font-bold shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 transition-transform uppercase text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-4 border-t-4 border-black border-dashed">
                      <div className="bg-gray-100 border-2 border-black px-3 py-1.5 font-bold uppercase text-xs sm:text-sm shadow-[2px_2px_0px_#000]">
                        {new Date(agreement.startDate).toLocaleDateString()} <span className="mx-2 font-black">TO</span> {new Date(agreement.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex w-full sm:w-auto space-x-3">
                        <Button className="flex-1 sm:flex-none h-10 border-4 border-black rounded-none bg-white text-black hover:bg-black hover:text-white uppercase font-black tracking-wider transition-colors shadow-brutal-sm">
                          Details
                        </Button>
                        <Button className="flex-1 sm:flex-none h-10 border-4 border-black rounded-none bg-destructive text-white hover:bg-black hover:text-white uppercase font-black tracking-wider transition-colors shadow-brutal-sm">
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-8 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-destructive/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <Shield className="w-8 h-8 text-black transition-transform hover:scale-110" strokeWidth={3} />
                <span>Security Overview</span>
              </CardTitle>
              <CardDescription className="font-bold text-black border-l-4 border-black pl-2 ml-1 uppercase">Your account security status and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Security Score */}
              <div className="p-5 bg-green-200 border-4 border-black shadow-[4px_4px_0px_#000] rotate-1 hover:rotate-0 transition-transform">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="font-black text-2xl uppercase tracking-tighter text-black mb-1">Security Score: Excellent</h3>
                    <p className="text-base font-bold text-black uppercase bg-white px-2 py-0.5 border-2 border-black inline-block">Your account is well protected</p>
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-black bg-white p-3 border-4 border-black shadow-inner">
                    95<span className="text-xl text-gray-500">/100</span>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Strong Password",
                    desc: "Meets security requirements",
                    status: "Active",
                    icon: <CheckCircle className="w-8 h-8 text-black" strokeWidth={3} />,
                    action: null,
                    bg: "bg-green-200/20"
                  },
                  {
                    title: "2FA",
                    desc: "Add an extra layer of security",
                    status: "Inactive",
                    icon: <XCircle className="w-8 h-8 text-black" strokeWidth={3} />,
                    action: "Enable",
                    bg: "bg-destructive/20"
                  },
                  {
                    title: "Email Verification",
                    desc: "Email address is verified",
                    status: "Verified",
                    icon: <CheckCircle className="w-8 h-8 text-black" strokeWidth={3} />,
                    action: null,
                    bg: "bg-green-200/20"
                  },
                  {
                    title: "Data Encryption",
                    desc: "Encrypted at rest and transit",
                    status: "Active",
                    icon: <CheckCircle className="w-8 h-8 text-black" strokeWidth={3} />,
                    action: null,
                    bg: "bg-green-200/20"
                  }
                ].map((feature, i) => (
                  <div key={i} className="flex flex-col h-full justify-between p-5 border-4 border-black bg-white shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 border-4 border-black ${feature.bg}`}>
                          {feature.icon}
                        </div>
                        {feature.status === "Active" || feature.status === "Verified" ? (
                          <Badge className="bg-green-200 text-black border-2 border-black rounded-none font-black uppercase shadow-brutal-sm">
                            {feature.status}
                          </Badge>
                        ) : (
                          <Badge className="bg-white text-black border-2 border-dashed border-black rounded-none font-black uppercase shadow-brutal-sm">
                            {feature.status}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-black text-xl uppercase tracking-tighter mb-1">{feature.title}</h4>
                      <p className="text-sm font-bold text-gray-800 border-l-4 border-black pl-2 mb-4">{feature.desc}</p>
                    </div>
                    {feature.action && (
                      <Button className="w-full h-10 border-4 border-black rounded-none bg-black text-white hover:bg-secondary hover:text-black uppercase font-black tracking-wider transition-colors shadow-brutal-sm">
                        {feature.action}
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Security Recommendations */}
              <div className="pt-8 border-t-8 border-black">
                <h3 className="font-display font-black text-2xl uppercase tracking-tighter mb-6 flex items-center bg-secondary w-fit px-3 py-1 border-4 border-black -rotate-1">
                  <AlertTriangle className="w-6 h-6 mr-3 text-black" strokeWidth={3} />
                  Recommendations
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white border-4 border-black border-dashed shadow-[4px_4px_0px_#000] flex items-start gap-4 hover:-translate-y-1 hover:-translate-x-1 transition-transform">
                    <div className="bg-secondary p-2 border-2 border-black mt-1">
                      <Shield className="w-6 h-6 text-black" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="font-black text-lg uppercase">Enable Two-Factor Authentication</p>
                      <p className="text-sm font-bold text-gray-700">Protect your account with an additional verification step when modifying sensitive settings.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white border-4 border-black border-dashed shadow-[4px_4px_0px_#000] flex items-start gap-4 hover:-translate-y-1 hover:-translate-x-1 transition-transform">
                    <div className="bg-primary/50 p-2 border-2 border-black mt-1">
                      <Eye className="w-6 h-6 text-black" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="font-black text-lg uppercase">Review Access Permissions</p>
                      <p className="text-sm font-bold text-gray-700">Regularly review who has access to your health information in the Privacy Settings tab.</p>
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
