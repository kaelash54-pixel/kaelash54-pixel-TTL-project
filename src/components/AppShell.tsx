import { useAuth } from '@/context/AuthContext';
import { useNav } from '@/lib/nav';
import { BottomNav } from '@/components/BottomNav';
import { HomePage } from '@/pages/HomePage';
import { MapPage } from '@/pages/MapPage';
import { ProgressionPage } from '@/pages/ProgressionPage';
import { SignInPage } from '@/pages/SignInPage';
import { ChatPage } from '@/pages/ChatPage';
import { ActivityPage } from '@/pages/ActivityPage';
import { FeedPage } from '@/pages/FeedPage';

export function AppShell() {
  const { loading } = useAuth();
  const { page } = useNav();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
      </div>
    );
  }

  if (page === 'signin') {
    return <SignInPage />;
  }

  return (
    <div className="mx-auto min-h-screen max-w-[390px] bg-white shadow-2xl">
      {page === 'home' && <HomePage />}
      {page === 'map' && <MapPage />}
      {page === 'progression' && <ProgressionPage />}
      {page === 'chat' && <ChatPage />}
      {page === 'activity' && <ActivityPage />}
      {page === 'feed' && <FeedPage />}
    </div>
  );
}
