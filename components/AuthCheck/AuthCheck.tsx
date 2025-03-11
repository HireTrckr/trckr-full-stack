import { useEffect, ReactNode } from "react";
import { auth } from "../../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithGoogle } from "../../utils/authUtils";

interface AuthCheckProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthCheck({ children, fallback }: AuthCheckProps) {
  const [user, loading] = useAuthState(auth);

  // i hate hydration errors
  if (loading) {
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
    <div className="gap-2 bg-background-primary rounded-lg p-6 transition-all duration-bg ease-in-out flex flex-col items-center hover:scale-[1.02] mt-4">
      <h2 className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text capitalize mb-6">
        please sign in to continue
      </h2>
      <button
        onClick={signInWithGoogle}
        className="px-3 py-1.5 rounded-lg text-sm font-medium
             bg-accent-primary hover:bg-accent-hover
             text-white
             transition-all duration-text ease-in-out
             flex items-center gap-2 shadow-light
               "
      >
        Sign In
      </button>
    </div>
  );
}
