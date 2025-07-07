"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, Camera, User, FileText, CheckCircle, Scan, History, Shield, AlertTriangle } from "lucide-react"

export default function QRScannerPage() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'history'>('scanner')

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Code Scanner</h1>
          <p className="text-muted-foreground">
            Scan patient QR codes for quick record access
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          Scanner Active
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'scanner' | 'history')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            QR Scanner
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Scan History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                QR Code Scanner
              </CardTitle>
              <CardDescription>
                Position the QR code within the camera view or enter QR data manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>QR Scanner component will be added here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Scans
              </CardTitle>
              <CardDescription>
                View recent QR code scans and patient access logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Scan history will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
