import { useState, useRef, useEffect } from 'react';
import { useCreateCommunity, useAddBadge, useGetUserCreatedCommunities, useGetAdminBadgeClaimUrls } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Award, Copy, Check, Building2, Upload, QrCode, AlertCircle, Hash, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import BadgeAnalytics from './BadgeAnalytics';

// QR Code generation using qrcode-generator library
declare global {
  interface Window {
    qrcode?: any;
  }
}

function generateQRCodeDataURL(text: string): string {
  try {
    // Check if qrcode library is loaded
    if (!window.qrcode) {
      console.error('QR code library not loaded');
      return '';
    }

    // Create QR code with error correction level H (high)
    const typeNumber = 0; // Auto-detect size
    const errorCorrectionLevel = 'H';
    const qr = window.qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(text);
    qr.make();

    // Generate canvas
    const canvas = document.createElement('canvas');
    const cellSize = 8;
    const margin = 4;
    const size = qr.getModuleCount();
    const canvasSize = size * cellSize + margin * 2 * cellSize;
    
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw QR code
    ctx.fillStyle = '#000000';
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(
            col * cellSize + margin * cellSize,
            row * cellSize + margin * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

export default function ManageCommunities() {
  const [activeTab, setActiveTab] = useState('community');
  const [communityName, setCommunityName] = useState('');
  const [badgeData, setBadgeData] = useState({
    communityId: '',
    name: '',
    description: '',
    claimCode: '',
    quantity: 1,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  const [qrLibraryLoaded, setQrLibraryLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createCommunity, isPending: isCreating, data: newCommunityId } = useCreateCommunity();
  const { mutate: addBadge, isPending: isAdding } = useAddBadge();
  const { data: createdCommunities = [], isLoading: isLoadingCommunities, error: communitiesError } = useGetUserCreatedCommunities();
  const { data: adminBadgeClaimUrls = [], isLoading: isLoadingBadges, error: badgesError } = useGetAdminBadgeClaimUrls();

  // Load QR code library
  useEffect(() => {
    if (window.qrcode) {
      setQrLibraryLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
    script.async = true;
    script.onload = () => {
      setQrLibraryLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load QR code library');
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (communityName.trim()) {
      createCommunity(communityName.trim());
      setCommunityName('');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        alert('Failed to read image file');
        setSelectedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCommunitySelect = (communityId: string) => {
    setBadgeData({ ...badgeData, communityId });
  };

  const handleAddBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (badgeData.communityId && badgeData.name && badgeData.description && badgeData.claimCode && selectedImage) {
      if (badgeData.quantity < 1 || badgeData.quantity > 200) {
        alert('Quantity must be between 1 and 200');
        return;
      }
      addBadge({
        ...badgeData,
        image: selectedImage,
        onProgress: setUploadProgress,
      });
      setBadgeData({ communityId: '', name: '', description: '', claimCode: '', quantity: 1 });
      setSelectedImage(null);
      setImagePreview(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getQRCode = (badgeId: string, claimUrl: string) => {
    if (qrCodeUrls[badgeId]) {
      return qrCodeUrls[badgeId];
    }
    if (!qrLibraryLoaded) {
      return '';
    }
    const url = generateQRCodeDataURL(claimUrl);
    if (url) {
      setQrCodeUrls(prev => ({ ...prev, [badgeId]: url }));
    }
    return url;
  };

  const downloadQRCode = (badgeName: string, qrUrl: string) => {
    try {
      const link = document.createElement('a');
      link.href = qrUrl;
      link.download = `${badgeName.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download QR code:', error);
      alert('Failed to download QR code');
    }
  };

  // Get the selected community name for display
  const getSelectedCommunityName = () => {
    const selected = createdCommunities.find(c => c.id === badgeData.communityId);
    return selected?.name || '';
  };

  // Helper to generate a short badge code for display
  const getBadgeCode = (badgeName: string): string => {
    const words = badgeName.split(' ').filter(w => w.length > 0);
    if (words.length >= 2) {
      return words.slice(0, 2).map(w => w.substring(0, 3).toUpperCase()).join('-');
    } else if (words.length === 1) {
      return words[0].substring(0, 6).toUpperCase();
    }
    return badgeName.substring(0, 6).toUpperCase();
  };

  // Extract claim code from URL for display
  const getClaimCodeFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('code') || url;
    } catch {
      return url;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create</span>
          </TabsTrigger>
          <TabsTrigger value="my-communities" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Communities</span>
          </TabsTrigger>
          <TabsTrigger value="badge" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Add Badge</span>
          </TabsTrigger>
          <TabsTrigger value="qr-codes" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">QR Codes</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="community" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img 
                  src="/assets/generated/community-icon-transparent.dim_64x64.png" 
                  alt="Community" 
                  className="w-6 h-6"
                />
                Create a New Community
              </CardTitle>
              <CardDescription>
                Start your own badge collection community and become its administrator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCommunity} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="communityName">Community Name</Label>
                  <Input
                    id="communityName"
                    placeholder="Enter community name"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!communityName.trim() || isCreating}>
                  {isCreating ? 'Creating...' : 'Create Community'}
                </Button>
              </form>

              {newCommunityId && (
                <Alert className="mt-4 bg-primary/5 border-primary/20">
                  <AlertDescription className="space-y-2">
                    <p className="font-medium text-sm">Community created successfully!</p>
                    <p className="text-xs text-muted-foreground">
                      You can now add badges to your community
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-communities" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                My Communities
              </CardTitle>
              <CardDescription>
                View and manage all communities you have created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {communitiesError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load communities. Please try refreshing the page.
                  </AlertDescription>
                </Alert>
              ) : isLoadingCommunities ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : createdCommunities.length > 0 ? (
                <div className="space-y-3">
                  {createdCommunities.map((community) => (
                    <div
                      key={community.id}
                      className="p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-2">{community.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            Community ID (for internal use)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>You haven't created any communities yet</p>
                  <p className="text-sm mt-1">Create your first community to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badge" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img 
                  src="/assets/generated/badge-icon-transparent.dim_64x64.png" 
                  alt="Badge" 
                  className="w-6 h-6"
                />
                Add a Badge
              </CardTitle>
              <CardDescription>
                Add a new badge to your community (admin only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCommunities ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : createdCommunities.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You need to create a community first before adding badges. Go to the "Create" tab to get started.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleAddBadge} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="communitySelect">Select Community</Label>
                    <Select
                      value={badgeData.communityId}
                      onValueChange={handleCommunitySelect}
                      disabled={isAdding}
                    >
                      <SelectTrigger id="communitySelect">
                        <SelectValue placeholder="Choose a community">
                          {getSelectedCommunityName()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {createdCommunities.map((community) => (
                          <SelectItem key={community.id} value={community.id}>
                            {community.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Select the community where you want to add this badge
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badgeName">Badge Name</Label>
                    <Input
                      id="badgeName"
                      placeholder="Enter badge name"
                      value={badgeData.name}
                      onChange={(e) => setBadgeData({ ...badgeData, name: e.target.value })}
                      disabled={isAdding}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badgeDescription">Description</Label>
                    <Textarea
                      id="badgeDescription"
                      placeholder="Enter badge description"
                      value={badgeData.description}
                      onChange={(e) => setBadgeData({ ...badgeData, description: e.target.value })}
                      disabled={isAdding}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badgeImage">Badge Image</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isAdding}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {selectedImage ? 'Change Image' : 'Upload Image'}
                      </Button>
                      {selectedImage && (
                        <span className="text-sm text-muted-foreground truncate flex-1">
                          {selectedImage.name}
                        </span>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    {imagePreview && (
                      <div className="mt-2 p-4 border rounded-lg bg-muted/20 flex items-center justify-center">
                        <img 
                          src={imagePreview} 
                          alt="Badge preview" 
                          className="max-w-[200px] max-h-[200px] object-contain rounded"
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Upload an image for your badge (max 5MB)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity Available</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="200"
                      placeholder="Enter quantity (max 200)"
                      value={badgeData.quantity}
                      onChange={(e) => setBadgeData({ ...badgeData, quantity: parseInt(e.target.value) || 1 })}
                      disabled={isAdding}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum 200 badges can be created per badge type
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="claimCode">Claim Code</Label>
                    <Input
                      id="claimCode"
                      placeholder="Enter unique claim code"
                      value={badgeData.claimCode}
                      onChange={(e) => setBadgeData({ ...badgeData, claimCode: e.target.value })}
                      disabled={isAdding}
                    />
                    <p className="text-xs text-muted-foreground">
                      This code will be used to claim the badge
                    </p>
                  </div>
                  {isAdding && uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Uploading image...</span>
                        <span className="font-medium">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      !badgeData.communityId ||
                      !badgeData.name ||
                      !badgeData.description ||
                      !badgeData.claimCode ||
                      !selectedImage ||
                      badgeData.quantity < 1 ||
                      badgeData.quantity > 200 ||
                      isAdding
                    }
                  >
                    {isAdding ? 'Adding Badge...' : 'Add Badge'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr-codes" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-6 h-6" />
                Badge QR Codes
              </CardTitle>
              <CardDescription>
                View and download QR codes for your badges - scan to claim directly
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!qrLibraryLoaded && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Loading QR code generator...
                  </AlertDescription>
                </Alert>
              )}
              {badgesError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load QR codes. Please try refreshing the page.
                  </AlertDescription>
                </Alert>
              ) : isLoadingBadges ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : adminBadgeClaimUrls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminBadgeClaimUrls.map(([badgeName, claimUrl]) => {
                    const qrUrl = getQRCode(badgeName, claimUrl);
                    const badgeCode = getBadgeCode(badgeName);
                    const claimCode = getClaimCodeFromUrl(claimUrl);
                    return (
                      <div
                        key={badgeName}
                        className="p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                      >
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base flex-1 truncate">{badgeName}</h3>
                              <Badge 
                                variant="outline" 
                                className="shrink-0 text-xs font-mono bg-primary/5 border-primary/20"
                              >
                                <Hash className="w-3 h-3 mr-1" />
                                {badgeCode}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-muted px-2 py-1 rounded break-all flex-1">
                                  {claimUrl}
                                </code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(claimUrl)}
                                  className="shrink-0 h-7 w-7 p-0"
                                >
                                  {copiedId === claimUrl ? (
                                    <Check className="w-3 h-3 text-success" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Claim code: <span className="font-mono">{claimCode}</span>
                              </p>
                            </div>
                          </div>
                          {qrUrl ? (
                            <div className="flex flex-col items-center gap-3">
                              <div className="bg-white p-3 rounded-lg border">
                                <img 
                                  src={qrUrl} 
                                  alt={`QR code for ${badgeName}`}
                                  className="w-48 h-48"
                                />
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadQRCode(badgeName, qrUrl)}
                                className="w-full"
                              >
                                Download QR Code
                              </Button>
                            </div>
                          ) : qrLibraryLoaded ? (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                              Failed to generate QR code
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No badges created yet</p>
                  <p className="text-sm mt-1">Create badges to generate QR codes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <BadgeAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
