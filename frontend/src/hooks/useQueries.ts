import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, UserBadge, Community, Badge } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor no disponible');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor no disponible');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Perfil guardado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al guardar perfil: ${error.message}`);
    },
  });
}

export function useCreateCommunity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor no disponible');
      return actor.createCommunity(name);
    },
    onSuccess: (communityId: string) => {
      queryClient.invalidateQueries({ queryKey: ['userBadges'] });
      queryClient.invalidateQueries({ queryKey: ['userCommunities'] });
      queryClient.invalidateQueries({ queryKey: ['userCreatedCommunities'] });
      queryClient.invalidateQueries({ queryKey: ['userBadgeDetails'] });
      queryClient.invalidateQueries({ queryKey: ['userBadgesByCommunity'] });
      queryClient.invalidateQueries({ queryKey: ['mostRecentBadgeDetails'] });
      queryClient.invalidateQueries({ queryKey: ['appStatistics'] });
      toast.success('¡Comunidad creada exitosamente!');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear comunidad: ${error.message}`);
    },
  });
}

export interface BadgeDetails {
  userBadge: UserBadge;
  badge: Badge | null;
}

export function useAddBadge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { 
      communityId: string; 
      name: string; 
      description: string; 
      claimCode: string;
      image: File;
      quantity: number;
      onProgress?: (percentage: number) => void;
    }) => {
      if (!actor) throw new Error('Actor no disponible');
      
      // Convert image to base64 data URL for storage
      const imageUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(params.image);
      });
      
      // Simulate upload progress
      if (params.onProgress) {
        params.onProgress(50);
        await new Promise(resolve => setTimeout(resolve, 100));
        params.onProgress(100);
      }
      
      const badgeId = await actor.addBadge(
        params.communityId, 
        params.name, 
        params.description, 
        params.claimCode,
        imageUrl,
        BigInt(params.quantity),
        params.name
      );

      return badgeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBadges'] });
      queryClient.invalidateQueries({ queryKey: ['adminBadgeClaimUrls'] });
      queryClient.invalidateQueries({ queryKey: ['userBadgeDetails'] });
      queryClient.invalidateQueries({ queryKey: ['adminBadgeAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['userBadgesByCommunity'] });
      queryClient.invalidateQueries({ queryKey: ['mostRecentBadgeDetails'] });
      queryClient.invalidateQueries({ queryKey: ['appStatistics'] });
      toast.success('Insignia agregada exitosamente');
    },
    onError: (error: Error) => {
      const message = error.message.toLowerCase();
      if (message.includes('la cantidad no puede exceder 200') || message.includes('quantity cannot exceed 200')) {
        toast.error('La cantidad no puede exceder 200 insignias');
      } else if (message.includes('no autorizado') || message.includes('unauthorized')) {
        toast.error('Solo los administradores de la comunidad pueden agregar insignias');
      } else {
        toast.error(`Error al agregar insignia: ${error.message}`);
      }
    },
  });
}

export function useClaimBadge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimCode: string) => {
      if (!actor) throw new Error('Actor no disponible');
      if (!claimCode || !claimCode.trim()) {
        throw new Error('Se requiere código de reclamo válido');
      }
      const trimmedCode = claimCode.trim();
      console.log('Reclamando insignia con código:', trimmedCode);
      return actor.claimBadge(trimmedCode);
    },
    onSuccess: (badgeId) => {
      console.log('Insignia reclamada exitosamente:', badgeId);
      queryClient.invalidateQueries({ queryKey: ['userBadges'] });
      queryClient.invalidateQueries({ queryKey: ['userCommunities'] });
      queryClient.invalidateQueries({ queryKey: ['userBadgeDetails'] });
      queryClient.invalidateQueries({ queryKey: ['adminBadgeAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['userBadgesByCommunity'] });
      queryClient.invalidateQueries({ queryKey: ['mostRecentBadgeDetails'] });
    },
    onError: (error: Error) => {
      // Error handling is delegated to the component for better UX control
      console.error('Error al reclamar insignia:', error.message);
    },
  });
}

export function useGetUserBadges() {
  const { actor, isFetching } = useActor();

  return useQuery<UserBadge[]>({
    queryKey: ['userBadges'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserBadges();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserBadgeDetails() {
  const { actor, isFetching } = useActor();

  return useQuery<BadgeDetails[]>({
    queryKey: ['userBadgeDetails'],
    queryFn: async () => {
      if (!actor) return [];
      const details = await actor.getUserBadgeDetails();
      return details.map(([userBadge, badge]) => ({
        userBadge,
        badge,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserCommunities() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['userCommunities'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserCommunities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserCreatedCommunities() {
  const { actor, isFetching } = useActor();

  return useQuery<Community[]>({
    queryKey: ['userCreatedCommunities'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserCreatedCommunities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAdminBadgeClaimUrls() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, string]>>({
    queryKey: ['adminBadgeClaimUrls'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminBadgeClaimUrls();
    },
    enabled: !!actor && !isFetching,
  });
}

export interface BadgeAnalytics {
  badge: Badge;
  totalClaims: bigint;
  remaining: bigint;
  claimers: Principal[];
}

export function useGetAdminBadgeAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<BadgeAnalytics[]>({
    queryKey: ['adminBadgeAnalytics'],
    queryFn: async () => {
      if (!actor) return [];
      const analytics = await actor.getAdminBadgeAnalytics();
      return analytics.map(([badge, totalClaims, remaining, claimers]) => ({
        badge,
        totalClaims,
        remaining,
        claimers,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserProfile() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor no disponible');
      return actor.getUserProfile(principal);
    },
  });
}

export function useGetUserBadgesByCommunity() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, UserBadge[]]>>({
    queryKey: ['userBadgesByCommunity'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserBadgesByCommunity();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMostRecentBadgeDetails() {
  const { actor, isFetching } = useActor();

  return useQuery<[UserBadge, Badge | null, Community | null] | null>({
    queryKey: ['mostRecentBadgeDetails'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMostRecentBadgeDetails();
    },
    enabled: !!actor && !isFetching,
  });
}

export interface AppStatistics {
  totalCommunities: bigint;
  totalBadges: bigint;
}

export function useGetAppStatistics() {
  const { actor, isFetching } = useActor();

  return useQuery<AppStatistics>({
    queryKey: ['appStatistics'],
    queryFn: async () => {
      if (!actor) return { totalCommunities: BigInt(0), totalBadges: BigInt(0) };
      const [totalCommunities, totalBadges] = await Promise.all([
        actor.getTotalCommunities(),
        actor.getTotalBadges(),
      ]);
      return { totalCommunities, totalBadges };
    },
    enabled: !!actor && !isFetching,
  });
}
