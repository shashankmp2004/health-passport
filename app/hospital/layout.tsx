"use client"

import type React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { HospitalSidebar } from "@/components/hospital-sidebar"

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <HospitalSidebar />
      <main className="flex-1 overflow-auto">
        <div className="flex items-center gap-2 p-4 border-b bg-white">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">Provider Dashboard</h1>
          <div className="ml-auto flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Authenticated Provider</span>
          </div>
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}
