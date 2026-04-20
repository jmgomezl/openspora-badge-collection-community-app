import { useGetUserBadgeDetails, useGetUserCreatedCommunities, useGetMostRecentBadgeDetails, useGetUserBadgesByCommunity } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Trophy, AlertCircle, Calendar, Building2, Hash, ChevronDown, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { useLanguage } from '../lib/i18n';

export default function MyBadges() {
  const { t } = useLanguage();
  const { data: badgesByComm = [], isLoading: loadingByComm, error: errorByComm } = useGetUserBadgesByCommunity();
  const { data: badgeDetails = [], isLoading, error } = useGetUserBadgeDetails();
  const { data: createdCommunities = [] } = useGetUserCreatedCommunities();
  const { data: recentBadgeData, isLoading: loadingRecent } = useGetMostRecentBadgeDetails();
  
  const [openCommunities, setOpenCommunities] = useState<Record<string, boolean>>({});

  if (error || errorByComm) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('badges.loadError')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading || loadingByComm) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{t('badges.loading')}</p>
        </div>
      </div>
    );
  }

  // Helper to get community name from ID
  const getCommunityName = (communityId: string): string => {
    const community = createdCommunities.find(c => c.id === communityId);
    return community?.name || communityId.split('_')[0] || communityId;
  };

  // Helper to generate a short badge code for display
  const getBadgeCode = (badgeId: string, badgeName?: string): string => {
    if (badgeName) {
      const words = badgeName.split(' ').filter(w => w.length > 0);
      if (words.length >= 2) {
        return words.slice(0, 2).map(w => w.substring(0, 3).toUpperCase()).join('-');
      } else if (words.length === 1) {
        return words[0].substring(0, 6).toUpperCase();
      }
    }
    
    const parts = badgeId.split('_');
    if (parts.length > 1) {
      const communityPart = parts[0].substring(0, 3).toUpperCase();
      const badgePart = parts.slice(1).join('').substring(0, 3).toUpperCase();
      return `${communityPart}-${badgePart}`;
    }
    return badgeId.substring(0, 6).toUpperCase();
  };

  const toggleCommunity = (communityId: string) => {
    setOpenCommunities(prev => ({
      ...prev,
      [communityId]: !prev[communityId]
    }));
  };

  // Extract unique communities
  const uniqueCommunities = Array.from(
    new Set(badgeDetails.map(detail => detail.userBadge.communityId))
  );

  // Get recent badge details
  const recentBadge = recentBadgeData ? {
    userBadge: recentBadgeData[0],
    badge: recentBadgeData[1],
    community: recentBadgeData[2]
  } : null;

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              {t('badges.totalCollected')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
              {badgeDetails.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-accent/20 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Award className="w-5 h-5 text-accent" />
              </div>
              {t('badges.communitiesJoined')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent">
              {uniqueCommunities.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badge Collection */}
      {badgeDetails.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <img 
                  src="/assets/generated/badge-icon-transparent.dim_64x64.png" 
                  alt="No badges" 
                  className="w-20 h-20 relative opacity-60"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('badges.noBadges')}</h3>
            <p className="text-muted-foreground mb-1">
              {t('badges.noBadgesDesc')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('badges.startClaiming')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Most Recent Badge Section */}
          {recentBadge && recentBadge.badge && (
            <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 via-primary/5 to-accent/5 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10" />
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/20 animate-pulse">
                    <Sparkles className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                      {t('badges.recentlyClaimed')}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {t('badges.latestAchievement')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  {/* Badge Image */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-accent/30 blur-2xl rounded-full scale-150" />
                    <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border-2 border-accent/20">
                      <img 
                        src={recentBadge.badge.imageUrl} 
                        alt={recentBadge.badge.name}
                        className="w-32 h-32 object-contain drop-shadow-2xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/assets/generated/achievement-badge-transparent.dim_128x128.png') {
                            target.src = '/assets/generated/achievement-badge-transparent.dim_128x128.png';
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Badge Details */}
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <div>
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <h3 className="text-2xl font-bold">{recentBadge.badge.name}</h3>
                        <Badge 
                          variant="outline" 
                          className="text-xs font-mono bg-accent/10 border-accent/30"
                        >
                          <Hash className="w-3 h-3 mr-1" />
                          {getBadgeCode(recentBadge.badge.id, recentBadge.badge.name)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{recentBadge.badge.description}</p>
                    </div>

                    <Separator />

                    <div className="flex flex-col sm:flex-row gap-4 text-sm">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {recentBadge.community?.name || getCommunityName(recentBadge.userBadge.communityId)}
                        </span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {t('badges.claimed')} {new Date(Number(recentBadge.userBadge.claimedAt) / 1000000).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Badges Grouped by Community */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              {t('badges.byComm')}
            </h2>
            
            {uniqueCommunities.map((communityId) => {
              const communityBadgeDetails = badgeDetails.filter(
                (detail) => detail.userBadge.communityId === communityId
              );
              const communityName = getCommunityName(communityId);
              const isOpen = openCommunities[communityId] ?? true;
              
              return (
                <Collapsible
                  key={communityId}
                  open={isOpen}
                  onOpenChange={() => toggleCommunity(communityId)}
                >
                  <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 overflow-hidden hover:shadow-lg transition-shadow">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="pb-4 cursor-pointer hover:bg-primary/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-left">
                              <CardTitle className="text-xl font-bold">{communityName}</CardTitle>
                              <CardDescription className="text-sm">
                                {communityBadgeDetails.length} {communityBadgeDetails.length === 1 ? t('badges.badge') : t('badges.badges')} {t('badges.collected')}
                              </CardDescription>
                            </div>
                          </div>
                          <ChevronDown 
                            className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <Separator className="mb-4" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {communityBadgeDetails.map((detail) => {
                            const { userBadge, badge } = detail;
                            const badgeName = badge?.name || userBadge.badgeId.split('_').slice(1).join(' ') || userBadge.badgeId;
                            const badgeDescription = badge?.description || '';
                            const badgeImageUrl = badge?.imageUrl || '/assets/generated/achievement-badge-transparent.dim_128x128.png';
                            const badgeCode = getBadgeCode(userBadge.badgeId, badge?.name);
                            const claimDate = new Date(Number(userBadge.claimedAt) / 1000000);
                            
                            return (
                              <Card
                                key={userBadge.badgeId}
                                className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-primary/20 bg-gradient-to-br from-card to-card/50 overflow-hidden"
                              >
                                {/* Badge Image Section */}
                                <div className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 p-6 flex items-center justify-center min-h-[180px]">
                                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-500" />
                                    <img 
                                      src={badgeImageUrl} 
                                      alt={badgeName}
                                      className="w-32 h-32 relative drop-shadow-2xl group-hover:scale-110 transition-transform duration-300 object-contain"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        if (target.src !== '/assets/generated/achievement-badge-transparent.dim_128x128.png') {
                                          target.src = '/assets/generated/achievement-badge-transparent.dim_128x128.png';
                                        }
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* Badge Details Section */}
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors flex-1">
                                      {badgeName}
                                    </CardTitle>
                                    <Badge 
                                      variant="outline" 
                                      className="shrink-0 text-xs font-mono bg-primary/5 border-primary/20"
                                    >
                                      <Hash className="w-3 h-3 mr-1" />
                                      {badgeCode}
                                    </Badge>
                                  </div>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                  {/* Badge Description */}
                                  {badgeDescription && (
                                    <>
                                      <p className="text-sm text-muted-foreground line-clamp-2">
                                        {badgeDescription}
                                      </p>
                                      <Separator />
                                    </>
                                  )}
                                  
                                  {/* Claim Date */}
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>{t('badges.claimed')} {claimDate.toLocaleDateString(undefined, { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}</span>
                                  </div>

                                  {/* Status Badge */}
                                  <div className="flex items-center justify-between">
                                    <Badge 
                                      variant="secondary" 
                                      className="bg-success/10 text-success border-success/20 hover:bg-success/20"
                                    >
                                      <Award className="w-3 h-3 mr-1" />
                                      {t('badges.claimed')}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
