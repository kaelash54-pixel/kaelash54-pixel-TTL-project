import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { navigate } from '@/lib/nav';
import { StatusBar } from '@/components/StatusBar';

export function SignInPage() {
  const { session, user, profile, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (step === 'email') { setStep('password'); return; }
    setLoading(true);
    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.user) {
        const name = email.split('@')[0];
        await supabase.from('profiles').upsert({ id: data.user.id, display_name: name, username: name });
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
    }
    setLoading(false);
    navigate('home');
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StatusBar />
      {session && (
        <div className="mx-5 mt-2 flex items-center justify-between rounded-xl bg-gray-100 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-400">Signed in as</p>
            <p className="truncate text-sm font-semibold text-black">{profile?.display_name || user?.email}</p>
          </div>
          <button
            onClick={async () => { await signOut(); setMode('signin'); setStep('email'); setError(''); setEmail(''); setPassword(''); }}
            className="shrink-0 text-xs font-semibold text-black border border-black rounded-full px-3 py-1.5"
          >
            Sign Out
          </button>
        </div>
      )}
      <div className="flex flex-1 flex-col items-center px-8 pt-14">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold text-black tracking-tight">Volunteer Exchange</h1>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-[240px]">
            I agree to follow the code of conduct and have common sense while volunteering.
          </p>
        </div>

        <form onSubmit={handleContinue} className="w-full max-w-[320px]">
          <div className="mb-6 text-center">
            <h2 className="text-base font-semibold text-black">
              {step === 'email' ? 'Create an account' : mode === 'signup' ? 'Set a password' : 'Welcome back'}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {step === 'email'
                ? 'Enter your email to sign up for this app'
                : mode === 'signup'
                  ? 'Choose a password (min 6 characters)'
                  : 'Enter your password to sign in'}
            </p>
          </div>

          {step === 'email' ? (
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@domain.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400 mb-4"
            />
          ) : (
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400 mb-4"
            />
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-3.5 text-sm font-semibold tracking-wide disabled:opacity-60 active:scale-[0.98] transition-transform"
          >
            {loading ? 'Please wait...' : 'Continue'}
          </button>
        </form>

        <div className="mt-6 w-full max-w-[320px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-3 text-sm font-medium text-black mb-3 hover:bg-gray-50 transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>
          <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-3 text-sm font-medium text-black hover:bg-gray-50 transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="black">
              <path d="M14.045 9.539c-.023-2.6 2.123-3.863 2.221-3.924-1.213-1.773-3.096-2.015-3.762-2.038-1.6-.162-3.131.947-3.944.947-.814 0-2.064-.926-3.396-.9C3.418 3.65 1.701 4.65.827 6.24-.97 9.48.272 14.28 2.016 16.894c.86 1.28 1.879 2.71 3.214 2.66 1.297-.052 1.784-.838 3.352-.838 1.553 0 2 .838 3.368.81 1.393-.023 2.27-1.295 3.122-2.58a12.74 12.74 0 0 0 1.42-2.985c-.033-.013-2.72-1.04-2.747-4.122zM11.506 2.382c.712-.867 1.192-2.063 1.062-3.264-1.025.043-2.27.685-3.007 1.535C8.9 1.48 8.374 2.7 8.525 3.87c1.145.09 2.318-.581 2.981-1.488z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        <p className="mt-8 text-center text-[11px] text-gray-400 leading-relaxed max-w-[260px]">
          By clicking continue, you agree to our{' '}
          <button onClick={() => setMode(m => m === 'signup' ? 'signin' : 'signup')} className="underline text-black">
            Terms of Service
          </button>{' '}
          and{' '}
          <span className="underline cursor-pointer">Privacy Policy</span>
        </p>
        <p className="mt-3 text-xs text-gray-400">
          Already have an account?{' '}
          <button onClick={() => { setMode('signin'); setStep('email'); setError(''); }} className="text-black underline font-medium">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
