"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Search,
  Users,
  FileText,
  Activity,
  Calendar,
  Settings,
  LogOut,
  Hospital,
  QrCode,
  BarChart3,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuItems = [
  {
    title: "Dashboard",
    url: "/hospital/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Patient Search",
    url: "/hospital/patient-search",
    icon: Search,
  },
  {
    title: "QR Scanner",
    url: "/hospital/qr-scanner",
    icon: QrCode,
  },
  {
    title: "Patient Records",
    url: "/hospital/patient-records",
    icon: FileText,
  },
  {
    title: "Analytics",
    url: "/hospital/analytics",
    icon: BarChart3,
  },
  {
    title: "Appointments",
    url: "/hospital/appointments",
    icon: Calendar,
  },
  {
    title: "Alerts",
    url: "/hospital/alerts",
    icon: AlertTriangle,
  },
]

const managementItems = [
  {
    title: "Staff Management",
    url: "/hospital/staff",
    icon: Users,
  },
  {
    title: "System Health",
    url: "/hospital/system-health",
    icon: Activity,
  },
  {
    title: "Settings",
    url: "/hospital/settings",
    icon: Settings,
  },
]

export function HospitalSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Hospital className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">HealthPassport</h2>
            <p className="text-sm text-gray-600">Provider Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Patient Care</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
