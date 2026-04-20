import { Component, ReactNode, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, QrCode, Plus, AlertCircle, TrendingUp } from 'lucide-react';
import MyBadges from '../components/MyBadges';
import ClaimBadge from '../components/ClaimBadge';
import ManageCommunities from '../components/ManageCommunities';
import AppStatistics from '../components/AppStatistics';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../lib/i18n';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm">{this.state.error.message}</p>
              <Button
                onClick={this.reset}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('badges');
  const [key, setKey] = useState(0);
  const { t } = useLanguage();

  // Check if we should switch to claim tab (when coming from QR code URL)
  useEffect(() => {
    const pendingCode = localStorage.getItem('pendingClaimCode') || sessionStorage.getItem('pendingClaimCode');
    if (pendingCode && pendingCode.trim()) {
      console.log('Switching to claim tab for pending code:', pendingCode);
      setActiveTab('claim');
    }
  }, []);

  const handleReset = () => {
    setKey(prev => prev + 1);
    setActiveTab('badges');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <img 
          src="/assets/generated/openspora-logo-transparent.dim_200x200.png" 
          alt="OpenSpora Logo" 
          className="w-24 h-24 mx-auto mb-4"
        />
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          {t('dashboard.title')}
        </h2>
        <p className="text-muted-foreground mt-2">{t('dashboard.subtitle')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8">
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">{t('dashboard.myBadges')}</span>
          </TabsTrigger>
          <TabsTrigger value="claim" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">{t('dashboard.claim')}</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('dashboard.manage')}</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">{t('dashboard.statistics')}</span>
          </TabsTrigger>
        </TabsList>

        <ErrorBoundary
          key={key}
          fallback={(error, reset) => (
            <div className="max-w-2xl mx-auto">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                  <p className="font-medium">{t('dashboard.error')}</p>
                  <p className="text-sm">{error.message}</p>
                  <Button
                    onClick={() => {
                      reset();
                      handleReset();
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    {t('dashboard.tryAgain')}
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}
        >
          <TabsContent value="badges" className="mt-0">
            <MyBadges />
          </TabsContent>

          <TabsContent value="claim" className="mt-0">
            <ClaimBadge />
          </TabsContent>

          <TabsContent value="manage" className="mt-0">
            <ManageCommunities />
          </TabsContent>

          <TabsContent value="statistics" className="mt-0">
            <AppStatistics />
          </TabsContent>
        </ErrorBoundary>
      </Tabs>
    </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
