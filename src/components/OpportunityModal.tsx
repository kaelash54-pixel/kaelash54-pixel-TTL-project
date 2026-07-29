import { X, Clock, MapPin, Users, Calendar, Building2, Check } from 'lucide-react';
import { VolunteerOpportunity } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export function OpportunityModal({ opp, onClose }: { opp: VolunteerOpportunity; onClose: () => void }) {
  const { user } = useAuth();
  const [joined, setJoined] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleJoin = async () => {
    if (!user) { setJoined(true); return; }
    setSaving(true);
    const ws = opp.date ? new Date(opp.date + 'T00:00:00') : new Date();
    ws.setDate(ws.getDate() - ws.getDay());
    const { error } = await supabase.from('volunteer_sessions').insert({
      user_id: user.id,
      opportunity_id: opp.id,
      organization: opp.organization,
      date: opp.date,
      hours: opp.duration_hours ?? 2,
      week_start: ws.toISOString().slice(0, 10),
    });
    if (!error) setJoined(true);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
      <div className="w-full max-w-[390px] mx-auto bg-white rounded-t-3xl overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="relative h-48">
          <img src={opp.image_url || ''} alt={opp.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 h-9 w-9 rounded-full bg-white/90 flex items-center justify-center"
          >
            <X size={18} className="text-black" />
          </button>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-sm opacity-90">{opp.organization}</p>
            <h2 className="text-xl font-bold leading-tight">{opp.title}</h2>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {opp.description && <p className="text-sm text-gray-600 leading-relaxed">{opp.description}</p>}

          <div className="grid grid-cols-2 gap-3">
            <InfoTile icon={<Calendar size={16} />} label="Date" value={formatDate(opp.date)} />
            <InfoTile icon={<Clock size={16} />} label="Time" value={`${formatTime(opp.start_time)} - ${formatTime(opp.end_time)}`} />
            <InfoTile icon={<Clock size={16} />} label="Duration" value={`${opp.duration_hours} hours`} />
            <InfoTile icon={<Users size={16} />} label="Spots" value={`${opp.spots_available} left`} />
          </div>

          <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-black" />
            <div>
              <p className="text-xs font-semibold text-black">Location</p>
              <p className="text-sm text-gray-500">{opp.address}{opp.city ? `, ${opp.city}` : ''}</p>
              <p className="text-xs text-gray-400">{opp.distance_miles} miles away</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
            <Building2 size={18} className="mt-0.5 shrink-0 text-black" />
            <div>
              <p className="text-xs font-semibold text-black">Organization</p>
              <p className="text-sm text-gray-500">{opp.organization}</p>
            </div>
          </div>

          <button
            onClick={handleJoin}
            disabled={saving || joined}
            className={`w-full rounded-xl py-3.5 text-sm font-semibold transition-all ${
              joined ? 'bg-gray-100 text-black' : 'bg-black text-white active:scale-[0.98]'
            }`}
          >
            {joined ? (
              <span className="flex items-center justify-center gap-2"><Check size={18} /> Joined! See you there</span>
            ) : saving ? 'Saving...' : `Join & Earn ${opp.duration_hours} Hours`}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-3">
      <div className="mb-1 text-black">{icon}</div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-black">{value}</p>
    </div>
  );
}
