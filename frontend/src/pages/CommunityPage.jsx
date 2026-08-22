import { useState } from 'react';
import { MessageSquare, Plus, Sparkles, Star, TrendingUp, Flame } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { PostCard } from '../components/community/PostCard';
import { CreatePostModal } from '../components/community/CreatePostModal';
import { useCommunityPosts } from '../hooks/useCommunity';
import { useAuth } from '../context/AuthContext';

export default function CommunityPage() {
  const { user } = useAuth();
  const [sort, setSort] = useState('recent');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const postsQuery = useCommunityPosts({ sort });
  const posts = postsQuery.data?.posts || [];

  return (
    <AppLayout>
      <PageHeader
        title="Travelers Community Hub"
        description="Read authentic trip reviews, secret destination tips, and join discussions with global travelers."
        actions={
          user ? (
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>Share Trip Review</span>
            </Button>
          ) : null
        }
      />

      {/* Community Filter & Sort Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sort Reviews:</span>
        </div>

        <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-2xs">
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              sort === 'recent' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setSort('recent')}
          >
            <span>Latest</span>
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              sort === 'popular' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setSort('popular')}
          >
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span>Popular</span>
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              sort === 'rating' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setSort('rating')}
          >
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
            <span>Top Rated</span>
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      {postsQuery.isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No community reviews yet"
          description="Be the first traveler to share your trip review and recommendations!"
          action={
            user ? (
              <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                Share First Review
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <CreatePostModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </AppLayout>
  );
}
