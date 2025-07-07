"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { QRCodeCanvas } from 'qrcode.react'
import { useSession } from "next-auth/react"

export default function TestQR() {
  const [patientId, setPatientId] = useState("")
  const [generatedQR, setGeneratedQR] = useState<any>(null)
  const [qrDataInput, setQrDataInput] = useState("")
  const [scanResult, setScanResult] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [rawQRData, setRawQRData] = useState("")
  
  const { data: session } = useSession()

  const handleGenerateQR = async () => {
    if (!patientId.trim()) {
      alert("Please enter a patient ID")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch(`/api/qr/generate/${patientId}?type=full&purpose=Test QR Code&format=data_url`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate QR code')
      }

      const result = await response.json()
      setGeneratedQR(result.data)
      
      // Extract the raw encrypted data that was used to generate the QR
      // We need to make another call to get this in text format
      const textResponse = await fetch(`/api/qr/generate/${patientId}?type=full&purpose=Test QR Code&format=text`)
      if (textResponse.ok) {
        const textResult = await textResponse.json()
        setRawQRData(textResult.data.qrCode || "Could not get raw data")
      }
      
    } catch (error) {
      console.error('Error generating QR:', error)
      alert(error instanceof Error ? error.message : "Failed to generate QR code")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScanQR = async () => {
    if (!qrDataInput.trim()) {
      alert("Please enter QR data to scan")
      return
    }

    setIsScanning(true)
    try {
      const response = await fetch('/api/qr/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrData: qrDataInput.trim(),
          purpose: 'Test QR Scan'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to scan QR code')
      }

      const result = await response.json()
      setScanResult(result.data)
      
    } catch (error) {
      console.error('Error scanning QR:', error)
      alert(error instanceof Error ? error.message : "Failed to scan QR code")
    } finally {
      setIsScanning(false)
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Please log in to test QR functionality.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Generation & Scanning Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="patientId">Patient ID</Label>
            <Input
              id="patientId"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter patient ID to generate QR for..."
            />
          </div>
          
          <Button 
            onClick={handleGenerateQR} 
            disabled={isGenerating || !patientId.trim()}
          >
            {isGenerating ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </CardContent>
      </Card>

      {generatedQR && (
        <Card>
          <CardHeader>
            <CardTitle>Generated QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={generatedQR.qrCode} 
                alt="Generated QR Code" 
                className="border"
              />
            </div>
            
            <div>
              <Label>QR Data (for manual testing)</Label>
              <Textarea
                value={rawQRData}
                readOnly
                className="h-32 font-mono text-sm"
              />
            </div>
            
            <div>
              <Label>Patient Info</Label>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(generatedQR.patient, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test QR Scanning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="qrInput">QR Data to Scan</Label>
            <Textarea
              id="qrInput"
              value={qrDataInput}
              onChange={(e) => setQrDataInput(e.target.value)}
              placeholder="Paste the raw QR data here to test scanning..."
              className="h-32 font-mono text-sm"
            />
          </div>
          
          <Button 
            onClick={handleScanQR} 
            disabled={isScanning || !qrDataInput.trim()}
          >
            {isScanning ? 'Scanning...' : 'Scan QR Data'}
          </Button>
        </CardContent>
      </Card>

      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(scanResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
