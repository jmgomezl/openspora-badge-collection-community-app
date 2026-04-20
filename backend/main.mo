import AccessControl "authorization/access-control";
import Principal "mo:base/Principal";
import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Time "mo:base/Time";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Nat "mo:base/Nat";

actor {
  let accessControlState = AccessControl.initState();
  let storage = Storage.new();
  include MixinStorage(storage);

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public type UserProfile = {
    name : Text;
  };

  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
  var userProfiles = principalMap.empty<UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view profiles");
    };
    principalMap.get(userProfiles, caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Can only view your own profile");
    };
    principalMap.get(userProfiles, user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  // Community and Badge Types
  public type Community = {
    id : Text;
    name : Text;
    admin : Principal;
  };

  public type Badge = {
    id : Text;
    name : Text;
    description : Text;
    communityId : Text;
    claimCode : Text;
    imageUrl : Text;
    quantity : Nat;
    claimedCount : Nat;
    displayCode : Text;
  };

  public type UserBadge = {
    badgeId : Text;
    communityId : Text;
    claimedAt : Int;
  };

  // OrderedMap instances
  transient let textMap = OrderedMap.Make<Text>(Text.compare);

  // Storage
  var communities = textMap.empty<Community>();
  var badges = textMap.empty<Badge>();
  var userCollections = principalMap.empty<[UserBadge]>();

  // Community Management
  public shared ({ caller }) func createCommunity(name : Text) : async Text {
    let communityId = name # "_" # debug_show (caller);
    let community : Community = {
      id = communityId;
      name;
      admin = caller;
    };
    communities := textMap.put(communities, communityId, community);
    communityId;
  };

  public query ({ caller }) func getUserCreatedCommunities() : async [Community] {
    let userCommunities = Iter.toArray(
      Iter.filter(
        textMap.vals(communities),
        func(community : Community) : Bool {
          community.admin == caller;
        },
      )
    );
    userCommunities;
  };

  // Badge Management
  public shared ({ caller }) func addBadge(communityId : Text, name : Text, description : Text, claimCode : Text, imageUrl : Text, quantity : Nat, displayCode : Text) : async Text {
    if (quantity > 200) {
      Debug.trap("Quantity cannot exceed 200");
    };

    switch (textMap.get(communities, communityId)) {
      case (null) { Debug.trap("Community not found") };
      case (?community) {
        if (community.admin != caller) {
          Debug.trap("Unauthorized: Only community admin can add badges");
        };
        let badgeId = communityId # "_" # name;
        let badge : Badge = {
          id = badgeId;
          name;
          description;
          communityId;
          claimCode;
          imageUrl;
          quantity;
          claimedCount = 0;
          displayCode;
        };
        badges := textMap.put(badges, badgeId, badge);
        badgeId;
      };
    };
  };

  // Badge Claiming
  public shared ({ caller }) func claimBadge(claimCode : Text) : async Text {
    let matchingBadges = Iter.toArray(
      Iter.filter(
        textMap.vals(badges),
        func(badge : Badge) : Bool {
          badge.claimCode == claimCode;
        },
      )
    );

    if (matchingBadges.size() == 0) {
      Debug.trap("Invalid claim code");
    };

    let badge = matchingBadges[0];

    if (badge.claimedCount >= badge.quantity) {
      Debug.trap("Badge no longer available");
    };

    let userBadges = switch (principalMap.get(userCollections, caller)) {
      case (null) { [] };
      case (?badges) { badges };
    };

    if (Iter.size(Iter.filter(Iter.fromArray(userBadges), func(ub : UserBadge) : Bool { ub.badgeId == badge.id })) > 0) {
      Debug.trap("Badge already claimed");
    };

    let newUserBadge : UserBadge = {
      badgeId = badge.id;
      communityId = badge.communityId;
      claimedAt = Int.abs(Time.now());
    };

    let updatedBadges = Array.append(userBadges, [newUserBadge]);
    userCollections := principalMap.put(userCollections, caller, updatedBadges);

    // Update claimed count
    let updatedBadge : Badge = {
      badge with claimedCount = badge.claimedCount + 1;
    };
    badges := textMap.put(badges, badge.id, updatedBadge);

    badge.id;
  };

  // User Dashboard
  public query ({ caller }) func getUserBadges() : async [UserBadge] {
    switch (principalMap.get(userCollections, caller)) {
      case (null) { [] };
      case (?badges) { badges };
    };
  };

  public query ({ caller }) func getUserCommunities() : async [Text] {
    let userBadges = switch (principalMap.get(userCollections, caller)) {
      case (null) { [] };
      case (?badges) { badges };
    };

    let communityIds = Array.map<UserBadge, Text>(userBadges, func(ub : UserBadge) : Text { ub.communityId });
    communityIds;
  };

  // Admin QR Code Retrieval
  public query ({ caller }) func getAdminBadgeClaimCodes() : async [(Text, Text)] {
    let adminBadges = Iter.toArray(
      Iter.filter(
        textMap.vals(badges),
        func(badge : Badge) : Bool {
          switch (textMap.get(communities, badge.communityId)) {
            case (null) { false };
            case (?community) { community.admin == caller };
          };
        },
      )
    );

    Array.map<Badge, (Text, Text)>(adminBadges, func(badge : Badge) : (Text, Text) { (badge.name, badge.claimCode) });
  };

  // New function to get detailed user badge info
  public query ({ caller }) func getUserBadgeDetails() : async [(UserBadge, ?Badge)] {
    let userBadges = switch (principalMap.get(userCollections, caller)) {
      case (null) { [] };
      case (?badges) { badges };
    };

    Array.map<UserBadge, (UserBadge, ?Badge)>(
      userBadges,
      func(userBadge : UserBadge) : (UserBadge, ?Badge) {
        (userBadge, textMap.get(badges, userBadge.badgeId));
      },
    );
  };

  // New function for admin analytics
  public query ({ caller }) func getAdminBadgeAnalytics() : async [(Badge, Nat, Nat, [Principal])] {
    let adminBadges = Iter.toArray(
      Iter.filter(
        textMap.vals(badges),
        func(badge : Badge) : Bool {
          switch (textMap.get(communities, badge.communityId)) {
            case (null) { false };
            case (?community) { community.admin == caller };
          };
        },
      )
    );

    Array.map<Badge, (Badge, Nat, Nat, [Principal])>(
      adminBadges,
      func(badge : Badge) : (Badge, Nat, Nat, [Principal]) {
        let totalClaims = badge.claimedCount;
        let remaining = Nat.sub(badge.quantity, totalClaims);

        let claimers = Array.mapFilter<(Principal, [UserBadge]), Principal>(
          Iter.toArray(principalMap.entries(userCollections)),
          func((principal, userBadges) : (Principal, [UserBadge])) : ?Principal {
            if (Iter.size(Iter.filter(Iter.fromArray(userBadges), func(ub : UserBadge) : Bool { ub.badgeId == badge.id })) > 0) {
              ?principal;
            } else {
              null;
            };
          },
        );

        (badge, totalClaims, remaining, claimers);
      },
    );
  };

  // New function to get claim URL for a badge
  public query ({ caller }) func getAdminBadgeClaimUrls() : async [(Text, Text)] {
    let adminBadges = Iter.toArray(
      Iter.filter(
        textMap.vals(badges),
        func(badge : Badge) : Bool {
          switch (textMap.get(communities, badge.communityId)) {
            case (null) { false };
            case (?community) { community.admin == caller };
          };
        },
      )
    );

    Array.map<Badge, (Text, Text)>(
      adminBadges,
      func(badge : Badge) : (Text, Text) {
        let claimUrl = "https://openspora-v75.caffeine.xyz/claim?code=" # badge.claimCode;
        (badge.name, claimUrl);
      },
    );
  };

  // New function to get all claim URLs for a community
  public query ({ caller }) func getCommunityClaimUrls(communityId : Text) : async [(Text, Text)] {
    switch (textMap.get(communities, communityId)) {
      case (null) { Debug.trap("Community not found") };
      case (?community) {
        if (community.admin != caller) {
          Debug.trap("Unauthorized: Only community admin can get claim URLs");
        };

        let communityBadges = Iter.toArray(
          Iter.filter(
            textMap.vals(badges),
            func(badge : Badge) : Bool {
              badge.communityId == communityId;
            },
          )
        );

        Array.map<Badge, (Text, Text)>(
          communityBadges,
          func(badge : Badge) : (Text, Text) {
            let claimUrl = "https://openspora-v75.caffeine.xyz/claim?code=" # badge.claimCode;
            (badge.name, claimUrl);
          },
        );
      };
    };
  };

  // New function to validate claim code
  public query func validateClaimCode(claimCode : Text) : async Bool {
    let matchingBadges = Iter.toArray(
      Iter.filter(
        textMap.vals(badges),
        func(badge : Badge) : Bool {
          badge.claimCode == claimCode;
        },
      )
    );

    if (matchingBadges.size() == 0) {
      return false;
    };

    let badge = matchingBadges[0];

    if (badge.claimedCount >= badge.quantity) {
      return false;
    };

    true;
  };

  // New function to get claim code details
  public query func getClaimCodeDetails(claimCode : Text) : async ?Badge {
    let matchingBadges = Iter.toArray(
      Iter.filter(
        textMap.vals(badges),
        func(badge : Badge) : Bool {
          badge.claimCode == claimCode;
        },
      )
    );

    if (matchingBadges.size() == 0) {
      return null;
    };

    let badge = matchingBadges[0];

    if (badge.claimedCount >= badge.quantity) {
      return null;
    };

    ?badge;
  };

  // New function to check if a badge is already claimed by the user
  public query ({ caller }) func isBadgeClaimedByUser(badgeId : Text) : async Bool {
    let userBadges = switch (principalMap.get(userCollections, caller)) {
      case (null) { return false };
      case (?badges) {
        return Iter.size(Iter.filter(Iter.fromArray(badges), func(ub : UserBadge) : Bool { ub.badgeId == badgeId })) > 0;
      };
    };
  };

  // New function to get claim status for a code
  public query ({ caller }) func getClaimStatus(claimCode : Text) : async {
    isValid : Bool;
    isClaimed : Bool;
    badge : ?Badge;
    errorMessage : ?Text;
  } {
    let matchingBadges = Iter.toArray(
      Iter.filter(
        textMap.vals(badges),
        func(badge : Badge) : Bool {
          badge.claimCode == claimCode;
        },
      )
    );

    if (matchingBadges.size() == 0) {
      return {
        isValid = false;
        isClaimed = false;
        badge = null;
        errorMessage = ?" Invalid claim code";
      };
    };

    let badge = matchingBadges[0];

    if (badge.claimedCount >= badge.quantity) {
      return {
        isValid = false;
        isClaimed = false;
        badge = ?badge;
        errorMessage = ?" Badge no longer available";
      };
    };

    let userBadges = switch (principalMap.get(userCollections, caller)) {
      case (null) { [] };
      case (?badges) { badges };
    };

    let isClaimed = Iter.size(Iter.filter(Iter.fromArray(userBadges), func(ub : UserBadge) : Bool { ub.badgeId == badge.id })) > 0;

    if (isClaimed) {
      return {
        isValid = false;
        isClaimed = true;
        badge = ?badge;
        errorMessage = ?" Badge already claimed";
      };
    };

    {
      isValid = true;
      isClaimed = false;
      badge = ?badge;
      errorMessage = null;
    };
  };

  // New function to get all available badges
  public query func getAllAvailableBadges() : async [Badge] {
    let availableBadges = Iter.toArray(
      Iter.filter(
        textMap.vals(badges),
        func(badge : Badge) : Bool {
          badge.claimedCount < badge.quantity;
        },
      )
    );
    availableBadges;
  };

  // New function to get all communities
  public query func getAllCommunities() : async [Community] {
    Iter.toArray(textMap.vals(communities));
  };

  // New function to get badges by community
  public query func getBadgesByCommunity(communityId : Text) : async [Badge] {
    let communityBadges = Iter.toArray(
      Iter.filter(
        textMap.vals(badges),
        func(badge : Badge) : Bool {
          badge.communityId == communityId;
        },
      )
    );
    communityBadges;
  };

  // New function to get user badge count
  public query ({ caller }) func getUserBadgeCount() : async Nat {
    let userBadges = switch (principalMap.get(userCollections, caller)) {
      case (null) { [] };
      case (?badges) { badges };
    };
    userBadges.size();
  };

  // New function to get community badge count
  public query func getCommunityBadgeCount(communityId : Text) : async Nat {
    let communityBadges = Iter.toArray(
      Iter.filter(
        textMap.vals(badges),
        func(badge : Badge) : Bool {
          badge.communityId == communityId;
        },
      )
    );
    communityBadges.size();
  };

  // New function to get user badges grouped by community
  public query ({ caller }) func getUserBadgesByCommunity() : async [(Text, [UserBadge])] {
    let userBadges = switch (principalMap.get(userCollections, caller)) {
      case (null) { [] };
      case (?badges) { badges };
    };

    let communityMap = OrderedMap.Make<Text>(Text.compare);
    var grouped = communityMap.empty<[UserBadge]>();

    for (userBadge in userBadges.vals()) {
      switch (communityMap.get(grouped, userBadge.communityId)) {
        case (null) {
          grouped := communityMap.put(grouped, userBadge.communityId, [userBadge]);
        };
        case (?existing) {
          grouped := communityMap.put(grouped, userBadge.communityId, Array.append(existing, [userBadge]));
        };
      };
    };

    Iter.toArray(communityMap.entries(grouped));
  };

  // New function to get most recently claimed badge
  public query ({ caller }) func getMostRecentBadge() : async ?UserBadge {
    let userBadges = switch (principalMap.get(userCollections, caller)) {
      case (null) { return null };
      case (?badges) {
        if (badges.size() == 0) {
          return null;
        };
        var mostRecent = badges[0];
        for (badge in badges.vals()) {
          if (badge.claimedAt > mostRecent.claimedAt) {
            mostRecent := badge;
          };
        };
        ?mostRecent;
      };
    };
  };

  // New function to get most recent badge with details
  public query ({ caller }) func getMostRecentBadgeDetails() : async ?(UserBadge, ?Badge, ?Community) {
    let userBadges = switch (principalMap.get(userCollections, caller)) {
      case (null) { return null };
      case (?userBadges) {
        if (userBadges.size() == 0) {
          return null;
        };
        var mostRecent = userBadges[0];
        for (badge in userBadges.vals()) {
          if (badge.claimedAt > mostRecent.claimedAt) {
            mostRecent := badge;
          };
        };
        let badgeDetails = textMap.get(badges, mostRecent.badgeId);
        let communityDetails = switch (badgeDetails) {
          case (null) { null };
          case (?badge) { textMap.get(communities, badge.communityId) };
        };
        ?(mostRecent, badgeDetails, communityDetails);
      };
    };
  };

  // New function to get total number of communities
  public query func getTotalCommunities() : async Nat {
    textMap.size(communities);
  };

  // New function to get total number of badges
  public query func getTotalBadges() : async Nat {
    textMap.size(badges);
  };
}
