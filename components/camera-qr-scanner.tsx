"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, RotateCcw, Square, Loader2, CheckCircle } from 'lucide-react'
import jsQR from 'jsqr'

interface CameraQRScannerProps {
  onScan: (data: string) => void
  onError: (error: string) => void
  isActive: boolean
  onClose: () => void
}

export default function CameraQRScanner({ onScan, onError, isActive, onClose }: CameraQRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)

  // QR Code scanning function
  const scanQRCode = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data from canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // Debug: Log scanning attempt (every 30 frames to avoid spam)
    if (Math.random() < 0.03) {
      console.log('Scanning frame...', { width: canvas.width, height: canvas.height })
    }

    // Scan for QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    })

    if (code && code.data) {
      console.log('QR Code detected:', code.data)
      setScanResult(code.data)
      setIsScanning(false)
      
      // Stop the scanning loop
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      
      // Call the onScan callback after a brief delay to show success
      setTimeout(() => {
        onScan(code.data)
      }, 1000)
      
      return
    }

    // Continue scanning if no QR code found
    if (isScanning) {
      animationRef.current = requestAnimationFrame(scanQRCode)
    }
  }, [isScanning, onScan])

  // Start scanning loop
  const startScanning = useCallback(() => {
    console.log('Starting QR code scanning...')
    setIsScanning(true)
    setScanResult(null)
    scanQRCode()
  }, [scanQRCode])

  // Stop scanning loop
  const stopScanning = useCallback(() => {
    setIsScanning(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isActive) {
      requestPermissionAndStart()
    } else {
      stopCamera()
      stopScanning()
    }

    return () => {
      stopCamera()
      stopScanning()
    }
  }, [isActive, facingMode])

  // Start scanning when video is ready
  useEffect(() => {
    const video = videoRef.current
    if (video && hasPermission && !isScanning && !scanResult) {
      const handleVideoReady = () => {
        if (video.readyState >= video.HAVE_ENOUGH_DATA) {
          startScanning()
        }
      }

      video.addEventListener('loadeddata', handleVideoReady)
      video.addEventListener('canplay', handleVideoReady)
      
      // Check if video is already ready
      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        startScanning()
      }

      return () => {
        video.removeEventListener('loadeddata', handleVideoReady)
        video.removeEventListener('canplay', handleVideoReady)
      }
    }
  }, [hasPermission, isScanning, scanResult, startScanning])

  const requestPermissionAndStart = async () => {
    try {
      setIsLoading(true)
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        onError('Camera access is not supported in this browser.')
        return
      }

      await startCamera()
      setHasPermission(true)
    } catch (error) {
      console.error('Permission/Camera error:', error)
      setHasPermission(false)
      onError('Camera permission denied or camera not available.')
    } finally {
      setIsLoading(false)
    }
  }

  const startCamera = async () => {
    // Stop any existing stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }

    const constraints = {
      video: {
        facingMode: facingMode,
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 }
      }
    }

    const newStream = await navigator.mediaDevices.getUserMedia(constraints)
    setStream(newStream)

    if (videoRef.current) {
      videoRef.current.srcObject = newStream
      await videoRef.current.play()
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const handleManualInput = () => {
    const qrData = prompt('Enter QR code data manually:')
    if (qrData && qrData.trim()) {
      onScan(qrData.trim())
    }
  }

  if (!isActive) return null

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white">
        <div className="relative">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">Scan QR Code</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Camera View */}
          <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
            {hasPermission === null || isLoading ? (
              <div className="text-white text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
                <p>Requesting camera access...</p>
              </div>
            ) : hasPermission === false ? (
              <div className="text-white text-center p-6">
                <CameraOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Camera Access Denied</p>
                <p className="text-sm opacity-75 mb-4">
                  Please allow camera access in your browser settings
                </p>
                <Button 
                  variant="secondary" 
                  onClick={handleManualInput}
                  className="bg-white text-black"
                >
                  Enter QR Code Manually
                </Button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                
                {/* Hidden canvas for QR code detection */}
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Success indicator */}
                    {scanResult ? (
                      <div className="text-center">
                        <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <CheckCircle className="w-16 h-16 text-white" />
                        </div>
                        <p className="text-white text-lg font-semibold">QR Code Detected!</p>
                        <p className="text-green-400 text-sm">Processing patient data...</p>
                      </div>
                    ) : (
                      <div>
                        {/* Corner markers */}
                        <div className="w-64 h-64 relative">
                          {/* Top-left corner */}
                          <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 ${isScanning ? 'border-green-400' : 'border-gray-400'}`}></div>
                          {/* Top-right corner */}
                          <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 ${isScanning ? 'border-green-400' : 'border-gray-400'}`}></div>
                          {/* Bottom-left corner */}
                          <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 ${isScanning ? 'border-green-400' : 'border-gray-400'}`}></div>
                          {/* Bottom-right corner */}
                          <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 ${isScanning ? 'border-green-400' : 'border-gray-400'}`}></div>
                          
                          {/* Scanning line animation */}
                          {isScanning && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-1 bg-green-400 opacity-75 animate-pulse"></div>
                            </div>
                          )}
                        </div>
                        
                        {/* Scanning status */}
                        <div className="text-center mt-4">
                          <p className="text-white text-sm">
                            {isScanning ? 'Scanning for QR code...' : 'Position QR code in frame'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={switchCamera}
                    className="bg-black/70 text-white hover:bg-black/90 backdrop-blur"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleManualInput}
                    className="bg-black/70 text-white hover:bg-black/90 backdrop-blur"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Manual
                  </Button>
                </div>
              </>
            )}
          </div>
          
          {/* Instructions */}
          <div className="p-4 bg-gray-50 text-center">
            <p className="text-sm text-gray-600">
              {hasPermission === false 
                ? "Camera access is required to scan QR codes" 
                : scanResult
                  ? "QR code detected successfully! Patient data is being loaded."
                  : isScanning
                    ? "Hold steady - scanning for QR code in the frame..."
                    : "Position the patient's QR code within the frame to scan"
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
