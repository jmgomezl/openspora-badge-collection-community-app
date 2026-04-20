import { useState, useEffect, useRef } from 'react';
import { useClaimBadge } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Keyboard, CheckCircle, AlertCircle, Loader2, Award } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import QRScanner from './QRScanner';
import { useLanguage } from '../lib/i18n';

export default function ClaimBadge() {
  const [claimCode, setClaimCode] = useState('');
  const [activeMethod, setActiveMethod] = useState<'qr' | 'manual'>('qr');
  const [lastClaimResult, setLastClaimResult] = useState<{ success: boolean; message: string } | null>(null);
  const { mutate: claimBadge, isPending, reset } = useClaimBadge();
  const autoClaimAttemptedRef = useRef(false);
  const componentMountedRef = useRef(false);
  const { t } = useLanguage();

  // Auto-claim from pending code with improved reliability
  useEffect(() => {
    // Mark component as mounted
    componentMountedRef.current = true;

    // Only attempt auto-claim once per component lifecycle
    if (autoClaimAttemptedRef.current) {
      return;
    }

    // Check both storage locations for pending claim code
    const pendingCode = localStorage.getItem('pendingClaimCode') || sessionStorage.getItem('pendingClaimCode');
    
    if (pendingCode && pendingCode.trim()) {
      // Mark as attempted immediately to prevent duplicate attempts
      autoClaimAttemptedRef.current = true;
      
      console.log('Starting auto-claim with code:', pendingCode);
      
      const trimmedCode = pendingCode.trim();
      setClaimCode(trimmedCode);
      setActiveMethod('manual');
      setLastClaimResult(null);
      
      // Delay to ensure actor is fully initialized
      const timer = setTimeout(() => {
        if (!componentMountedRef.current) return;
        
        claimBadge(trimmedCode, {
          onSuccess: () => {
            if (!componentMountedRef.current) return;
            
            // Clear from both storage locations
            localStorage.removeItem('pendingClaimCode');
            sessionStorage.removeItem('pendingClaimCode');
            
            setLastClaimResult({ 
              success: true, 
              message: t('claim.successMsg')
            });
            setClaimCode('');
            
            console.log('Badge claimed successfully');
          },
          onError: (err: Error) => {
            if (!componentMountedRef.current) return;
            
            // Clear from both storage locations
            localStorage.removeItem('pendingClaimCode');
            sessionStorage.removeItem('pendingClaimCode');
            
            const userMessage = getErrorMessage(err);
            setLastClaimResult({ success: false, message: userMessage });
            
            console.error('Error claiming badge:', err.message);
          },
        });
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [claimBadge, t]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      componentMountedRef.current = false;
    };
  }, []);

  const getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    if (message.includes('insignia ya no disponible') || message.includes('badge no longer available') || message.includes('ya no disponible') || message.includes('não está mais disponível')) {
      return t('error.notAvailable');
    } else if (message.includes('insignia ya reclamada') || message.includes('already claimed') || message.includes('ya reclamada') || message.includes('já reivindicou')) {
      return t('error.alreadyClaimed');
    } else if (message.includes('código de reclamo inválido') || message.includes('invalid claim code') || message.includes('inválido') || message.includes('código de reivindicação inválido')) {
      return t('error.invalidCode');
    } else if (message.includes('actor not available') || message.includes('actor no disponible') || message.includes('actor não disponível')) {
      return t('error.connection');
    } else if (message.includes('comunidad no encontrada') || message.includes('community not found') || message.includes('comunidade não encontrada')) {
      return t('error.communityNotFound');
    } else if (message.includes('no autorizado') || message.includes('unauthorized') || message.includes('não autorizado')) {
      return t('error.unauthorized');
    } else if (message.includes('se requiere código') || message.includes('required') || message.includes('é necessário')) {
      return t('error.codeRequired');
    } else {
      return `${t('error.generic')} ${error.message}`;
    }
  };

  const handleManualClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = claimCode.trim();
    
    if (!trimmedCode) {
      setLastClaimResult({ 
        success: false, 
        message: t('error.emptyCode')
      });
      return;
    }
    
    setLastClaimResult(null);
    reset();
    
    claimBadge(trimmedCode, {
      onSuccess: () => {
        setClaimCode('');
        setLastClaimResult({ 
          success: true, 
          message: t('claim.successMsg')
        });
      },
      onError: (err: Error) => {
        const userMessage = getErrorMessage(err);
        setLastClaimResult({ success: false, message: userMessage });
      },
    });
  };

  const extractClaimCode = (scannedData: string): string | null => {
    if (!scannedData || !scannedData.trim()) {
      console.error('Empty scanned data');
      return null;
    }
    
    const trimmedData = scannedData.trim();
    console.log('Processing scanned data:', trimmedData);
    
    // Try to parse as URL first
    try {
      const url = new URL(trimmedData);
      const code = url.searchParams.get('code');
      if (code && code.trim()) {
        const decodedCode = decodeURIComponent(code.trim());
        console.log('Code extracted from URL:', decodedCode);
        return decodedCode;
      }
    } catch {
      // Not a valid URL, continue with other checks
    }
    
    // Check if it contains /claim?code= pattern (for partial URLs)
    const claimMatch = trimmedData.match(/\/claim\?code=([^&\s#]+)/);
    if (claimMatch && claimMatch[1]) {
      const decodedCode = decodeURIComponent(claimMatch[1].trim());
      console.log('Code extracted from /claim pattern:', decodedCode);
      return decodedCode;
    }
    
    // Check for ?code= pattern anywhere in the string
    const codeMatch = trimmedData.match(/[?&]code=([^&\s#]+)/);
    if (codeMatch && codeMatch[1]) {
      const decodedCode = decodeURIComponent(codeMatch[1].trim());
      console.log('Code extracted from ?code= pattern:', decodedCode);
      return decodedCode;
    }
    
    // If not a URL or no code parameter, use the scanned data directly as claim code
    console.log('Using scanned data directly as code:', trimmedData);
    return trimmedData;
  };

  const handleQRClaim = (scannedData: string) => {
    console.log('QR scanned:', scannedData);
    
    const code = extractClaimCode(scannedData);
    
    if (!code) {
      setLastClaimResult({ 
        success: false, 
        message: t('error.invalidQR')
      });
      return;
    }
    
    console.log('Claiming badge with code:', code);
    setLastClaimResult(null);
    reset();
    
    claimBadge(code, {
      onSuccess: () => {
        setLastClaimResult({ 
          success: true, 
          message: t('claim.successMsg')
        });
      },
      onError: (err: Error) => {
        const userMessage = getErrorMessage(err);
        setLastClaimResult({ success: false, message: userMessage });
      },
    });
  };

  const isProcessingAutoClaim = isPending && autoClaimAttemptedRef.current && !lastClaimResult;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img 
              src="/assets/generated/qr-scanner-icon-transparent.dim_48x48.png" 
              alt={t('claim.title')}
              className="w-6 h-6"
            />
            {t('claim.title')}
          </CardTitle>
          <CardDescription>
            {t('claim.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isProcessingAutoClaim && (
            <Alert className="mb-4 bg-primary/10 border-primary/20">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <AlertTitle>{t('claim.processing')}</AlertTitle>
              <AlertDescription>
                {t('claim.processingDesc')}
              </AlertDescription>
            </Alert>
          )}

          {!isProcessingAutoClaim && lastClaimResult && lastClaimResult.success && (
            <Alert className="mb-4 bg-success/10 border-success/20">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertTitle className="text-success">{t('claim.success')}</AlertTitle>
              <AlertDescription className="text-success">
                {lastClaimResult.message}
              </AlertDescription>
            </Alert>
          )}

          {!isProcessingAutoClaim && lastClaimResult && !lastClaimResult.success && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('claim.failed')}</AlertTitle>
              <AlertDescription>
                {lastClaimResult.message}
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeMethod} onValueChange={(v) => setActiveMethod(v as 'qr' | 'manual')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="qr" className="flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                {t('claim.qrScanner')}
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Keyboard className="w-4 h-4" />
                {t('claim.manualEntry')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qr" className="mt-0">
              <QRScanner onScan={handleQRClaim} />
            </TabsContent>

            <TabsContent value="manual" className="mt-0">
              <form onSubmit={handleManualClaim} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="claimCode">{t('claim.claimCode')}</Label>
                  <Input
                    id="claimCode"
                    placeholder={t('claim.enterCode')}
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value)}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('claim.enterCodeDesc')}
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!claimCode.trim() || isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('claim.claiming')}
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 mr-2" />
                      {t('claim.claimBadge')}
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">{t('claim.howTo')}</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{t('claim.howToQR')}</li>
              <li>{t('claim.howToManual')}</li>
              <li>{t('claim.oncePerUser')}</li>
              <li>{t('claim.limitedQuantity')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
