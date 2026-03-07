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
    <SidebarProvider className="portal-theme">
      <PatientSidebar />
      <main className="flex-1 overflow-auto bg-gray-50 flex flex-col min-h-screen">
        <div className="flex items-center gap-4 p-4 md:p-6 border-b-4 border-black bg-white sticky top-0 z-50 shadow-brutal-sm">
          <SidebarTrigger className="border-4 border-black rounded-none shadow-brutal-sm hover:shadow-brutal-lg hover:-translate-y-1 transition-all bg-secondary text-black w-10 h-10" />
          <h1 className="text-xl md:text-3xl font-display font-black uppercase tracking-tighter">Patient Portal</h1>
        </div>
        <div className="flex-1 w-full bg-grid-pattern bg-[length:32px_32px]">
           {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
