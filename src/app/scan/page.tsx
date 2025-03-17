'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QRScanner } from '@/components/QRScanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, XCircle, Mail, User } from 'lucide-react';
import { toast } from 'sonner';

interface ScanResult {
  success: boolean;
  message: string;
  eventName?: string;
  userName?: string;
  userEmail?: string;
  timestamp?: string;
}

export default function ScanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, router, session]);

  const handleScanResult = async (result: string) => {
    setIsProcessing(true);
    try {
      // Parse the QR code data
      const qrData = JSON.parse(result);
      
      if (!qrData.userId || !qrData.email) {
        throw new Error('Código QR inválido');
      }

      // Show user info immediately
      setScanResult({
        success: true,
        message: 'Verificando acceso...',
        userName: qrData.name,
        userEmail: qrData.email,
        timestamp: new Date().toLocaleString(),
      });

      // Register the access
      const response = await fetch('/api/access/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: qrData.userId,
          eventId: '1', // For testing, we're using a fixed event ID
        }),
      });

      if (!response.ok) {
        throw new Error('Error al registrar el acceso');
      }

      const data = await response.json();
      
      setScanResult(prev => ({
        ...prev!,
        message: 'Acceso registrado correctamente',
      }));

      toast.success('Acceso registrado correctamente');
    } catch (error) {
      console.error('Error processing scan:', error);
      setScanResult({
        success: false,
        message: error instanceof Error ? error.message : 'Error al procesar el código QR',
      });
      toast.error('Error al procesar el código QR');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  const handleReset = () => {
    setScanResult(null);
  };

  if (status === 'loading' || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Cargando...</div>
      </div>
    );
  }

  if (session.user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-6">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold">Acceso Denegado</h2>
            <p className="mt-2 text-gray-600">
              No tienes permisos para acceder a esta página
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="mt-6"
              variant="outline"
            >
              Volver al Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Escanear Código QR</h1>
      </div>

      <div className="mx-auto max-w-md">
        {!scanResult ? (
          <Card className="overflow-hidden">
            <QRScanner onResult={handleScanResult} onError={handleError} />
            <div className="bg-white p-4 text-center text-sm text-gray-600">
              Apunta la cámara al código QR del usuario
            </div>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white">
              <div className="text-center">
                {scanResult.success ? (
                  <CheckCircle2 className="mx-auto h-12 w-12" />
                ) : (
                  <XCircle className="mx-auto h-12 w-12" />
                )}
                <h2 className="mt-4 text-xl font-semibold">
                  {scanResult.success ? 'Usuario Identificado' : 'Error'}
                </h2>
              </div>
            </div>
            <div className="space-y-6 p-6">
              {scanResult.success && scanResult.userName && (
                <div className="flex items-center gap-3 text-gray-700">
                  <User className="h-5 w-5" />
                  <span className="font-medium">{scanResult.userName}</span>
                </div>
              )}
              {scanResult.success && scanResult.userEmail && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="h-5 w-5" />
                  <span>{scanResult.userEmail}</span>
                </div>
              )}
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-center text-sm font-medium text-gray-900">
                  {scanResult.message}
                </p>
                {scanResult.timestamp && (
                  <p className="mt-1 text-center text-xs text-gray-500">
                    {scanResult.timestamp}
                  </p>
                )}
              </div>
              <Button
                onClick={handleReset}
                className="w-full"
                disabled={isProcessing}
              >
                Escanear Otro Código
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 