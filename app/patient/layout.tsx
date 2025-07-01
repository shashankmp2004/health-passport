"use client"

import type React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { PatientSidebar } from "@/components/patient-sidebar"

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <PatientSidebar />
      <main className="flex-1 overflow-auto">
        <div className="flex items-center gap-2 p-4 border-b bg-white">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">Patient Portal</h1>
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}
