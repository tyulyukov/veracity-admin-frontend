import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { useUser, useUpdateUserStatus, useUpdateUserRole } from '@/hooks/use-admin-users';
import { useUserPosts, useUserActivity } from '@/hooks/use-admin-content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, Mail, Briefcase, Loader2, CheckCircle, XCircle, Clock, ChevronDown, CalendarDays, FileText, Activity, User as UserIcon, MessageSquare, Heart, Trash2, ImageIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import type { UserStatus, UserRole, Post, UserActivity as UserActivityType } from '@/types';
import { getFullStorageUrl } from '@/lib/storage';

const statusConfig: Record<UserStatus, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: typeof CheckCircle }> = {
  active: { label: 'Active', variant: 'default', icon: CheckCircle },
  pending: { label: 'Pending', variant: 'secondary', icon: Clock },
  inactive: { label: 'Inactive', variant: 'destructive', icon: XCircle },
};


const roleConfig: Record<UserRole, { label: string }> = {
  standard_user: { label: 'User' },
  speaker: { label: 'Speaker' },
};

type TabType = 'profile' | 'posts' | 'activity';

const ITEMS_PER_PAGE = 20;

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [postsPage, setPostsPage] = useState(0);
  const [activityPage, setActivityPage] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { data: user, isLoading, isError } = useUser(userId);
  const { data: postsData, isLoading: postsLoading } = useUserPosts(userId, { offset: postsPage * ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE });
  const { data: activityData, isLoading: activityLoading } = useUserActivity(userId, { offset: activityPage * ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE });
  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxImages([]);
    setLightboxIndex(0);
  };

  useEffect(() => {
    setPostsPage(0);
    setActivityPage(0);
  }, [activeTab]);

  const handleStatusChange = (status: UserStatus) => {
    if (!userId) return;
    updateStatus.mutate({ userId, payload: { status } });
  };

  const handleRoleChange = (role: UserRole) => {
    if (!userId) return;
    updateRole.mutate({ userId, payload: { role } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link
          to="/users"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to users
        </Link>
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">User not found</h2>
          <p className="text-muted-foreground">This user may no longer exist.</p>
        </div>
      </div>
    );
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const statusCfg = statusConfig[user.status];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/users"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to users
        </Link>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/users/${userId}/events`}>
            <CalendarDays className="w-4 h-4 mr-2" />
            View Events
          </Link>
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />

        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-10 mb-8">
            <Avatar
              src={getFullStorageUrl(user.avatarUrl)}
              firstName={user.firstName}
              lastName={user.lastName}
              seed={user.id}
              size="lg"
              className="border-4 border-card w-20 h-20 text-xl"
            />

            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {user.firstName} {user.lastName}
              </h1>
              {user.position && <p className="text-muted-foreground">{user.position}</p>}
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={updateStatus.isPending}>
                    <Badge
                      variant={statusCfg.variant}
                      className={cn(
                        'mr-2',
                        user.status === 'active' && 'bg-emerald-500/10 text-emerald-500',
                        user.status === 'pending' && 'bg-amber-500/10 text-amber-500'
                      )}
                    >
                      {statusCfg.label}
                    </Badge>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleStatusChange('active')}
                    disabled={user.status === 'active'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange('inactive')}
                    disabled={user.status === 'inactive'}
                  >
                    <XCircle className="w-4 h-4 mr-2 text-destructive" />
                    Deactivate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={updateRole.isPending}>
                    <span className="mr-2 capitalize">{roleConfig[user.role]?.label ?? user.role}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleRoleChange('standard_user')}
                    disabled={user.role === 'standard_user'}
                  >
                    Set as User
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRoleChange('speaker')}
                    disabled={user.role === 'speaker'}
                  >
                    Set as Speaker
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex gap-2 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors border-b-2',
                activeTab === 'profile'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <UserIcon className="w-4 h-4 inline-block mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors border-b-2',
                activeTab === 'posts'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <FileText className="w-4 h-4 inline-block mr-2" />
              Posts {postsData && `(${postsData.total})`}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors border-b-2',
                activeTab === 'activity'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Activity className="w-4 h-4 inline-block mr-2" />
              Activity {activityData && `(${activityData.total})`}
            </button>
          </div>

          {activeTab === 'profile' && (
            <div>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Joined {joinDate}</span>
            </div>
            {user.position && (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{user.position}</span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-foreground mb-3">Connection Statistics</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-muted/40 border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-500 mb-1">
                  {user.totalConnections ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Connections</div>
              </div>
              <div className="bg-muted/40 border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-500 mb-1">
                  {user.pendingSentCount ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">Pending Sent</div>
              </div>
              <div className="bg-muted/40 border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {user.pendingReceivedCount ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">Pending Received</div>
              </div>
            </div>
          </div>

          {user.shortDescription && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-foreground mb-2">About</h3>
              <p className="text-muted-foreground">{user.shortDescription}</p>
            </div>
          )}

          {user.interests.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-foreground mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <Badge key={interest.id} variant="secondary">
                    {interest.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {user.contactInfo && Object.keys(user.contactInfo).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Contact Information</h3>
              <div className="grid gap-2">
                {Object.entries(user.contactInfo).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground capitalize">{key}:</span>
                    <span className="text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
            </div>
          )}

          {activeTab === 'posts' && (
            <div>
              {postsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : postsData && postsData.posts.length > 0 ? (
                <>
                  <div className="space-y-4 mb-6">
                    {postsData.posts.map((post) => (
                      <PostCard key={post.id} post={post} onImageClick={openLightbox} />
                    ))}
                  </div>
                  <PaginationControls
                    currentPage={postsPage}
                    totalItems={postsData.total}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setPostsPage}
                  />
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No posts found
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              {activityLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : activityData && activityData.activities.length > 0 ? (
                <>
                  <div className="space-y-3 mb-6">
                    {activityData.activities.map((activity, index) => (
                      <ActivityItem key={`${activity.entityId}-${index}`} activity={activity} onImageClick={openLightbox} />
                    ))}
                  </div>
                  <PaginationControls
                    currentPage={activityPage}
                    totalItems={activityData.total}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setActivityPage}
                  />
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No activity found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}

function PostCard({ post, onImageClick }: { post: Post; onImageClick: (images: string[], index: number) => void }) {
  const isDeleted = post.deletedAt !== null;
  const createdDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleImageClick = (index: number) => {
    const fullUrls = post.imageUrls.map(url => getFullStorageUrl(url)).filter(Boolean) as string[];
    onImageClick(fullUrls, index);
  };

  return (
    <Card className={cn('p-4', isDeleted && 'opacity-60 border-destructive/30')}>
      <div className="flex items-start gap-3 mb-3">
        <Avatar
          src={getFullStorageUrl(post.author.avatarUrl)}
          firstName={post.author.firstName}
          lastName={post.author.lastName}
          seed={post.author.id}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground text-sm">
              {post.author.firstName} {post.author.lastName}
            </span>
            {isDeleted && (
              <Badge variant="destructive" className="text-xs">
                <Trash2 className="w-3 h-3 mr-1" />
                Deleted
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{createdDate}</p>
        </div>
      </div>

      <p className="text-foreground mb-3 whitespace-pre-wrap">{post.text}</p>

      {post.imageUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {post.imageUrls.slice(0, 4).map((url, index) => {
            const fullUrl = getFullStorageUrl(url);
            return (
              <button
                key={index}
                onClick={() => handleImageClick(index)}
                className="relative aspect-video bg-muted rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity cursor-pointer"
              >
                {fullUrl && (
                  <img
                    src={fullUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
                {post.imageUrls.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-medium">+{post.imageUrls.length - 4}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          <span>{post.likeCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          <span>{post.commentCount}</span>
        </div>
        {post.imageUrls.length > 0 && (
          <div className="flex items-center gap-1">
            <ImageIcon className="w-4 h-4" />
            <span>{post.imageUrls.length}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

function ActivityItem({ activity, onImageClick }: { activity: UserActivityType; onImageClick: (images: string[], index: number) => void }) {
  const activityDate = new Date(activity.activityAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const activityConfig = {
    post_created: {
      icon: FileText,
      label: 'Created a post',
      color: 'text-emerald-500',
    },
    post_deleted: {
      icon: Trash2,
      label: 'Deleted a post',
      color: 'text-destructive',
    },
    liked: {
      icon: Heart,
      label: 'Liked a post',
      color: 'text-pink-500',
    },
    commented: {
      icon: MessageSquare,
      label: 'Commented on a post',
      color: 'text-blue-400',
    },
  };

  const config = activityConfig[activity.activityType];
  const Icon = config.icon;

  const hasImages = activity.imageUrls && activity.imageUrls.length > 0;
  const shouldShowImages = (activity.activityType === 'post_created' || activity.activityType === 'post_deleted') && hasImages;

  const handleImageClick = (index: number) => {
    if (activity.imageUrls) {
      const fullUrls = activity.imageUrls.map(url => getFullStorageUrl(url)).filter(Boolean) as string[];
      onImageClick(fullUrls, index);
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-muted/40 border border-border rounded-lg">
      <div className={cn('p-2 rounded-lg bg-card', config.color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground mb-1">{config.label}</p>
        {activity.contentPreview && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {activity.contentPreview}
          </p>
        )}
        {shouldShowImages && (
          <div className="flex gap-2 mb-2">
            {activity.imageUrls!.slice(0, 3).map((url, index) => {
              const fullUrl = getFullStorageUrl(url);
              return fullUrl ? (
                <button
                  key={index}
                  onClick={() => handleImageClick(index)}
                  className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <img
                    src={fullUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {activity.imageUrls!.length > 3 && index === 2 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">+{activity.imageUrls!.length - 3}</span>
                    </div>
                  )}
                </button>
              ) : null;
            })}
          </div>
        )}
        <p className="text-xs text-muted-foreground">{activityDate}</p>
      </div>
    </div>
  );
}

function PaginationControls({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border pt-4">
      <div className="text-sm text-muted-foreground">
        Showing {startItem}-{endItem} of {totalItems}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i;
            } else if (currentPage < 3) {
              pageNum = i;
            } else if (currentPage > totalPages - 4) {
              pageNum = totalPages - 5 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="w-9 h-9 p-0"
              >
                {pageNum + 1}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const handlePrevious = () => {
    onNavigate(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    onNavigate(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentIndex, images.length]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg bg-background/10 hover:bg-background/20 text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 p-2 rounded-lg bg-background/10 hover:bg-background/20 text-white transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 p-2 rounded-lg bg-background/10 hover:bg-background/20 text-white transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div
        className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt=""
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-background/20 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

