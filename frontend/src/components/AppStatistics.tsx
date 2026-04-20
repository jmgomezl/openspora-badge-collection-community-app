import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAppStatistics } from '../hooks/useQueries';
import { useLanguage } from '../lib/i18n';
import { Users, Award, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function AppStatistics() {
  const { data: stats, isLoading, isError } = useGetAppStatistics();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {t('stats.title')}
          </h2>
          <p className="text-muted-foreground">{t('stats.description')}</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">{t('stats.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {t('stats.title')}
          </h2>
          <p className="text-muted-foreground">{t('stats.description')}</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('stats.loadError')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalCommunities = Number(stats?.totalCommunities || 0);
  const totalBadges = Number(stats?.totalBadges || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <TrendingUp className="w-10 h-10 text-primary" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {t('stats.title')}
          </h2>
        </div>
        <p className="text-muted-foreground">{t('stats.description')}</p>
      </div>

      <Card className="border-primary/20 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t('stats.platformOverview')}
          </CardTitle>
          <CardDescription>{t('stats.description')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Communities Card */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('stats.totalCommunities')}
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {totalCommunities.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('stats.communitiesCreated')}
                    </p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Badges Card */}
            <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('stats.totalBadgesMinted')}
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                      {totalBadges.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('stats.badgesMinted')}
                    </p>
                  </div>
                  <div className="p-4 bg-accent/10 rounded-full">
                    <Award className="w-8 h-8 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Additional visual element */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-full border border-primary/20">
          <img 
            src="/assets/generated/openspora-logo-transparent.dim_200x200.png" 
            alt="OpenSpora Logo" 
            className="w-8 h-8"
          />
          <span className="text-sm font-medium text-muted-foreground">
            OpenSpora Platform
          </span>
        </div>
      </div>
    </div>
  );
}
