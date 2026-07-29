import { useEffect, useState } from 'react';

type Page = 'home' | 'map' | 'progression' | 'signin' | 'chat' | 'activity' | 'feed';

interface NavState {
  page: Page;
  params?: Record<string, string>;
}

const listeners: ((s: NavState) => void)[] = [];
let currentState: NavState = { page: 'home' };

export function navigate(page: Page, params?: Record<string, string>) {
  currentState = { page, params };
  listeners.forEach(l => l(currentState));
  window.scrollTo(0, 0);
}

export function useNav(): NavState {
  const [state, setState] = useState<NavState>(currentState);
  useEffect(() => {
    const l = (s: NavState) => setState(s);
    listeners.push(l);
    return () => { const i = listeners.indexOf(l); if (i >= 0) listeners.splice(i, 1); };
  }, []);
  return state;
}
