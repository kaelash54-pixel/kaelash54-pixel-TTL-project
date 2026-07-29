import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { VolunteerOpportunity } from '@/lib/types';
import { OpportunityModal } from '@/components/OpportunityModal';
import { StatusBar } from '@/components/StatusBar';
import { BottomNav } from '@/components/BottomNav';
import { Search, Pencil, ChevronDown, MapPin, Clock } from 'lucide-react';

export function MapPage() {
  const [opps, setOpps] = useState<VolunteerOpportunity[]>([]);
  const [selected, setSelected] = useState<VolunteerOpportunity | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'Distance' | 'Date' | 'Duration'>('Distance');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('volunteer_opportunities').select('*');
      setOpps(data || []);
      setLoading(false);
    })();
  }, []);

  const sorted = useMemo(() => {
    const arr = [...opps];
    if (sortBy === 'Distance') arr.sort((a, b) => (a.distance_miles ?? 99) - (b.distance_miles ?? 99));
    if (sortBy === 'Date') arr.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
    if (sortBy === 'Duration') arr.sort((a, b) => (a.duration_hours ?? 0) - (b.duration_hours ?? 0));
    return arr;
  }, [opps, sortBy]);

  // Place labels on the mock map (from the design)
  const labels = [
    { name: 'Homeless Shelter', x: 18, y: 22 },
    { name: 'Clean Up Road', x: 62, y: 16 },
    { name: 'Religious Institution', x: 38, y: 50 },
    { name: 'Food Shelter', x: 72, y: 58 },
    { name: 'Library', x: 20, y: 72 },
    { name: 'Road', x: 58, y: 80 },
  ];

  return (
    <div className="min-h-screen bg-white pb-24">
      <StatusBar />

      {/* Search row with location */}
      <div className="px-5 pt-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              defaultValue="NJ/DMV"
              className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-10 text-sm text-black focus:outline-none"
            />
            <Pencil size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2">
            <button className="flex items-center gap-1 text-xs font-semibold text-black bg-gray-100 rounded-full px-3 py-1.5">
              Filter <ChevronDown size={14} />
            </button>
            <div className="relative">
              <button
                onClick={() => setSortOpen(s => !s)}
                className="flex items-center gap-1 text-xs font-semibold text-black bg-gray-100 rounded-full px-3 py-1.5"
              >
                Sort: {sortBy} <ChevronDown size={14} />
              </button>
              {sortOpen && (
                <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-32">
                  {(['Distance', 'Date', 'Duration'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => { setSortBy(s); setSortOpen(false); }}
                      className={`block w-full text-left px-3 py-2 text-xs ${sortBy === s ? 'text-black font-semibold' : 'text-gray-500'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <span className="text-xs font-medium text-gray-400">{sorted.length} results</span>
        </div>
      </div>

      {/* Mock map */}
      <div className="relative mt-3 mx-5 h-72 rounded-2xl overflow-hidden bg-[#f8f9fa] border border-gray-200">
        {/* Street grid */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Major roads */}
          <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#d1d5db" strokeWidth="3" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#d1d5db" strokeWidth="3" />
          <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#d1d5db" strokeWidth="2" />
        </svg>

        {/* Place labels */}
        {labels.map((l, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${l.x}%`, top: `${l.y}%` }}
          >
            <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <span className="mt-1 text-[10px] font-medium text-black bg-white/80 px-1.5 py-0.5 rounded whitespace-nowrap">
              {l.name}
            </span>
          </div>
        ))}

        {/* You-are-here marker */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-blue-500 ring-4 ring-blue-500/30" />
          </div>
        </div>
      </div>

      {/* Listing cards */}
      <div className="mt-4 space-y-3 px-5">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />)
        ) : (
          sorted.slice(0, 4).map(o => (
            <button
              key={o.id}
              onClick={() => setSelected(o)}
              className="w-full text-left bg-white border border-gray-200 rounded-2xl overflow-hidden active:scale-[0.99] transition-transform"
            >
              <div className="flex">
                <div className="h-32 w-28 shrink-0 bg-gray-100">
                  <img src={o.image_url || ''} alt={o.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 p-3.5">
                  <p className="text-sm font-bold text-black leading-tight">{o.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{o.organization}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={12} /> {o.duration_hours}h · {o.start_time?.slice(0, 5)}PM-{o.end_time?.slice(0, 5)}PM</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={12} /> {o.distance_miles} miles
                  </div>
                  <div className="mt-2.5">
                    <span className="inline-block text-xs font-semibold text-black border border-black rounded-full px-3 py-1">
                      Select
                    </span>
                  </div>
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
