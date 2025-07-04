import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  QrCode, 
  Camera, 
  Upload, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  User, 
  Clock, 
  Shield,
  Eye,
  FileText,
  Phone,
  AlertTriangle,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScanSuccess?: (data: any) => void;
  onScanError?: (error: string) => void;
}

interface ScannedData {
  qr: {
    id: string;
    type: string;
    purpose: string;
    generatedAt: string;
    generatedBy: string;
    expiresAt?: string;
    permissions: string[];
    limitedContext?: any;
  };
  patient: {
    id: string;
    healthPassportId: string;
    data: any;
  };
  scanner: {
    id: string;
    role: string;
    name: string;
    scannedAt: string;
  };
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanError
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMethod, setScanMethod] = useState<'camera' | 'upload' | 'text'>('text');
  const [qrInput, setQrInput] = useState('');
  const [purpose, setPurpose] = useState('');
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPatientData, setShowPatientData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleScanQR = async () => {
    if (!qrInput.trim()) {
      toast({
        title: "Missing Data",
        description: "Please enter QR code data",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);

    try {
      const response = await fetch('/api/qr/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrData: qrInput.trim(),
          purpose: purpose.trim() || 'QR code scan'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scan QR code');
      }

      const result = await response.json();
      setScannedData(result.data);
      onScanSuccess?.(result.data);

      toast({
        title: "Success",
        description: "QR code scanned successfully",
      });

    } catch (error) {
      console.error('QR scan error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to scan QR code";
      onScanError?.(errorMessage);
      
      toast({
        title: "Scan Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleVerifyQR = async () => {
    if (!qrInput.trim()) {
      toast({
        title: "Missing Data",
        description: "Please enter QR code data to verify",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch('/api/qr/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrData: qrInput.trim(),
          verifyIntegrity: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify QR code');
      }

      const result = await response.json();
      const verification = result.data.verification;

      if (verification.isValid) {
        toast({
          title: "Valid QR Code",
          description: "QR code is authentic and valid",
        });
      } else {
        toast({
          title: "Invalid QR Code",
          description: `Verification failed: ${verification.errors.join(', ')}`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('QR verification error:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify QR code",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real implementation, you would decode the QR from the image
    // For now, we'll show a placeholder message
    toast({
      title: "Feature Coming Soon",
      description: "QR code image scanning will be available in a future update",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'view_basic_info': return <User className="w-3 h-3" />;
      case 'view_medical_history': return <FileText className="w-3 h-3" />;
      case 'view_emergency_info': return <AlertTriangle className="w-3 h-3" />;
      case 'view_contact_info': return <Phone className="w-3 h-3" />;
      default: return <Eye className="w-3 h-3" />;
    }
  };

  const renderPatientData = (data: any) => {
    return (
      <div className="space-y-4">
        {/* Basic Information */}
        {data.basicInfo && (
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Basic Information
            </h4>
            <div className="space-y-1 text-sm">
              <div><strong>Name:</strong> {data.basicInfo.firstName} {data.basicInfo.lastName}</div>
              <div><strong>Date of Birth:</strong> {new Date(data.basicInfo.dateOfBirth).toLocaleDateString()}</div>
              <div><strong>Blood Type:</strong> {data.basicInfo.bloodType}</div>
              <div><strong>Health Passport ID:</strong> {data.basicInfo.healthPassportId}</div>
            </div>
          </div>
        )}

        {/* Emergency Information */}
        {data.emergencyInfo && (
          <div>
            <h4 className="font-medium mb-2 flex items-center text-red-600">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Information
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>Blood Type:</strong> {data.emergencyInfo.bloodType}</div>
              {data.emergencyInfo.allergies && data.emergencyInfo.allergies.length > 0 && (
                <div>
                  <strong>Allergies:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {data.emergencyInfo.allergies.map((allergy: string, index: number) => (
                      <li key={index}>{allergy}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.emergencyInfo.criticalConditions && data.emergencyInfo.criticalConditions.length > 0 && (
                <div>
                  <strong>Critical Conditions:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {data.emergencyInfo.criticalConditions.map((condition: string, index: number) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.emergencyInfo.emergencyContacts && data.emergencyInfo.emergencyContacts.length > 0 && (
                <div>
                  <strong>Emergency Contacts:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {data.emergencyInfo.emergencyContacts.map((contact: any, index: number) => (
                      <li key={index}>
                        {contact.name} ({contact.relationship}) - {contact.phone}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Information */}
        {data.contactInfo && (
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Contact Information
            </h4>
            <div className="space-y-1 text-sm">
              {data.contactInfo.email && <div><strong>Email:</strong> {data.contactInfo.email}</div>}
              {data.contactInfo.phone && <div><strong>Phone:</strong> {data.contactInfo.phone}</div>}
              {data.contactInfo.address && <div><strong>Address:</strong> {data.contactInfo.address}</div>}
            </div>
          </div>
        )}

        {/* Medical History */}
        {data.medicalHistory && data.medicalHistory.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Medical History
            </h4>
            <div className="space-y-2">
              {data.medicalHistory.slice(0, 5).map((history: any, index: number) => (
                <div key={index} className="text-sm border-l-4 border-blue-500 pl-3">
                  <div className="font-medium">{history.condition}</div>
                  <div className="text-gray-600">
                    {history.diagnosedDate && `Diagnosed: ${new Date(history.diagnosedDate).toLocaleDateString()}`}
                    {history.severity && ` • Severity: ${history.severity}`}
                  </div>
                </div>
              ))}
              {data.medicalHistory.length > 5 && (
                <div className="text-sm text-gray-500">
                  ... and {data.medicalHistory.length - 5} more conditions
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medications */}
        {data.medications && data.medications.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Current Medications</h4>
            <div className="space-y-2">
              {data.medications.slice(0, 3).map((medication: any, index: number) => (
                <div key={index} className="text-sm">
                  <div className="font-medium">{medication.name}</div>
                  <div className="text-gray-600">
                    {medication.dosage} • {medication.frequency}
                  </div>
                </div>
              ))}
              {data.medications.length > 3 && (
                <div className="text-sm text-gray-500">
                  ... and {data.medications.length - 3} more medications
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Scanner Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="w-5 h-5 mr-2" />
            QR Code Scanner
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Scan Method Selection */}
          <div>
            <Label>Scanning Method</Label>
            <div className="flex space-x-2 mt-2">
              <Button
                variant={scanMethod === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScanMethod('text')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Text Input
              </Button>
              <Button
                variant={scanMethod === 'camera' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScanMethod('camera')}
                disabled
              >
                <Camera className="w-4 h-4 mr-2" />
                Camera (Coming Soon)
              </Button>
              <Button
                variant={scanMethod === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScanMethod('upload')}
                disabled
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image (Coming Soon)
              </Button>
            </div>
          </div>

          {/* Text Input Method */}
          {scanMethod === 'text' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="qr-input">QR Code Data</Label>
                <Textarea
                  id="qr-input"
                  placeholder="Paste QR code data here..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="scan-purpose">Purpose (Optional)</Label>
                <Input
                  id="scan-purpose"
                  placeholder="Reason for scanning this QR code..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleScanQR} 
                  disabled={isScanning || !qrInput.trim()}
                  className="flex-1"
                >
                  {isScanning ? 'Scanning...' : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Scan QR Code
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleVerifyQR} 
                  disabled={isVerifying || !qrInput.trim()}
                  variant="outline"
                >
                  {isVerifying ? 'Verifying...' : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Verify Only
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* File Upload Method */}
          {scanMethod === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                disabled
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose QR Code Image
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Upload an image containing a QR code to scan it automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scanned Data Display */}
      {scannedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                QR Code Scanned Successfully
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScannedData(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {/* QR Information */}
              <div>
                <h4 className="font-medium mb-3">QR Code Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <Badge variant={
                        scannedData.qr.type === 'emergency' ? 'destructive' :
                        scannedData.qr.type === 'temporary' ? 'secondary' :
                        'default'
                      }>
                        {scannedData.qr.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generated:</span>
                      <span>{formatDate(scannedData.qr.generatedAt)}</span>
                    </div>
                    {scannedData.qr.expiresAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expires:</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(scannedData.qr.expiresAt)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scanned by:</span>
                      <span>{scannedData.scanner.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scanned at:</span>
                      <span>{formatDate(scannedData.scanner.scannedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <h4 className="font-medium mb-2">Purpose</h4>
                <p className="text-sm text-gray-600">{scannedData.qr.purpose}</p>
              </div>

              {/* Permissions */}
              <div>
                <h4 className="font-medium mb-2">Granted Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  {scannedData.qr.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs flex items-center">
                      {getPermissionIcon(permission)}
                      <span className="ml-1">{permission.replace('_', ' ')}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Patient Data Toggle */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Patient Information</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPatientData(!showPatientData)}
                  >
                    {showPatientData ? (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Hide Data
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        View Data
                      </>
                    )}
                  </Button>
                </div>

                {showPatientData && (
                  <ScrollArea className="h-96 border rounded-lg p-4">
                    {renderPatientData(scannedData.patient.data)}
                  </ScrollArea>
                )}
              </div>

              {/* Security Notice */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Privacy Notice</p>
                    <p>This scan has been logged for security and compliance purposes. Only use the accessed information for authorized medical purposes.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRScanner;
