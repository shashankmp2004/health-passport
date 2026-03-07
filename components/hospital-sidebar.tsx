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
  Bell,
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
    title: "Add Patient",
    url: "/hospital/add-patient",
    icon: QrCode,
  },
  {
    title: "Patient Records",
    url: "/hospital/patient-records",
    icon: FileText,
  },
  {
    title: "Access Requests",
    url: "/hospital/access-requests",
    icon: Bell,
  },
  {
    title: "Analytics",
    url: "/hospital/analytics",
    icon: BarChart3,
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
    <Sidebar className="border-r-4 border-black bg-white">
      <SidebarHeader className="p-4 border-b-4 border-black bg-green-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white border-4 border-black flex items-center justify-center shadow-brutal-sm rotate-3">
            <Hospital className="w-6 h-6 text-black" strokeWidth={3} />
          </div>
          <div>
            <h2 className="font-display font-black text-xl uppercase tracking-tighter mix-blend-multiply">HealthPassport</h2>
            <p className="text-xs font-bold font-mono bg-white border-2 border-black inline-block px-1">PROVIDER PORTAL</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="font-black uppercase text-black mb-2 opacity-100">Patient Care</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`h-12 border-4 border-transparent hover:border-black rounded-none transition-all ${isActive ? 'bg-secondary border-black shadow-brutal-sm -rotate-1 translate-x-1 hover:bg-secondary' : 'hover:bg-secondary/20 hover:-rotate-1 hover:translate-x-1'}`}
                    >
                      <Link href={item.url} className="flex items-center space-x-3 w-full">
                        <item.icon className="w-5 h-5 text-black" strokeWidth={isActive ? 3 : 2} />
                        <span className={`font-black uppercase tracking-wider ${isActive ? 'text-black' : 'text-gray-700'}`}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6 border-t-4 border-dashed border-black pt-6">
          <SidebarGroupLabel className="font-black uppercase text-black mb-2 opacity-100">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {managementItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`h-12 border-4 border-transparent hover:border-black rounded-none transition-all ${isActive ? 'bg-primary border-black shadow-brutal-sm rotate-1 translate-x-1 hover:bg-primary' : 'hover:bg-primary/50 hover:rotate-1 hover:translate-x-1'}`}
                    >
                      <Link href={item.url} className="flex items-center space-x-3 w-full">
                        <item.icon className="w-5 h-5 text-black" strokeWidth={isActive ? 3 : 2} />
                        <span className={`font-black uppercase tracking-wider ${isActive ? 'text-black' : 'text-gray-700'}`}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t-4 border-black bg-accent">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
               asChild
               className="h-14 bg-white border-4 border-black shadow-brutal-sm rounded-none hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-lg transition-all text-destructive hover:bg-destructive hover:text-white group"
            >
              <Link href="/" className="flex justify-center items-center w-full">
                <LogOut className="w-5 h-5 mr-3 group-hover:animate-bounce" strokeWidth={3} />
                <span className="font-black uppercase tracking-wider text-base">Sign Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
