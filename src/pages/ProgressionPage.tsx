import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { VolunteerSession } from '@/lib/types';
import { StatusBar } from '@/components/StatusBar';
import { BottomNav } from '@/components/BottomNav';
import { navigate } from '@/lib/nav';
import { Menu, ChevronRight, LogOut, LogIn } from 'lucide-react';

export function ProgressionPage() {
  const { user, profile, signOut } = useAuth();
  const [sessions, setSessions] = useState<VolunteerSession[]>([]);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from('volunteer_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      setSessions(data || []);
    })();
  }, [user]);

  // Group sessions by week
  const weekMap = new Map<string, number>();
  sessions.forEach(s => {
    const ws = s.week_start || s.date;
    weekMap.set(ws, (weekMap.get(ws) || 0) + Number(s.hours));
  });
  const weeks = Array.from(weekMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 4);

  // Areas volunteered (unique organizations)
  const areas = Array.from(new Set(sessions.map(s => s.organization).filter(Boolean))) as string[];

  function fmtWeekRange(start: string): string {
    const d = new Date(start + 'T00:00:00');
    const end = new Date(d);
    end.setDate(d.getDate() + 7);
    const fmt = (x: Date) => `${x.toLocaleString('en-US', { month: 'short' })} ${x.getDate()}`;
    return `${fmt(d)} - ${fmt(end)}`;
  }

  const initials = (profile?.display_name || (user ? (user.email?.[0] ?? 'G') : 'G')).split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-white pb-24">
      <StatusBar />

      {/* Header */}
      <div className="px-5 pt-2 pb-3 flex items-center justify-between">
        <button className="text-black"><Menu size={24} /></button>
        <h1 className="text-base font-bold text-black">Your Progress</h1>
        <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-black">
          {initials}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5">
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <button
              key={i}
              onClick={() => setTab(i)}
              className={`flex-1 text-center text-sm font-medium py-2.5 rounded-lg ${
                tab === i ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              Tab
            </button>
          ))}
        </div>
      </div>

      {/* Weekly stats cards */}
      <div className="mt-5 px-5">
        <h2 className="text-sm font-bold text-black mb-3">Weekly Hours</h2>
        <div className="space-y-3">
          {weeks.length === 0 && (
            <>
              <WeekCard range="This week" hours={0} />
              <WeekCard range="Last week" hours={0} />
            </>
          )}
          {weeks.map(([start, hours]) => (
            <WeekCard key={start} range={fmtWeekRange(start)} hours={hours} />
          ))}
        </div>
      </div>

      {/* Areas you've volunteered */}
      <div className="mt-6 px-5">
        <h2 className="text-sm font-bold text-black mb-3">Areas You've Volunteered</h2>
        <div className="border border-gray-200 rounded-2xl divide-y divide-gray-100">
          {areas.length === 0 ? (
            ['Food Shelter', 'Library', 'Church', 'Temple', 'Homeless Shelter'].map((a, i) => (
              <AreaRow key={i} name={a} email="xyz@gmail.com" />
            ))
          ) : (
            areas.map((a, i) => <AreaRow key={i} name={a} email="xyz@gmail.com" />)
          )}
        </div>
      </div>

      {/* Auth section */}
      <div className="mt-6 px-5">
        {user ? (
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-2xl py-3.5 text-sm font-semibold text-black active:scale-[0.99] transition-transform"
          >
            <LogOut size={18} /> Sign Out
          </button>
        ) : (
          <button
            onClick={() => navigate('signin')}
            className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-2xl py-3.5 text-sm font-semibold active:scale-[0.99] transition-transform"
          >
            <LogIn size={18} /> Sign In to Track Your Hours
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function WeekCard({ range, hours }: { range: string; hours: number }) {
  return (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5">
      <div>
        <p className="text-xs text-gray-400">Week</p>
        <p className="text-sm font-semibold text-black">{range}</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-black">{hours}</p>
        <p className="text-[11px] text-gray-400 -mt-0.5">Hours</p>
      </div>
    </div>
  );
}

function AreaRow({ name, email }: { name: string; email: string }) {
  const icons: Record<string, string> = {
    'Food Shelter': 'F',
    'Food Bank': 'F',
    'Library': 'L',
    'Church': 'C',
    'Temple': 'T',
    'Homeless Shelter': 'H',
  };
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-black">
        {icons[name] || name[0]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-black">{name}</p>
        <p className="text-xs text-gray-400">{email}</p>
      </div>
      <ChevronRight size={18} className="text-gray-300" />
    </div>
  );
}
