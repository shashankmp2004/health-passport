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
  Calendar,
  FileText,
  Activity,
  Pill,
  Heart,
  User,
  Settings,
  LogOut,
  Shield,
  Bell,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuItems = [
  {
    title: "Dashboard",
    url: "/patient/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Health Overview",
    url: "/patient/health-overview",
    icon: Activity,
  },
  {
    title: "Medical History",
    url: "/patient/medical-history",
    icon: FileText,
  },
  {
    title: "Visits",
    url: "/patient/visits",
    icon: Calendar,
  },
  {
    title: "Medications",
    url: "/patient/medications",
    icon: Pill,
  },
  {
    title: "Documents",
    url: "/patient/documents",
    icon: FileText,
  },
  {
    title: "Vitals",
    url: "/patient/vitals",
    icon: Heart,
  },
]

const accountItems = [
  {
    title: "Access Requests",
    url: "/patient/notifications",
    icon: Bell,
  },
  {
    title: "Profile",
    url: "/patient/profile",
    icon: User,
  },
  {
    title: "Privacy & Security",
    url: "/patient/privacy",
    icon: Shield,
  },
  {
    title: "Settings",
    url: "/patient/settings",
    icon: Settings,
  },
]

export function PatientSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r-4 border-black bg-white">
      <SidebarHeader className="p-4 border-b-4 border-black bg-secondary">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white border-4 border-black flex items-center justify-center shadow-brutal-sm -rotate-3">
            <Heart className="w-6 h-6 text-black" strokeWidth={3} />
          </div>
          <div>
            <h2 className="font-display font-black text-xl uppercase tracking-tighter mix-blend-multiply">HealthPassport</h2>
            <p className="text-xs font-bold font-mono bg-white border-2 border-black inline-block px-1">PATIENT PORTAL</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="font-black uppercase text-black mb-2 opacity-100">Health Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`h-12 border-4 border-transparent hover:border-black rounded-none transition-all ${isActive ? 'bg-primary border-black shadow-brutal-sm -rotate-1 translate-x-1 hover:bg-primary' : 'hover:bg-primary/20 hover:-rotate-1 hover:translate-x-1'}`}
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
          <SidebarGroupLabel className="font-black uppercase text-black mb-2 opacity-100">Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {accountItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`h-12 border-4 border-transparent hover:border-black rounded-none transition-all ${isActive ? 'bg-secondary border-black shadow-brutal-sm rotate-1 translate-x-1 hover:bg-secondary' : 'hover:bg-secondary/50 hover:rotate-1 hover:translate-x-1'}`}
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
