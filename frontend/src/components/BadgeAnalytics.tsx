import { useState, useEffect } from 'react';
import { useGetAdminBadgeAnalytics, useGetUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BarChart3, Users, Hash, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Principal } from '@icp-sdk/core/principal';
import type { UserProfile } from '../backend';

export default function BadgeAnalytics() {
  const { data: analytics = [], isLoading, error } = useGetAdminBadgeAnalytics();
  const { mutateAsync: getUserProfile } = useGetUserProfile();
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile | null>>({});
  const [loadingProfiles, setLoadingProfiles] = useState<Set<string>>(new Set());

  // Fetch user profiles for claimers
  useEffect(() => {
    const fetchProfiles = async () => {
      const principalsToFetch: Principal[] = [];
      
      analytics.forEach(({ claimers }) => {
        claimers.forEach((principal) => {
          const principalStr = principal.toString();
          if (!userProfiles[principalStr] && !loadingProfiles.has(principalStr)) {
            principalsToFetch.push(principal);
          }
        });
      });

      if (principalsToFetch.length === 0) return;

      const newLoadingProfiles = new Set(loadingProfiles);
      principalsToFetch.forEach(p => newLoadingProfiles.add(p.toString()));
      setLoadingProfiles(newLoadingProfiles);

      const profiles: Record<string, UserProfile | null> = {};
      await Promise.all(
        principalsToFetch.map(async (principal) => {
          try {
            const profile = await getUserProfile(principal);
            profiles[principal.toString()] = profile;
          } catch (error) {
            console.error('Failed to fetch profile:', error);
            profiles[principal.toString()] = null;
          }
        })
      );

      setUserProfiles(prev => ({ ...prev, ...profiles }));
      setLoadingProfiles(new Set());
    };

    fetchProfiles();
  }, [analytics, getUserProfile]);

  const getBadgeCode = (badgeName: string): string => {
    const words = badgeName.split(' ').filter(w => w.length > 0);
    if (words.length >= 2) {
      return words.slice(0, 2).map(w => w.substring(0, 3).toUpperCase()).join('-');
    } else if (words.length === 1) {
      return words[0].substring(0, 6).toUpperCase();
    }
    return badgeName.substring(0, 6).toUpperCase();
  };

  const getUserDisplayName = (principal: Principal): string => {
    const principalStr = principal.toString();
    const profile = userProfiles[principalStr];
    
    if (profile?.name) {
      return profile.name;
    }
    
    // Show shortened principal if no profile
    const shortPrincipal = principalStr.substring(0, 8) + '...' + principalStr.substring(principalStr.length - 4);
    return shortPrincipal;
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load badge analytics. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analytics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Badge Analytics
          </CardTitle>
          <CardDescription>
            View detailed statistics for your badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No badges created yet</p>
            <p className="text-sm mt-2">Create badges to view analytics and track claims</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Badge Analytics
        </CardTitle>
        <CardDescription>
          View detailed statistics and claim information for your badges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {analytics.map(({ badge, totalClaims, remaining, claimers }) => {
            const badgeCode = getBadgeCode(badge.name);
            const claimPercentage = badge.quantity > 0 
              ? Math.round((Number(totalClaims) / Number(badge.quantity)) * 100)
              : 0;

            return (
              <div
                key={badge.id}
                className="border rounded-lg p-6 bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Badge Image and Info */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted/20 border flex items-center justify-center">
                      {badge.imageUrl ? (
                        <img
                          src={badge.imageUrl}
                          alt={badge.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground text-xs">No image</div>
                      )}
                    </div>
                  </div>

                  {/* Badge Details and Stats */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-xl font-semibold">{badge.name}</h3>
                        <Badge 
                          variant="outline" 
                          className="shrink-0 text-xs font-mono bg-primary/5 border-primary/20"
                        >
                          <Hash className="w-3 h-3 mr-1" />
                          {badgeCode}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                        <div className="text-xs text-muted-foreground mb-1">Total Created</div>
                        <div className="text-2xl font-bold text-primary">
                          {Number(badge.quantity)}
                        </div>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
                        <div className="text-xs text-muted-foreground mb-1">Claimed</div>
                        <div className="text-2xl font-bold text-accent">
                          {Number(totalClaims)}
                        </div>
                      </div>
                      <div className="bg-success/10 rounded-lg p-3 border border-success/20">
                        <div className="text-xs text-muted-foreground mb-1">Remaining</div>
                        <div className="text-2xl font-bold text-success">
                          {Number(remaining)}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 border">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Claimed
                        </div>
                        <div className="text-2xl font-bold">
                          {claimPercentage}%
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Claimers List */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <h4 className="font-semibold text-sm">
                          Users who claimed this badge ({claimers.length})
                        </h4>
                      </div>
                      {claimers.length > 0 ? (
                        <ScrollArea className="h-32 rounded-md border bg-muted/20">
                          <div className="p-4 space-y-2">
                            {claimers.map((principal, index) => {
                              const displayName = getUserDisplayName(principal);
                              const isLoading = loadingProfiles.has(principal.toString());
                              
                              return (
                                <div
                                  key={principal.toString()}
                                  className="flex items-center gap-3 text-sm"
                                >
                                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                    {index + 1}
                                  </div>
                                  {isLoading ? (
                                    <Skeleton className="h-4 w-32" />
                                  ) : (
                                    <span className="font-medium">{displayName}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground text-sm bg-muted/20 rounded-md border">
                          No claims yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
