import { useAuth } from '@/context/AuthContext';
import { useNav, navigate } from '@/lib/nav';
import { Home, Search, PlusCircle, Bell, User, Map } from 'lucide-react';

interface BottomNavProps {
  hasNotification?: boolean;
}

export function BottomNav({ hasNotification }: BottomNavProps) {
  const { page } = useNav();
  const { user } = useAuth();

  const items: { id: string; icon: typeof Home; badge?: boolean }[] = [
    { id: 'home',        icon: Home },
    { id: 'map',         icon: Map },
    { id: 'create',      icon: PlusCircle },
    { id: 'activity',    icon: Bell, badge: hasNotification },
    { id: user ? 'progression' : 'signin', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-200 z-40">
      <div className="flex items-center justify-around px-2 pt-3 pb-6">
        {items.map(item => {
          const active = page === item.id || (item.id === 'signin' && page === 'signin') || (item.id === 'progression' && page === 'progression');
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id as any)}
              className="relative flex flex-col items-center"
            >
              <Icon
                size={26}
                strokeWidth={active ? 2.2 : 1.6}
                className={active ? 'text-black' : 'text-gray-400'}
              />
              {item.badge && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 border border-white" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
