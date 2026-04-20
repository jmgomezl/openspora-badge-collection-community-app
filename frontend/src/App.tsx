import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { LanguageProvider } from './lib/i18n';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import Dashboard from './pages/Dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, Award } from 'lucide-react';
import { useLanguage } from './lib/i18n';

function AppContent() {
  const { identity, loginStatus, login } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [pendingClaimCode, setPendingClaimCode] = useState<string | null>(null);
  const { t } = useLanguage();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Extract claim code from URL on mount and persist it
  useEffect(() => {
    const extractClaimCodeFromURL = (): string | null => {
      const currentUrl = window.location.href;
      
      // Try to parse as URL
      try {
        const url = new URL(currentUrl);
        const code = url.searchParams.get('code');
        if (code && code.trim()) {
          return decodeURIComponent(code.trim());
        }
      } catch (e) {
        console.error('Error parsing URL:', e);
      }
      
      // Check hash routing (e.g., #/claim?code=...)
      const hash = window.location.hash;
      if (hash.includes('code=')) {
        try {
          const hashParts = hash.split('?');
          if (hashParts.length > 1) {
            const hashParams = new URLSearchParams(hashParts[1]);
            const hashCode = hashParams.get('code');
            if (hashCode && hashCode.trim()) {
              return decodeURIComponent(hashCode.trim());
            }
          }
        } catch (e) {
          console.error('Error parsing hash:', e);
        }
      }
      
      // Check query parameters directly
      const search = window.location.search;
      if (search.includes('code=')) {
        try {
          const params = new URLSearchParams(search);
          const code = params.get('code');
          if (code && code.trim()) {
            return decodeURIComponent(code.trim());
          }
        } catch (e) {
          console.error('Error parsing search params:', e);
        }
      }
      
      return null;
    };

    const claimCode = extractClaimCodeFromURL();
    
    if (claimCode) {
      console.log('Claim code detected in URL:', claimCode);
      // Store the claim code in localStorage for persistence across authentication
      localStorage.setItem('pendingClaimCode', claimCode);
      sessionStorage.setItem('pendingClaimCode', claimCode);
      setPendingClaimCode(claimCode);
    } else {
      // Check if there's a stored claim code from previous session
      const storedCode = localStorage.getItem('pendingClaimCode') || sessionStorage.getItem('pendingClaimCode');
      if (storedCode && storedCode.trim()) {
        console.log('Claim code restored from storage:', storedCode);
        setPendingClaimCode(storedCode.trim());
      }
    }
  }, []);

  // Clean up URL after authentication is complete
  useEffect(() => {
    if (isAuthenticated && pendingClaimCode) {
      // Clean up the URL to remove the claim code parameter
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      console.log('URL cleaned after authentication');
    }
  }, [isAuthenticated, pendingClaimCode]);

  const handleLoginForClaim = async () => {
    try {
      await login();
      // After successful login, the user will be redirected to Dashboard
      // and ClaimBadge component will handle the auto-claim
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        // Clear state and reload
        sessionStorage.removeItem('pendingClaimCode');
        localStorage.removeItem('pendingClaimCode');
        setPendingClaimCode(null);
        window.location.reload();
      }
    }
  };

  if (loginStatus === 'initializing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {!isAuthenticated ? (
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <img 
                  src="/assets/generated/openspora-logo-transparent.dim_200x200.png" 
                  alt="OpenSpora Logo" 
                  className="w-48 h-48 mx-auto"
                />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {t('app.welcome')}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {t('app.welcomeDesc')}
                </p>
              </div>

              {pendingClaimCode ? (
                <Card className="border-primary/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-6 h-6 text-primary" />
                      {t('app.badgeReady')}
                    </CardTitle>
                    <CardDescription>
                      {t('app.badgeReadyDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">{t('app.claimCode')}</p>
                      <p className="font-mono text-sm font-medium break-all">{pendingClaimCode}</p>
                    </div>
                    <Button 
                      onClick={handleLoginForClaim} 
                      className="w-full"
                      size="lg"
                      disabled={loginStatus === 'logging-in'}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {loginStatus === 'logging-in' ? t('header.loggingIn') : t('app.loginToClaim')}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      {t('app.afterLogin')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-primary/10">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <p className="text-muted-foreground">
                        {t('app.pleaseLogin')}
                      </p>
                      <Button 
                        onClick={login} 
                        size="lg"
                        disabled={loginStatus === 'logging-in'}
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        {loginStatus === 'logging-in' ? t('header.loggingIn') : t('header.login')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Dashboard />
        )}
      </main>
      <Footer />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
