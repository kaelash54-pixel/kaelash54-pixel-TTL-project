import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { navigate } from '@/lib/nav';
import { StatusBar } from '@/components/StatusBar';
import { ArrowLeft, Check, Image as ImageIcon, ChevronDown } from 'lucide-react';

const CATEGORIES = [
  'Food Bank', 'Clean Up', 'Shelter', 'Library',
  'Environment', 'Elder Care', 'Animals', 'Education', 'Religious',
];

const PRESET_IMAGES: Record<string, string> = {
  'Food Bank': 'https://images.pexels.com/photos/6591154/pexels-photo-6591154.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Clean Up': 'https://images.pexels.com/photos/798638/pexels-photo-798638.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Shelter': 'https://images.pexels.com/photos/9532298/pexels-photo-9532298.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Library': 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Environment': 'https://images.pexels.com/photos/1105019/pexels-photo-1105019.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Elder Care': 'https://images.pexels.com/photos/7282818/pexels-photo-7282818.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Animals': 'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Education': 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Religious': 'https://images.pexels.com/photos/3030632/pexels-photo-3030632.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

export function CreateOpportunityPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [spots, setSpots] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const durationHours = (() => {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) diff += 24 * 60;
    return Math.round((diff / 60) * 10) / 10;
  })();

  const canSubmit = title.trim() && organization.trim() && date && startTime && endTime && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError('');
    setSubmitting(true);

    const img = imageUrl || PRESET_IMAGES[category] || '';
    const payload = {
      title: title.trim(),
      organization: organization.trim(),
      description: description.trim() || null,
      category,
      address: address.trim() || null,
      city: city.trim() || null,
      date,
      start_time: startTime,
      end_time: endTime,
      duration_hours: durationHours || 2,
      spots_available: parseInt(spots) || 10,
      image_url: img,
      distance_miles: Math.round(Math.random() * 40) / 10,
      created_by: user?.id || null,
    };

    const { error: err } = await supabase.from('volunteer_opportunities').insert(payload);

    if (err) {
      setError(err.message);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <StatusBar />
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="h-16 w-16 rounded-full bg-black flex items-center justify-center mb-4">
            <Check size={32} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-black">Opportunity Posted!</h2>
          <p className="mt-2 text-sm text-gray-500 text-center max-w-[260px]">
            Your volunteer opportunity is now live for others to discover and join.
          </p>
          <button
            onClick={() => navigate('home')}
            className="mt-6 bg-black text-white rounded-lg px-6 py-3 text-sm font-semibold"
          >
            Back to Home
          </button>
          <button
            onClick={() => {
              setSuccess(false);
              setTitle(''); setOrganization(''); setDescription(''); setAddress('');
              setCity(''); setDate(''); setStartTime(''); setEndTime(''); setSpots('10');
              setImageUrl('');
            }}
            className="mt-3 text-sm text-gray-400 underline"
          >
            Post another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      <StatusBar />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-2 pb-3">
        <button onClick={() => navigate('home')}>
          <ArrowLeft size={22} className="text-black" />
        </button>
        <h1 className="text-base font-bold text-black">Post an Opportunity</h1>
      </div>

      <div className="px-5 space-y-5">
        <p className="text-xs text-gray-400 -mt-2">
          Share a volunteer opportunity for others in your community to join.
        </p>

        {/* Image preview */}
        <div className="relative h-36 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
          <img
            src={imageUrl || PRESET_IMAGES[category]}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
          <label className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 rounded-full px-3 py-1.5 text-xs font-semibold text-black cursor-pointer">
            <ImageIcon size={14} /> Photo URL
            <input
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="Paste image URL"
              className="hidden"
            />
          </label>
        </div>
        {imageUrl && (
          <input
            type="text"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
          />
        )}

        {/* Title */}
        <Field label="Title">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Help the Homeless Shelter"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
          />
        </Field>

        {/* Organization */}
        <Field label="Organization">
          <input
            value={organization}
            onChange={e => setOrganization(e.target.value)}
            placeholder="e.g. Hope Shelter"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
          />
        </Field>

        {/* Category */}
        <Field label="Category">
          <button
            onClick={() => setCategoryOpen(o => !o)}
            className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 text-sm text-black focus:outline-none"
          >
            {category}
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          {categoryOpen && (
            <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); setCategoryOpen(false); }}
                  className={`block w-full text-left px-4 py-2.5 text-sm ${c === category ? 'bg-gray-100 font-semibold text-black' : 'text-gray-600'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe what volunteers will be doing..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400 resize-none"
          />
        </Field>

        {/* Location */}
        <Field label="Address">
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="123 Main St"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
          />
        </Field>
        <Field label="City / Area">
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="NJ/DMV"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
          />
        </Field>

        {/* Date */}
        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-black focus:outline-none focus:border-gray-400"
          />
        </Field>

        {/* Time range */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Time">
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-black focus:outline-none focus:border-gray-400"
            />
          </Field>
          <Field label="End Time">
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-black focus:outline-none focus:border-gray-400"
            />
          </Field>
        </div>

        {durationHours > 0 && (
          <p className="text-xs text-gray-400 -mt-2">
            Duration: {durationHours} hour{durationHours !== 1 ? 's' : ''}
          </p>
        )}

        {/* Spots */}
        <Field label="Spots Available">
          <input
            type="number"
            min="1"
            value={spots}
            onChange={e => setSpots(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-black focus:outline-none focus:border-gray-400"
          />
        </Field>

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>
        )}
      </div>

      {/* Submit button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-100 px-5 py-4 pb-6">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-black text-white rounded-lg py-3.5 text-sm font-semibold disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {submitting ? 'Posting...' : 'Post Opportunity'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
