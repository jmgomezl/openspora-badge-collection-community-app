import { useEffect, useRef } from 'react';
import { useQRScanner } from '../qr-code/useQRScanner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CameraOff, SwitchCamera, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (code: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const {
    qrResults,
    isScanning,
    isActive,
    isSupported,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    switchCamera,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: 'environment',
    scanInterval: 100,
    maxResults: 1,
  });

  const processedCodes = useRef(new Set<string>());

  useEffect(() => {
    if (qrResults && qrResults.length > 0) {
      const latestResult = qrResults[0];
      if (latestResult && latestResult.data && !processedCodes.current.has(latestResult.data)) {
        console.log('Nuevo código QR detectado:', latestResult.data);
        processedCodes.current.add(latestResult.data);
        onScan(latestResult.data);
        stopScanning();
      }
    }
  }, [qrResults, onScan, stopScanning]);

  if (isSupported === false) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          La cámara no es compatible con este dispositivo o navegador. Por favor, intenta usar un dispositivo diferente o ingresa el código manualmente.
        </AlertDescription>
      </Alert>
    );
  }

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {!isActive && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center space-y-2">
              <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">La vista previa de la cámara aparecerá aquí</p>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 border-4 border-primary/50 rounded-lg animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary rounded-lg" />
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.type === 'permission' && 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador e intenta nuevamente.'}
            {error.type === 'not-found' && 'No se encontró ninguna cámara en este dispositivo. Por favor, verifica que tu dispositivo tenga una cámara o ingresa el código manualmente.'}
            {error.type === 'not-supported' && 'La cámara no es compatible con este navegador. Por favor, intenta usar un navegador diferente o ingresa el código manualmente.'}
            {error.type === 'unknown' && `Error de cámara: ${error.message}. Por favor, intenta nuevamente o ingresa el código manualmente.`}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        {!isActive ? (
          <Button
            onClick={startScanning}
            disabled={!canStartScanning || isLoading}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            {isLoading ? 'Iniciando...' : 'Iniciar Escáner'}
          </Button>
        ) : (
          <>
            <Button
              onClick={stopScanning}
              disabled={isLoading}
              variant="destructive"
              className="flex-1"
            >
              <CameraOff className="w-4 h-4 mr-2" />
              Detener Escáner
            </Button>
            {isMobile && (
              <Button
                onClick={switchCamera}
                disabled={isLoading}
                variant="outline"
              >
                <SwitchCamera className="w-4 h-4" />
              </Button>
            )}
          </>
        )}
      </div>

      {isScanning && (
        <p className="text-sm text-center text-muted-foreground">
          Apunta tu cámara a un código QR para reclamar una insignia
        </p>
      )}
    </div>
  );
}
