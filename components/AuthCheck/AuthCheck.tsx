import { useEffect, useState, ReactNode } from 'react';
import { auth } from '../../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { NotSignedIn } from '../NotSignedIn/NotSignedIn';

interface AuthCheckProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthCheck({ children, fallback }: AuthCheckProps) {
  const [user, loading] = useAuthState(auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // i hate hydration errors
  if (!mounted || loading) {
    return null;
  }

  if (user === undefined) {
    return null;
  }

  if (user) {
    return <>{children}</>;
  }

  return fallback ? (
    <>{fallback}</>
  ) : (
    <main>
      <NotSignedIn />
    </main>
  );
}
