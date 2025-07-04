import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, AlertCircle, CheckCircle } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess?: (data: any) => void;
  onScanError?: (error: string) => void;
}

const QRScannerSimple: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanError
}) => {
  const [qrInput, setQrInput] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleScanQR = async () => {
    if (!qrInput.trim()) {
      onScanError?.('Please enter QR code data');
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
      onScanSuccess?.(result.data);

    } catch (error) {
      console.error('QR scan error:', error);
      onScanError?.(error instanceof Error ? error.message : 'Failed to scan QR code');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>Scan QR Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qrInput">QR Code Data</Label>
            <Input
              id="qrInput"
              placeholder="Enter or paste QR code data here..."
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              placeholder="Purpose for accessing patient record..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleScanQR}
            disabled={isScanning || !qrInput.trim()}
            className="w-full"
          >
            {isScanning ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-2" />
                Scan QR Code
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Enter QR code data manually</p>
            <p>• Specify the purpose for accessing the record</p>
            <p>• Camera scanning coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScannerSimple;
