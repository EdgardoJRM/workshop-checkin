'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, StopCircle } from 'lucide-react';

interface QRScannerProps {
  onResult: (result: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onResult, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // On successful scan
          scanner.stop().catch(console.error);
          setIsScanning(false);
          onResult(decodedText);
        },
        (errorMessage) => {
          // Ignore errors during scanning
          console.log(errorMessage);
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      onError?.(err instanceof Error ? err.message : 'Error al iniciar el escáner');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(console.error);
      setIsScanning(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div
          id="qr-reader"
          className="overflow-hidden rounded-lg bg-gray-100"
          style={{ minHeight: '300px' }}
        />
        <div className="flex justify-center">
          {!isScanning ? (
            <Button
              onClick={startScanning}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Iniciar Escaneo
            </Button>
          ) : (
            <Button
              onClick={stopScanning}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <StopCircle className="h-4 w-4" />
              Detener Escaneo
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
} 