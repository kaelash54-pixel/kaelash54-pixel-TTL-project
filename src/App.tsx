import { AuthProvider } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
