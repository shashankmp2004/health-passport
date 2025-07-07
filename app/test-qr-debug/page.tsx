"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { QRCodeCanvas } from 'qrcode.react'
import CameraQRScanner from "@/components/camera-qr-scanner"

export default function TestQRDebug() {
  const [encryptedData, setEncryptedData] = useState("")
  const [scannedData, setScannedData] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [manualTest, setManualTest] = useState("")

  // Test with some sample encrypted data
  const testData = "SFB2MjpVMkZzZEdWa1gxKzNiVE5QbnZpdUlDeU1aL0xuSCtwcWYrZExMZjZzVWhFSTZXT1ZyS1lFOURjeklEcHFH+ExZZQEsQbdtYerrl89/cg0Km3CBI/hloCaxKP3+UbxPQZV79toujBtLeHGfYsEehvG26wGdNyky+88CqmclZ979EH5kSZurrBcHmcyaqW+S1iFKrWGaY4E675Emkny2ZVngwpPncnlmXgD4GgT0gkzDoc0Z9i1DmEIwWw+Yd4XACONDFJQH2ylrPyPEkv22hR89IedmR31clgSz3/iyie7XguN39g7jf0DcuW74Jn7moWkGXsHZwQqFuxZ5O1XEwzPTXt9dNcyqlN2y0BUi9zqmQ=="

  const handleQRScan = (qrData: string) => {
    console.log('Camera scanned QR data:', qrData)
    setScannedData(qrData)
    setScanResult({ type: 'camera', data: qrData })
    setIsScanning(false)
  }

  const handleScanError = (error: string) => {
    console.error('QR scan error:', error)
    setScanResult({ type: 'error', error })
    setIsScanning(false)
  }

  const testManualInput = () => {
    console.log('Manual input test:', manualTest)
    setScanResult({ type: 'manual', data: manualTest })
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>QR Debug Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This page tests QR code generation and scanning without authentication.</p>
        </CardContent>
      </Card>

      {/* Test QR Code Display */}
      <Card>
        <CardHeader>
          <CardTitle>Test QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 border rounded-lg bg-white">
              <QRCodeCanvas 
                value={testData}
                size={256}
                level="M"
                includeMargin={true}
              />
            </div>
          </div>
          
          <div>
            <Label>Test QR Data (encrypted)</Label>
            <Textarea
              value={testData}
              readOnly
              className="h-32 font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Camera Scanner Test */}
      <Card>
        <CardHeader>
          <CardTitle>Camera Scanner Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button 
              onClick={() => setIsScanning(!isScanning)}
              variant={isScanning ? "destructive" : "default"}
            >
              {isScanning ? 'Stop Camera' : 'Start Camera'}
            </Button>
          </div>

          {isScanning && (
            <div className="border rounded-lg overflow-hidden">
              <CameraQRScanner
                onScan={handleQRScan}
                onError={handleScanError}
                isActive={isScanning}
                onClose={() => setIsScanning(false)}
              />
            </div>
          )}

          {scannedData && (
            <div>
              <Label>Camera Scanned Data</Label>
              <Textarea
                value={scannedData}
                readOnly
                className="h-32 font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Input Test */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Input Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Paste QR Data Here</Label>
            <Textarea
              value={manualTest}
              onChange={(e) => setManualTest(e.target.value)}
              placeholder="Paste the QR data to test..."
              className="h-32 font-mono text-sm"
            />
          </div>
          
          <Button onClick={testManualInput} disabled={!manualTest.trim()}>
            Test Manual Input
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(scanResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>The test QR code above contains encrypted patient data</li>
            <li>Use "Start Camera" to test camera-based QR scanning</li>
            <li>Point your camera at the QR code above</li>
            <li>Or copy the encrypted data and paste it in manual input</li>
            <li>Compare the results to see if scanning extracts the same data</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
