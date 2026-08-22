import { useState } from 'react';
import { Heart, MessageSquare, Star, Trash2, MapPin, Send, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToggleLike, useAddComment, useDeleteComment, useDeleteCommunityPost } from '../../hooks/useCommunity';
import { Badge } from '../ui/badge';
import { Button } from '../ui/Button';

export function PostCard({ post }) {
  const { user } = useAuth();
  const toggleLike = useToggleLike();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const deletePost = useDeleteCommunityPost();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const isMyPost = user && post.user && user.id === post.user.id;

  async function handleLike() {
    if (!user) return;
    try {
      await toggleLike.mutateAsync(post.id);
    } catch {
      // ignore error
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment.mutateAsync({ postId: post.id, content: commentText.trim() });
      setCommentText('');
    } catch {
      // ignore
    }
  }

  async function handleDeletePost() {
    if (!window.confirm('Are you sure you want to delete this community review?')) return;
    try {
      await deletePost.mutateAsync(post.id);
    } catch {
      // ignore
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300 space-y-4">
      {/* Header with User Info & Rating */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 font-extrabold text-sky-700 text-sm border border-sky-200">
            {post.user?.name ? post.user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              {post.user?.name || 'Anonymous Traveler'}
              {post.user?.country && (
                <span className="text-xs font-medium text-slate-400">· {post.user.country}</span>
              )}
            </h4>
            <p className="text-xs text-slate-400 font-medium">{post.createdAt}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Star Rating */}
          <div className="flex items-center gap-0.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200/60">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{post.rating}.0</span>
          </div>

          {(isMyPost || user?.isAdmin) && (
            <button
              type="button"
              onClick={handleDeletePost}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
              title="Delete post"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Post Title & Tags */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">{post.title}</h3>
          {post.city && (
            <Badge variant="sky" className="text-[10px] font-semibold">
              <MapPin className="h-3 w-3 mr-0.5" />
              {post.city.name}, {post.city.country}
            </Badge>
          )}
          {post.trip && (
            <Link to={`/shared/${post.trip.shareSlug || post.trip.id}`}>
              <Badge variant="secondary" className="text-[10px] font-semibold hover:bg-slate-200">
                🗺️ View Itinerary: {post.trip.name}
              </Badge>
            </Link>
          )}
        </div>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{post.content}</p>
      </div>

      {/* Optional Post Image */}
      {post.imageUrl && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 max-h-80">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover max-h-80" />
        </div>
      )}

      {/* Actions: Likes & Comment Toggle */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-slate-600">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition cursor-pointer ${
              post.isLikedByMe
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Heart className={`h-4 w-4 ${post.isLikedByMe ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <MessageSquare className="h-4 w-4 text-sky-600" />
            <span>{post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}</span>
          </button>
        </div>
      </div>

      {/* Comments Drawer / Section */}
      {showComments && (
        <div className="space-y-3 border-t border-slate-100 pt-3">
          {/* Add Comment Input */}
          {user ? (
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment or tip..."
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-sky-500 focus:bg-white"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button type="submit" size="sm" variant="primary" disabled={addComment.isPending}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          ) : (
            <p className="text-xs text-slate-500 italic">Log in to write a comment.</p>
          )}

          {/* Comment List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start justify-between gap-2 rounded-xl bg-slate-50 p-2.5 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900">{comment.user?.name || 'Traveler'}:</span>{' '}
                    <span className="text-slate-700">{comment.content}</span>
                    <span className="block text-[10px] text-slate-400">{comment.createdAt}</span>
                  </div>

                  {(user?.id === comment.user?.id || user?.isAdmin) && (
                    <button
                      type="button"
                      onClick={() => deleteComment.mutate(comment.id)}
                      className="text-slate-400 hover:text-red-600 transition p-0.5"
                      title="Delete comment"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-1">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
