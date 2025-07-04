import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  QrCode, 
  Download, 
  Share2, 
  Clock, 
  Shield, 
  User, 
  Hospital,
  AlertTriangle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRGeneratorProps {
  patientId: string;
  patientName?: string;
  onQRGenerated?: (qrData: any) => void;
}

interface QRCodeData {
  id: string;
  type: string;
  purpose: string;
  generatedAt: string;
  expiresAt?: string;
  permissions: string[];
}

interface GeneratedQR {
  qrCode: string;
  qrData: QRCodeData;
  patient: {
    id: string;
    name: string;
    healthPassportId: string;
  };
  format: string;
  size: number;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({
  patientId,
  patientName,
  onQRGenerated
}) => {
  const [qrType, setQRType] = useState<string>('full');
  const [purpose, setPurpose] = useState<string>('');
  const [expiresIn, setExpiresIn] = useState<string>('');
  const [permissions, setPermissions] = useState<string[]>(['view_basic_info']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<GeneratedQR | null>(null);
  const [showQRData, setShowQRData] = useState(false);
  const { toast } = useToast();

  const qrTypes = [
    { value: 'full', label: 'Full Access', description: 'Complete medical records access' },
    { value: 'emergency', label: 'Emergency', description: 'Critical medical information only' },
    { value: 'limited', label: 'Limited', description: 'Specific permissions only' },
    { value: 'temporary', label: 'Temporary', description: 'Time-limited access' }
  ];

  const availablePermissions = [
    { value: 'view_basic_info', label: 'Basic Information' },
    { value: 'view_medical_history', label: 'Medical History' },
    { value: 'view_medications', label: 'Medications' },
    { value: 'view_vitals', label: 'Vital Signs' },
    { value: 'view_documents', label: 'Documents' },
    { value: 'view_emergency_info', label: 'Emergency Information' },
    { value: 'view_contact_info', label: 'Contact Information' },
    { value: 'emergency_access', label: 'Emergency Access' }
  ];

  const handleGenerateQR = async () => {
    if (!purpose.trim()) {
      toast({
        title: "Missing Information",
        description: "Please specify the purpose for this QR code",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        type: qrType,
        purpose: purpose.trim(),
        format: 'data_url',
        size: '256'
      });

      if (expiresIn) {
        params.append('expiresIn', expiresIn);
      }

      if (qrType === 'limited' || qrType === 'temporary') {
        params.append('permissions', permissions.join(','));
      }

      const response = await fetch(`/api/qr/generate/${patientId}?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate QR code');
      }

      const result = await response.json();
      setGeneratedQR(result.data);
      onQRGenerated?.(result.data);

      toast({
        title: "Success",
        description: "QR code generated successfully",
      });

    } catch (error) {
      console.error('QR generation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadQR = () => {
    if (!generatedQR) return;

    const link = document.createElement('a');
    link.download = `qr-${generatedQR.qrData.type}-${generatedQR.patient.name.replace(/\s+/g, '-')}.png`;
    link.href = generatedQR.qrCode;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded",
      description: "QR code image downloaded successfully",
    });
  };

  const handleCopyQRData = async () => {
    if (!generatedQR) return;

    try {
      await navigator.clipboard.writeText(generatedQR.qrCode);
      toast({
        title: "Copied",
        description: "QR code data copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy QR code data",
        variant: "destructive",
      });
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setPermissions(prev => [...prev, permission]);
    } else {
      setPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* QR Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="w-5 h-5 mr-2" />
            Generate QR Code
            {patientName && (
              <Badge variant="outline" className="ml-2">
                {patientName}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* QR Type Selection */}
          <div>
            <Label htmlFor="qr-type">QR Code Type</Label>
            <Select value={qrType} onValueChange={setQRType}>
              <SelectTrigger>
                <SelectValue placeholder="Select QR type..." />
              </SelectTrigger>
              <SelectContent>
                {qrTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Purpose */}
          <div>
            <Label htmlFor="purpose">Purpose *</Label>
            <Textarea
              id="purpose"
              placeholder="Specify the purpose for this QR code..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={2}
            />
          </div>

          {/* Expiration */}
          {(qrType === 'temporary' || qrType === 'limited') && (
            <div>
              <Label htmlFor="expires-in">Expires In (hours)</Label>
              <Input
                id="expires-in"
                type="number"
                placeholder="24"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                min="1"
                max="8760"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty for default: {qrType === 'temporary' ? '24 hours' : '24 hours'}
              </p>
            </div>
          )}

          {/* Permissions */}
          {(qrType === 'limited' || qrType === 'temporary') && (
            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availablePermissions.map((perm) => (
                  <div key={perm.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={perm.value}
                      checked={permissions.includes(perm.value)}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(perm.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={perm.value} className="text-sm">
                      {perm.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button 
            onClick={handleGenerateQR} 
            disabled={isGenerating || !purpose.trim()}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated QR Display */}
      {generatedQR && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                Generated QR Code
              </span>
              <div className="flex items-center space-x-2">
                <Badge variant={
                  generatedQR.qrData.type === 'emergency' ? 'destructive' :
                  generatedQR.qrData.type === 'temporary' ? 'secondary' :
                  'default'
                }>
                  {generatedQR.qrData.type.toUpperCase()}
                </Badge>
                {generatedQR.qrData.expiresAt && (
                  <Badge variant="outline" className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Expires {formatDate(generatedQR.qrData.expiresAt)}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Code Image */}
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 border rounded-lg bg-white">
                  <img 
                    src={generatedQR.qrCode} 
                    alt="Generated QR Code"
                    className="w-64 h-64"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleDownloadQR} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={handleCopyQRData} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Data
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Share QR Code</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          You can share this QR code with authorized healthcare providers.
                          The QR code contains encrypted patient information and will only
                          work for users with appropriate permissions.
                        </p>
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-amber-600">
                            Ensure you only share with trusted healthcare providers
                          </span>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* QR Information */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">QR Code Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-mono">{generatedQR.qrData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="capitalize">{generatedQR.qrData.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generated:</span>
                      <span>{formatDate(generatedQR.qrData.generatedAt)}</span>
                    </div>
                    {generatedQR.qrData.expiresAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expires:</span>
                        <span>{formatDate(generatedQR.qrData.expiresAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Purpose</h4>
                  <p className="text-sm text-gray-600">{generatedQR.qrData.purpose}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    Permissions
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQRData(!showQRData)}
                      className="ml-2"
                    >
                      {showQRData ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                  </h4>
                  {showQRData && (
                    <div className="flex flex-wrap gap-1">
                      {generatedQR.qrData.permissions.map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Patient</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-2" />
                      {generatedQR.patient.name}
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-3 h-3 mr-2" />
                      {generatedQR.patient.healthPassportId}
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Security Notice</p>
                      <p>This QR code contains encrypted medical data. Only authorized healthcare providers with valid credentials can access the information.</p>
                    </div>
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

export default QRGenerator;
