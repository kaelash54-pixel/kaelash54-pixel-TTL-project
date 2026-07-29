import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { ActivityNotification, Profile } from '@/lib/types';
import { StatusBar } from '@/components/StatusBar';
import { BottomNav } from '@/components/BottomNav';
import { timeAgo, initials } from '@/lib/utils';

export function ActivityPage() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<(ActivityNotification & { actor?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('activity_notifications')
        .select('*, actor:profiles!activity_notifications_actor_id_fkey(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(40);
      setNotifs(data || []);
      setLoading(false);
      await supabase.from('activity_notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    })();
  }, [user]);

  // Mock data matching the design when empty
  const mockNotifs: (ActivityNotification & { actor?: Profile })[] = [
    { id: '1', user_id: '', actor_id: '', type: 'follow', post_id: null, content_preview: null, is_read: false, image_url: null, created_at: new Date(Date.now() - 86400000).toISOString(), actor: { id: '1', username: 'starryskies23', display_name: 'starryskies23', avatar_url: null, bio: null, total_hours: 0, created_at: '' } },
    { id: '2', user_id: '', actor_id: '', type: 'like', post_id: 'p1', content_preview: null, is_read: false, image_url: 'https://images.pexels.com/photos/28895471/pexels-photo-28895471.jpeg?auto=compress&cs=tinysrgb&h=120&w=120', created_at: new Date(Date.now() - 86400000).toISOString(), actor: { id: '2', username: 'nebulanomad', display_name: 'nebulanomad', avatar_url: null, bio: null, total_hours: 0, created_at: '' } },
    { id: '3', user_id: '', actor_id: '', type: 'like', post_id: 'p2', content_preview: 'I love this volunteering...', is_read: true, image_url: null, created_at: new Date(Date.now() - 2 * 86400000).toISOString(), actor: { id: '3', username: 'emberecho', display_name: 'emberecho', avatar_url: null, bio: null, total_hours: 0, created_at: '' } },
    { id: '4', user_id: '', actor_id: '', type: 'comment', post_id: 'p3', content_preview: 'I volunteered over here, I definitely recommend!', is_read: true, image_url: 'https://images.pexels.com/photos/9532298/pexels-photo-9532298.jpeg?auto=compress&cs=tinysrgb&h=120&w=120', created_at: new Date(Date.now() - 4 * 86400000).toISOString(), actor: { id: '4', username: 'shadowlynx', display_name: 'shadowlynx', avatar_url: null, bio: null, total_hours: 0, created_at: '' } },
    { id: '5', user_id: '', actor_id: '', type: 'share', post_id: 'p4', content_preview: null, is_read: true, image_url: 'https://images.pexels.com/photos/6591154/pexels-photo-6591154.jpeg?auto=compress&cs=tinysrgb&h=120&w=120', created_at: new Date(Date.now() - 5 * 86400000).toISOString(), actor: { id: '5', username: 'nebulanomad', display_name: 'nebulanomad', avatar_url: null, bio: null, total_hours: 0, created_at: '' } },
    { id: '6', user_id: '', actor_id: '', type: 'like', post_id: 'p5', content_preview: 'I love this volunteer pr...', is_read: true, image_url: null, created_at: new Date(Date.now() - 5 * 86400000).toISOString(), actor: { id: '6', username: 'lunavoyager', display_name: 'lunavoyager', avatar_url: null, bio: null, total_hours: 0, created_at: '' } },
  ];

  const display = notifs.length > 0 ? notifs : mockNotifs;

  const labelFor = (type: string) => {
    switch (type) {
      case 'like': return 'Liked your post';
      case 'comment': return 'Commented on your post';
      case 'follow': return 'Started following you';
      case 'save': return 'Saved your post';
      case 'share': return 'Shared a post you might like';
      default: return 'Liked your comment';
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <StatusBar />

      <div className="px-5 pt-2">
        <h1 className="text-2xl font-bold text-black">Activity</h1>

        {/* Pill filter */}
        <div className="mt-3">
          <span className="inline-block bg-gray-100 rounded-full px-3.5 py-1.5 text-xs font-medium text-gray-600">
            Likes, shares, saves, followers, comments.
          </span>
        </div>
      </div>

      {/* List */}
      <div className="mt-4">
        {display.map(n => {
          const name = n.actor?.display_name || n.actor?.username || 'Someone';
          const isFollow = n.type === 'follow';
          return (
            <div key={n.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
              {/* Avatar or thumbnail */}
              {n.image_url ? (
                <div className="h-11 w-11 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <img src={n.image_url} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-11 w-11 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-black relative">
                  {initials(name)}
                  {!n.is_read && <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-blue-500 border border-white" />}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm text-black">
                  <span className="font-semibold">{name}</span>{' '}
                  <span className="text-gray-500">{labelFor(n.type)}</span>
                </p>
                {n.content_preview && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">"{n.content_preview}"</p>
                )}
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[11px] text-gray-400">{timeAgo(n.created_at)}</p>
                {isFollow && (
                  <button className="mt-1 text-[11px] font-semibold text-black border border-black rounded-full px-3 py-1">
                    Follow
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav hasNotification />
    </div>
  );
}
