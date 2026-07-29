import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Post, Profile } from '@/lib/types';
import { StatusBar } from '@/components/StatusBar';
import { BottomNav } from '@/components/BottomNav';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, MapPin, Send as ShareIcon, Plus, X } from 'lucide-react';
import { timeAgo, initials } from '@/lib/utils';

export function FeedPage() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<(Post & { profiles?: Profile })[]>([]);
  const [tab, setTab] = useState<'Following' | 'For you' | 'Favorites'>('For you');
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [content, setContent] = useState('');

  const loadPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles!posts_user_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(30);
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  const submitPost = async () => {
    if (!user || !content.trim()) return;
    const { data } = await supabase
      .from('posts')
      .insert({ user_id: user.id, content: content.trim() })
      .select('*, profiles!posts_user_id_fkey(*)')
      .single();
    if (data) {
      setPosts(p => [data, ...p]);
      setContent('');
      setComposing(false);
    }
  };

  // Seed posts matching the mockup if feed is empty
  const mockPosts = [
    {
      id: 'm1',
      user_id: 'mock',
      content: "Flowers looking better than ever, our volunteers did a great job!",
      image_url: 'https://images.pexels.com/photos/28895471/pexels-photo-28895471.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      location: 'Community Garden',
      likes_count: 21,
      comments_count: 4,
      created_at: new Date(Date.now() - 3 * 60000).toISOString(),
      profiles: { id: 'm1', username: 'helena', display_name: 'Helena', avatar_url: null, bio: null, total_hours: 0, created_at: '' } as Profile,
    },
    {
      id: 'm2',
      user_id: 'mock2',
      content: "I volunteered for this location not to long ago, safe to say I recommend!",
      image_url: null,
      location: 'Hope Shelter',
      likes_count: 6,
      comments_count: 18,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      profiles: { id: 'm2', username: 'daniel', display_name: 'Daniel', avatar_url: null, bio: null, total_hours: 0, created_at: '' } as Profile,
    },
  ] as unknown as (Post & { profiles?: Profile })[];

  const display = posts.length > 0 ? posts : mockPosts;

  return (
    <div className="min-h-screen bg-white pb-24">
      <StatusBar />

      {/* Tabs */}
      <div className="px-5 pt-2 flex gap-6">
        {(['Following', 'For you', 'Favorites'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm font-semibold pb-2 transition-colors ${
              tab === t ? 'text-black border-b-2 border-black' : 'text-gray-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="mt-2">
        {display.map(p => <FeedPost key={p.id} post={p} actor={p.profiles} />)}
        {display.length === 0 && !loading && (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-semibold text-gray-600">No posts yet</p>
          </div>
        )}
      </div>

      {/* Compose FAB */}
      <button
        onClick={() => setComposing(true)}
        className="fixed right-5 bottom-24 z-30 h-12 w-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {composing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setComposing(false)}>
          <div className="w-full bg-white rounded-t-2xl p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-black">New Post</h2>
              <button onClick={() => setComposing(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-black">
                {initials(profile?.display_name ?? null)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-black">{profile?.display_name || 'You'}</p>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Share your volunteering experience..."
                  rows={4}
                  className="mt-2 w-full resize-none border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-gray-400"
                />
                <button
                  onClick={submitPost}
                  disabled={!content.trim()}
                  className="mt-3 bg-black text-white rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function FeedPost({ post, actor }: { post: Post; actor?: Profile }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count);

  const toggleLike = async () => {
    if (!user || post.user_id === 'mock' || post.user_id === 'mock2') {
      setLiked(l => !l);
      setLikeCount(c => liked ? c - 1 : c + 1);
      return;
    }
    if (liked) {
      setLiked(false); setLikeCount(c => c - 1);
      await supabase.from('post_likes').delete().eq('user_id', user.id).eq('post_id', post.id);
    } else {
      setLiked(true); setLikeCount(c => c + 1);
      await supabase.from('post_likes').insert({ user_id: user.id, post_id: post.id });
    }
  };

  const name = actor?.display_name || 'Anonymous';
  const group = 'volunteers';

  return (
    <div className="border-b border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4">
        <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-black">
          {initials(name)}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-black">
            {name} <span className="font-normal text-gray-400">in {group}</span>
          </p>
          <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
        </div>
        <MoreHorizontal size={18} className="text-gray-400" />
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="mt-3 w-full bg-gray-100">
          <img src={post.image_url} alt="" className="w-full max-h-[400px] object-cover" />
        </div>
      )}

      {/* Caption */}
      {post.content && (
        <p className="px-5 pt-3 text-sm text-black leading-relaxed">{post.content}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 px-5 py-3">
        <button onClick={toggleLike} className="flex items-center gap-1.5">
          <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : 'text-black'} />
          <span className="text-sm font-medium text-black">{likeCount}</span>
        </button>
        <button className="flex items-center gap-1.5">
          <MessageCircle size={20} className="text-black" />
          <span className="text-sm font-medium text-black">{post.comments_count}</span>
        </button>
        <button className="flex items-center gap-1.5">
          <ShareIcon size={18} className="text-black" />
        </button>
        <button className="ml-auto">
          <Bookmark size={18} className="text-black" />
        </button>
      </div>
    </div>
  );
}
