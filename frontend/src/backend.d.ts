import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Badge {
    id: string;
    communityId: string;
    displayCode: string;
    name: string;
    description: string;
    claimCode: string;
    imageUrl: string;
    quantity: bigint;
    claimedCount: bigint;
}
export interface UserBadge {
    communityId: string;
    claimedAt: bigint;
    badgeId: string;
}
export interface Community {
    id: string;
    admin: Principal;
    name: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBadge(communityId: string, name: string, description: string, claimCode: string, imageUrl: string, quantity: bigint, displayCode: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimBadge(claimCode: string): Promise<string>;
    createCommunity(name: string): Promise<string>;
    getAdminBadgeAnalytics(): Promise<Array<[Badge, bigint, bigint, Array<Principal>]>>;
    getAdminBadgeClaimCodes(): Promise<Array<[string, string]>>;
    getAdminBadgeClaimUrls(): Promise<Array<[string, string]>>;
    getAllAvailableBadges(): Promise<Array<Badge>>;
    getAllCommunities(): Promise<Array<Community>>;
    getBadgesByCommunity(communityId: string): Promise<Array<Badge>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClaimCodeDetails(claimCode: string): Promise<Badge | null>;
    getClaimStatus(claimCode: string): Promise<{
        errorMessage?: string;
        isClaimed: boolean;
        badge?: Badge;
        isValid: boolean;
    }>;
    getCommunityBadgeCount(communityId: string): Promise<bigint>;
    getCommunityClaimUrls(communityId: string): Promise<Array<[string, string]>>;
    getMostRecentBadge(): Promise<UserBadge | null>;
    getMostRecentBadgeDetails(): Promise<[UserBadge, Badge | null, Community | null] | null>;
    getTotalBadges(): Promise<bigint>;
    getTotalCommunities(): Promise<bigint>;
    getUserBadgeCount(): Promise<bigint>;
    getUserBadgeDetails(): Promise<Array<[UserBadge, Badge | null]>>;
    getUserBadges(): Promise<Array<UserBadge>>;
    getUserBadgesByCommunity(): Promise<Array<[string, Array<UserBadge>]>>;
    getUserCommunities(): Promise<Array<string>>;
    getUserCreatedCommunities(): Promise<Array<Community>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isBadgeClaimedByUser(badgeId: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    validateClaimCode(claimCode: string): Promise<boolean>;
}