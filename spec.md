# OpenSpora Badge Collection Community App

## Overview
A community-driven badge collection application where users can create communities, manage badge distributions, and collect badges through QR codes or manual entry.

## Core Features

### Language Support
- The application is fully trilingual, supporting English, Spanish, and Portuguese
- A language selector is prominently displayed in the header allowing users to switch between all three languages at any time
- User's language preference is stored in localStorage for persistence across sessions
- All user-facing text, labels, buttons, error messages, success messages, and feedback are available in all three languages
- Language switching is instant and applies to all components throughout the application
- Default language can be English, with Spanish and Portuguese as alternative options

### About Section
- The application includes an "About" section or page that displays the following information in all supported languages:
  - English: "This is a product of Corporación KaidáO - NIT 9019577984, and is given under AGPL-3.0."
  - Spanish: "Este es un producto de Corporación KaidáO - NIT 9019577984, y se otorga bajo AGPL-3.0."
  - Portuguese: "Este é um produto da Corporação KaidáO - NIT 9019577984, e é fornecido sob AGPL-3.0."
- The About section is easily accessible and styled consistently with OpenSpora branding
- The information is clearly visible and professionally presented

### App Statistics
- A dedicated "App Statistics" page accessible from the navigation menu or dashboard
- Displays comprehensive application-wide statistics in a visually appealing format
- Shows total number of communities created across the entire platform
- Shows total number of badges minted across all communities
- Statistics are presented using charts, counters, or visual elements styled with OpenSpora branding
- All statistics labels and text are fully translated into English, Spanish, and Portuguese
- Navigation to the statistics page is available from the main dashboard or footer
- Page maintains visual consistency with OpenSpora branding including colors, typography, and icons

### Community Management
- Any user can create a new community
- Community creators become administrators of their communities
- Each community has a unique name and ID that is displayed immediately after creation
- Users can view a dashboard listing all communities they have created with names and IDs for easy reference
- Each community can manage its own collection of badges

### Badge Management
- Only community administrators can add new badges to their community
- Badge creation form includes a dropdown menu for community selection that displays only the community name (not the full community ID) while using the correct community ID internally for form submission
- Each badge has a name, description, custom image, and unique claim code
- Badge creators can upload an image for each badge during creation
- Each badge has a quantity limit (maximum 200 per badge type) set during creation
- Badges are distributed through QR codes or manual code entry
- Administrators can view QR codes for each badge in their management interface
- Each badge must have a short, human-friendly display code or identifier that is used in all user-facing areas instead of the full technical badge ID
- QR codes must encode the complete, correct claim URL in the exact format `https://openspora-v75.caffeine.xyz/claim?code=CLAIM_CODE` where CLAIM_CODE is the unique claim code for the badge
- QR code generation must be thoroughly tested to ensure the encoded URLs are properly formatted and functional

### Badge Collection
- All users can scan QR codes to claim badges
- Users can manually enter badge codes as an alternative to QR scanning
- Each badge can only be claimed once per user
- Badge claims are limited by the quantity set for each badge type
- Users receive confirmation when successfully claiming a badge
- Users are notified if a badge is no longer available due to quantity limits
- Scanning a QR code with a mobile device must reliably open the claim page and automatically trigger the badge claim process for the user without requiring manual intervention
- The claim page must automatically process badge claims when accessed via QR code URLs with valid claim codes
- QR code scanning and claim processing must work seamlessly on both desktop and mobile devices
- The entire QR code flow from generation to scanning to claim processing must be thoroughly tested to guarantee reliable functionality

### Authentication and Claim Flow
- The QR claim flow must be completely debugged and reliable across all devices and scenarios
- When a user scans a badge QR code and lands on the claim page, the claim code is correctly extracted from the URL query parameter using robust URL parsing that handles all edge cases
- If the user is not logged in, they are redirected to the login page with the claim code preserved using multiple redundant methods (URL parameters, sessionStorage, and localStorage) to ensure the code is never lost
- After successful authentication, users are automatically redirected back to the claim page and the claim process is triggered immediately with the preserved claim code retrieved from any of the storage methods
- If a user is already logged in and accesses a claim URL, the claim process is triggered immediately without requiring any extra steps
- The system uses multiple fallback mechanisms to preserve the claim code during the authentication flow including URL state preservation, sessionStorage, and localStorage to guarantee seamless redirection and automatic claim processing
- The claim code is correctly passed to the backend claimBadge function for processing with comprehensive validation
- Robust error handling and user feedback in English, Spanish, and Portuguese for all possible claim failures including invalid codes, expired codes, already claimed badges, badges that have reached their quantity limit, network errors, authentication failures, and URL parsing errors
- Clear success messages in English, Spanish, and Portuguese are displayed when a badge is successfully claimed
- Detailed error messages in English, Spanish, and Portuguese are displayed for all failure scenarios with specific feedback for each error type
- The claim flow handles all edge cases gracefully with appropriate user messaging in the user's selected language
- The QR code claim flow must be fully reliable and seamless regardless of the user's login state with comprehensive testing across different browsers and devices
- Authentication state changes must not interrupt or break the claim process with robust state management
- The claim page must handle authentication redirects properly and maintain claim context throughout the entire flow using multiple preservation strategies
- All claim attempts must provide immediate and clear feedback to users in their selected language about success or failure
- Comprehensive debugging and testing of the complete flow: scan QR code → open claim page → extract claim code → authenticate if needed → preserve claim code → process claim → display success or error message in user's selected language
- URL parsing must be bulletproof and handle malformed URLs, missing parameters, and special characters gracefully
- Session and local storage operations must include error handling for storage quota exceeded, disabled storage, and cross-origin restrictions
- The claim process must work reliably after login redirects with thorough testing of all storage and retrieval mechanisms

### User Dashboard
- Users can view their complete badge collection with the actual uploaded badge images always displayed - never show placeholder images when real badge images exist
- Display shows total number of badges collected
- Badges are organized by community using beautiful collapsible modules or dropdowns for each community
- Each community module displays the community name and, when expanded, shows all badges received from that community with their images, names, and descriptions
- A "Most Recent" or "Recently Claimed" section is prominently displayed at the top of the dashboard, highlighting the latest badge claimed by the user with its image, name, description, and community
- The recently claimed section is styled to match OpenSpora branding and provides visual emphasis for the user's latest achievement
- Show which communities the user has collected badges from
- Community creators can view a management dashboard showing all their created communities with names and IDs
- Badge management interface displays QR codes for each badge for easy sharing
- Dashboard tab switching must be robust with proper error handling and graceful fallbacks to prevent blank displays
- Tab state management ensures consistent content rendering across all dashboard sections
- Missing data or loading states display appropriate placeholder content instead of blank screens
- Badge collection display features a beautifully designed layout that showcases each collected badge with its actual custom image, full description, and the name of the community it belongs to
- Badge collection interface maintains visual consistency with OpenSpora branding and uses an appealing grid or card-based layout for optimal presentation
- Each badge card displays the real uploaded badge image (never placeholders when real images exist), the badge name or short human-friendly code as identifier instead of the full technical badge ID, description, and community name in a visually appealing, branded layout
- All user-facing badge displays use short, readable badge codes or names instead of long technical IDs for clean presentation
- All new UI elements including community modules, collapsible sections, and the recently claimed section are fully trilingual with proper translations in English, Spanish, and Portuguese

### Badge Analytics Dashboard
- Community administrators have access to a dedicated analytics tab in their admin dashboard
- Analytics tab displays comprehensive information for each badge they have created
- For each badge, show: badge image, badge name, short display code, total number of claims, and number of badges remaining
- Display a list of all users who have claimed each specific badge
- Analytics interface maintains visual consistency with OpenSpora branding using an appealing layout
- Information is presented in a clear, organized manner with proper visual hierarchy

## Design and Branding
- Application name: "OpenSpora"
- Use the OpenSpora logo as the main visual identity throughout the application
- Color palette, typography, and UI elements should be inspired by the OpenSpora logo's visual style
- Maintain a cohesive and modern look and feel across all components
- Header, Dashboard, and all relevant components should reflect the OpenSpora branding
- Replace any previous branding or placeholder images with OpenSpora branding elements
- Badge collection dashboard uses visually appealing design elements that complement the OpenSpora brand identity
- Badge analytics dashboard follows the same visual design principles as other dashboard sections
- Language selector in the header should be visually integrated with the overall design and branding
- About section styling is consistent with OpenSpora branding and maintains professional presentation
- Community collapsible modules and recently claimed section maintain visual consistency with OpenSpora branding
- App Statistics page follows the same visual design principles and OpenSpora branding as other sections
- All new UI components follow the established design system and visual hierarchy

## Backend Data Storage
- Communities: store community details, unique IDs, and administrator information
- Badges: store badge information linked to specific communities with unique claim codes, custom images (using Caffeine blob storage), quantity limits, and short human-friendly display codes for user-facing presentation
- User collections: track which badges each user has claimed to prevent duplicate claims, including timestamp information for recently claimed badges
- Badge claim tracking: monitor total claims per badge to enforce quantity limits and track which specific users claimed each badge with claim timestamps
- Authentication sessions: manage user login state and preserve claim codes during authentication flows with enhanced session management
- Claim context preservation: store temporary claim context during authentication redirects to ensure seamless claim processing with multiple redundant storage mechanisms
- Application statistics: maintain counts of total communities and total badges for statistics display

## Backend Operations
- Create new communities and return community ID
- Retrieve list of communities created by a specific user
- Add badges to communities with image upload, quantity limits, and generation of short display codes (admin only)
- Store and retrieve badge images using Caffeine blob storage with guaranteed image availability for display
- Validate and process badge claims with quantity enforcement and comprehensive error handling for all failure scenarios with detailed error messages in English, Spanish, and Portuguese
- Retrieve user's badge collection with associated images and human-friendly display codes, organized by community with timestamp information for recently claimed badges
- Retrieve the most recently claimed badge for a user with full badge details, community information, and claim timestamp
- Verify claim codes and prevent duplicate claims with detailed error responses for each failure type in English, Spanish, and Portuguese
- Track and enforce badge quantity limits with appropriate error messaging in English, Spanish, and Portuguese
- Generate QR codes that encode the complete, correct claim URL in the exact format `https://openspora-v75.caffeine.xyz/claim?code=CLAIM_CODE` with proper URL formatting and validation
- Generate short, human-friendly display codes for badges that are used in all user-facing areas
- Retrieve badge analytics data including claim counts, remaining quantities, and lists of users who claimed each badge (admin only)
- Process automatic badge claims when users access claim URLs with valid claim codes with enhanced reliability
- Ensure QR code generation produces properly formatted URLs that work reliably across all devices and browsers with comprehensive testing
- Handle authentication state verification for claim processing with robust error handling and multiple fallback mechanisms
- Preserve and restore claim context during authentication flows with comprehensive session management using multiple storage strategies
- Provide detailed, specific error responses in English, Spanish, and Portuguese for all claim failure scenarios including invalid codes, expired codes, already claimed badges, quantity limit exceeded, network errors, authentication failures, URL parsing errors, and storage errors
- Return specific error types and messages that allow the frontend to display appropriate user feedback in the user's selected language
- Maintain claim context integrity throughout the entire authentication and claim process with thorough testing and multiple preservation mechanisms
- Validate claim codes thoroughly and provide comprehensive error handling for all failure scenarios with error messages in English, Spanish, and Portuguese
- Implement robust debugging and logging for the claim flow to identify and resolve any issues with enhanced monitoring
- Enhanced claim code validation with bulletproof parsing and comprehensive error handling for malformed or invalid codes
- Improved session management with multiple redundant storage and retrieval mechanisms for claim context preservation
- Comprehensive error categorization and localization for all claim-related error messages in English, Spanish, and Portuguese
- Retrieve total number of communities created across the platform (getTotalCommunities query function)
- Retrieve total number of badges minted across all communities (getTotalBadges query function)

## Application Language
- The application is fully trilingual supporting English, Spanish, and Portuguese
- Users can select their preferred language through a language selector in the header
- Language preference is persisted in localStorage
- All user interface text, error messages, success messages, and content is available in all three languages
- Language switching is seamless and applies immediately to all components
- About section content is properly translated and displayed in all supported languages
- App Statistics page content including labels and text is fully translated and available in English, Spanish, and Portuguese
- All new UI elements including community collapsible modules, recently claimed section, statistics page, and related interface text are fully translated and available in English, Spanish, and Portuguese
