import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { navigate } from '@/lib/nav';
import { VolunteerOpportunity } from '@/lib/types';
import { OpportunityModal } from '@/components/OpportunityModal';
import { StatusBar } from '@/components/StatusBar';
import { BottomNav } from '@/components/BottomNav';
import { Search, ChevronRight, Clock, MapPin } from 'lucide-react';

export function HomePage() {
  const { user } = useAuth();
  const [opps, setOpps] = useState<VolunteerOpportunity[]>([]);
  const [selected, setSelected] = useState<VolunteerOpportunity | null>(null);
  const [tab, setTab] = useState<'Favorites' | 'History' | 'Following'>('Favorites');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('volunteer_opportunities').select('*').order('date', { ascending: true });
      setOpps(data || []);
      setLoading(false);
    })();
  }, []);

  const categories = [
    { name: 'Food Bank', img: 'https://images.pexels.com/photos/6591154/pexels-photo-6591154.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
    { name: 'Adopt-A-Road', img: 'https://images.pexels.com/photos/38682984/pexels-photo-38682984.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
    { name: 'Homeless Shelter', img: 'https://images.pexels.com/photos/9532298/pexels-photo-9532298.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
    { name: 'Clean Up', img: 'https://images.pexels.com/photos/798638/pexels-photo-798638.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
    { name: 'Library', img: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  ];

  const filtered = search
    ? opps.filter(o => o.title.toLowerCase().includes(search.toLowerCase()) || o.organization.toLowerCase().includes(search.toLowerCase()))
    : opps;

  return (
    <div className="min-h-screen bg-white pb-24">
      <StatusBar />

      <div className="px-5 pt-2">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search For Volunteer Opportunities"
            className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm text-black placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        <div className="mt-4 flex gap-6">
          {(['Favorites', 'History', 'Following'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm font-semibold pb-1.5 transition-colors ${
                tab === t ? 'text-black border-b-2 border-black' : 'text-gray-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Featured banner */}
      <div className="mt-4 px-5">
        <div className="relative h-40 rounded-2xl overflow-hidden">
          <img
            src="https://images.pexels.com/photos/9532298/pexels-photo-9532298.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Help the Homeless Shelter"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-white font-bold text-lg leading-tight">Help the Homeless Shelter Today!</h2>
            <button onClick={() => navigate('map')} className="mt-2 text-xs text-white/90 font-medium underline">
              Find opportunities near you
            </button>
          </div>
        </div>
      </div>

      {/* Category cards */}
      <div className="mt-6 px-5">
        <h3 className="text-base font-bold text-black mb-3">Here are the Volunteer Opportunities For This Week:</h3>
        <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2">
          {categories.map(c => (
            <button
              key={c.name}
              onClick={() => navigate('map')}
              className="shrink-0 w-32 text-left"
            >
              <div className="h-32 w-32 rounded-2xl overflow-hidden bg-gray-100">
                <img src={c.img} alt={c.name} className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 text-xs font-semibold text-black">{c.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Title row */}
      <div className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-black">Title</h3>
          <button onClick={() => navigate('map')} className="text-gray-400">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Post opportunity CTA */}
      <div className="mt-4 px-5">
        <button
          onClick={() => navigate('create')}
          className="w-full flex items-center justify-between bg-black text-white rounded-2xl px-5 py-4 active:scale-[0.99] transition-transform"
        >
          <div className="text-left">
            <p className="text-sm font-bold">Post an Opportunity</p>
            <p className="text-xs text-white/60">Share a volunteer role for others to join</p>
          </div>
          <ChevronRight size={20} className="text-white/60" />
        </button>
      </div>

      {/* Community feed link */}
      <div className="mt-3 px-5">
        <button
          onClick={() => navigate('feed')}
          className="w-full flex items-center justify-between border border-gray-200 rounded-2xl px-5 py-4 active:scale-[0.99] transition-transform"
        >
          <div className="text-left">
            <p className="text-sm font-bold text-black">Community Feed</p>
            <p className="text-xs text-gray-400">See what other volunteers are sharing</p>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </button>
      </div>

      {/* Opportunity cards */}
      <div className="mt-3 space-y-3 px-5">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-44 animate-pulse rounded-2xl bg-gray-100" />)
        ) : (
          filtered.slice(0, 5).map(o => (
            <button
              key={o.id}
              onClick={() => setSelected(o)}
              className="w-full text-left bg-white border border-gray-200 rounded-2xl overflow-hidden active:scale-[0.99] transition-transform"
            >
              <div className="h-44 bg-gray-100">
                <img src={o.image_url || ''} alt={o.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-black truncate">{o.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{o.organization}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-black bg-gray-100 rounded-full px-2.5 py-1">
                    {o.duration_hours}h
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock size={12} /> {o.start_time?.slice(0, 5)} - {o.end_time?.slice(0, 5)}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {o.distance_miles} mi</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <BottomNav />
      {selected && <OpportunityModal opp={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
