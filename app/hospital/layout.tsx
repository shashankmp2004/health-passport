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
    <SidebarProvider className="portal-theme">
      <HospitalSidebar />
      <main className="flex-1 overflow-auto bg-gray-50 flex flex-col min-h-screen">
        <div className="flex items-center gap-4 p-4 md:p-6 border-b-4 border-black bg-white sticky top-0 z-50 shadow-brutal-sm">
          <SidebarTrigger className="border-4 border-black rounded-none shadow-brutal-sm hover:shadow-brutal-lg hover:-translate-y-1 transition-all bg-secondary text-black w-10 h-10" />
          <h1 className="text-xl md:text-3xl font-display font-black uppercase tracking-tighter">Provider Dashboard</h1>
          <div className="ml-auto hidden sm:flex items-center space-x-3 bg-green-200 border-4 border-black p-2 px-4 shadow-brutal-sm -rotate-1 hover:rotate-0 transition-transform">
            <div className="w-3 h-3 bg-black border-2 border-white animate-pulse"></div>
            <span className="text-sm md:text-base font-black uppercase text-black">Active Provider</span>
          </div>
        </div>
        <div className="flex-1 w-full bg-grid-pattern bg-[length:32px_32px]">
           {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
